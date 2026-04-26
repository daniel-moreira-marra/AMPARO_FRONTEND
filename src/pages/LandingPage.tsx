import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import ForWho from "@/components/landing/ForWho";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <main className="flex flex-col scroll-smooth">
      <Hero />
      <StatsBar />
      <div id="como-funciona">
        <HowItWorks />
      </div>
      <ForWho />
      <div id="depoimentos">
        <Testimonials />
      </div>
      <CTASection />
    </main>
  );
}
