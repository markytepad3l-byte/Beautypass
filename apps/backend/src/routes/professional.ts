import { Router, Request, Response } from 'express'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { requirePermission } from '../services/permissions'
import { writeAuditLog } from '../services/audit'

const router = Router()
router.use(authenticate, authorize('doctor', 'clinic_admin'))

// GET /api/professional/clients — clients who have granted me access
router.get('/clients', async (req: Request, res: Response) => {
  const { userId } = req.user!
  const { rows } = await pool.query(
    `SELECT
       u.id,
       cp.full_name,
       cp.avatar_url,
       p.access_level,
       p.granted_at,
       p.expires_at
     FROM permissions p
     INNER JOIN users u ON u.id = p.client_id
     LEFT JOIN client_profiles cp ON cp.user_id = u.id
     WHERE p.grantee_id = $1
       AND p.revoked_at IS NULL
       AND (p.expires_at IS NULL OR p.expires_at > now())
     ORDER BY p.granted_at DESC`,
    [userId]
  )
  res.json(rows)
})

// GET /api/professional/clients/:clientId — client profile summary
router.get('/clients/:clientId', async (req: Request, res: Response) => {
  const { userId, role } = req.user!
  const { clientId } = req.params

  await requirePermission(clientId, userId)

  const { rows: [profile] } = await pool.query(
    `SELECT u.id, u.email, cp.full_name, cp.dob, cp.skin_type, cp.avatar_url
     FROM users u
     LEFT JOIN client_profiles cp ON cp.user_id = u.id
     WHERE u.id = $1`,
    [clientId]
  )
  if (!profile) {
    res.status(404).json({ error: 'Client not found' })
    return
  }

  await writeAuditLog({
    actorId: userId,
    actorRole: role,
    action: 'view_client',
    resourceType: 'client',
    resourceId: clientId,
    ip: req.ip,
  })

  res.json(profile)
})

export default router
