import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection({ onGetStarted, onExploreEvents }) {
  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-20 py-20 md:py-[120px] overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center px-6 md:px-20 py-6" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <div className="flex items-center">
          <img
            src={require("../../assets/images/SprintXLogoBlack.png")}
            alt="SprintX"
            className="h-12 w-auto"
          />
        </div>
      </nav>

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(37,99,235,0.03)] via-[rgba(219,39,119,0.03)] to-[rgba(124,58,237,0.03)]" />
      
      <div className="relative max-w-[1280px] mx-auto w-full grid md:grid-cols-[60%_40%] gap-12 items-center">
        {/* Left Column - Content */}
        <div className="max-w-[640px] z-10">
          {/* Eyebrow Text */}
          <div className="mb-4">
            <span className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--competition-main)' }}>
              University Event Management
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-[40px] md:text-[56px] lg:text-[72px] leading-[1.2] tracking-tight mb-6" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Your Campus. Every Event. One Platform.
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg leading-[1.6] mb-10 max-w-[560px]" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of students, faculty, and partners managing bazaars, trips, workshops, competitions, and conferences—all in one seamless platform.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              className="h-12 px-8 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ 
                backgroundColor: 'var(--competition-main)', 
                color: 'white',
                border: 'none'
              }}
              onClick={onGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              className="h-12 px-8 rounded-lg transition-all duration-200 hover:bg-[var(--bg-secondary)]"
              style={{ 
                borderWidth: '2px',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent'
              }}
              onClick={onExploreEvents || onGetStarted}
            >
              Explore Events
            </Button>
          </div>
          
          {/* Social Proof Badge */}
          <div 
            className="inline-flex items-center gap-3 px-5 py-3 rounded-full"
            style={{ backgroundColor: 'var(--competition-bg)' }}
          >
            {/* Avatar Stack */}
            <div className="flex -space-x-2">
              {[
                'bg-[var(--bazaar-main)]',
                'bg-[var(--trip-main)]',
                'bg-[var(--workshop-main)]',
                'bg-[var(--competition-main)]'
              ].map((bgColor, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${bgColor}`}
                >
                  <span className="text-white text-xs font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                </div>
              ))}
            </div>
            
            <span className="text-sm font-medium" style={{ color: 'var(--competition-dark)' }}>
              Join 5,000+ students already registered
            </span>
          </div>
        </div>
        
        {/* Right Column - Visual */}
        <div className="relative hidden md:flex items-center justify-center">
          <div className="relative w-full max-w-[600px] aspect-square">
            {/* Decorative background shapes */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Main circular background */}
              <div className="absolute w-[500px] h-[500px] rounded-full opacity-10" style={{ backgroundColor: 'var(--competition-light)' }} />
              
              {/* Floating event type indicators */}
              <div className="absolute top-[10%] left-[10%] w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ backgroundColor: 'var(--bazaar-main)', animationDelay: '0s' }}>
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              
              <div className="absolute top-[20%] right-[15%] w-24 h-24 rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ backgroundColor: 'var(--trip-main)', animationDelay: '0.5s' }}>
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              
              <div className="absolute bottom-[15%] left-[15%] w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ backgroundColor: 'var(--workshop-main)', animationDelay: '1s' }}>
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <div className="absolute bottom-[25%] right-[10%] w-24 h-24 rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ backgroundColor: 'var(--conference-main)', animationDelay: '1.5s' }}>
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-2xl shadow-xl flex items-center justify-center z-10 animate-float" style={{ backgroundColor: 'var(--competition-main)', animationDelay: '0.25s' }}>
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
