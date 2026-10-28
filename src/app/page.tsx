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
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b]">
      {/* Sessions Sidebar */}
      <Sidebar />

      {/* Main Chat Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full relative">
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
