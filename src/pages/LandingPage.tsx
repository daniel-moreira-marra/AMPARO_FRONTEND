import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTASection from "@/components/landing/CTASection";
import Testimonials from "@/components/landing/Testimonials";



export default function LandingPage() {
  return (
    <div className="flex flex-col scroll-smooth">
        <main>
            <Hero />
            <div id="como-funciona"><Features /></div>
            <div id="depoimentos"><Testimonials /></div>            
            <CTASection />
        </main>      
    </div>
  );
}