import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('bp-locale')?.value ?? 'en'
  const supported = ['en', 'lt']
  const resolved = supported.includes(locale) ? locale : 'en'

  return {
    locale: resolved,
    messages: (await import(`./messages/${resolved}.json`)).default,
  }
})
