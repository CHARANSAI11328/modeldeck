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
    a: "Instead of paying a third-party subscription markup, you generate API credentials directly from official provider consoles (OpenAI, Anthropic, Google AI Studio, DeepSeek, Groq). ModelDeck communicates directly with those providers on your behalf. You pay pennies directly to the provider for the tokens you generate.",
  },
  {
    q: "Are my API keys stored on your servers or databases?",
    a: "Never. ModelDeck is zero-trust by design. Your keys are encrypted in your browser's private memory using hardware-accelerated AES-GCM-256 and synchronized locally across your open tabs via BroadcastChannel. They are never logged, stored, or inspected on any third-party database.",
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
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Zero-Trust, Zero-Markup FAQ
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Clear answers about keys, privacy, models, and embed architecture.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="double-bezel">
                <div className="double-bezel-inner overflow-hidden">
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-foreground hover:bg-surface-2/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-md bg-surface-2 text-muted-foreground ml-3 shrink-0">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

