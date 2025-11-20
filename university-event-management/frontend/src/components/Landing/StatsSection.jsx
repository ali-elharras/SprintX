import { Users, Calendar, Briefcase, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    number: "5,000+",
    label: "Active Students",
  },
  {
    icon: Calendar,
    number: "200+",
    label: "Events Annually",
  },
  {
    icon: Briefcase,
    number: "50+",
    label: "Partner Companies",
  },
  {
    icon: Star,
    number: "98%",
    label: "Satisfaction Rate",
  },
];

export function StatsSection() {
  return (
    <section className="px-6 md:px-20 py-16 md:py-20" style={{ backgroundColor: 'var(--competition-bg)' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center max-w-[240px] mx-auto">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <Icon 
                    className="w-12 h-12" 
                    style={{ color: 'var(--competition-light)' }}
                    strokeWidth={1.5}
                  />
                </div>
                
                {/* Number */}
                <div 
                  className="text-[48px] md:text-[72px] leading-[1] mb-2"
                  style={{ 
                    color: 'var(--competition-main)',
                    fontWeight: 700
                  }}
                >
                  {stat.number}
                </div>
                
                {/* Label */}
                <div className="text-lg leading-[1.6]" style={{ color: 'var(--text-primary)' }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
