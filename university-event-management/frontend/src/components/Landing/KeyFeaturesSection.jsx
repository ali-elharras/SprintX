import { ImageWithFallback } from "./figma/ImageWithFallback";

const features = [
  {
    number: "01",
    title: "Discover Events That Match Your Interests",
    description: "Advanced filtering and personalized recommendations ensure you never miss an event that matters to you. Browse by type, date, location, or organizer.",
    colorBg: 'var(--bazaar-bg)',
    colorMain: 'var(--bazaar-main)',
    imagePosition: 'right',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
  },
  {
    number: "02",
    title: "Register in Seconds, Not Minutes",
    description: "One-click registration with automatic calendar integration. Track all your registered events in a single dashboard with reminders and updates.",
    colorBg: 'var(--trip-bg)',
    colorMain: 'var(--trip-main)',
    imagePosition: 'left',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  },
  {
    number: "03",
    title: "Stay Informed With Live Notifications",
    description: "Get instant updates about event changes, new opportunities, and important announcements. Never miss a deadline or last-minute change.",
    colorBg: 'var(--workshop-bg)',
    colorMain: 'var(--workshop-main)',
    imagePosition: 'right',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
  },
];

export function KeyFeaturesSection() {
  return (
    <section className="px-6 md:px-20 py-20 md:py-[120px] bg-white">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[720px] mb-20">
          <p className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--competition-main)' }}>
            Platform Features
          </p>
          <h2 className="text-[32px] md:text-[40px] lg:text-[48px] leading-[1.2] tracking-tight" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Everything You Need, Nothing You Don't
          </h2>
        </div>
        
        {/* Feature Blocks */}
        <div className="space-y-24 md:space-y-[120px]">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
                feature.imagePosition === 'left' ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content Column */}
              <div className={`max-w-[520px] ${feature.imagePosition === 'left' ? 'md:col-start-2' : ''}`}>
                {/* Feature Number Badge */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: feature.colorBg }}
                >
                  <span className="text-base" style={{ color: feature.colorMain, fontWeight: 600 }}>
                    {feature.number}
                  </span>
                </div>
                
                {/* Feature Heading */}
                <h3 className="text-[28px] md:text-[36px] leading-[1.2] mb-4" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {feature.title}
                </h3>
                
                {/* Feature Description */}
                <p className="text-lg leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
              
              {/* Image Column */}
              <div className={`${feature.imagePosition === 'left' ? 'md:col-start-1 md:row-start-1' : ''}`}>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border" 
                  style={{ 
                    borderColor: 'var(--border-default)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <ImageWithFallback
                    src={feature.imageUrl}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Decorative overlay */}
                  <div 
                    className="absolute inset-0 opacity-5"
                    style={{ backgroundColor: feature.colorMain }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
