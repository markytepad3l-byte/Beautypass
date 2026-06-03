import { Router, Request, Response } from 'express'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createNoteSchema } from '../schemas'
import { encrypt, decrypt } from '../utils/crypto'
import { requirePermission } from '../services/permissions'
import { writeAuditLog } from '../services/audit'

const router = Router({ mergeParams: true })
router.use(authenticate)

// POST /api/treatments/:treatmentId/notes
router.post('/', authorize('doctor', 'clinic_admin'), validate(createNoteSchema), async (req: Request, res: Response) => {
  const { userId, role } = req.user!
  const { treatmentId } = req.params
  const { content } = req.body

  const { rows: [treatment] } = await pool.query(
    `SELECT client_id FROM treatments WHERE id = $1 AND deleted_at IS NULL`,
    [treatmentId]
  )
  if (!treatment) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }

  await requirePermission(treatment.client_id, userId)

  const encryptedContent = encrypt(content)
  const { rows: [note] } = await pool.query(
    `INSERT INTO professional_notes (treatment_id, author_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [treatmentId, userId, encryptedContent]
  )

  await writeAuditLog({
    actorId: userId,
    actorRole: role,
    action: 'add_note',
    resourceType: 'treatment',
    resourceId: treatmentId,
    ip: req.ip,
  })

  res.status(201).json({ ...note, content })
})

// GET /api/treatments/:treatmentId/notes
router.get('/', async (req: Request, res: Response) => {
  const { userId, role } = req.user!
  const { treatmentId } = req.params

  const { rows: [treatment] } = await pool.query(
    `SELECT client_id FROM treatments WHERE id = $1 AND deleted_at IS NULL`,
    [treatmentId]
  )
  if (!treatment) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }

  if (treatment.client_id !== userId) {
    await requirePermission(treatment.client_id, userId)
    await writeAuditLog({
      actorId: userId,
      actorRole: role,
      action: 'view_notes',
      resourceType: 'treatment',
      resourceId: treatmentId,
      ip: req.ip,
    })
  }

  const { rows } = await pool.query(
    `SELECT n.*, COALESCE(dp.full_name, cp.name) AS author_name
     FROM professional_notes n
     LEFT JOIN doctor_profiles dp ON dp.user_id = n.author_id
     LEFT JOIN clinic_profiles cp ON cp.user_id = n.author_id
     WHERE n.treatment_id = $1 ORDER BY n.created_at ASC`,
    [treatmentId]
  )

  const decrypted = rows.map(n => {
    let content = n.content
    try { content = decrypt(n.content) } catch { /* leave encrypted if fails */ }
    return { ...n, content }
  })

  res.json(decrypted)
})

export default router
