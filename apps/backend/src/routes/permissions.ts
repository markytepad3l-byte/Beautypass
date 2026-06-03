import { Router, Request, Response } from 'express'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createPermissionSchema } from '../schemas'
import { writeAuditLog } from '../services/audit'

const router = Router()
router.use(authenticate)

// POST /api/permissions
router.post('/', authorize('client'), validate(createPermissionSchema), async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { granteeId, granteeType, accessLevel, expiresAt } = req.body

  // Verify grantee exists and has the right role
  const expectedRole = granteeType === 'doctor' ? 'doctor' : 'clinic_admin'
  const { rows: [grantee] } = await pool.query(
    `SELECT id FROM users WHERE id = $1 AND role = $2`,
    [granteeId, expectedRole]
  )
  if (!grantee) {
    res.status(404).json({ error: 'Grantee not found' })
    return
  }

  const { rows: [permission] } = await pool.query(
    `INSERT INTO permissions (client_id, grantee_id, grantee_type, access_level, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [clientId, granteeId, granteeType, accessLevel, expiresAt ?? null]
  )

  await writeAuditLog({
    actorId: clientId,
    actorRole: 'client',
    action: 'grant_permission',
    resourceType: 'permission',
    resourceId: permission.id,
    ip: req.ip,
  })

  res.status(201).json(permission)
})

// GET /api/permissions
router.get('/', authorize('client'), async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { rows } = await pool.query(
    `SELECT p.*,
       COALESCE(dp.full_name, cp.name) AS grantee_name
     FROM permissions p
     LEFT JOIN doctor_profiles dp ON dp.user_id = p.grantee_id
     LEFT JOIN clinic_profiles cp ON cp.user_id = p.grantee_id
     WHERE p.client_id = $1 AND p.revoked_at IS NULL
     ORDER BY p.granted_at DESC`,
    [clientId]
  )
  res.json(rows)
})

// DELETE /api/permissions/:id
router.delete('/:id', authorize('client'), async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { id } = req.params

  const { rowCount } = await pool.query(
    `UPDATE permissions SET revoked_at = now()
     WHERE id = $1 AND client_id = $2 AND revoked_at IS NULL`,
    [id, clientId]
  )
  if (!rowCount) {
    res.status(404).json({ error: 'Permission not found' })
    return
  }

  await writeAuditLog({
    actorId: clientId,
    actorRole: 'client',
    action: 'revoke_permission',
    resourceType: 'permission',
    resourceId: id,
    ip: req.ip,
  })

  res.json({ message: 'Permission revoked' })
})

export default router
