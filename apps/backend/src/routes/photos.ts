import { Router, Request, Response } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { uploadPhotoSchema } from '../schemas'
import { uploadFile, deleteFile, getSignedUrl } from '../services/storage'
import { requirePermission } from '../services/permissions'
import { writeAuditLog } from '../services/audit'
import { config } from '../utils/config'

const router = Router({ mergeParams: true })
router.use(authenticate)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter(_req, file, cb) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'))
      return
    }
    cb(null, true)
  },
})

// POST /api/treatments/:treatmentId/photos
router.post(
  '/',
  authorize('client'),
  upload.single('photo'),
  validate(uploadPhotoSchema, 'body'),
  async (req: Request, res: Response) => {
    const clientId = req.user!.userId
    const { treatmentId } = req.params
    const { phase, areaTag, consentClinical, sortOrder } = req.body

    if (!req.file) {
      res.status(400).json({ error: 'Photo file is required' })
      return
    }

    const { rows: [treatment] } = await pool.query(
      `SELECT client_id FROM treatments WHERE id = $1 AND deleted_at IS NULL`,
      [treatmentId]
    )
    if (!treatment || treatment.client_id !== clientId) {
      res.status(404).json({ error: 'Treatment not found' })
      return
    }

    // Strip EXIF and compress via sharp
    const processed = await sharp(req.file.buffer)
      .rotate() // Auto-orient from EXIF before stripping
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .withMetadata({}) // Pass empty metadata to strip EXIF
      .toBuffer()

    const storageKey = await uploadFile(processed, clientId, 'image/jpeg')

    const { rows: [photo] } = await pool.query(
      `INSERT INTO photos (treatment_id, client_id, phase, storage_key, area_tag, consent_clinical, exif_stripped, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7) RETURNING *`,
      [treatmentId, clientId, phase, storageKey, areaTag ?? null, consentClinical ?? false, sortOrder ?? 0]
    )

    res.status(201).json(photo)
  }
)

// GET /api/treatments/:treatmentId/photos
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
    await writeAuditLog({ actorId: userId, actorRole: role, action: 'view_photos', resourceType: 'treatment', resourceId: treatmentId, ip: req.ip })
  }

  const { rows } = await pool.query(
    `SELECT * FROM photos WHERE treatment_id = $1 ORDER BY sort_order, created_at`,
    [treatmentId]
  )

  // Generate signed URLs — never return raw storage keys
  const photosWithUrls = await Promise.all(
    rows.map(async (p) => ({
      id: p.id,
      treatmentId: p.treatment_id,
      phase: p.phase,
      areaTag: p.area_tag,
      consentClinical: p.consent_clinical,
      sortOrder: p.sort_order,
      createdAt: p.created_at,
      url: await getSignedUrl(p.storage_key),
    }))
  )

  res.json(photosWithUrls)
})

// DELETE /api/treatments/:treatmentId/photos/:photoId
router.delete('/:photoId', authorize('client'), async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { treatmentId, photoId } = req.params

  const { rows: [photo] } = await pool.query(
    `SELECT p.*, t.client_id AS treatment_client_id
     FROM photos p
     INNER JOIN treatments t ON t.id = p.treatment_id
     WHERE p.id = $1 AND p.treatment_id = $2`,
    [photoId, treatmentId]
  )
  if (!photo || photo.treatment_client_id !== clientId) {
    res.status(404).json({ error: 'Photo not found' })
    return
  }

  await deleteFile(photo.storage_key)
  await pool.query(`DELETE FROM photos WHERE id = $1`, [photoId])

  res.json({ message: 'Photo deleted' })
})

// GET /api/photos/serve/:storageKey — dev-only local file serving
router.get('/serve/:storageKey(*)', async (req: Request, res: Response) => {
  if (config.s3Compatible) {
    res.status(404).json({ error: 'Not available in S3 mode' })
    return
  }
  const storageKey = req.params.storageKey
  const fullPath = path.join(config.storagePath, storageKey)
  if (!fullPath.startsWith(path.resolve(config.storagePath))) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  if (!fs.existsSync(fullPath)) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.sendFile(path.resolve(fullPath))
})

export default router
