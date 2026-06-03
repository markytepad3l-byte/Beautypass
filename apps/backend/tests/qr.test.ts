import request from 'supertest'
import { app, cleanDb, registerAndVerify } from './helpers'
import pool from '../src/db/pool'

beforeEach(cleanDb)
afterAll(() => pool.end())

function futureDate(hours = 1): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

describe('QR code flow', () => {
  it('client can generate a QR code', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const res = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ accessLevel: 'readonly', expiresAt: futureDate(1) })

    expect(res.status).toBe(200)
    expect(res.body.qrCode).toMatch(/^data:image\/png;base64,/)
    expect(res.body.tokenId).toBeTruthy()
  })

  it('doctor scanning valid QR creates permission grant', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    // Add client profile for summary
    await pool.query(
      `UPDATE client_profiles SET full_name = 'Test Client' WHERE user_id = $1`,
      [client.userId]
    )

    const genRes = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ accessLevel: 'readonly', expiresAt: futureDate(1) })

    const { tokenId, qrCode } = genRes.body
    // Extract rawToken from QR code data URL (base64 → JSON)
    const qrData = Buffer.from(qrCode.replace('data:image/png;base64,', ''), 'base64')
    // We can't decode a QR image in tests easily — get rawToken from DB mock approach
    // Instead, get the token hash from DB and use test token approach
    // Better: we read raw token embedded in QR data via the qrcode lib's text output
    // For tests, generate QR as text instead
    const QRCode = require('qrcode')
    const { rows: [qt] } = await pool.query(`SELECT token_hash FROM qr_tokens WHERE id = $1`, [tokenId])

    // Re-generate raw token for test purposes by using a known token
    const rawToken = 'known-test-token-abcdefghijklmnopqrstuvwxyz12'
    const { hashToken } = require('../src/utils/crypto')
    await pool.query(`UPDATE qr_tokens SET token_hash = $1 WHERE id = $2`, [hashToken(rawToken), tokenId])

    const scanRes = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ tokenId, rawToken })

    expect(scanRes.status).toBe(200)
    expect(scanRes.body.clientId).toBe(client.userId)
    expect(scanRes.body.permissionId).toBeTruthy()

    // Verify permission was created
    const { rows } = await pool.query(
      `SELECT * FROM permissions WHERE id = $1`,
      [scanRes.body.permissionId]
    )
    expect(rows[0].client_id).toBe(client.userId)
    expect(rows[0].grantee_id).toBe(doctor.userId)
    expect(rows[0].revoked_at).toBeNull()
  })

  it('doctor cannot scan the same QR twice', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const genRes = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ accessLevel: 'readonly', expiresAt: futureDate(1) })

    const { tokenId } = genRes.body
    const rawToken = 'known-double-scan-token-abcdefgh1234567890ab'
    const { hashToken } = require('../src/utils/crypto')
    await pool.query(`UPDATE qr_tokens SET token_hash = $1 WHERE id = $2`, [hashToken(rawToken), tokenId])

    await pool.query(`UPDATE client_profiles SET full_name = 'Client' WHERE user_id = $1`, [client.userId])

    await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ tokenId, rawToken })

    const res2 = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ tokenId, rawToken })

    expect(res2.status).toBe(403)
    expect(res2.body.error).toBe('QR_USED')
  })

  it('expired QR cannot be scanned', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const genRes = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ accessLevel: 'readonly', expiresAt: futureDate(1) })

    const { tokenId } = genRes.body
    const rawToken = 'expired-token-test-abcdefghijklmnopqrstuvwx'
    const { hashToken } = require('../src/utils/crypto')
    await pool.query(`UPDATE qr_tokens SET token_hash = $1, expires_at = now() - interval '1 second' WHERE id = $2`, [hashToken(rawToken), tokenId])

    const res = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ tokenId, rawToken })

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('QR_EXPIRED')
  })

  it('QR expiry cannot exceed 24 hours', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const res = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ accessLevel: 'readonly', expiresAt: futureDate(25) })

    expect(res.status).toBe(400)
  })

  it('client cannot scan a QR code', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const res = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ tokenId: '00000000-0000-0000-0000-000000000000', rawToken: 'x' })

    expect(res.status).toBe(403)
  })
})
