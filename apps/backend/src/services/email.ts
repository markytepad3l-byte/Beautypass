import { config } from '../utils/config'

interface EmailOptions {
  to: string
  subject: string
  text: string
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (config.skipEmail) {
    console.log(`[EMAIL] To: ${opts.to} | Subject: ${opts.subject}\n${opts.text}`)
    return
  }
  // Production: swap in nodemailer here
  throw new Error('SMTP not configured — set SKIP_EMAIL=true for dev')
}

export function verificationEmailText(link: string): string {
  return `Welcome to BeautyPass!\n\nPlease verify your email:\n${link}\n\nThis link expires in 24 hours.`
}

export function passwordResetEmailText(link: string): string {
  return `You requested a password reset for your BeautyPass account.\n\nReset your password:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`
}
