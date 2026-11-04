"use client";

import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Key,
  ServerOff,
  EyeOff,
  Check,
  RefreshCw,
  Cpu,
} from "lucide-react";

export function SecurityVaultSection() {
  const [mockKey, setMockKey] = useState("sk-ant-api03-kJ89mN21qZ45xP89");
  const [encryptedHash, setEncryptedHash] = useState(
    "7a9b1c4e8f02d5e38194b6c8a1e2f3d4...[AES-GCM-256]"
  );

  const handleKeyChange = (val: string) => {
    setMockKey(val);
    // Generate simulated pseudo-encrypted hex string
    let hash = "";
    for (let i = 0; i < 32; i++) {
      hash += Math.floor(Math.random() * 16).toString(16);
    }
    setEncryptedHash(`${hash}...[AES-GCM-256]`);
  };

  return (
    <section
      id="security"
      className="relative py-24 sm:py-32 bg-[#0a0605] text-[#faf5ef] border-t border-white/[0.06] overflow-hidden"
    >
      {/* Background warm amber glow */}
      <div
        className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[150px]"
        style={{
          background: "radial-gradient(circle, #ff5722 0%, rgba(10,6,5,0) 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c100b] border border-amber-900/50 text-[11px] font-mono font-semibold text-[#ff8a50]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#ff5722]" />
            <span>04 / HARDWARE-GRADE ZERO TRUST</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#faf5ef]">
            Your Keys Never Touch Our Servers.
          </h2>
          <p className="text-sm sm:text-base text-[#ab9b8f]">
            ModelDeck is a client-side execution harness. Your API credentials are encrypted with hardware-accelerated AES-GCM-256 in your browser and sent directly to provider APIs over encrypted TLS.
          </p>
        </div>

        {/* 2-Column: Left Pillars, Right Interactive Vault Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: 4 Security Guarantees */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#140d0a]/70 backdrop-blur-xl flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#faf5ef]">
                  Hardware-Enforced AES-GCM-256
                </h3>
                <p className="text-xs text-[#a8998e] leading-relaxed">
                  Keys are stored using the Web Cryptography API (`crypto.subtle`). Encryption keys never touch persistent plain storage.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#140d0a]/70 backdrop-blur-xl flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <ServerOff className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#faf5ef]">
                  Zero Server Intermediary Storage
                </h3>
                <p className="text-xs text-[#a8998e] leading-relaxed">
                  We maintain zero user key databases. Requests fly straight from your browser to OpenAI, Anthropic, or Groq via direct CORS endpoints.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#140d0a]/70 backdrop-blur-xl flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                <EyeOff className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#faf5ef]">
                  Zero Prompt Telemetry Logging
                </h3>
                <p className="text-xs text-[#a8998e] leading-relaxed">
                  Your prompts and completions belong entirely to you. No tracking, no scraping, no model re-training on your enterprise queries.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive AES-256 Vault Encryption Simulator */}
          <div className="lg:col-span-6 rounded-2xl border border-amber-900/40 bg-[#160e0a] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[#ff5722]" />
                <span className="text-xs font-bold font-mono text-[#faf5ef] uppercase tracking-wider">
                  Interactive Vault Cipher Simulator
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                CLIENT-SIDE AES-GCM
              </span>
            </div>

            {/* Input Mock Key */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9e8e83] flex items-center justify-between">
                <span>Test with any sample API key:</span>
                <span className="text-[10px] text-[#ff8a50]">Type to watch encryption</span>
              </label>
              <div className="flex items-center gap-2 bg-[#0c0705] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-[#faf5ef]">
                <input
                  type="text"
                  value={mockKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className="w-full bg-transparent focus:outline-none"
                  placeholder="Paste or type sample key..."
                />
              </div>
            </div>

            {/* Derived Cryptographic Output */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#0e0806] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#7d6e64]">
                  <span>Initialization Vector (12-byte IV):</span>
                  <span className="text-amber-400">c3a4f891b02d</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#7d6e64]">
                  <span>Authentication Tag (16-byte GCM):</span>
                  <span className="text-emerald-400">9e2d14b8a10f8c2e</span>
                </div>
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-[#8f7f74] block mb-1">
                    Encrypted Ciphertext in Browser Memory:
                  </span>
                  <span className="text-[11px] text-[#ff8a50] break-all block">
                    {encryptedHash}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#9e8e83]">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Only your browser can decrypt this cipher. No middleman proxy has access.</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

