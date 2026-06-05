import { Router, Request, Response } from 'express'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createTreatmentSchema, updateTreatmentSchema } from '../schemas'
import { encrypt, decrypt } from '../utils/crypto'
import { requirePermission } from '../services/permissions'
import { writeAuditLog } from '../services/audit'

const router = Router()
router.use(authenticate)

function decryptNotes(notes: string | null): string | null {
  if (!notes) return null
  try { return decrypt(notes) } catch { return null }
}

// POST /api/treatments
router.post('/', validate(createTreatmentSchema), async (req: Request, res: Response) => {
  const { userId, role } = req.user!
  const { title, type, date, notes, status, doctorId, clinicId, bodyZone } = req.body
  let { clientId } = req.body

  if (role === 'client') {
    clientId = userId
  } else {
    if (!clientId) {
      res.status(400).json({ error: 'clientId is required when a professional records a treatment' })
      return
    }
    await requirePermission(clientId, userId)
  }

  const encryptedNotes = notes ? encrypt(notes) : null
  const resolvedDoctorId = role === 'doctor' ? userId : doctorId ?? null
  const resolvedClinicId = role === 'clinic_admin' ? userId : clinicId ?? null

  const { rows: [treatment] } = await pool.query(
    `INSERT INTO treatments
       (client_id, doctor_id, clinic_id, title, type, date, notes, status, body_zone, created_by_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [clientId, resolvedDoctorId, resolvedClinicId, title, type, date, encryptedNotes, status, bodyZone ?? null, userId]
  )

  if (role !== 'client') {
    await writeAuditLog({
      actorId: userId,
      actorRole: role,
      action: 'create_treatment',
      resourceType: 'treatment',
      resourceId: treatment.id,
      ip: req.ip,
    })
  }

  res.status(201).json({ ...treatment, notes: notes ?? null })
})

// GET /api/treatments?clientId=...
router.get('/', async (req: Request, res: Response) => {
  const { userId, role } = req.user!
  const clientIdFilter = typeof req.query.clientId === 'string' ? req.query.clientId : null

  let rows: Record<string, unknown>[]
  if (role === 'client') {
    const result = await pool.query(
      `SELECT * FROM treatments WHERE client_id = $1 AND deleted_at IS NULL ORDER BY date DESC`,
      [userId]
    )
    rows = result.rows
  } else {
    // Doctor/clinic: only treatments they have permission to see
    const result = await pool.query(
      `SELECT t.* FROM treatments t
       INNER JOIN permissions p ON p.client_id = t.client_id
       WHERE p.grantee_id = $1
         AND p.revoked_at IS NULL
         AND (p.expires_at IS NULL OR p.expires_at > now())
         AND t.deleted_at IS NULL
         AND ($2::uuid IS NULL OR t.client_id = $2::uuid)
       ORDER BY t.date DESC`,
      [userId, clientIdFilter]
    )
    rows = result.rows

    if (rows.length > 0) {
      const ip = req.ip
      await Promise.all(rows.map(t =>
        writeAuditLog({ actorId: userId, actorRole: role, action: 'list_treatments', resourceType: 'treatment', resourceId: t.id as string, ip })
      ))
    }
  }

  const decrypted = rows.map(t => ({ ...t, notes: decryptNotes(t.notes as string | null) }))
  res.json(decrypted)
})

// GET /api/treatments/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { userId, role } = req.user!
  const { id } = req.params

  const { rows: [treatment] } = await pool.query(
    `SELECT * FROM treatments WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  )
  if (!treatment) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }

  if (treatment.client_id !== userId) {
    await requirePermission(treatment.client_id, userId)
    await writeAuditLog({ actorId: userId, actorRole: role, action: 'view_treatment', resourceType: 'treatment', resourceId: id, ip: req.ip })
  }

  res.json({ ...treatment, notes: decryptNotes(treatment.notes) })
})

// PATCH /api/treatments/:id
router.patch('/:id', authorize('client'), validate(updateTreatmentSchema), async (req: Request, res: Response) => {
  const { userId } = req.user!
  const { id } = req.params
  const { title, type, date, notes, status, doctorId, clinicId } = req.body

  const { rows: [existing] } = await pool.query(
    `SELECT * FROM treatments WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  )
  if (!existing || existing.client_id !== userId) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }

  const encryptedNotes = notes !== undefined ? (notes ? encrypt(notes) : null) : existing.notes

  const { rows: [updated] } = await pool.query(
    `UPDATE treatments
     SET title = COALESCE($1, title),
         type = COALESCE($2, type),
         date = COALESCE($3, date),
         notes = $4,
         status = COALESCE($5, status),
         doctor_id = COALESCE($6, doctor_id),
         clinic_id = COALESCE($7, clinic_id),
         updated_at = now()
     WHERE id = $8 RETURNING *`,
    [title ?? null, type ?? null, date ?? null, encryptedNotes, status ?? null, doctorId ?? null, clinicId ?? null, id]
  )

  res.json({ ...updated, notes: decryptNotes(updated.notes) })
})

// DELETE /api/treatments/:id
router.delete('/:id', authorize('client'), async (req: Request, res: Response) => {
  const { userId } = req.user!
  const { id } = req.params

  const { rowCount } = await pool.query(
    `UPDATE treatments SET deleted_at = now() WHERE id = $1 AND client_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  )
  if (!rowCount) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }
  res.json({ message: 'Treatment deleted' })
})

export default router
