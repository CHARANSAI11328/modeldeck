"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { EnginesSection } from "@/components/landing/EnginesSection";
import { InteractivePlaygroundSection } from "@/components/landing/InteractivePlaygroundSection";
import { StudioForgeSection } from "@/components/landing/StudioForgeSection";
import { SecurityVaultSection } from "@/components/landing/SecurityVaultSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function SinglePageLanding() {
  return (
    <div className="min-h-screen bg-[#0c0807] text-[#faf5ef] selection:bg-[#ff5722]/30 selection:text-white">
      {/* 1. Atmospheric Ambient Noise Texture */}
      <div className="site-noise" aria-hidden="true" />

      {/* 2. Fixed Smooth-Scroll Pill Navbar */}
      <LandingNavbar />

      {/* 3. Main Single-Page Scroll Content */}
      <main className="relative z-10">
        {/* #home: The Reference-grade Hero with Concentric AI Orbitals */}
        <LandingHero />

        {/* #engines: Every Frontier Model Matrix & Filter */}
        <EnginesSection />

        {/* #playground: In-Page Multi-Model Comparative Playground */}
        <InteractivePlaygroundSection />

        {/* #studio: In-Page Assistant Studio & Persona Forge */}
        <StudioForgeSection />

        {/* #security: Zero-Trust BYOK Encryption Vault */}
        <SecurityVaultSection />

        {/* #faq: Interactive Accordion FAQ */}
        <FaqSection />
      </main>

      {/* 4. Warm Obsidian Footer */}
      <LandingFooter />
    </div>
  );
}
