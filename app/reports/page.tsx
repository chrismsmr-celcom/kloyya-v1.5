"use client";

import { FileText, BarChart3, Download, CalendarDays } from "lucide-react";

const REPORTS = [
  { id: 1, title: "Rapport d'efficacité opérationnelle", period: "Août 2026", type: "Mensuel" },
  { id: 2, title: "Analyse des coûts de maintenance", period: "T3 2026", type: "Trimestriel" },
  { id: 3, title: "Bilan carbone et logistique", period: "Août 2026", type: "Mensuel" },
];

export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Rapports & Insights</h1>
      <p className="mt-1 text-sm text-muted">Synthèses générées par Kloyya sur l'impact de vos opérations.</p>
      
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 text-xs font-medium text-muted uppercase">Temps moyen de résolution</div>
          <div className="text-2xl font-bold text-foreground">-24%</div>
          <div className="mt-1 text-xs text-green-400">Amélioration vs mois dernier</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 text-xs font-medium text-muted uppercase">Taux d'approbation IA</div>
          <div className="text-2xl font-bold text-foreground">87%</div>
          <div className="mt-1 text-xs text-muted">Des recommandations sont validées</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 text-xs font-medium text-muted uppercase">Incidents évités</div>
          <div className="text-2xl font-bold text-foreground">12</div>
          <div className="mt-1 text-xs text-muted">Grâce à la détection proactive</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Rapports générés</h2>
        <div className="space-y-2">
          {REPORTS.map((report) => (
            <div key={report.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="rounded bg-accent/10 p-2 text-accent">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{report.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    <CalendarDays className="h-3 w-3" /> {report.period}
                    <span className="rounded bg-white/10 px-1.5 py-0.5">{report.type}</span>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground">
                <Download className="h-3.5 w-3.5" /> Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
