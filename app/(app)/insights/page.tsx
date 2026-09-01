"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, TrendingUp, AlertTriangle } from "lucide-react";

export default function InsightsPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setIssues(data.issues);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Insights Kloyya</h1>
      <p className="mt-1 text-sm text-muted">Analyses intelligentes de vos opérations en temps réel.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-muted">Chargement...</p>
        ) : issues.length === 0 ? (
          <p className="text-sm text-muted">Aucun insight pour le moment.</p>
        ) : (
          issues.map((issue: any) => (
            <div key={issue.id} className="rounded-lg border border-border bg-surface p-5">
              <div className={`mb-3 inline-flex rounded-full p-2 ${issue.severity === "high" ? "bg-red-500/10 text-red-400" : "bg-accent/10 text-accent"}`}>
                {issue.severity === "high" ? <AlertTriangle className="h-5 w-5" /> : <BrainCircuit className="h-5 w-5" />}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{issue.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{issue.description}</p>
              {issue.impact && (
                <div className="mt-4 flex items-center gap-1.5 rounded bg-white/5 px-2 py-1.5 text-[11px] font-medium text-foreground">
                  <TrendingUp className="h-3 w-3" /> {issue.impact}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
