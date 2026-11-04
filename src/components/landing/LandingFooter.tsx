"use client";

import React from "react";
import Link from "next/link";
import { Bot, Sparkles, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface-1/70 backdrop-blur-xl py-12 sm:py-16 text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-blue-500/20">
                MD
              </div>
              <span className="font-bold text-sm text-foreground tracking-tight">ModelDeck</span>
            </Link>
            <p className="leading-relaxed">
              Multi-provider BYOK AI testing playground and personalized portfolio assistant generator.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-knowledge client encryption</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground font-mono">
              Workstation
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/playground" className="hover:text-foreground transition-colors">
                  Live Chat Playground
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-foreground transition-colors">
                  Assistant Studio Generator
                </Link>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-foreground transition-colors">
                  Interactive Terminal Demo
                </a>
              </li>
              <li>
                <a href="#benchmarks" className="hover:text-foreground transition-colors">
                  Velocity &amp; Cost Benchmarks
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Providers */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground font-mono">
              Supported Engines
            </h4>
            <ul className="space-y-1.5">
              <li>
                <span className="text-muted-foreground">OpenAI (GPT-4o, o1, o3, o4)</span>
              </li>
              <li>
                <span className="text-muted-foreground">Anthropic (Claude 3.7 Sonnet)</span>
              </li>
              <li>
                <span className="text-muted-foreground">Google (Gemini 2.5 Flash / Pro)</span>
              </li>
              <li>
                <span className="text-muted-foreground">DeepSeek (R1 Reasoning &amp; V3)</span>
              </li>
              <li>
                <span className="text-muted-foreground">Groq LPU (Ultra-Low Latency)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Open Source */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground font-mono">
              Open Source
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://github.com/CHARANSAI11328/modeldeck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">MIT License • BYOK Standard</span>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  Security &amp; Encryption FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} ModelDeck. Designed and built with the Creative Intelligence Skills Library.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/playground" className="hover:text-foreground transition-colors">
              Playground
            </Link>
            <Link href="/studio" className="hover:text-foreground transition-colors">
              Studio
            </Link>
            <a
              href="https://github.com/CHARANSAI11328/modeldeck"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
