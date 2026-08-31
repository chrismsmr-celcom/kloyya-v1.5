"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Sparkle,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { COUNTRIES, citiesFor, guessCountry } from "@/lib/countries";
import {
  INDUSTRIES,
  LEVEL_LABEL,
  LOCATION_BASED_INDUSTRIES,
  PERMISSIONS,
  PLANS,
  SOURCE_LIBRARY,
  STEP_META,
  formatCardNumber,
  formatExpiry,
  getSourceIds,
  levelFromPermissionCount,
  pickIssueTemplate,
  pickLocationCount,
  shuffled,
  yearlyMonthlyPrice,
} from "@/lib/onboarding-data";
import { Badge } from "@/components/ui/badge";
import { Confetti } from "@/components/onboarding/confetti";
import { Eyebrow, NextButton, Step, Title } from "@/components/onboarding/primitives";
import { ScanStep } from "@/components/onboarding/scan-step";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { setAutonomyLevel, completeOnboarding, orgProfile } = useDemoStore();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [customIndustry, setCustomIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PERMISSIONS.map((p, i) => [p.id, i < 3]))
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState("team");
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[1];

  // Locations lookup
  const [country, setCountry] = useState<string | null>(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [guessedCountry] = useState(() => guessCountry());
  const [locStage, setLocStage] = useState<"country" | "searching" | "results">("country");
  const [foundCities, setFoundCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<Record<string, boolean>>({});
  const [locationTier, setLocationTier] = useState<"trial" | "paid">("trial");
  const locTimers = useRef<NodeJS.Timeout[]>([]);
  useEffect(() => () => locTimers.current.forEach(clearTimeout), []);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return COUNTRIES.slice(0, 8);
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [countryQuery]);

  const effectiveIndustry = industry === "Other" ? customIndustry.trim() || "Other" : industry ?? "";
  const businessName = name.trim() || orgProfile.name;
  const hasLocations = industry !== null && LOCATION_BASED_INDUSTRIES.has(effectiveIndustry);

  const activeSteps = useMemo(() => {
    const steps = ["business"];
    if (hasLocations) steps.push("locations");
    steps.push("connect", "describe", "learn", "first-save", "control", "plan");
    if (!selectedPlan.custom) steps.push("payment");
    steps.push("ready");
    return steps;
  }, [hasLocations, selectedPlan.custom]);

  const [stepIndex, setStepIndex] = useState(0);
  const currentStepKey = activeSteps[Math.min(stepIndex, activeSteps.length - 1)];

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, activeSteps.length - 1));
  }

  function searchBusiness(selectedCountry: string) {
    setCountry(selectedCountry);
    setLocStage("searching");
    const pool = citiesFor(selectedCountry);
    const picked = shuffled(pool).slice(0, pickLocationCount(pool.length));
    const t = setTimeout(() => {
      setFoundCities(picked);
      // Trial is capped at 1 location, so only pre-check the first result until upgraded.
      setSelectedCities(Object.fromEntries(picked.map((c, i) => [c, locationTier === "paid" || i === 0])));
      setLocStage("results");
    }, 1300);
    locTimers.current.push(t);
  }

  function toggleCity(city: string) {
    if (locationTier === "trial") {
      // Single-select on trial: picking one city clears the rest.
      setSelectedCities({ [city]: true });
      return;
    }
    setSelectedCities((s) => ({ ...s, [city]: !s[city] }));
  }

  function setLocationTierAndAdjust(tier: "trial" | "paid") {
    setLocationTier(tier);
    if (tier === "trial") {
      const first = foundCities.find((c) => selectedCities[c]) ?? foundCities[0];
      setSelectedCities(first ? { [first]: true } : {});
    }
  }

  const confirmedCityCount = Object.values(selectedCities).filter(Boolean).length;

  const sourceIds = useMemo(() => getSourceIds(industry), [industry]);

  function defaultSourceSelection(ids: string[]): Record<string, boolean> {
    return Object.fromEntries(ids.map((id, i) => [id, i < 3]));
  }

  // Reset the source selection whenever the underlying id set changes (industry switched).
  // Adjusted during render rather than in an effect — see "adjusting state when a prop
  // changes" in the React docs — so the UI never flashes the previous industry's defaults.
  const [sources, setSources] = useState<Record<string, boolean>>(() => defaultSourceSelection(sourceIds));
  const [syncedSourceIds, setSyncedSourceIds] = useState(sourceIds);
  if (syncedSourceIds.join("|") !== sourceIds.join("|")) {
    setSyncedSourceIds(sourceIds);
    setSources(defaultSourceSelection(sourceIds));
  }

  const connectedLabels = sourceIds.filter((id) => sources[id]).map((id) => SOURCE_LIBRARY[id].label);

  const template = useMemo(() => pickIssueTemplate(effectiveIndustry, description), [effectiveIndustry, description]);

  const [localStatus, setLocalStatus] = useState<"pending" | "executing" | "completed">("pending");
  const [localStep, setLocalStep] = useState(0);
  const localTimers = useRef<NodeJS.Timeout[]>([]);
  useEffect(() => () => localTimers.current.forEach(clearTimeout), []);

  function approveLocal() {
    setLocalStatus("executing");
    setLocalStep(0);
    let s = 0;
    const total = template.steps.length;
    const tick = () => {
      s += 1;
      if (s >= total) {
        setLocalStep(total);
        setLocalStatus("completed");
        return;
      }
      setLocalStep(s);
      const t = setTimeout(tick, 650);
      localTimers.current.push(t);
    };
    const t = setTimeout(tick, 650);
    localTimers.current.push(t);
  }

  function toggleSource(id: string) {
    setSources((s) => ({ ...s, [id]: !s[id] }));
  }

  function togglePermission(id: string) {
    setPermissions((p) => ({ ...p, [id]: !p[id] }));
  }

  const selectedPermissionCount = Object.values(permissions).filter(Boolean).length;
  const resolvedLevel = levelFromPermissionCount(selectedPermissionCount, PERMISSIONS.length);

  function finish() {
    setAutonomyLevel(resolvedLevel);
    completeOnboarding({
      name: businessName,
      industry: effectiveIndustry || orgProfile.industry,
    });
    goNext();
  }

  // Payment
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying">("idle");
  const paymentTimers = useRef<NodeJS.Timeout[]>([]);
  useEffect(() => () => paymentTimers.current.forEach(clearTimeout), []);

  const cardNumberDigits = cardNumber.replace(/\D/g, "");
  const cardValid =
    cardName.trim().length > 1 &&
    cardNumberDigits.length >= 12 &&
    /^\d{2}\/\d{2}$/.test(cardExpiry) &&
    cardCvc.length >= 3;

  const trialEndDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }, []);

  function submitPayment() {
    if (!cardValid) return;
    setPaymentStatus("verifying");
    const t = setTimeout(() => finish(), 900);
    paymentTimers.current.push(t);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-12">
      <div className="mb-10 flex items-center gap-3">
        <Image src="/kloyya-mark.png" alt="Kloyya" width={22} height={22} />
        <div className="flex items-center gap-1.5">
          {activeSteps.map((key, i) => (
            <div key={key} className="flex items-center gap-1.5" title={STEP_META[key]}>
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === stepIndex ? "bg-accent" : i < stepIndex ? "bg-good" : "bg-white/15"
                )}
              />
              {i < activeSteps.length - 1 && <div className="h-px w-4 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>

      <div className={cn("w-full transition-[max-width]", currentStepKey === "plan" ? "max-w-2xl" : "max-w-lg")}>
        <AnimatePresence mode="wait">
          {currentStepKey === "business" && (
            <Step key="business">
              <Eyebrow>Let&apos;s set up Kloyya</Eyebrow>
              <Title>What should we call your business?</Title>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Logistics"
                className="mt-5 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
              />
              <p className="mt-6 text-xs font-medium text-muted">What kind of operation is it?</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs transition-colors",
                      industry === ind
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-surface text-muted hover:text-foreground"
                    )}
                  >
                    {ind}
                  </button>
                ))}
              </div>
              {industry === "Other" && (
                <input
                  autoFocus
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Write in what you do…"
                  className="mt-2.5 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                />
              )}
              <NextButton
                disabled={!industry || (industry === "Other" && !customIndustry.trim())}
                onClick={goNext}
              />
            </Step>
          )}

          {currentStepKey === "locations" && (
            <Step key="locations">
              <Eyebrow>Find your business</Eyebrow>
              {locStage === "country" && (
                <>
                  <Title>Where is {businessName} based?</Title>
                  <p className="mt-2 text-sm text-muted">
                    Kloyya can look up {businessName} and pull in all its locations at once.
                  </p>

                  {guessedCountry && (
                    <button
                      onClick={() => searchBusiness(guessedCountry)}
                      className="mt-4 flex w-full items-center justify-between rounded-md border border-accent/40 bg-accent/[0.06] p-3 text-left"
                    >
                      <span className="flex items-center gap-2.5 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        <span className="text-foreground">
                          Looks like you&apos;re in <span className="font-medium">{guessedCountry}</span>
                        </span>
                      </span>
                      <span className="text-[11px] font-medium text-accent">Use this</span>
                    </button>
                  )}

                  <div className="relative mt-4">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                    <input
                      value={countryQuery}
                      onChange={(e) => setCountryQuery(e.target.value)}
                      placeholder={guessedCountry ? "Not right? Search for your country…" : "Search for your country…"}
                      className="w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                    />
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {filteredCountries.map((c) => (
                      <button
                        key={c}
                        onClick={() => searchBusiness(c)}
                        className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-left text-xs text-muted hover:border-accent/30 hover:text-foreground"
                      >
                        {c}
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <p className="px-1 py-2 text-xs text-muted">No match — try a different spelling.</p>
                    )}
                  </div>

                  <button onClick={goNext} className="mt-5 text-xs text-muted hover:text-foreground">
                    Skip — I&apos;ll add locations manually
                  </button>
                </>
              )}
              {locStage === "searching" && (
                <>
                  <Title>Searching for {businessName}…</Title>
                  <div className="mt-6 flex items-center gap-2.5 rounded-md border border-border bg-surface p-4 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    Looking up {businessName} in {country}…
                  </div>
                </>
              )}
              {locStage === "results" && (
                <>
                  <Title>Found it — is this {businessName}?</Title>
                  <p className="mt-2 text-sm text-muted">
                    {foundCities.length} location{foundCities.length === 1 ? "" : "s"} in {country}.
                  </p>

                  <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-surface p-1">
                    {(["trial", "paid"] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setLocationTierAndAdjust(tier)}
                        className={cn(
                          "flex-1 rounded px-3 py-1.5 text-[11px] font-medium transition-colors",
                          locationTier === tier ? "bg-accent text-white" : "text-muted hover:text-foreground"
                        )}
                      >
                        {tier === "trial" ? "Free trial — 1 location" : "Paid plan — multiple locations"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted">
                    {locationTier === "trial"
                      ? "Pick the one location to use during your trial."
                      : "Select every location that's yours — this is unlocked on paid plans."}
                  </p>

                  <div className="mt-3 flex flex-col gap-2">
                    {foundCities.map((city) => {
                      const on = selectedCities[city];
                      return (
                        <button
                          key={city}
                          onClick={() => toggleCity(city)}
                          className={cn(
                            "flex items-center justify-between rounded-md border p-3 text-left transition-colors",
                            on ? "border-accent/40 bg-accent/[0.06]" : "border-border bg-surface hover:bg-white/[0.03]"
                          )}
                        >
                          <span className="flex items-center gap-2.5 text-xs font-medium">
                            <MapPin className={cn("h-3.5 w-3.5", on ? "text-accent" : "text-muted")} />
                            <span className={on ? "text-foreground" : "text-muted"}>
                              {businessName} — {city}
                            </span>
                          </span>
                          <div
                            className={cn(
                              "grid h-4 w-4 shrink-0 place-items-center border",
                              locationTier === "trial" ? "rounded-full" : "rounded",
                              on ? "border-accent bg-accent" : "border-white/20"
                            )}
                          >
                            {on && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <NextButton onClick={goNext} label={`Yes, that's us — add ${confirmedCityCount} location${confirmedCityCount === 1 ? "" : "s"}`} />
                </>
              )}
            </Step>
          )}

          {currentStepKey === "connect" && (
            <Step key="connect">
              <Eyebrow>Connect your world</Eyebrow>
              <Title>What should Kloyya be watching?</Title>
              <p className="mt-2 text-sm text-muted">
                Picked for a {effectiveIndustry || "business like yours"} — adjust as needed.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {sourceIds.map((id) => {
                  const s = SOURCE_LIBRARY[id];
                  const on = sources[id];
                  return (
                    <button
                      key={id}
                      onClick={() => toggleSource(id)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border p-3 text-left transition-colors",
                        on ? "border-accent/40 bg-accent/[0.06]" : "border-border bg-surface hover:bg-white/[0.03]"
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded",
                          on ? "bg-accent/15 text-accent" : "bg-white/[0.05] text-muted"
                        )}
                      >
                        <s.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={cn("text-xs font-medium", on ? "text-foreground" : "text-muted")}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-muted">{connectedLabels.length} connected</p>
              <NextButton onClick={goNext} />
            </Step>
          )}

          {currentStepKey === "describe" && (
            <Step key="describe">
              <Eyebrow>Tell Kloyya about it</Eyebrow>
              <Title>Describe your business in your own words.</Title>
              <p className="mt-2 text-sm text-muted">
                What do you do, who are your customers, and what&apos;s the most annoying operational
                problem you deal with? Kloyya uses this to find your first real issue.
              </p>
              <textarea
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="e.g. We run a same-day delivery fleet across three depots. Our biggest headache is trucks running late without anyone noticing until the customer calls…"
                className="mt-4 w-full resize-none rounded-md border border-border bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                <span>{description.trim().length === 0 ? "Optional, but worth it" : `${description.trim().length} characters`}</span>
                {description.trim().length === 0 && (
                  <button onClick={goNext} className="text-accent hover:underline">
                    Skip for now
                  </button>
                )}
              </div>
              <NextButton onClick={goNext} label={description.trim() ? "Let Kloyya learn this" : "Continue"} />
            </Step>
          )}

          {currentStepKey === "learn" && (
            <ScanStep
              key="learn"
              name={businessName}
              industry={effectiveIndustry}
              description={description}
              connectedLabels={connectedLabels}
              country={hasLocations ? country : null}
              locationCount={hasLocations ? Math.max(confirmedCityCount, 1) : 1}
              onDone={goNext}
            />
          )}

          {currentStepKey === "first-save" && (
            <Step key="first-save">
              <Eyebrow>First save</Eyebrow>
              <Title>Kloyya found something in what you shared.</Title>
              <p className="mt-2 text-sm text-muted">
                Based on your description — evidence, a recommendation, and one approval away from done.
              </p>

              <div className="mt-5 rounded-md border border-border bg-surface p-4">
                <div className="flex items-center gap-2">
                  <Badge tone={template.severity === "high" ? "bad" : template.severity === "critical" ? "critical" : "warn"}>
                    {template.severity}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{template.title}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{template.reason}</p>

                <div className="mt-3 rounded border border-border bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{template.actionTitle}</span>
                    <Badge tone={localStatus === "completed" ? "good" : "accent"}>
                      {localStatus === "pending" ? "pending approval" : localStatus}
                    </Badge>
                  </div>
                  <ol className="flex flex-col gap-1.5">
                    {template.steps.map((s, i) => {
                      const stepDone = i < localStep;
                      const active = i === localStep && localStatus === "executing";
                      return (
                        <li key={s} className="flex items-center gap-2 text-[11px]">
                          {stepDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-good" />
                          ) : active ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
                          ) : (
                            <CircleDashed className="h-3.5 w-3.5 shrink-0 text-muted/50" />
                          )}
                          <span className={stepDone ? "text-foreground" : active ? "text-accent" : "text-muted"}>
                            {s}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {localStatus === "pending" ? (
                  <button
                    onClick={approveLocal}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/85"
                  >
                    <ShieldCheck className="h-4 w-4" /> Approve & watch it run
                  </button>
                ) : (
                  <div className="mt-3 text-center text-[11px] text-muted">
                    {localStatus === "completed" ? template.impact : "Executing…"}
                  </div>
                )}
              </div>

              <NextButton
                disabled={localStatus !== "completed"}
                onClick={goNext}
                label={localStatus === "completed" ? "Nice. Continue" : "Approve to continue"}
              />
            </Step>
          )}

          {currentStepKey === "control" && (
            <Step key="control">
              <Eyebrow>Stay in control</Eyebrow>
              <Title>What can Kloyya do without asking?</Title>
              <p className="mt-2 text-sm text-muted">
                Select all, or just 2–3 to start — you can change this any time.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setPermissions(Object.fromEntries(PERMISSIONS.map((p) => [p.id, true])))}
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-foreground"
                >
                  Select all
                </button>
                <button
                  onClick={() => setPermissions(Object.fromEntries(PERMISSIONS.map((p, i) => [p.id, i < 2])))}
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-foreground"
                >
                  Just the essentials
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {PERMISSIONS.map((p) => {
                  const on = permissions[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePermission(p.id)}
                      className={cn(
                        "flex items-center justify-between rounded-md border p-3.5 text-left transition-colors",
                        on ? "border-accent/40 bg-accent/[0.06]" : "border-border bg-surface hover:bg-white/[0.03]"
                      )}
                    >
                      <div>
                        <div className="text-xs font-medium text-foreground">{p.label}</div>
                        <div className="mt-0.5 text-[11px] text-muted">{p.desc}</div>
                      </div>
                      <div
                        className={cn(
                          "grid h-4 w-4 shrink-0 place-items-center rounded border",
                          on ? "border-accent bg-accent" : "border-white/20"
                        )}
                      >
                        {on && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-md border border-border bg-white/[0.02] px-3.5 py-2.5 text-[11px] text-muted">
                {selectedPermissionCount} of {PERMISSIONS.length} selected → Level {resolvedLevel} ·{" "}
                <span className="text-foreground">{LEVEL_LABEL[resolvedLevel].title}</span> —{" "}
                {LEVEL_LABEL[resolvedLevel].desc}
              </div>
              <NextButton onClick={goNext} label="Continue" />
            </Step>
          )}

          {currentStepKey === "plan" && (
            <Step key="plan">
              <Eyebrow>Choose your plan</Eyebrow>
              <Title>Every plan starts with a 5-day free trial.</Title>
              <p className="mt-2 text-sm text-muted">
                The trial itself isn&apos;t tied to a plan — it&apos;s limited to 1 location and up to 3
                people for 5 days. Pick the plan you&apos;ll move to afterward.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="relative inline-flex rounded-md border border-border bg-surface p-1">
                  {(["monthly", "yearly"] as const).map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className="relative rounded px-3 py-1.5 text-xs font-medium"
                    >
                      {billingCycle === cycle && (
                        <motion.div
                          layoutId="billing-pill"
                          className="absolute inset-0 rounded bg-accent"
                          transition={{ type: "spring", stiffness: 500, damping: 32 }}
                        />
                      )}
                      <span className={cn("relative z-10", billingCycle === cycle ? "text-white" : "text-muted")}>
                        {cycle === "monthly" ? "Monthly" : "Yearly"}
                      </span>
                    </button>
                  ))}
                </div>
                {billingCycle === "yearly" && (
                  <span className="text-[11px] font-medium text-good">Save up to 24%</span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {PLANS.map((plan) => {
                  const selected = plan.id === selectedPlanId;
                  const price = plan.monthly === null ? null : billingCycle === "yearly" ? yearlyMonthlyPrice(plan) : plan.monthly;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        "flex flex-col rounded-md border p-3.5 text-left transition-colors",
                        selected ? "border-accent/50 bg-accent/[0.06]" : "border-border bg-surface hover:bg-white/[0.03]"
                      )}
                    >
                      {plan.badge ? (
                        <div className="mb-2 inline-block w-fit rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          {plan.badge}
                        </div>
                      ) : (
                        <div className="mb-2 h-[18px]" />
                      )}
                      <div className="text-xs font-medium text-foreground">{plan.name}</div>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        {price === null ? (
                          <span className="text-lg font-semibold text-foreground">Custom</span>
                        ) : (
                          <>
                            <span className="text-lg font-semibold tabular-nums text-foreground">${price}</span>
                            <span className="text-[10px] text-muted">/mo</span>
                          </>
                        )}
                      </div>
                      {price !== null && billingCycle === "yearly" && (
                        <div className="text-[10px] text-muted">billed ${plan.yearly}/yr</div>
                      )}
                      <ul className="mt-2.5 flex flex-1 flex-col gap-1 text-[10.5px] leading-relaxed text-muted">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-good" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div
                        className={cn(
                          "mt-3 rounded px-2.5 py-1.5 text-center text-[11px] font-medium",
                          selected ? "bg-accent text-white" : "border border-border text-muted"
                        )}
                      >
                        {selected ? "Selected" : plan.custom ? "Talk to sales" : "Choose"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <NextButton
                onClick={() => (selectedPlan.custom ? finish() : goNext())}
                label={selectedPlan.custom ? "Continue — we'll be in touch" : `Continue with ${selectedPlan.name}`}
              />
            </Step>
          )}

          {currentStepKey === "payment" && (
            <Step key="payment">
              <Eyebrow>Add a payment method</Eyebrow>
              <Title>Set up billing for {selectedPlan.name}.</Title>
              <p className="mt-2 text-sm text-muted">
                You won&apos;t be charged until your trial ends on {trialEndDate}. Cancel anytime before
                then.
              </p>

              <div className="mt-5 rounded-md border border-border bg-surface-2 p-4">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>
                    {selectedPlan.name} · billed {billingCycle}
                  </span>
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="mt-5 font-mono text-base tracking-widest text-foreground">
                  {cardNumber ? formatCardNumber(cardNumber) : "•••• •••• •••• ••••"}
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted">
                  <span className="uppercase">{cardName || "Your name"}</span>
                  <span>{cardExpiry || "MM/YY"}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted">Name on card</label>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Jane Doe"
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted">Card number</label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted">Expiry</label>
                    <input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted">CVC</label>
                    <input
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
                <Lock className="h-3 w-3" /> Payments securely processed. Your card won&apos;t be charged today.
              </div>

              <NextButton
                disabled={!cardValid || paymentStatus === "verifying"}
                onClick={submitPayment}
                label={paymentStatus === "verifying" ? "Verifying card…" : "Start my free trial"}
              />
            </Step>
          )}

          {currentStepKey === "ready" && (
            <Step key="ready">
              <div className="relative">
                <Confetti />
                <div className="grid h-11 w-11 place-items-center rounded-md bg-good/15 text-good">
                  <Sparkle className="h-5 w-5" />
                </div>
              </div>
              <Title className="mt-4">{businessName} is live on Kloyya.</Title>
              <p className="mt-2 text-sm text-muted">
                {connectedLabels.length} source{connectedLabels.length === 1 ? "" : "s"} connected
                {hasLocations && confirmedCityCount > 0
                  ? ` · ${confirmedCityCount} location${confirmedCityCount === 1 ? "" : "s"} found`
                  : ""}{" "}
                · 1 issue already resolved · autonomy set to level {resolvedLevel}.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/[0.06] px-3 py-1.5 text-[11px] text-accent">
                {selectedPlan.custom
                  ? "Enterprise — our team will reach out to set things up"
                  : `5-day free trial · 1 location · up to 3 people · then ${selectedPlan.name}, billed ${billingCycle}`}
              </div>
              <button
                onClick={() => router.push("/command-center")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/85"
              >
                Enter Command Center <ArrowRight className="h-4 w-4" />
              </button>
            </Step>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
