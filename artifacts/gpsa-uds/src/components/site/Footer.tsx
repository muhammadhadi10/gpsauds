import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white/90 pt-16 pb-8">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display font-bold text-3xl text-white tracking-tight">
                GPSA-UDS
              </span>
            </Link>
            <p className="text-navy-200 max-w-sm text-sm leading-relaxed mb-8">
              Ghana Pharmaceutical Students Association, University for Development Studies. 
              Empowering the next generation of pharmacy leaders through academic excellence, 
              welfare support, and professional networking.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} label="Facebook" />
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} label="Instagram" />
              <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} label="LinkedIn" />
              <SocialLink href="#" icon={<MessageCircle className="w-5 h-5" />} label="WhatsApp" />
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="flex flex-col gap-3 text-sm text-navy-200">
              <li><Link href="/about" className="hover:text-gold-400 transition-colors">About Us</Link></li>
              <li><Link href="/events" className="hover:text-gold-400 transition-colors">Events & Seminars</Link></li>
              <li><Link href="/news" className="hover:text-gold-400 transition-colors">Latest News</Link></li>
              <li><Link href="/opportunities" className="hover:text-gold-400 transition-colors">Opportunities</Link></li>
              <li><Link href="/join" className="hover:text-gold-400 transition-colors">Become a Member</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-white">Academic & Support</h4>
            <ul className="flex flex-col gap-3 text-sm text-navy-200">
              <li><Link href="/resources" className="hover:text-gold-400 transition-colors">Past Questions</Link></li>
              <li><Link href="/resources" className="hover:text-gold-400 transition-colors">Lecture Notes</Link></li>
              <li><Link href="/welfare" className="hover:text-gold-400 transition-colors">Financial Aid</Link></li>
              <li><Link href="/welfare" className="hover:text-gold-400 transition-colors">Submit Request</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-white">Contact Us</h4>
            <ul className="flex flex-col gap-3 text-sm text-navy-200">
              <li>UDS Tamale Campus</li>
              <li>Dungu, Tamale, Ghana</li>
              <li className="pt-2"><a href="mailto:contact@gpsa-uds.org" className="hover:text-gold-400 transition-colors">contact@gpsa-uds.org</a></li>
              <li><a href="tel:+233200000000" className="hover:text-gold-400 transition-colors">+233 20 000 0000</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-navy-300">
          <p>© {new Date().getFullYear()} GPSA-UDS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-navy-200 hover:bg-gold-500 hover:text-white transition-colors"
    >
      {icon}
    </a>
  );
}
