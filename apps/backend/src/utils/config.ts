function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  encryptionKey: required('ENCRYPTION_KEY'),
  storagePath: process.env.STORAGE_PATH ?? './uploads',
  s3Compatible: process.env.S3_COMPATIBLE === 'true',
  s3Bucket: process.env.S3_BUCKET ?? '',
  s3Region: process.env.S3_REGION ?? '',
  s3AccessKey: process.env.S3_ACCESS_KEY ?? '',
  s3SecretKey: process.env.S3_SECRET_KEY ?? '',
  s3Endpoint: process.env.S3_ENDPOINT ?? '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  skipEmail: process.env.SKIP_EMAIL === 'true',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: parseInt(process.env.SMTP_PORT ?? '587', 10),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'noreply@beautypass.app',
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
  qrTokenRetentionDays: parseInt(process.env.QR_TOKEN_RETENTION_DAYS ?? '90', 10),
}
