import { LandingHero } from '@/components/landing/landing-hero'
import { LandingFeatures } from '@/components/landing/landing-features'
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingFooter />
    </main>
  )
}
