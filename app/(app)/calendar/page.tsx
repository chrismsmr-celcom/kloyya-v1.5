"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setEvents(data.events);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Calendrier Opérationnel</h1>
      <p className="mt-1 text-sm text-muted">Synchronisé avec Google Calendar.</p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-accent" />
          Événements à venir
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted">Chargement...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted">Aucun événement. Connectez Google Calendar.</p>
          ) : (
            events.map((event: any) => (
              <div key={event.id} className="flex gap-4 border-l-2 border-accent pl-4">
                <div className="w-24 text-sm font-medium text-muted">
                  {new Date(event.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  {event.location && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
