"use client";

import { CalendarDays, Clock, MapPin, Truck } from "lucide-react";

const EVENTS = [
  { id: 1, time: "08:00", title: "Inspection Site Nord", location: "Dépôt Principal", type: "inspection" },
  { id: 2, time: "10:30", title: "Livraison Fourniture #4821", location: "Client Acme Corp", type: "delivery" },
  { id: 3, time: "14:00", title: "Maintenance Préventive Machine #4", location: "Atelier B", type: "maintenance" },
];

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Calendrier Opérationnel</h1>
      <p className="mt-1 text-sm text-muted">Vue synchronisée de vos événements, livraisons et maintenances.</p>
      
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-accent" />
          Aujourd&apos;hui, 1er Septembre 2026
        </div>
        <div className="space-y-4">
          {EVENTS.map((event) => (
            <div key={event.id} className="flex gap-4 border-l-2 border-accent pl-4">
              <div className="w-16 text-sm font-medium text-muted">{event.time}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <MapPin className="h-3 w-3" /> {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
