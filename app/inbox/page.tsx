"use client";

import { Mail, MessageSquare, Phone, Clock } from "lucide-react";

const MESSAGES = [
  { id: 1, source: "Gmail", icon: Mail, from: "Fournisseur Acier", subject: "Retard de livraison prévu", time: "10 min", unread: true },
  { id: 2, source: "Slack", icon: MessageSquare, from: "#ops-terrain", subject: "Machine #4 en maintenance", time: "1h", unread: true },
  { id: 3, source: "WhatsApp", icon: Phone, from: "Chauffeur Jean", subject: "Arrivé au site B, porte fermée", time: "2h", unread: false },
];

export default function InboxPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Inbox Unifiée</h1>
      <p className="mt-1 text-sm text-muted">Tous les messages et notifications de vos outils connectés au même endroit.</p>
      
      <div className="mt-6 space-y-3">
        {MESSAGES.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${msg.unread ? "border-accent/30 bg-accent/5" : "border-border bg-surface hover:bg-white/5"}`}>
            <div className={`mt-1 rounded-full p-2 ${msg.unread ? "bg-accent/20 text-accent" : "bg-white/5 text-muted"}`}>
              <msg.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{msg.from}</span>
                <span className="flex items-center gap-1 text-[11px] text-muted"><Clock className="h-3 w-3" /> {msg.time}</span>
              </div>
              <p className="text-sm text-muted">{msg.subject}</p>
              <span className="mt-1 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted">{msg.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
