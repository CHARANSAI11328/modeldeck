"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Sparkles, Menu, X, ShieldCheck, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/80 shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="btn-tactile flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            MD
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-foreground">ModelDeck</span>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/25 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono tracking-tight -mt-0.5">
              BYOK AI Playground &amp; Studio
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-1/80 border border-border/80 rounded-full px-4 py-1.5 backdrop-blur-md shadow-sm">
          <a
            href="#features"
            className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface-2"
          >
            Features
          </a>
          <a
            href="#interactive-demo"
            className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface-2"
          >
            Live Demo
          </a>
          <a
            href="#benchmarks"
            className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface-2"
          >
            Benchmarks
          </a>
          <a
            href="#studio"
            className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface-2"
          >
            Studio
          </a>
          <a
            href="#faq"
            className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface-2"
          >
            FAQ
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Link
            href="/studio"
            className="btn-tactile hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-1 hover:bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition-all shadow-sm"
          >
            <Bot className="h-3.5 w-3.5 text-blue-500" />
            <span>Studio</span>
          </Link>

          <Link
            href="/playground"
            className="btn-tactile group inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all"
          >
            <span>Launch Playground</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-tactile md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-border"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface-1/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-surface-2"
            >
              Features
            </a>
            <a
              href="#interactive-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-surface-2"
            >
              Live Demo
            </a>
            <a
              href="#benchmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-surface-2"
            >
              Speed &amp; Cost Benchmarks
            </a>
            <a
              href="#studio"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-surface-2"
            >
              Assistant Studio
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-surface-2"
            >
              FAQ
            </a>
          </div>

          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link
              href="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-tactile flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-2.5 text-xs font-semibold text-foreground"
            >
              <Bot className="h-4 w-4 text-blue-500" />
              <span>Assistant Studio</span>
            </Link>
            <Link
              href="/playground"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-tactile flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25"
            >
              <span>Launch Playground</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

