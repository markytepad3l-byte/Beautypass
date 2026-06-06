import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db/pool'
import { config } from '../utils/config'
import { hashToken, generateToken } from '../utils/crypto'
import { sendEmail, verificationEmailText, passwordResetEmailText } from '../services/email'
import { validate } from '../middleware/validate'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas'

const router = Router()

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, role, fullName, licenseNumber, specialization, clinicName, dob, skinType } = req.body

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'Email already registered' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const isDev = process.env.NODE_ENV !== 'production'
    const { rows: [user] } = await client.query(
      `INSERT INTO users (email, password_hash, role${isDev ? ', email_verified_at' : ''}) VALUES ($1, $2, $3${isDev ? ', now()' : ''}) RETURNING id`,
      [email, passwordHash, role]
    )

    if (role === 'client') {
      await client.query(
        `INSERT INTO client_profiles (user_id, full_name, dob, skin_type) VALUES ($1, $2, $3, $4)`,
        [user.id, fullName, dob ?? null, skinType ?? null]
      )
    } else if (role === 'doctor') {
      await client.query(
        `INSERT INTO doctor_profiles (user_id, full_name, license_number, specialization) VALUES ($1, $2, $3, $4)`,
        [user.id, fullName, licenseNumber ?? null, specialization ?? null]
      )
    } else if (role === 'clinic_admin') {
      await client.query(
        `INSERT INTO clinic_profiles (user_id, name) VALUES ($1, $2)`,
        [user.id, clinicName ?? fullName]
      )
    }

    await client.query('COMMIT')

    if (!isDev) {
      const rawToken = generateToken()
      const tokenHash = hashToken(rawToken)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await pool.query(
        `INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt]
      )
      const link = `${config.baseUrl}/api/auth/verify-email?userId=${user.id}&token=${rawToken}`
      await sendEmail({ to: email, subject: 'Verify your BeautyPass email', text: verificationEmailText(link) })
    }

    res.status(201).json({ message: isDev ? 'Registered successfully.' : 'Registered successfully. Please check your email to verify your account.' })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})

// GET /api/auth/verify-email
router.get('/verify-email', validate(verifyEmailSchema, 'query'), async (req: Request, res: Response) => {
  const { token, userId } = req.query as { token: string; userId: string }
  const tokenHash = hashToken(token)

  const { rows } = await pool.query(
    `SELECT id FROM email_verifications
     WHERE user_id = $1 AND token_hash = $2 AND expires_at > now()`,
    [userId, tokenHash]
  )
  if (rows.length === 0) {
    res.status(400).json({ error: 'Invalid or expired verification link' })
    return
  }

  await pool.query(`UPDATE users SET email_verified_at = now() WHERE id = $1`, [userId])
  await pool.query(`DELETE FROM email_verifications WHERE user_id = $1`, [userId])

  res.json({ message: 'Email verified successfully' })
})

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password, deviceMeta } = req.body

  const { rows: [user] } = await pool.query(
    `SELECT id, password_hash, role, email_verified_at FROM users WHERE email = $1`,
    [email]
  )
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }
  if (!user.email_verified_at) {
    res.status(403).json({ error: 'Please verify your email before logging in' })
    return
  }
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role, email },
    config.jwtSecret,
    { expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] }
  )

  const rawRefresh = generateToken()
  const tokenHash = hashToken(rawRefresh)
  const familyId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { rows: [rt] } = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, family_id, device_meta, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [user.id, tokenHash, familyId, deviceMeta ? JSON.stringify(deviceMeta) : null, expiresAt]
  )

  res.json({
    accessToken,
    refreshToken: rawRefresh,
    tokenId: rt.id,
    role: user.role,
  })
})

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  const { refreshToken, tokenId } = req.body
  const tokenHash = hashToken(refreshToken)

  const { rows: [rt] } = await pool.query(
    `SELECT id, user_id, family_id, revoked_at, expires_at FROM refresh_tokens WHERE id = $1`,
    [tokenId]
  )

  if (!rt) {
    res.status(401).json({ error: 'Invalid refresh token' })
    return
  }

  // Token reuse detection — if this token is revoked, revoke the whole family
  if (rt.revoked_at) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL`,
      [rt.family_id]
    )
    res.status(401).json({ error: 'Token reuse detected. All sessions revoked.' })
    return
  }

  if (rt.token_hash !== undefined && rt.expires_at < new Date()) {
    res.status(401).json({ error: 'Refresh token expired' })
    return
  }

  // Verify hash
  const { rows: [rtWithHash] } = await pool.query(
    `SELECT token_hash FROM refresh_tokens WHERE id = $1`,
    [tokenId]
  )
  if (rtWithHash.token_hash !== tokenHash) {
    res.status(401).json({ error: 'Invalid refresh token' })
    return
  }

  // Revoke old token
  await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [tokenId])

  const { rows: [user] } = await pool.query(
    `SELECT email, role FROM users WHERE id = $1`,
    [rt.user_id]
  )

  const accessToken = jwt.sign(
    { userId: rt.user_id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] }
  )

  const rawRefresh = generateToken()
  const newTokenHash = hashToken(rawRefresh)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { rows: [newRt] } = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, family_id, device_meta, expires_at)
     VALUES ($1, $2, $3, (SELECT device_meta FROM refresh_tokens WHERE id = $4), $5) RETURNING id`,
    [rt.user_id, newTokenHash, rt.family_id, tokenId, expiresAt]
  )

  res.json({
    accessToken,
    refreshToken: rawRefresh,
    tokenId: newRt.id,
  })
})

// POST /api/auth/logout
router.post('/logout', validate(refreshSchema), async (req: Request, res: Response) => {
  const { tokenId } = req.body
  await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [tokenId])
  res.json({ message: 'Logged out' })
})

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  const { email } = req.body
  const { rows: [user] } = await pool.query(`SELECT id FROM users WHERE email = $1`, [email])

  // Always respond the same to prevent email enumeration
  if (user) {
    const rawToken = generateToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    )

    const link = `${config.baseUrl}/reset-password?userId=${user.id}&token=${rawToken}`
    await sendEmail({ to: email, subject: 'Reset your BeautyPass password', text: passwordResetEmailText(link) })
  }

  res.json({ message: 'If that email is registered, a reset link has been sent.' })
})

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  const { token, userId, newPassword } = req.body
  const tokenHash = hashToken(token)

  const { rows: [prt] } = await pool.query(
    `SELECT id FROM password_reset_tokens
     WHERE user_id = $1 AND token_hash = $2 AND used_at IS NULL AND expires_at > now()`,
    [userId, tokenHash]
  )
  if (!prt) {
    res.status(400).json({ error: 'Invalid or expired reset token' })
    return
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  const dbClient = await pool.connect()
  try {
    await dbClient.query('BEGIN')
    await dbClient.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, userId])
    await dbClient.query(`UPDATE password_reset_tokens SET used_at = now() WHERE id = $1`, [prt.id])
    // Revoke all refresh tokens for this user (force re-login on all devices)
    await dbClient.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    )
    await dbClient.query('COMMIT')
  } catch (err) {
    await dbClient.query('ROLLBACK')
    throw err
  } finally {
    dbClient.release()
  }

  res.json({ message: 'Password reset successfully. Please log in again.' })
})

export default router
