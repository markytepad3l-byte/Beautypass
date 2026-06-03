import { Router, Request, Response } from 'express'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { updateConsentSchema } from '../schemas'
import { decrypt } from '../utils/crypto'
import { deleteFile } from '../services/storage'
import { writeAuditLog } from '../services/audit'

const router = Router()
router.use(authenticate, authorize('client'))

// PATCH /api/account/consent
router.patch('/consent', validate(updateConsentSchema), async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { consentAiProcessing } = req.body

  await pool.query(
    `UPDATE client_profiles SET consent_ai_processing = $1 WHERE user_id = $2`,
    [consentAiProcessing, clientId]
  )

  await writeAuditLog({
    actorId: clientId,
    actorRole: 'client',
    action: consentAiProcessing ? 'consent_ai_enabled' : 'consent_ai_disabled',
    resourceType: 'client',
    resourceId: clientId,
    ip: req.ip,
  })

  res.json({ consentAiProcessing })
})

// GET /api/account/export
router.get('/export', async (req: Request, res: Response) => {
  const clientId = req.user!.userId

  const [profileRes, treatmentsRes, photosRes, permissionsRes, insightsRes, auditRes] = await Promise.all([
    pool.query(`SELECT * FROM client_profiles WHERE user_id = $1`, [clientId]),
    pool.query(`SELECT * FROM treatments WHERE client_id = $1`, [clientId]),
    pool.query(`SELECT id, treatment_id, phase, area_tag, consent_clinical, created_at FROM photos WHERE client_id = $1`, [clientId]),
    pool.query(`SELECT * FROM permissions WHERE client_id = $1`, [clientId]),
    pool.query(`SELECT id, input_summary, output_content, generated_at FROM ai_insights WHERE client_id = $1`, [clientId]),
    pool.query(`SELECT * FROM audit_log WHERE actor_id = $1`, [clientId]),
  ])

  const profile = profileRes.rows[0]
  if (profile?.allergies) {
    try { profile.allergies = decrypt(profile.allergies) } catch { /* keep as-is */ }
  }

  const treatments = treatmentsRes.rows.map(t => {
    if (t.notes) try { t.notes = decrypt(t.notes) } catch { /* keep as-is */ }
    return t
  })

  res.json({
    exportedAt: new Date().toISOString(),
    profile,
    treatments,
    photos: photosRes.rows,
    permissions: permissionsRes.rows,
    aiInsights: insightsRes.rows,
    auditLog: auditRes.rows,
  })
})

// DELETE /api/account
router.delete('/', async (req: Request, res: Response) => {
  const clientId = req.user!.userId

  await writeAuditLog({
    actorId: clientId,
    actorRole: 'client',
    action: 'account_deletion_requested',
    resourceType: 'client',
    resourceId: clientId,
    ip: req.ip,
  })

  // Fetch photos for S3 deletion before cascading delete
  const { rows: photos } = await pool.query(
    `SELECT storage_key FROM photos WHERE client_id = $1`,
    [clientId]
  )

  // Soft-delete user — set email/password to unusable, cascade handled by FK
  await pool.query(
    `UPDATE users SET
       email = 'deleted+' || id || '@beautypass.deleted',
       password_hash = 'DELETED',
       email_verified_at = NULL
     WHERE id = $1`,
    [clientId]
  )

  // Delete photos from storage (best-effort, non-blocking)
  Promise.all(photos.map(p => deleteFile(p.storage_key).catch(() => null)))

  res.json({ message: 'Account deletion initiated. Your data will be purged within 30 days.' })
})

// GET /api/account/audit
router.get('/audit', async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { rows } = await pool.query(
    `SELECT al.* FROM audit_log al
     WHERE al.actor_id = $1
        OR (al.resource_type = 'client' AND al.resource_id = $1)
     ORDER BY al.created_at DESC LIMIT 100`,
    [clientId]
  )
  res.json(rows)
})

export default router
