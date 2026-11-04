"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LiveTerminalDemo } from "@/components/landing/LiveTerminalDemo";
import { ProviderStrip } from "@/components/landing/ProviderStrip";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { BenchmarkMatrix } from "@/components/landing/BenchmarkMatrix";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StudioSpotlight } from "@/components/landing/StudioSpotlight";
import { FaqSection } from "@/components/landing/FaqSection";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground relative selection:bg-blue-500/25 selection:text-foreground overflow-x-hidden">
      {/* Ambient micro-grid and radial lighting meshes */}
      <div className="ambient-field" aria-hidden="true" />
      <div className="ambient-mesh-glow" aria-hidden="true" />

      {/* Navigation */}
      <LandingNavbar />

      {/* Main Page Flow */}
      <main className="relative z-10">
        <LandingHero />
        <LiveTerminalDemo />
        <ProviderStrip />
        <BentoFeatures />
        <BenchmarkMatrix />
        <HowItWorks />
        <StudioSpotlight />
        <FaqSection />
        <LandingCta />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
