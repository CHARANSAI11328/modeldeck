"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { KeyVaultModal } from "@/components/modals/KeyVaultModal";
import { ParametersDrawer } from "@/components/modals/ParametersDrawer";
import { ApiKeyDirectoryModal } from "@/components/modals/ApiKeyDirectoryModal";
import { usePlaygroundStore } from "@/lib/store";

export default function Home() {
  const { refreshKeyStatus } = usePlaygroundStore();

  useEffect(() => {
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  return (
    <div className="app-shell flex h-[100dvh] w-full max-w-full overflow-hidden bg-background text-foreground relative selection:bg-blue-500/20 selection:text-foreground">
      {/* Luminous GPU-accelerated atmospheric background layers */}
      <div className="ambient-field" aria-hidden="true" />
      <div className="ambient-mesh-glow" aria-hidden="true" />

      {/* Sessions Sidebar */}
      <Sidebar />

      {/* Main Chat Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full relative z-10 overflow-hidden bg-transparent">
        <Navbar />
        <ChatContainer />
        <ChatInput />
      </div>

      {/* Global Modals */}
      <KeyVaultModal />
      <ParametersDrawer />
      <ApiKeyDirectoryModal />
    </div>
  );
}
