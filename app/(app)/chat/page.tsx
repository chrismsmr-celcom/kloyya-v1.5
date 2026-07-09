"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUp } from "lucide-react";
import { Aperture } from "@/components/aperture";
import { CitationRow } from "@/components/source-chip";
import { StreamingText } from "@/components/streaming-text";
import { Button } from "@/components/ui/button";
import {
  cannedAnswers,
  fallbackAnswer,
  findAnswer,
  founder,
  suggestedQuestions,
  totalIngested,
  type Citation,
} from "@/lib/demo-data";
import { DUR, EASE_IRIS, fadeUp, stagger } from "@/lib/motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations: Citation[];
  /** Set once the typewriter finishes, which is when citations appear. */
  settled: boolean;
};

const THINKING_MS = 900;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>(suggestedQuestions[0]);
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const empty = messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;

    setInput("");
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "user", text: q, citations: [], settled: true },
    ]);
    setThinking(true);

    setTimeout(() => {
      const hit = findAnswer(q);
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: hit?.answer ?? fallbackAnswer,
          citations: hit?.citations ?? [],
          settled: false,
        },
      ]);
    }, THINKING_MS);
  }

  const settle = (id: string) =>
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, settled: true } : x)));

  const answered = messages.some((m) => m.role === "assistant");

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-3xl flex-col">
      {empty ? (
        <motion.div
          variants={stagger(0.05, 0.08)}
          initial="hidden"
          animate="show"
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <motion.div variants={fadeUp} className="bloom relative">
            <Aperture size={84} spin />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-8 font-display text-[28px] font-semibold tracking-tight"
          >
            Ask across everything
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-2.5 text-[15px] text-paper-dim">
            {totalIngested.toLocaleString()} items from your inbox, calendar and
            Notion are in context.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex w-full flex-col gap-2 sm:max-w-lg"
          >
            {cannedAnswers.map((a) => (
              <button
                key={a.question}
                onClick={() => ask(a.question)}
                className="glass glow group flex items-center justify-between gap-3 px-4 py-3.5 text-left text-[14.5px] text-paper-dim transition-colors hover:text-paper"
              >
                {a.question}
                <ArrowUp className="size-3.5 shrink-0 rotate-45 text-paper-faint transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <div className="flex-1 space-y-8 pb-6 pt-2">
          {messages.map((m) =>
            m.role === "user" ? (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.base, ease: EASE_IRIS }}
                className="flex justify-end"
              >
                <div className="flex max-w-[85%] items-start gap-3">
                  <p className="glass px-4 py-3 text-[15px] leading-relaxed text-paper">
                    {m.text}
                  </p>
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-iris-violet to-iris-blue text-[11px] font-semibold text-white">
                    {founder.initials}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.base, ease: EASE_IRIS }}
                className="flex items-start gap-3.5"
              >
                <div className="mt-0.5 shrink-0">
                  <Aperture size={28} />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <StreamingText text={m.text} onDone={() => settle(m.id)} />

                  <AnimatePresence>
                    {m.settled && m.citations.length > 0 && (
                      <CitationRow citations={m.citations} />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ),
          )}

          <AnimatePresence>
            {thinking && <Thinking />}
          </AnimatePresence>

          {answered && !thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: DUR.slow }}
              className="flex justify-start pt-2"
            >
              <Link href="/executive">
                <Button variant="glass" size="sm" className="group">
                  Draft the investor update from this
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </motion.div>
          )}

          <div ref={endRef} />
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-void via-void/90 to-transparent px-1 pb-4 pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="glass glow flex items-center gap-2 p-2 pl-4"
          data-active={input.length > 0}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your context…"
            aria-label="Ask Kloyya"
            className="h-10 flex-1 bg-transparent text-[15px] text-paper outline-none placeholder:text-paper-faint"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || thinking}
            className="!rounded-lg"
            aria-label="Send"
          >
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </Button>
        </form>

        {!empty && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {suggestedQuestions
              .filter((q) => !messages.some((m) => m.text === q))
              .map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="chip transition-colors hover:border-hairline-strong hover:text-paper"
                >
                  {q}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Not three bouncing dots. It says what it is doing. */
function Thinking() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3.5"
    >
      <Aperture size={28} spin />
      <span className="font-mono text-[12px] text-paper-faint">
        Reading {totalIngested.toLocaleString()} items…
      </span>
    </motion.div>
  );
}
