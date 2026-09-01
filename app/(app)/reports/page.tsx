"use client";

import { useEffect, useState } from "react";
import { FileText, Download, CalendarDays } from "lucide-react";

export default function ReportsPage() {
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOutcomes(data.outcomes);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Rapports & Insights</h1>
      <p className="mt-1 text-sm text-muted">Synthèses générées automatiquement.</p>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Chargement...</p>
        ) : outcomes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface py-12 text-center text-muted">
            Aucun rapport disponible.
          </div>
        ) : (
          <div className="space-y-2">
            {outcomes.map((outcome: any) => (
              <div key={outcome.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-accent/10 p-2 text-accent">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{outcome.title || "Rapport opérationnel"}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                      <CalendarDays className="h-3 w-3" /> {new Date(outcome.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted">
                  <Download className="h-3.5 w-3.5" /> Télécharger
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
