import { ShoppingBag, Plane, BookOpen, Trophy, Users, ArrowRight } from "lucide-react";

const eventTypes = [
  {
    name: "Bazaars",
    description: "Student vendors, local artisans, and campus marketplace events",
    icon: ShoppingBag,
    colorMain: 'var(--bazaar-main)',
    colorLight: 'var(--bazaar-light)',
    colorBg: 'var(--bazaar-bg)',
  },
  {
    name: "Trips",
    description: "Organized travel experiences to Cairo, Berlin, and beyond",
    icon: Plane,
    colorMain: 'var(--trip-main)',
    colorLight: 'var(--trip-light)',
    colorBg: 'var(--trip-bg)',
  },
  {
    name: "Workshops",
    description: "Hands-on learning sessions led by industry experts",
    icon: BookOpen,
    colorMain: 'var(--workshop-main)',
    colorLight: 'var(--workshop-light)',
    colorBg: 'var(--workshop-bg)',
  },
  {
    name: "Competitions",
    description: "Challenge yourself and showcase your skills to peers",
    icon: Trophy,
    colorMain: 'var(--competition-main)',
    colorLight: 'var(--competition-light)',
    colorBg: 'var(--competition-bg)',
  },
  {
    name: "Conferences",
    description: "Academic gatherings with keynote speakers and symposiums",
    icon: Users,
    colorMain: 'var(--conference-main)',
    colorLight: 'var(--conference-light)',
    colorBg: 'var(--conference-bg)',
  },
];

export function EventTypesSection() {
  return (
    <section className="px-6 md:px-20 py-20 md:py-[120px] bg-white">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <p className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Event Categories
          </p>
          <h2 className="text-[32px] md:text-[40px] lg:text-[48px] leading-[1.2] tracking-tight mb-4" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Five Event Types, Endless Possibilities
          </h2>
          <p className="text-lg leading-[1.6] max-w-[640px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
            From student bazaars to international conferences, discover and participate in events that matter to you.
          </p>
        </div>
        
        {/* Event Type Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {eventTypes.map((event, index) => {
            const Icon = event.icon;
            return (
              <div
                key={index}
                className="group rounded-xl p-8 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer min-h-[280px] flex flex-col"
                style={{ 
                  backgroundColor: event.colorBg,
                  borderColor: event.colorLight,
                }}
              >
                {/* Icon Container */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: event.colorMain }}
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                
                {/* Event Type Name */}
                <h3 className="text-2xl mb-3" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {event.name}
                </h3>
                
                {/* Description */}
                <p className="text-base leading-[1.6] mb-5 flex-grow" style={{ color: 'var(--text-secondary)' }}>
                  {event.description}
                </p>
                
                {/* Learn More Link */}
                <a 
                  href="#"
                  className="inline-flex items-center text-sm font-medium group-hover:gap-2 transition-all duration-200"
                  style={{ color: event.colorMain }}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
