import request from 'supertest'
import { app, cleanDb, registerAndVerify } from './helpers'
import pool from '../src/db/pool'

beforeEach(cleanDb)
afterAll(() => pool.end())

describe('Permission system', () => {
  it('client can grant permission to a doctor', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const res = await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ granteeId: doctor.userId, granteeType: 'doctor', accessLevel: 'readonly' })

    expect(res.status).toBe(201)
    expect(res.body.client_id).toBe(client.userId)
    expect(res.body.grantee_id).toBe(doctor.userId)
  })

  it('doctor cannot view client treatment without permission', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    // Create a treatment
    const treatRes = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ title: 'Filler', type: 'dermal_filler', date: '2024-01-15', status: 'completed' })
    const treatmentId = treatRes.body.id

    const res = await request(app)
      .get(`/api/treatments/${treatmentId}`)
      .set('Authorization', `Bearer ${doctor.accessToken}`)

    expect(res.status).toBe(403)
  })

  it('doctor can view client treatment after permission granted', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const treatRes = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ title: 'Filler', type: 'dermal_filler', date: '2024-01-15', status: 'completed' })
    const treatmentId = treatRes.body.id

    await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ granteeId: doctor.userId, granteeType: 'doctor', accessLevel: 'readonly' })

    const res = await request(app)
      .get(`/api/treatments/${treatmentId}`)
      .set('Authorization', `Bearer ${doctor.accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(treatmentId)
  })

  it('doctor cannot access treatment after permission revoked', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const treatRes = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ title: 'Filler', type: 'dermal_filler', date: '2024-01-15', status: 'completed' })
    const treatmentId = treatRes.body.id

    const grantRes = await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ granteeId: doctor.userId, granteeType: 'doctor', accessLevel: 'readonly' })
    const permissionId = grantRes.body.id

    // Revoke
    await request(app)
      .delete(`/api/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${client.accessToken}`)

    const res = await request(app)
      .get(`/api/treatments/${treatmentId}`)
      .set('Authorization', `Bearer ${doctor.accessToken}`)

    expect(res.status).toBe(403)
  })

  it('expired permission is not honoured', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ title: 'Filler', type: 'dermal_filler', date: '2024-01-15', status: 'completed' })

    // Manually insert an already-expired permission
    await pool.query(
      `INSERT INTO permissions (client_id, grantee_id, grantee_type, access_level, expires_at)
       VALUES ($1, $2, 'doctor', 'readonly', now() - interval '1 second')`,
      [client.userId, doctor.userId]
    )

    const listRes = await request(app)
      .get('/api/treatments')
      .set('Authorization', `Bearer ${doctor.accessToken}`)

    expect(listRes.status).toBe(200)
    expect(listRes.body).toHaveLength(0)
  })

  it('only client can revoke their own permissions', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const client2 = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const grantRes = await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ granteeId: doctor.userId, granteeType: 'doctor', accessLevel: 'readonly' })

    // Another client tries to revoke
    const res = await request(app)
      .delete(`/api/permissions/${grantRes.body.id}`)
      .set('Authorization', `Bearer ${client2.accessToken}`)

    expect(res.status).toBe(404) // returns 404 since the WHERE clause doesn't match
  })
})
