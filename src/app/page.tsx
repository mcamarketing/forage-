import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ProblemSection } from '@/components/ProblemSection';
import { MechanismSection } from '@/components/MechanismSection';
import { ValueStackSection } from '@/components/ValueStackSection';
import { SkillsSection } from '@/components/SkillsSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { SocialProofSection } from '@/components/SocialProofSection';
import { PricingSection } from '@/components/PricingSection';
import { GuaranteeSection } from '@/components/GuaranteeSection';
import { FAQSection } from '@/components/FAQSection';
import { FinalCTASection, Footer } from '@/components/FinalCTASection';
import { ChatWidget } from '@/components/ChatWidget';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <MechanismSection />
        <ValueStackSection />
        <SkillsSection />
        <HowItWorksSection />
        <SocialProofSection />
        <PricingSection />
        <GuaranteeSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
