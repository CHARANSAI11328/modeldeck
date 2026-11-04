"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Sparkles, Menu, X, ShieldCheck, Zap, Lock } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Engines", href: "#engines" },
  { label: "Playground", href: "#playground" },
  { label: "Studio", href: "#studio" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section spy
      const sections = NAV_ITEMS.map((item) => item.href.slice(1));
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace("#", "");
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0f0907]/90 backdrop-blur-2xl border-b border-amber-950/40 shadow-2xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo - clean geometric lower-case matching reference */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex items-center gap-2 group cursor-pointer"
          aria-label="ModelDeck Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5722] via-[#ea580c] to-[#9a3412] text-white font-black text-sm shadow-lg shadow-[#ff5722]/30 group-hover:scale-105 transition-transform">
            <span className="w-2.5 h-2.5 rounded-sm bg-white rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#faf5ef]">
            modeldeck<span className="text-[#ff5722]">.</span>
          </span>
        </a>

        {/* Center Pill Navigation (Exact aesthetic of the reference image) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#1a110d]/80 border border-white/[0.08] rounded-full p-1.5 backdrop-blur-xl shadow-xl shadow-black/40">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#ff5722] text-[#1a0c06] shadow-md shadow-[#ff5722]/30 font-bold"
                    : "text-[#c2b2a6] hover:text-[#faf5ef] hover:bg-white/[0.06]"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Action (Pill with icon matching reference) */}
        <div className="flex items-center gap-3">
          <a
            href="#playground"
            onClick={(e) => handleNavClick(e, "#playground")}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-900/50 bg-[#21140e]/80 hover:bg-[#2c1b14] px-4 py-2 text-xs font-bold text-[#faf5ef] transition-all duration-200 shadow-md hover:border-amber-700/60"
          >
            <Lock className="h-3.5 w-3.5 text-[#ff7043]" />
            <span>BYOK Vault</span>
          </a>

          <a
            href="#playground"
            onClick={(e) => handleNavClick(e, "#playground")}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff5722] to-[#ea580c] hover:from-[#ff6b35] hover:to-[#f97316] px-4 sm:px-5 py-2 text-xs font-bold text-[#140a06] shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Deck</span>
            <div className="w-4 h-4 rounded-full bg-[#140a06]/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="h-2.5 w-2.5 text-[#140a06]" />
            </div>
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#c2b2a6] hover:text-[#faf5ef] bg-[#1a110d] border border-white/10"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-amber-950/60 bg-[#120a07]/98 backdrop-blur-2xl px-5 py-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  activeSection === item.href.slice(1)
                    ? "bg-[#ff5722] text-[#1a0c06]"
                    : "text-[#c2b2a6] hover:text-[#faf5ef] hover:bg-white/[0.05]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1c120d] py-3 text-xs font-bold text-[#faf5ef]"
            >
              <Bot className="h-4 w-4 text-[#ff7043]" />
              <span>Full Studio Workspace</span>
            </Link>
            <Link
              href="/playground"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ea580c] py-3 text-xs font-bold text-[#140a06] shadow-lg shadow-[#ff5722]/20"
            >
              <span>Full Screen Playground</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
