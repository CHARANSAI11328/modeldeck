"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does the BYOK (Bring Your Own Key) model work?",
    a: "Instead of paying a third-party subscription markup, you enter API keys generated directly from official provider consoles (OpenAI, Anthropic, Google AI Studio, DeepSeek, Groq). ModelDeck communicates directly with those providers on your behalf. You pay pennies directly to the provider for the exact tokens you generate.",
  },
  {
    q: "Are my API keys stored on your servers or databases?",
    a: "Never. ModelDeck is zero-trust by design. Your keys are encrypted locally in your browser's private memory using hardware-accelerated AES-GCM-256 and synchronized locally across your open tabs. They are never transmitted, logged, stored, or inspected on any third-party server.",
  },
  {
    q: "Can I use ModelDeck completely for free without entering a credit card?",
    a: "Yes! Both Groq and Google AI Studio offer generous free tiers with no payment card required. You can generate instant keys on GroqCloud and Google AI Studio to test frontier Llama 3.3 70B and Gemini 2.5 Flash models immediately.",
  },
  {
    q: "How does the Assistant Studio embed into my website?",
    a: "Assistant Studio compiles your customized bot into a lightweight vanilla JS script (<12KB) that runs entirely inside an isolated Shadow DOM. You can paste a single script tag before </body> on any HTML, Next.js, React, or Astro site, or use our 1-click GitHub Pull Request automation to open a PR on your repository.",
  },
  {
    q: "Can I connect local models running on Ollama, vLLM, or LM Studio?",
    a: "Absolutely. ModelDeck supports standard OpenAI-compatible local endpoints (e.g., http://localhost:11434/v1). You can test locally hosted open-weights completely offline on your own GPU/CPU hardware with zero data leaving your machine.",
  },
  {
    q: "How does the single-page navigation work?",
    a: "Every item in the top menu (Home, Engines, Playground, Studio, Security, FAQ) uses smooth hardware-accelerated scrolling with precise offset padding. You can jump directly to any section or interact with the in-page tools without losing your state.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 bg-[#0c0807] text-[#faf5ef] border-t border-white/[0.06]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c100b] border border-amber-900/50 text-[11px] font-mono font-semibold text-[#ff8a50]">
            <HelpCircle className="h-3.5 w-3.5 text-[#ff5722]" />
            <span>05 / FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#faf5ef]">
            Zero-Trust, Zero-Markup FAQ
          </h2>
          <p className="text-sm sm:text-base text-[#ab9b8f]">
            Clear answers about keys, privacy, local models, and embed architecture.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#140d0a]/70 backdrop-blur-xl transition-all duration-200 overflow-hidden"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#faf5ef] hover:text-[#ff8a50] transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className="p-1.5 rounded-full bg-white/[0.04] text-[#c2b2a5]">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#ff5722]" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#b8a79a] leading-relaxed border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
