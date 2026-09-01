"use client";

import { ShieldCheck, Check, X, Clock, AlertCircle } from "lucide-react";

const PENDING_APPROVALS = [
  { id: 1, title: "Réaffecter la livraison #4821", reason: "Véhicule actuel en surchauffe. Un véhicule inactif est disponible à 2km.", risk: "low", time: "Il y a 15 min" },
  { id: 2, title: "Commander 50 unités de SKU-402", reason: "Le stock est sous le seuil de sécurité. Fournisseur délai 48h.", risk: "medium", time: "Il y a 1h" },
];

export default function ApprovalsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Centre d'Approbation</h1>
      <p className="mt-1 text-sm text-muted">Validez ou rejetez les actions proposées par Kloyya. Vous gardez le contrôle.</p>
      
      <div className="mt-6 space-y-4">
        {PENDING_APPROVALS.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="rounded-full bg-accent/10 p-2 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted">{item.reason}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.time}</span>
                    <span className={`rounded px-1.5 py-0.5 font-medium ${item.risk === 'low' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      Risque {item.risk === 'low' ? 'Faible' : 'Modéré'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20">
                  <X className="h-3.5 w-3.5" /> Rejeter
                </button>
                <button className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90">
                  <Check className="h-3.5 w-3.5" /> Approuver
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {PENDING_APPROVALS.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface py-12 text-muted">
            <CheckCircle2 className="mb-2 h-8 w-8 text-green-400" />
            <p className="text-sm font-medium">Tout est à jour. Aucune approbation en attente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
