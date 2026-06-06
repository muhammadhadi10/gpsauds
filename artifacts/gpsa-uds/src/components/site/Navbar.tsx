"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "News", href: "/news" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Welfare", href: "/welfare" },
  { label: "Resources", href: "/resources" },
  { label: "Join Us", href: "/join" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-white py-5"
      )}
    >
      <div className="container-max px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <span className="font-display font-bold text-2xl text-navy-900 tracking-tight">
            GPSA-UDS
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-gold-500 relative py-1",
                pathname === link.href ? "text-navy-900" : "text-muted-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-navy-900 border border-navy-900 rounded-full hover:bg-navy-900 hover:text-white transition-colors"
          >
            Member Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden z-50 p-2 text-navy-900"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out lg:hidden pt-24 px-6 flex flex-col",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <nav className="flex flex-col gap-6 text-center overflow-y-auto pb-20">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-2xl font-display font-medium",
                pathname === link.href ? "text-gold-500" : "text-navy-900"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block w-full px-6 py-4 text-lg font-medium text-white bg-navy-900 rounded-xl"
            >
              Member Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
