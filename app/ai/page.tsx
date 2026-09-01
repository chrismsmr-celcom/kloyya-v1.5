"use client";

import { useState } from "react";
import { MessageSquare, Send, Sparkles, Bot } from "lucide-react";

export default function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "Bonjour. Je suis Kloyya, votre Chef de Cabinet IA. Je peux analyser vos sites, ressources et outils connectés. Que souhaitez-vous savoir ?" }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // Simulation de réponse (à connecter à /api/chat plus tard)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: "J'analyse vos données en temps réel. D'après les logs de vos sites, tout fonctionne normalement, mais une maintenance est prévue sur la Machine #4 demain." }]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-6">
      <div className="mb-4 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Demander à Kloyya</h1>
          <p className="text-xs text-muted">Interrogez vos données internes, sites et outils connectés.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-surface p-4 space-y-4">
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
          placeholder="Ex: Quel est l'état de santé du Site Nord ?"
          className="flex-1 rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none"
        />
        <button onClick={handleSend} className="rounded-md bg-accent px-4 text-white hover:bg-accent/90">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
