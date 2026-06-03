import { z } from 'zod'

// Auth
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'doctor', 'clinic_admin']),
  fullName: z.string().min(1).max(255),
  // Optional per-role fields
  licenseNumber: z.string().max(100).optional(),
  specialization: z.string().max(255).optional(),
  clinicName: z.string().max(255).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  skinType: z.string().max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceMeta: z.record(z.unknown()).optional(),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
  tokenId: z.string().uuid(),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
  userId: z.string().uuid(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  userId: z.string().uuid(),
  newPassword: z.string().min(8),
})

// Treatments
export const createTreatmentSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().max(10000).optional(),
  status: z.enum(['planned', 'completed', 'ongoing']).default('planned'),
  doctorId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
})

export const updateTreatmentSchema = createTreatmentSchema.partial()

// Photos
export const uploadPhotoSchema = z.object({
  phase: z.enum(['before', 'after', 'progress']),
  areaTag: z.string().max(100).optional(),
  consentClinical: z.enum(['true', 'false']).transform(v => v === 'true').optional().default('false'),
  sortOrder: z.string().regex(/^\d+$/).transform(Number).optional(),
})

// Permissions
export const createPermissionSchema = z.object({
  granteeId: z.string().uuid(),
  granteeType: z.enum(['doctor', 'clinic']),
  accessLevel: z.enum(['readonly', 'full']).default('readonly'),
  expiresAt: z.string().datetime().optional(),
})

// QR
export const generateQrSchema = z.object({
  accessLevel: z.enum(['readonly', 'full']).default('readonly'),
  expiresAt: z.string().datetime().refine(
    (v) => new Date(v) <= new Date(Date.now() + 24 * 60 * 60 * 1000),
    'QR token expiry cannot exceed 24 hours'
  ),
})

export const scanQrSchema = z.object({
  tokenId: z.string().uuid(),
  rawToken: z.string().min(1),
})

// Insights
export const generateInsightSchema = z.object({}).optional()

// Professional notes
export const createNoteSchema = z.object({
  content: z.string().min(1).max(10000),
})

// Account
export const updateConsentSchema = z.object({
  consentAiProcessing: z.boolean(),
})
