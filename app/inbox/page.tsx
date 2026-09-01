"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Clock } from "lucide-react";

export default function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inbox")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setMessages(data.messages);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Inbox Unifiée</h1>
      <p className="mt-1 text-sm text-muted">Messages de Gmail, Slack et autres outils connectés.</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-muted">Chargement depuis Composio...</p>
        ) : messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface py-12 text-center text-muted">
            Aucun message. Connectez Gmail ou Slack pour voir vos notifications ici.
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className={`flex items-start gap-4 rounded-lg border p-4 ${msg.unread ? "border-accent/30 bg-accent/5" : "border-border bg-surface"}`}>
              <div className={`mt-1 rounded-full p-2 ${msg.unread ? "bg-accent/20 text-accent" : "bg-white/5 text-muted"}`}>
                {msg.source === "Gmail" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{msg.from}</span>
                  <span className="flex items-center gap-1 text-[11px] text-muted">
                    <Clock className="h-3 w-3" /> {new Date(msg.time).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="text-sm text-muted">{msg.subject}</p>
                <span className="mt-1 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted">{msg.source}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
