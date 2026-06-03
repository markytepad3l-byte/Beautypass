import { Router, Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'
import pool from '../db/pool'
import { authenticate, authorize } from '../middleware/auth'
import { config } from '../utils/config'

const router = Router()
router.use(authenticate)

const AI_DISCLAIMER = 'This summary is for personal reference only and is not medical advice. Always consult a qualified healthcare professional for medical decisions.'

const SYSTEM_PROMPT = `You are a personal beauty and cosmetic treatment journal assistant.
Your role is strictly limited to:
1. Summarizing the client's treatment timeline in a friendly, readable way
2. Identifying patterns (e.g. frequency of treatments, gaps, recurring types)
3. Suggesting questions the client might want to ask their clinician at their next visit

You must NEVER:
- Diagnose any condition
- Assess the effectiveness or safety of any treatment
- Recommend specific treatments, products, or procedures
- Make any claims about health outcomes

Keep the tone supportive and informative. Write in plain language.`

// POST /api/insights/generate
router.post('/generate', authorize('client'), async (req: Request, res: Response) => {
  const clientId = req.user!.userId

  // Hard consent gate
  const { rows: [profile] } = await pool.query(
    `SELECT consent_ai_processing FROM client_profiles WHERE user_id = $1`,
    [clientId]
  )
  if (!profile?.consent_ai_processing) {
    res.status(403).json({
      error: 'AI_CONSENT_REQUIRED',
      message: 'Please enable AI processing consent in your account settings to use this feature.',
    })
    return
  }

  if (!config.anthropicApiKey) {
    res.status(503).json({ error: 'AI service not configured' })
    return
  }

  // Fetch treatment data — titles, types, dates, status only (no raw notes or photos)
  const { rows: treatments } = await pool.query(
    `SELECT title, type, date, status FROM treatments
     WHERE client_id = $1 AND deleted_at IS NULL ORDER BY date DESC LIMIT 20`,
    [clientId]
  )

  if (treatments.length === 0) {
    res.status(400).json({ error: 'No treatment history found to generate insights from.' })
    return
  }

  const inputSummary = treatments
    .map(t => `- ${t.date}: ${t.title} (${t.type}) [${t.status}]`)
    .join('\n')

  const promptHash = crypto.createHash('sha256').update(inputSummary).digest('hex')
  const userMessage = `Here is my treatment history:\n\n${inputSummary}\n\nPlease provide a summary, any patterns you notice, and questions I might ask my clinician.`

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const outputContent = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('\n')

  const { rows: [insight] } = await pool.query(
    `INSERT INTO ai_insights (client_id, prompt_hash, input_summary, output_content, model_version)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [clientId, promptHash, inputSummary, outputContent, message.model]
  )

  res.status(201).json({
    id: insight.id,
    content: outputContent,
    disclaimer: AI_DISCLAIMER,
    generatedAt: insight.generated_at,
  })
})

// GET /api/insights
router.get('/', authorize('client'), async (req: Request, res: Response) => {
  const clientId = req.user!.userId
  const { rows } = await pool.query(
    `SELECT id, output_content, model_version, generated_at FROM ai_insights
     WHERE client_id = $1 ORDER BY generated_at DESC LIMIT 20`,
    [clientId]
  )
  res.json(rows.map(r => ({
    id: r.id,
    content: r.output_content,
    modelVersion: r.model_version,
    generatedAt: r.generated_at,
    disclaimer: AI_DISCLAIMER,
  })))
})

export default router
