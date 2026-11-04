"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export function LandingFooter() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-[#080504] text-[#faf5ef] border-t border-white/[0.08] py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand & Mission */}
          <div className="space-y-3 max-w-sm">
            <a
              href="#home"
              onClick={scrollToTop}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5722] via-[#ea580c] to-[#9a3412] text-white font-black text-sm shadow-lg shadow-[#ff5722]/30 group-hover:scale-105 transition-transform">
                <span className="w-2.5 h-2.5 rounded-sm bg-white rotate-45" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#faf5ef]">
                modeldeck<span className="text-[#ff5722]">.</span>
              </span>
            </a>
            <p className="text-xs text-[#9e8e83] leading-relaxed">
              The high-velocity BYOK intelligence deck. Route, evaluate, and embed frontier AI with hardware speed and local AES-GCM-256 encryption.
            </p>
          </div>

          {/* Quick Smooth Anchor Navigation */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#c2b2a6]">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              className="hover:text-[#ff8a50] transition-colors"
            >
              Home
            </a>
            <a
              href="#engines"
              onClick={(e) => handleNavClick(e, "#engines")}
              className="hover:text-[#ff8a50] transition-colors"
            >
              Engines
            </a>
            <a
              href="#playground"
              onClick={(e) => handleNavClick(e, "#playground")}
              className="hover:text-[#ff8a50] transition-colors"
            >
              Playground
            </a>
            <a
              href="#studio"
              onClick={(e) => handleNavClick(e, "#studio")}
              className="hover:text-[#ff8a50] transition-colors"
            >
              Studio
            </a>
            <a
              href="#security"
              onClick={(e) => handleNavClick(e, "#security")}
              className="hover:text-[#ff8a50] transition-colors"
            >
              Security
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "#faq")}
              className="hover:text-[#ff8a50] transition-colors"
            >
              FAQ
            </a>
          </div>

          {/* Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-[#160e0a] hover:bg-[#20140e] px-4 py-2 text-xs font-mono text-[#c2b2a6] hover:text-[#faf5ef] transition-colors"
            aria-label="Scroll to top"
          >
            <span>Top</span>
            <ArrowUp className="h-3.5 w-3.5 text-[#ff5722]" />
          </button>
        </div>

        {/* Bottom Metadata & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#7d6e64]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#a8998e]">All 9 Frontier Engines Operational</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/playground" className="text-[#a8998e] hover:text-[#ff8a50] transition-colors">
              Full Playground
            </Link>
            <span>•</span>
            <Link href="/studio" className="text-[#a8998e] hover:text-[#ff8a50] transition-colors">
              Full Studio
            </Link>
            <span>•</span>
            <span>Zero-Trust Vault</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
