"use client";

import { CheckCircle2 } from "lucide-react";
import { useDemoStore } from "@/lib/store";

export function Toaster() {
  const { toasts } = useDemoStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="panel-float fade-up pointer-events-auto flex items-start gap-2.5 rounded-md p-3"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" />
          <div>
            <div className="text-xs font-medium text-foreground">{t.title}</div>
            {t.detail && <div className="mt-0.5 text-[11px] text-muted">{t.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
