"use client";

import { useState } from "react";
import { Bot, Sparkles, X, Send } from "lucide-react";

type AiAssistantProps = {
  placement?: "floating" | "navbar";
};

export function AiAssistant({ placement = "floating" }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isNavbarPlacement = placement === "navbar";

  return (
    <>
      {isOpen && (
        <div
          className={`fixed z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-md)] ${
            isNavbarPlacement ? "right-4 top-20 sm:right-8 lg:right-12 xl:right-16" : "bottom-24 right-6"
          }`}
          role="dialog"
          aria-label="AI Assistant"
        >
          <div className="flex items-center justify-between gap-3 bg-[var(--accent)] px-4 py-3.5 text-[var(--text-on-accent)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5">
                <Bot size={19} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold">AI Assistant</p>
                <p className="text-xs text-[var(--accent-strong)] opacity-75">Here to help with your shipments</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-[var(--accent-strong)] transition-colors hover:bg-black/5"
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-3 bg-[var(--surface-soft)] px-4 py-5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Sparkles size={16} />
              </span>
              <div className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--text)] shadow-sm">
                Hi! I&apos;m your logistics assistant. Ask me about tracking, shipments,
                or payments.
                <span className="mt-2 block text-xs font-semibold text-[var(--text-muted)]">
                  Full chat is coming soon.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--border)] bg-white p-3">
            <input
              type="text"
              disabled
              placeholder="Coming soon…"
              className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] disabled:cursor-not-allowed"
              aria-label="Message the assistant"
              suppressHydrationWarning
            />
            <button
              type="button"
              disabled
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
              suppressHydrationWarning
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={
          isNavbarPlacement
            ? "flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[var(--accent)] px-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
            : "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-lg transition-all hover:scale-105 hover:bg-[var(--accent-hover)]"
        }
        style={{ boxShadow: "var(--shadow-md)" }}
        aria-label="Open AI Assistant"
        aria-expanded={isOpen}
        suppressHydrationWarning
      >
        {isOpen ? <X size={18} /> : <Bot size={18} />}
        <span
          className={isNavbarPlacement ? "hidden xl:inline" : "hidden sm:inline"}
        >
          AI Assistant
        </span>
      </button>
    </>
  );
}
