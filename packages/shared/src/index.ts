export type UserRole = 'client' | 'doctor' | 'clinic_admin'

export type TreatmentStatus = 'planned' | 'completed' | 'ongoing'

export type PhotoPhase = 'before' | 'after' | 'progress'

export type AccessLevel = 'readonly' | 'full'

export type GranteeType = 'doctor' | 'clinic'

export interface User {
  id: string
  email: string
  role: UserRole
  emailVerifiedAt: string | null
  createdAt: string
}

export interface ClientProfile {
  userId: string
  fullName: string
  dob: string | null
  skinType: string | null
  allergies: string | null
  avatarUrl: string | null
  consentAiProcessing: boolean
  createdAt: string
}

export interface DoctorProfile {
  userId: string
  fullName: string
  licenseNumber: string | null
  specialization: string | null
  avatarUrl: string | null
}

export interface ClinicProfile {
  userId: string
  name: string
  address: string | null
  phone: string | null
  logoUrl: string | null
}

export interface ClinicMember {
  clinicId: string
  userId: string
  role: string
  status: 'active' | 'suspended'
  joinedAt: string
}

export interface Treatment {
  id: string
  clientId: string
  doctorId: string | null
  clinicId: string | null
  title: string
  type: string
  date: string
  notes: string | null
  status: TreatmentStatus
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  treatmentId: string
  clientId: string
  phase: PhotoPhase
  storageKey: string
  areaTag: string | null
  consentClinical: boolean
  exifStripped: boolean
  createdAt: string
}

export interface ProfessionalNote {
  id: string
  treatmentId: string
  authorId: string
  content: string
  createdAt: string
}

export interface Permission {
  id: string
  clientId: string
  granteeId: string
  granteeType: GranteeType
  accessLevel: AccessLevel
  grantedAt: string
  expiresAt: string | null
  revokedAt: string | null
}

export interface QrToken {
  id: string
  clientId: string
  tokenHash: string
  accessLevel: AccessLevel
  usedAt: string | null
  expiresAt: string
  resultingPermissionId: string | null
}

export interface AuditLog {
  id: string
  actorId: string
  actorRole: UserRole
  action: string
  resourceType: string
  resourceId: string
  ip: string | null
  createdAt: string
}

export interface AiInsight {
  id: string
  clientId: string
  promptHash: string
  inputSummary: string
  outputContent: string
  modelVersion: string
  generatedAt: string
}
