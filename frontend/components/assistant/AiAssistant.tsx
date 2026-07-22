"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bot,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  sendAssistantMessage,
  type AssistantChatMessage,
} from "@/lib/api/assistant.api";

type AiAssistantProps = {
  token: string;
  placement?: "floating" | "navbar";
};

type DisplayMessage = AssistantChatMessage & { id: string };

const WELCOME_MESSAGE: DisplayMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m your CargoNep logistics assistant. Ask me about booking, tracking, delivery stages, or payments.",
};

export function AiAssistant({
  token,
  placement = "floating",
}: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    WELCOME_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState("Mistral Small");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNavbarPlacement = placement === "navbar";

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, sending]);

  const clearConversation = () => {
    if (sending) return;
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setError(null);
    setModel("Mistral Small");
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    const userMessage: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const result = await sendAssistantMessage(
        token,
        nextMessages
          .slice(-12)
          .map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
      );

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.message,
        },
      ]);
      setModel(
        result.model === "mistral-small-latest"
          ? "Mistral Small"
          : result.model,
      );
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The AI assistant could not respond. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className={`fixed z-50 flex h-[min(580px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-md)] ${
            isNavbarPlacement
              ? "right-4 top-20 sm:right-8 lg:right-12 xl:right-16"
              : "bottom-24 right-6"
          }`}
          role="dialog"
          aria-label="AI Assistant"
        >
          <div className="flex items-center justify-between gap-3 bg-[var(--accent)] px-4 py-3.5 text-[var(--text-on-accent)]">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5">
                <Bot size={19} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-bold">CargoNep AI Assistant</p>
                <p className="truncate text-xs text-[var(--accent-strong)] opacity-75">
                  Online · Powered by {model}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearConversation}
                disabled={sending}
                className="rounded-lg p-1.5 text-[var(--accent-strong)] transition-colors hover:bg-black/5 disabled:opacity-50"
                aria-label="Start a new conversation"
                title="New conversation"
                suppressHydrationWarning
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[var(--accent-strong)] transition-colors hover:bg-black/5"
                aria-label="Close assistant"
                suppressHydrationWarning
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[var(--surface-soft)] px-4 py-5"
            aria-live="polite"
          >
            {messages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Sparkles size={16} />
                  </span>
                  <p className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm leading-6 text-[var(--text)] shadow-sm">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[var(--accent)] px-3.5 py-2.5 text-sm leading-6 text-[var(--text-on-accent)] shadow-sm">
                    {message.content}
                  </p>
                </div>
              ),
            )}

            {sending && (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Bot size={16} />
                </span>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[var(--border)] bg-white px-3.5 py-3 text-xs font-medium text-[var(--text-muted)] shadow-sm">
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              </div>
            )}

            {error && (
              <div
                className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3.5 py-3 text-xs font-medium leading-5 text-[var(--danger)]"
                role="alert"
              >
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="border-t border-[var(--border)] bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={sending}
                maxLength={2000}
                rows={1}
                placeholder="Ask about shipments, tracking, or payments…"
                className="max-h-28 min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] disabled:bg-[var(--surface-soft)]"
                aria-label="Message the assistant"
                suppressHydrationWarning
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
                suppressHydrationWarning
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <p className="mt-2 px-1 text-[10px] text-[var(--text-muted)]">
              AI can make mistakes. Verify shipment and payment details in your dashboard.
            </p>
          </form>
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
