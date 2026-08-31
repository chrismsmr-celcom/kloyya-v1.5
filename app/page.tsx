import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Splash() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="mx-auto max-w-xl text-center">
        <Image
          src="/kloyya-mark.png"
          alt="Kloyya"
          width={40}
          height={40}
          className="mx-auto mb-8"
        />

        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tell Kloyya the outcome you want.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-balance text-sm leading-relaxed text-muted">
          It understands your people, locations, resources and events, plans
          the work, coordinates the business, asks for approval when it
          matters, executes what it&apos;s allowed to, and reports the
          outcome.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/85"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/command-center"
            className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.05]"
          >
            Skip to Command Center
          </Link>
        </div>

        <div className="mx-auto mt-14 grid max-w-md grid-cols-3 gap-6 text-left">
          {[
            ["Observe → Act", "One loop from intent to verified outcome"],
            ["Human in control", "Every risky action asks for approval"],
            ["Any operation", "Vehicles, machines, teams, inventory, sites"],
          ].map(([title, sub]) => (
            <div key={title}>
              <div className="text-xs font-medium text-foreground">{title}</div>
              <div className="mt-1 text-[11px] leading-relaxed text-muted">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
