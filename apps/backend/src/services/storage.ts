import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../utils/config'

// Storage abstraction — local disk for dev, S3-compatible for production
// Switch via S3_COMPATIBLE=true env flag

export async function uploadFile(
  buffer: Buffer,
  clientId: string,
  mimeType: string
): Promise<string> {
  const ext = mimeType === 'image/png' ? 'png' : 'jpg'
  const storageKey = `photos/${clientId}/${uuidv4()}.${ext}`

  if (config.s3Compatible) {
    return uploadToS3(buffer, storageKey, mimeType)
  }
  return uploadToLocal(buffer, storageKey)
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (config.s3Compatible) {
    return deleteFromS3(storageKey)
  }
  return deleteFromLocal(storageKey)
}

export async function getSignedUrl(storageKey: string): Promise<string> {
  if (config.s3Compatible) {
    return getS3SignedUrl(storageKey)
  }
  return getLocalSignedUrl(storageKey)
}

// Local implementations
async function uploadToLocal(buffer: Buffer, storageKey: string): Promise<string> {
  const fullPath = path.join(config.storagePath, storageKey)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, buffer)
  return storageKey
}

async function deleteFromLocal(storageKey: string): Promise<void> {
  const fullPath = path.join(config.storagePath, storageKey)
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
}

async function getLocalSignedUrl(storageKey: string): Promise<string> {
  // In dev, serve via /api/photos/serve endpoint with a short-lived token
  // For simplicity in dev, return a path-based URL — replace with real signed URL in prod
  return `${config.baseUrl}/api/photos/serve/${encodeURIComponent(storageKey)}`
}

// S3 implementations (requires aws-sdk or @aws-sdk/client-s3 if S3_COMPATIBLE=true)
async function uploadToS3(_buffer: Buffer, _storageKey: string, _mimeType: string): Promise<string> {
  throw new Error('S3 not configured. Set S3_COMPATIBLE=false or configure S3 env vars and implement S3 upload.')
}

async function deleteFromS3(_storageKey: string): Promise<void> {
  throw new Error('S3 not configured.')
}

async function getS3SignedUrl(_storageKey: string): Promise<string> {
  throw new Error('S3 not configured.')
}
