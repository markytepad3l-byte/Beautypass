import { Router, Request, Response } from 'express'
import QRCode from 'qrcode'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generateQrSchema, scanQrSchema } from '../schemas'
import { generateToken, hashToken, decrypt } from '../utils/crypto'
import { writeAuditLog } from '../services/audit'

const router = Router()
router.use(authenticate)

// POST /api/qr/generate
router.post('/generate', authorize('client'), validate(generateQrSchema), async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { accessLevel, expiresAt } = req.body

  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)

  const { rows: [qr] } = await pool.query(
    `INSERT INTO qr_tokens (client_id, token_hash, access_level, expires_at)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [clientId, tokenHash, accessLevel, expiresAt]
  )

  const payload = JSON.stringify({ tokenId: qr.id, rawToken })
  const qrBase64 = await QRCode.toDataURL(payload)

  res.json({ tokenId: qr.id, qrCode: qrBase64, expiresAt })
})

// POST /api/qr/scan
router.post('/scan', authorize('doctor', 'clinic_admin'), validate(scanQrSchema), async (req: Request, res: Response) => {
  const { userId, role } = req.user!
  const { tokenId, rawToken } = req.body
  const tokenHash = hashToken(rawToken)

  const { rows: [qrToken] } = await pool.query(
    `SELECT * FROM qr_tokens WHERE id = $1`,
    [tokenId]
  )

  if (!qrToken) {
    res.status(403).json({ error: 'QR_INVALID', message: 'QR code not found' })
    return
  }
  if (qrToken.used_at) {
    res.status(403).json({ error: 'QR_USED', message: 'QR code has already been used' })
    return
  }
  if (new Date(qrToken.expires_at) < new Date()) {
    res.status(403).json({ error: 'QR_EXPIRED', message: 'QR code has expired' })
    return
  }
  if (qrToken.token_hash !== tokenHash) {
    res.status(403).json({ error: 'QR_INVALID', message: 'Invalid QR code' })
    return
  }

  // Create a permission grant that matches the QR token's expiry
  const { rows: [permission] } = await pool.query(
    `INSERT INTO permissions (client_id, grantee_id, grantee_type, access_level, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      qrToken.client_id,
      userId,
      role === 'doctor' ? 'doctor' : 'clinic',
      qrToken.access_level,
      qrToken.expires_at,
    ]
  )

  // Mark token used and link to the resulting permission
  await pool.query(
    `UPDATE qr_tokens SET used_at = now(), resulting_permission_id = $1 WHERE id = $2`,
    [permission.id, tokenId]
  )

  await writeAuditLog({
    actorId: userId,
    actorRole: role,
    action: 'qr_scan',
    resourceType: 'client',
    resourceId: qrToken.client_id,
    ip: req.ip,
  })

  // Return client summary
  const { rows: [profile] } = await pool.query(
    `SELECT cp.full_name, cp.dob, cp.skin_type, cp.allergies
     FROM client_profiles cp WHERE cp.user_id = $1`,
    [qrToken.client_id]
  )

  const { rows: recentTreatments } = await pool.query(
    `SELECT id, title, type, date, status FROM treatments
     WHERE client_id = $1 AND deleted_at IS NULL ORDER BY date DESC LIMIT 5`,
    [qrToken.client_id]
  )

  res.json({
    clientId: qrToken.client_id,
    profile: {
      fullName: profile?.full_name,
      dob: profile?.dob,
      skinType: profile?.skin_type,
      // allergies are encrypted — decrypt for authorized access
      allergies: profile?.allergies ? tryDecrypt(profile.allergies) : null,
    },
    recentTreatments,
    permissionId: permission.id,
    accessLevel: qrToken.access_level,
    permissionExpiresAt: qrToken.expires_at,
  })
})

function tryDecrypt(val: string): string | null {
  try {
    return decrypt(val)
  } catch {
    return null
  }
}

export default router
