import { Header } from '@/components/marketing/Header'
import { Hero } from '@/components/marketing/Hero'
import { ZoneMap } from '@/components/marketing/ZoneMap'
import { ShareSection } from '@/components/marketing/ShareSection'
import { SplitSection } from '@/components/marketing/SplitSection'
import { ValuesSection } from '@/components/marketing/ValuesSection'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ZoneMap />
        <ShareSection />
        <SplitSection />
        <ValuesSection />
      </main>
      <Footer />
    </>
  )
}
