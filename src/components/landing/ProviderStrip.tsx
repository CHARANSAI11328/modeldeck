"use client";

import React from "react";
import { ProviderMark } from "@/components/ui/ProviderMark";
import { PROVIDER_LIST } from "@/lib/providers";
import { ProviderId } from "@/lib/types";

export function ProviderStrip() {
  return (
    <section className="py-8 sm:py-12 border-y border-border/80 bg-surface-1/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Direct High-Throughput Connections to 40+ Frontier Models
          </p>
        </div>

        {/* Multi-provider grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PROVIDER_LIST.slice(0, 10).map((prov) => (
            <div
              key={prov.id}
              className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-surface-1 px-3.5 py-2.5 shadow-sm hover:border-zinc-700/80 transition-colors"
            >
              <ProviderMark providerId={prov.id as ProviderId} label={prov.shortLabel} className="h-4.5 w-4.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-foreground block truncate">
                  {prov.label}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground block truncate">
                  Direct BYOK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

