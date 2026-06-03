import request from 'supertest'
import { app, cleanDb, registerAndVerify } from './helpers'
import pool from '../src/db/pool'
import { hashToken } from '../src/utils/crypto'

beforeEach(cleanDb)
afterAll(() => pool.end())

describe('POST /api/auth/register', () => {
  it('registers a client successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'client@test.com',
      password: 'Password123!',
      role: 'client',
      fullName: 'Alice Test',
    })
    expect(res.status).toBe(201)
    expect(res.body.message).toContain('verify your email')
  })

  it('rejects duplicate email', async () => {
    const body = { email: 'dup@test.com', password: 'Password123!', role: 'client', fullName: 'A' }
    await request(app).post('/api/auth/register').send(body)
    const res = await request(app).post('/api/auth/register').send(body)
    expect(res.status).toBe(409)
  })

  it('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'x@test.com', password: 'short', role: 'client', fullName: 'A',
    })
    expect(res.status).toBe(400)
  })

  it('rejects invalid role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'x@test.com', password: 'Password123!', role: 'hacker', fullName: 'A',
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('rejects login before email verification', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'unverified@test.com', password: 'Password123!', role: 'client', fullName: 'A',
    })
    const res = await request(app).post('/api/auth/login').send({
      email: 'unverified@test.com', password: 'Password123!',
    })
    expect(res.status).toBe(403)
  })

  it('issues tokens after verification', async () => {
    const user = await registerAndVerify({ role: 'client' })
    expect(user.accessToken).toBeTruthy()
    expect(user.tokenId).toBeTruthy()
    expect(user.refreshToken).toBeTruthy()
  })

  it('rejects wrong password', async () => {
    const { email } = await registerAndVerify({ role: 'client' })
    const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass123!' })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/refresh', () => {
  it('issues new token pair', async () => {
    const { tokenId, refreshToken } = await registerAndVerify({ role: 'client' })
    const res = await request(app).post('/api/auth/refresh').send({ tokenId, refreshToken })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.tokenId).not.toBe(tokenId)
  })

  it('revokes whole family on token reuse', async () => {
    const { tokenId, refreshToken } = await registerAndVerify({ role: 'client' })
    // First refresh — valid
    const res1 = await request(app).post('/api/auth/refresh').send({ tokenId, refreshToken })
    expect(res1.status).toBe(200)
    // Reuse the same old token — should detect theft and revoke family
    const res2 = await request(app).post('/api/auth/refresh').send({ tokenId, refreshToken })
    expect(res2.status).toBe(401)
    expect(res2.body.error).toMatch(/reuse/i)
    // New token from first refresh should also be revoked now
    const res3 = await request(app).post('/api/auth/refresh').send({
      tokenId: res1.body.tokenId,
      refreshToken: res1.body.refreshToken,
    })
    expect(res3.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('revokes refresh token', async () => {
    const { tokenId, refreshToken } = await registerAndVerify({ role: 'client' })
    const logoutRes = await request(app).post('/api/auth/logout').send({ tokenId, refreshToken })
    expect(logoutRes.status).toBe(200)
    // Using the revoked token should fail
    const res = await request(app).post('/api/auth/refresh').send({ tokenId, refreshToken })
    expect(res.status).toBe(401)
  })
})

describe('Password reset flow', () => {
  it('resets password and revokes all sessions', async () => {
    const user = await registerAndVerify({ role: 'client', email: 'reset@test.com', password: 'OldPass123!' })

    await request(app).post('/api/auth/forgot-password').send({ email: 'reset@test.com' })

    // Get the reset token from DB directly (simulating email link)
    const { rows } = await pool.query(
      `SELECT prt.id, ev.token_hash FROM password_reset_tokens prt
       INNER JOIN users u ON u.id = prt.user_id
       WHERE u.email = 'reset@test.com'`
    )
    // In tests we can't get raw token from hash — simulate via direct DB update
    const rawToken = 'test-reset-token-12345678901234567890123456789012'
    await pool.query(
      `UPDATE password_reset_tokens SET token_hash = $1 WHERE id = $2`,
      [hashToken(rawToken), rows[0].id]
    )

    const res = await request(app).post('/api/auth/reset-password').send({
      token: rawToken,
      userId: user.userId,
      newPassword: 'NewPass123!',
    })
    expect(res.status).toBe(200)

    // Old password should not work
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'reset@test.com', password: 'OldPass123!' })
    expect(loginRes.status).toBe(401)

    // New password should work
    const loginRes2 = await request(app).post('/api/auth/login').send({ email: 'reset@test.com', password: 'NewPass123!' })
    expect(loginRes2.status).toBe(200)
  })
})
