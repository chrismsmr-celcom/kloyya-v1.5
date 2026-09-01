"use client";

import { useState } from "react";
import { Send, Bot, MessageSquare } from "lucide-react";

export default function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", content: "Bonjour. Je suis Kloyya. Que souhaitez-vous analyser ?" }]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.response || "Erreur de réponse." }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Erreur de connexion." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-6">
      <h1 className="text-xl font-bold text-foreground">Demander à Kloyya</h1>
      <p className="text-xs text-muted">Interrogez vos données réelles via Composio.</p>

      <div className="mt-4 flex-1 overflow-y-auto rounded-lg border border-border bg-surface p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "ai" ? "bg-accent/10 text-accent" : "bg-white/10 text-foreground"}`}>
              {msg.role === "ai" ? <Bot className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${msg.role === "ai" ? "bg-white/5 text-foreground" : "bg-accent text-white"}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ex: Quel est l'état de mes livraisons aujourd'hui ?"
          className="flex-1 rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading} className="rounded-md bg-accent px-4 text-white hover:bg-accent/90 disabled:opacity-50">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
