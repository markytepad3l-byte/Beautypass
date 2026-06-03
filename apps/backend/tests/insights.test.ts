import request from 'supertest'
import { app, cleanDb, registerAndVerify } from './helpers'
import pool from '../src/db/pool'

beforeEach(cleanDb)
afterAll(() => pool.end())

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          model: 'claude-sonnet-4-6',
          content: [{ type: 'text', text: 'Here is a summary of your treatments. You have had 2 treatments. You might ask your clinician about spacing recommendations.' }],
        }),
      },
    })),
  }
})

describe('AI Insights', () => {
  it('requires consent to generate insights', async () => {
    const client = await registerAndVerify({ role: 'client' })

    const res = await request(app)
      .post('/api/insights/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('AI_CONSENT_REQUIRED')
  })

  it('generates insight after consent enabled', async () => {
    const client = await registerAndVerify({ role: 'client' })

    // Enable consent
    await request(app)
      .patch('/api/account/consent')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ consentAiProcessing: true })

    // Add some treatments
    await pool.query(
      `INSERT INTO treatments (client_id, title, type, date, status) VALUES
       ($1, 'Botox', 'botox', '2024-01-01', 'completed'),
       ($1, 'Filler', 'dermal_filler', '2024-03-01', 'completed')`,
      [client.userId]
    )

    const res = await request(app)
      .post('/api/insights/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)

    expect(res.status).toBe(201)
    expect(res.body.content).toContain('summary')
    expect(res.body.disclaimer).toContain('not medical advice')

    // Verify stored in DB with audit fields
    const { rows } = await pool.query(
      `SELECT * FROM ai_insights WHERE client_id = $1`,
      [client.userId]
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].prompt_hash).toBeTruthy()
    expect(rows[0].input_summary).toBeTruthy()
    expect(rows[0].model_version).toBe('claude-sonnet-4-6')
  })

  it('fails without treatment data', async () => {
    const client = await registerAndVerify({ role: 'client' })
    await pool.query(`UPDATE client_profiles SET consent_ai_processing = true WHERE user_id = $1`, [client.userId])

    const res = await request(app)
      .post('/api/insights/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)

    expect(res.status).toBe(400)
  })

  it('doctor cannot generate insights', async () => {
    const doctor = await registerAndVerify({ role: 'doctor' })
    const res = await request(app)
      .post('/api/insights/generate')
      .set('Authorization', `Bearer ${doctor.accessToken}`)

    expect(res.status).toBe(403)
  })

  it('disabling consent blocks future generations', async () => {
    const client = await registerAndVerify({ role: 'client' })
    await pool.query(`UPDATE client_profiles SET consent_ai_processing = true WHERE user_id = $1`, [client.userId])

    // Disable consent
    await request(app)
      .patch('/api/account/consent')
      .set('Authorization', `Bearer ${client.accessToken}`)
      .send({ consentAiProcessing: false })

    const res = await request(app)
      .post('/api/insights/generate')
      .set('Authorization', `Bearer ${client.accessToken}`)

    expect(res.status).toBe(403)
  })
})
