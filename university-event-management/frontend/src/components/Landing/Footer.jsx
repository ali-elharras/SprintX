import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  quickLinks: [
    { label: "About Us", href: "#" },
    { label: "How It Works", href: "#" },
    { label: "For Students", href: "#" },
    { label: "For Organizers", href: "#" },
    { label: "For Partners", href: "#" },
    { label: "Contact Support", href: "#" },
  ],
  eventTypes: [
    { label: "Bazaars", href: "#", color: 'var(--bazaar-main)' },
    { label: "Trips", href: "#", color: 'var(--trip-main)' },
    { label: "Workshops", href: "#", color: 'var(--workshop-main)' },
    { label: "Competitions", href: "#", color: 'var(--competition-main)' },
    { label: "Conferences", href: "#", color: 'var(--conference-main)' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="px-6 md:px-20 py-16 bg-[#111827]">
      <div className="max-w-[1280px] mx-auto">
        {/* Top Section - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl text-white" style={{ fontWeight: 600 }}>
                Campus Events
              </h3>
            </div>
            
            <p className="text-sm leading-[1.4] text-[#9ca3af] mb-6">
              Connecting the campus community through seamless event management.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white mb-4" style={{ fontWeight: 600 }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[#9ca3af] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Event Types */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white mb-4" style={{ fontWeight: 600 }}>
              Event Types
            </h4>
            <ul className="space-y-3">
              {footerLinks.eventTypes.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:opacity-80"
                    style={{ color: link.color }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white mb-4" style={{ fontWeight: 600 }}>
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@universityevents.edu"
                  className="flex items-center gap-2 text-sm text-[#9ca3af] hover:text-white transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  support@universityevents.edu
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                  <Phone className="w-4 h-4" />
                  +1 (555) 123-4567
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                  <MapPin className="w-4 h-4" />
                  Student Center, Room 201
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#374151] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#6b7280]">
            © 2025 University Event Management. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-[#9ca3af] hover:text-white transition-colors duration-200">
              Privacy Policy
            </a>
            <span className="text-[#6b7280]">•</span>
            <a href="#" className="text-xs text-[#9ca3af] hover:text-white transition-colors duration-200">
              Terms of Service
            </a>
            <span className="text-[#6b7280]">•</span>
            <a href="#" className="text-xs text-[#9ca3af] hover:text-white transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
