import request from 'supertest'
import { createApp } from '../src/index'
import pool from '../src/db/pool'

export const app = createApp()

export async function cleanDb() {
  await pool.query(`
    DELETE FROM ai_insights;
    DELETE FROM audit_log;
    DELETE FROM qr_tokens;
    DELETE FROM permissions;
    DELETE FROM professional_notes;
    DELETE FROM photos;
    DELETE FROM treatments;
    DELETE FROM clinic_members;
    DELETE FROM email_verifications;
    DELETE FROM password_reset_tokens;
    DELETE FROM refresh_tokens;
    DELETE FROM clinic_profiles;
    DELETE FROM doctor_profiles;
    DELETE FROM client_profiles;
    DELETE FROM users;
  `)
}

interface RegisterOpts {
  email?: string
  password?: string
  role: 'client' | 'doctor' | 'clinic_admin'
  fullName?: string
}

export async function registerAndVerify(opts: RegisterOpts) {
  const email = opts.email ?? `${Date.now()}-${Math.random()}@test.com`
  const password = opts.password ?? 'Password123!'

  await request(app).post('/api/auth/register').send({
    email,
    password,
    role: opts.role,
    fullName: opts.fullName ?? 'Test User',
    clinicName: opts.role === 'clinic_admin' ? 'Test Clinic' : undefined,
  })

  // Manually verify email for tests
  await pool.query(`UPDATE users SET email_verified_at = now() WHERE email = $1`, [email])

  const loginRes = await request(app).post('/api/auth/login').send({ email, password })
  return {
    email,
    password,
    accessToken: loginRes.body.accessToken as string,
    tokenId: loginRes.body.tokenId as string,
    refreshToken: loginRes.body.refreshToken as string,
    userId: (await pool.query(`SELECT id FROM users WHERE email = $1`, [email])).rows[0].id as string,
  }
}
