// components/integrations/connect-button.tsx

"use client";

import { useState } from "react";

type Props = {
  toolkit: "gmail" | "slack" | "googlecalendar" | "googledrive";
  label: string;
};

export function ConnectButton({ toolkit, label }: Props) {
  const [loading, setLoading] = useState(false);

  async function connect() {
    setLoading(true);

    try {
      const response = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toolkit }),
      });

      const data = await response.json();

      if (!response.ok || !data.redirectUrl) {
        throw new Error(
          data.error ?? "Unable to create connection",
        );
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={loading}
      className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Connecting…" : label}
    </button>
  );
}