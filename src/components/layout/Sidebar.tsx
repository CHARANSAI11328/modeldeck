"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DeckIcon, DeckLogo } from "@/components/ui/DeckIcon";
import { usePlaygroundStore } from "@/lib/store";
import { ProviderMark } from "@/components/ui/ProviderMark";

export function Sidebar() {
  const {
    sessions,
    currentSessionId,
    createNewSession,
    switchSession,
    deleteSession,
    isSidebarOpen,
    setSidebarOpen,
    setKeyVaultOpen,
    setApiDirectoryOpen,
  } = usePlaygroundStore();
  const [query, setQuery] = useState("");
  const aside = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [setSidebarOpen]);
  useEffect(() => {
    if (!isSidebarOpen || window.innerWidth >= 768) return;
    const previous = document.activeElement as HTMLElement;
    aside.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector('[aria-modal="true"]')) return;
      if (e.key === "Escape") {
        setSidebarOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items =
        aside.current?.querySelectorAll<HTMLElement>("a, button, input");
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [isSidebarOpen, setSidebarOpen]);
  const closeOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };
  if (!isSidebarOpen) return null;
  const visible = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div
        className="deck-sidebar-backdrop"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={aside}
        className="deck-sidebar"
        aria-label="Workspace navigation"
      >
        <div className="deck-sidebar-brand">
          <Link href="/" className="deck-brand">
            <DeckLogo />
            modeldeck<span>.</span>
          </Link>
          <button
            className="deck-icon-button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <DeckIcon name="panel" />
          </button>
        </div>
        <div className="deck-workspace-label">YOUR WORKSPACE</div>
        <nav className="deck-workspace-nav" aria-label="Workspaces">
          <Link href="/playground" aria-current="page">
            <DeckIcon name="chat" />
            Playground
            <span className="deck-dot" />
          </Link>
          <Link href="/studio">
            <DeckIcon name="spark" />
            Assistant Studio
            <DeckIcon name="arrow" />
          </Link>
        </nav>
        <button
          className="deck-new-chat"
          onClick={() => {
            createNewSession();
            closeOnMobile();
          }}
        >
          <DeckIcon name="plus" />
          New conversation<span>+</span>
        </button>
        <div className="deck-history-head">
          <span>RECENT CONVERSATIONS</span>
          <span>{sessions.length}</span>
        </div>
        <label className="deck-history-search">
          <DeckIcon name="search" width={15} />
          <input
            aria-label="Search conversations"
            placeholder="Find a conversation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="deck-history">
          {visible.length ? (
            visible.map((s) => (
              <div
                key={s.id}
                className={`deck-session ${s.id === currentSessionId ? "is-active" : ""}`}
              >
                <button
                  onClick={() => {
                    switchSession(s.id);
                    closeOnMobile();
                  }}
                  aria-current={s.id === currentSessionId ? "page" : undefined}
                >
                  <ProviderMark
                    providerId={s.providerId}
                    modelId={s.modelId}
                    className="h-4 w-4"
                  />
                  <span>
                    {s.title === "New Testing Session"
                      ? "New conversation"
                      : s.title}
                    <small>
                      {s.messages.length
                        ? `${s.messages.length} messages`
                        : "A fresh start"}
                    </small>
                  </span>
                </button>
                <button
                  className="deck-session-delete"
                  aria-label={`Delete conversation: ${s.title}`}
                  onClick={() => {
                    if (
                      !s.messages.length ||
                      window.confirm(
                        "Delete this conversation? This cannot be undone.",
                      )
                    )
                      deleteSession(s.id);
                  }}
                >
                  <DeckIcon name="trash" width={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="deck-no-results">No conversations found.</p>
          )}
        </div>
        <div className="deck-sidebar-bottom">
          <button onClick={() => setKeyVaultOpen(true)}>
            <DeckIcon name="key" />
            <span>API key vault</span>
            <DeckIcon name="chevron" width={14} />
          </button>
          <button onClick={() => setApiDirectoryOpen(true)}>
            <DeckIcon name="book" />
            <span>Provider directory</span>
            <DeckIcon name="chevron" width={14} />
          </button>
          <div className="deck-sidebar-foot">
            <span className="deck-dot" />
            Your models. Your space.
          </div>
        </div>
      </aside>
    </>
  );
}
