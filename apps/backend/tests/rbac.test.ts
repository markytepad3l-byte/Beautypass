import request from 'supertest'
import { app, cleanDb, registerAndVerify } from './helpers'
import pool from '../src/db/pool'

beforeEach(cleanDb)
afterAll(() => pool.end())

describe('Role-based access control', () => {
  it('unauthenticated requests are rejected', async () => {
    const res = await request(app).get('/api/treatments')
    expect(res.status).toBe(401)
  })

  it('doctor cannot create a treatment', async () => {
    const doctor = await registerAndVerify({ role: 'doctor' })
    const res = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ title: 'X', type: 'y', date: '2024-01-01', status: 'planned' })
    expect(res.status).toBe(403)
  })

  it('clinic cannot create a treatment', async () => {
    const clinic = await registerAndVerify({ role: 'clinic_admin' })
    const res = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${clinic.accessToken}`)
      .send({ title: 'X', type: 'y', date: '2024-01-01', status: 'planned' })
    expect(res.status).toBe(403)
  })

  it('client cannot grant permissions as a doctor', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    // Client tries to grant permission using doctor's grantee_type but wrong role
    const res = await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ granteeId: client.userId, granteeType: 'doctor', accessLevel: 'readonly' })

    expect(res.status).toBe(403)
  })

  it('client cannot generate a QR code scan (only doctors/clinics can scan)', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const res = await request(app)
      .post('/api/qr/scan')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ tokenId: '00000000-0000-0000-0000-000000000000', rawToken: 'test' })
    expect(res.status).toBe(403)
  })

  it("client cannot edit another client's treatment", async () => {
    const client1 = await registerAndVerify({ role: 'client' })
    const client2 = await registerAndVerify({ role: 'client' })

    const treatRes = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${client1.accessToken}`)
      .send({ title: 'Botox', type: 'botox', date: '2024-01-01', status: 'completed' })

    const res = await request(app)
      .patch(`/api/treatments/${treatRes.body.id}`)
      .set('Authorization', `Bearer ${client2.accessToken}`)
      .send({ title: 'Hacked' })

    expect(res.status).toBe(404)
  })

  it('doctor can add note when they have permission', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const treatRes = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ title: 'Botox', type: 'botox', date: '2024-01-01', status: 'completed' })

    await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ granteeId: doctor.userId, granteeType: 'doctor', accessLevel: 'full' })

    const noteRes = await request(app)
      .post(`/api/treatments/${treatRes.body.id}/notes`)
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ content: 'Patient responded well to 20 units of botulinum toxin.' })

    expect(noteRes.status).toBe(201)
    expect(noteRes.body.content).toBe('Patient responded well to 20 units of botulinum toxin.')
  })

  it('doctor cannot add note without permission', async () => {
    const client = await registerAndVerify({ role: 'client' })
    const doctor = await registerAndVerify({ role: 'doctor' })

    const treatRes = await request(app)
      .post('/api/treatments')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ title: 'Botox', type: 'botox', date: '2024-01-01', status: 'completed' })

    const res = await request(app)
      .post(`/api/treatments/${treatRes.body.id}/notes`)
      .set('Authorization', `Bearer ${doctor.accessToken}`)
      .send({ content: 'Unauthorized note.' })

    expect(res.status).toBe(403)
  })
})
