"use client";

import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const INSIGHTS = [
  { id: 1, type: "warning", icon: AlertTriangle, title: "Risque de rupture de stock", desc: "Le SKU-402 tombera à 0 dans 2 jours basé sur la vélocité actuelle.", impact: "Impact financier estimé: 4 500 €" },
  { id: 2, type: "success", icon: CheckCircle2, title: "Optimisation de tournée réussie", desc: "Kloyya a réduit les kilomètres à vide de 12% cette semaine.", impact: "Économie carburant: 340 €" },
  { id: 3, type: "info", icon: BrainCircuit, title: "Anomalie de consommation", desc: "La machine #4 consomme 15% d'énergie en plus que la moyenne.", impact: "Nécessite une inspection technique." },
];

export default function InsightsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Insights Kloyya</h1>
      <p className="mt-1 text-sm text-muted">Analyses intelligentes et commentaires proactifs sur vos opérations.</p>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {INSIGHTS.map((insight) => (
          <div key={insight.id} className="rounded-lg border border-border bg-surface p-5">
            <div className={`mb-3 inline-flex rounded-full p-2 ${insight.type === 'warning' ? 'bg-red-500/10 text-red-400' : insight.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-accent/10 text-accent'}`}>
              <insight.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">{insight.desc}</p>
            <div className="mt-4 flex items-center gap-1.5 rounded bg-white/5 px-2 py-1.5 text-[11px] font-medium text-foreground">
              <TrendingUp className="h-3 w-3" /> {insight.impact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
