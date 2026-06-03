import { execSync } from 'child_process'

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgres://postgres:password@localhost:5432/beautypass_test'
process.env.JWT_SECRET = 'test-secret-minimum-32-chars-ok!!'
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-ok!'
process.env.SKIP_EMAIL = 'true'
process.env.STORAGE_PATH = '/tmp/beautypass_test_uploads'
process.env.S3_COMPATIBLE = 'false'
process.env.ANTHROPIC_API_KEY = 'test-key'
process.env.BASE_URL = 'http://localhost:3000'

export default async function globalSetup() {
  execSync('npm run migrate', {
    cwd: __dirname + '/..',
    env: { ...process.env },
    stdio: 'pipe',
  })
}
