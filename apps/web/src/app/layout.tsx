import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BeautyPass — Your beauty journey, in one place',
  description:
    'Track every cosmetic treatment, share records securely with your doctor, and understand your skin — all in one place.',
  metadataBase: new URL('https://beautypass.lt'),
  openGraph: {
    title: 'BeautyPass',
    description: 'Track every cosmetic treatment, share records securely.',
    url: 'https://beautypass.lt',
    siteName: 'BeautyPass',
    locale: 'en',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
