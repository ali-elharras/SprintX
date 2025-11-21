import { GraduationCap, Briefcase, Handshake, Check } from "lucide-react";
import { Button } from "./ui/button";

export function UserTypeSection({ onStudentSignup, onFacultySignup, onPartnerSignup }) {
  const userTypes = [
    {
      title: "Students",
      icon: GraduationCap,
      benefits: [
        "Discover events tailored to your interests",
        "Register and track attendance in one place",
        "Get real-time notifications for upcoming events",
        "Build your campus engagement portfolio"
      ],
      cta: "Sign Up as Student",
      isPrimary: true,
      onClick: onStudentSignup,
    },
    {
      title: "Faculty & Staff",
      icon: Briefcase,
      benefits: [
        "Propose and organize academic workshops",
        "Manage event logistics and approvals",
        "Track attendance and engagement metrics",
        "Collaborate with other departments"
      ],
      cta: "Request Access",
      isPrimary: false,
      onClick: onFacultySignup,
    },
    {
      title: "External Partners",
      icon: Handshake,
      benefits: [
        "Register for campus bazaars and career fairs",
        "Showcase products and services to students",
        "Streamlined approval process",
        "Access to engaged university community"
      ],
      cta: "Become a Partner",
      isPrimary: false,
      onClick: onPartnerSignup,
    },
  ];
  return (
    <section className="px-6 md:px-20 py-20 md:py-[120px]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <h2 className="text-[32px] md:text-[40px] lg:text-[48px] leading-[1.2] tracking-tight mb-4" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Built For Everyone On Campus
          </h2>
          <p className="text-lg leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
            Whether you're organizing, attending, or partnering—our platform adapts to your needs.
          </p>
        </div>
        
        {/* User Type Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userTypes.map((user, index) => {
            const Icon = user.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-10 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl min-h-[340px] flex flex-col"
                style={{ 
                  borderColor: 'var(--border-default)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
              >
                {/* Icon */}
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--competition-main) 0%, var(--workshop-main) 100%)'
                  }}
                >
                  <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                
                {/* Title */}
                <h3 className="text-[28px] md:text-[36px] leading-[1.2] mb-4" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {user.title}
                </h3>
                
                {/* Benefits List */}
                <ul className="space-y-4 mb-8 flex-grow">
                  {user.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check 
                        className="w-5 h-5 mt-0.5 flex-shrink-0" 
                        style={{ color: 'var(--competition-main)' }}
                        strokeWidth={2.5}
                      />
                      <span className="text-base leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                {user.isPrimary ? (
                  <Button 
                    className="w-full h-10 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'var(--competition-main)', 
                      color: 'white',
                      border: 'none'
                    }}
                    onClick={user.onClick}
                  >
                    {user.cta}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full h-10 rounded-lg transition-all duration-200 hover:bg-[var(--bg-secondary)]"
                    style={{ 
                      borderWidth: '2px',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent'
                    }}
                    onClick={user.onClick}
                  >
                    {user.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
