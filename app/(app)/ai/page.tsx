"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, Send, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDemoStore } from "@/lib/store";
import { severityTone } from "@/lib/format";

const suggestions = [
  "What's going wrong right now?",
  "Why is delivery #4821 delayed?",
  "What actions are waiting on my approval?",
  "How much has Kloyya saved this week?",
];

export default function AiPage() {
  const { chat, sendChat, chatBusy } = useDemoStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, chatBusy]);

  function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    sendChat(value);
    setInput("");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Kloyya AI</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ask Kloyya</h1>
        <p className="mt-1 text-sm text-muted">
          Grounded in your business, resources, work and events — every answer is explainable.
        </p>
      </div>

      <div className="panel flex-1 overflow-y-auto rounded-lg p-4">
        <div className="flex flex-col gap-4">
          {chat.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`grid h-6 w-6 shrink-0 place-items-center rounded ${
                  m.role === "assistant" ? "bg-accent/15 text-accent" : "bg-white/10 text-foreground"
                }`}
              >
                {m.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>
              <div className={`max-w-[80%] ${m.role === "user" ? "items-end" : ""}`}>
                <div
                  className={`fade-up rounded-md px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-white/[0.04] text-foreground"
                      : "bg-accent text-white"
                  }`}
                >
                  {m.text}
                </div>
                {m.data?.issues && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {m.data.issues.map((iss) => (
                      <Link
                        key={iss.id}
                        href={`/issues/${iss.id}`}
                        className="flex items-center justify-between rounded border border-border bg-white/[0.02] px-3 py-2 hover:border-accent/30"
                      >
                        <span className="text-xs text-foreground">{iss.title}</span>
                        <Badge tone={severityTone(iss.severity)}>{iss.severity}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
                {m.data?.actions && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {m.data.actions.map((a) => (
                      <Link
                        key={a.id}
                        href="/approvals"
                        className="flex items-center justify-between rounded border border-border bg-white/[0.02] px-3 py-2 hover:border-accent/30"
                      >
                        <span className="text-xs text-foreground">{a.title}</span>
                        <Badge tone="accent">review</Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {chatBusy && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Kloyya is thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="rounded border border-border bg-surface px-2.5 py-1.5 text-[11px] text-muted hover:border-accent/30 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface p-1.5 pl-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your business…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded bg-accent text-white transition-opacity disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
