"use client";

import React from "react";
import { AssistantStudio } from "@/components/studio/AssistantStudio";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StudioPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0c10] overflow-hidden">
      <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to ModelDeck Playground</span>
        </Link>
        <span className="text-zinc-500 font-mono text-[11px]">ModelDeck AI Assistant Engine</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <AssistantStudio />
      </div>
    </div>
  );
}
