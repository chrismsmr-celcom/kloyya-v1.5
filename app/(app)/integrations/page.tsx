// app/(app)/integrations/page.tsx

"use client";

import { Card } from "@/components/ui/card";
import { ConnectButton } from "@/components/integrations/connect-button";

const integrations = [
  {
    toolkit: "gmail" as const,
    name: "Gmail",
    description: "Emails, requests, alerts and customer communication.",
  },
  {
    toolkit: "slack" as const,
    name: "Slack",
    description: "Internal conversations and operational signals.",
  },
  {
    toolkit: "googlecalendar" as const,
    name: "Google Calendar",
    description: "Meetings, deadlines and scheduling conflicts.",
  },
  {
    toolkit: "googledrive" as const,
    name: "Google Drive",
    description: "Contracts, documents and company procedures.",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">
          Integrations
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Connect your business
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted">
          Kloyya observes the systems your company already uses and turns
          operational signals into decisions and controlled actions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.toolkit} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">
                  {integration.name}
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {integration.description}
                </p>
              </div>

              <ConnectButton
                toolkit={integration.toolkit}
                label="Connect"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}