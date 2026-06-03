import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // next-intl plugin uses experimental.turbo (Next.js 15 API) which is ignored in Next.js 16.
  // Add the alias under the stable turbopack key so it works in both dev and build.
  turbopack: {
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
    },
  },
}

export default withNextIntl(nextConfig)
