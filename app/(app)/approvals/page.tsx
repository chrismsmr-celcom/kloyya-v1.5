"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Check, X, Clock } from "lucide-react";

export default function ApprovalsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/actions")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setActions(data.actions);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (actionId: string) => {
    const res = await fetch(`/api/actions/${actionId}/approve`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setActions(actions.filter((a: any) => a.id !== actionId));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Centre d'Approbation</h1>
      <p className="mt-1 text-sm text-muted">Validez les actions proposées par Kloyya.</p>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted">Chargement...</p>
        ) : actions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface py-12 text-center text-muted">
            Aucune approbation en attente.
          </div>
        ) : (
          actions.map((action: any) => (
            <div key={action.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="rounded-full bg-accent/10 p-2 text-accent">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                    <p className="mt-1 text-xs text-muted">{action.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                      <Clock className="h-3 w-3" /> {new Date(action.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400">
                    <X className="h-3.5 w-3.5" /> Rejeter
                  </button>
                  <button onClick={() => handleApprove(action.id)} className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white">
                    <Check className="h-3.5 w-3.5" /> Approuver
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
