import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function CTASection({ onGetStarted }) {
  return (
    <section className="relative px-6 md:px-20 py-20 md:py-[120px] overflow-hidden">
      {/* Dark Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        }}
      />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full" style={{ backgroundColor: 'var(--bazaar-main)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full" style={{ backgroundColor: 'var(--workshop-main)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" style={{ backgroundColor: 'var(--competition-main)' }} />
      </div>
      
      <div className="relative max-w-[800px] mx-auto text-center z-10">
        {/* Heading */}
        <h2 className="text-[32px] md:text-[40px] lg:text-[48px] leading-[1.2] tracking-tight text-white mb-6" style={{ fontWeight: 700 }}>
          Ready To Transform Your Campus Experience?
        </h2>
        
        {/* Subheading */}
        <p className="text-lg leading-[1.6] text-white/80 max-w-[640px] mx-auto mb-10">
          Join thousands of students, faculty, and partners already using our platform to discover and manage campus events.
        </p>
        
        {/* Primary CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <Button 
            className="h-14 px-12 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 bg-white border-none"
            style={{ 
              color: 'var(--competition-main)',
            }}
            onClick={onGetStarted}
          >
            Create Your Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {/* Secondary Link */}
          <a 
            href="#"
            className="text-base text-white/90 hover:text-white transition-colors duration-200 hover:underline"
            style={{ fontWeight: 500 }}
          >
            Schedule a Demo for Administrators →
          </a>
        </div>
      </div>
    </section>
  );
}
