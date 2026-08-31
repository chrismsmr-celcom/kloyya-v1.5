"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkle,
} from "lucide-react";

import { useDemoStore } from "@/lib/store";
import {
  COUNTRIES,
  guessCountry,
} from "@/lib/countries";
import {
  INDUSTRIES,
  LEVEL_LABEL,
  LOCATION_BASED_INDUSTRIES,
  PERMISSIONS,
  PLANS,
  SOURCE_LIBRARY,
  STEP_META,
  getSourceIds,
  levelFromPermissionCount,
  yearlyMonthlyPrice,
} from "@/lib/onboarding-data";

import { Badge } from "@/components/ui/badge";
import { Confetti } from "@/components/onboarding/confetti";
import {
  Eyebrow,
  NextButton,
  Step,
  Title,
} from "@/components/onboarding/primitives";
import { cn } from "@/lib/utils";

type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error";

type AnalysisStatus =
  | "idle"
  | "running"
  | "completed"
  | "error";

type OnboardingResult = {
  organizationId: string;
};

export default function OnboardingPage() {
  const router = useRouter();

  const {
    setAutonomyLevel,
    completeOnboarding,
    orgProfile,
  } = useDemoStore();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [customIndustry, setCustomIndustry] = useState("");
  const [description, setDescription] = useState("");

  const [permissions, setPermissions] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      PERMISSIONS.map((permission, index) => [
        permission.id,
        index < 3,
      ]),
    ),
  );

  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "yearly"
  >("monthly");

  const [selectedPlanId, setSelectedPlanId] =
    useState("team");

  const selectedPlan =
    PLANS.find(
      (plan) => plan.id === selectedPlanId,
    ) ?? PLANS[1];

  const [country, setCountry] = useState<string | null>(
    null,
  );

  const [countryQuery, setCountryQuery] = useState("");

  const [savingOnboarding, setSavingOnboarding] =
    useState(false);

  const [onboardingError, setOnboardingError] =
    useState<string | null>(null);

  const [onboardingResult, setOnboardingResult] =
    useState<OnboardingResult | null>(null);

  const [connectionStatus, setConnectionStatus] =
    useState<Record<string, ConnectionStatus>>({});

  const [connectionErrors, setConnectionErrors] =
    useState<Record<string, string>>({});

  const [analysisStatus, setAnalysisStatus] =
    useState<AnalysisStatus>("idle");

  const [analysisError, setAnalysisError] =
    useState<string | null>(null);

  const [analysis, setAnalysis] =
    useState<any>(null);

  const [stepIndex, setStepIndex] = useState(0);

  const effectiveIndustry =
    industry === "Other"
      ? customIndustry.trim() || "Other"
      : industry ?? "";

  const businessName =
    name.trim() || orgProfile.name || "your business";

  const hasLocations =
    industry !== null &&
    LOCATION_BASED_INDUSTRIES.has(
      effectiveIndustry,
    );

  const sourceIds = useMemo(
    () => getSourceIds(industry),
    [industry],
  );

  const [sources, setSources] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      getSourceIds(industry).map((id, index) => [
        id,
        index < 3,
      ]),
    ),
  );

  const [syncedIndustry, setSyncedIndustry] =
    useState(industry);

  if (syncedIndustry !== industry) {
    setSyncedIndustry(industry);

    setSources(
      Object.fromEntries(
        getSourceIds(industry).map((id, index) => [
          id,
          index < 3,
        ]),
      ),
    );
  }

  const connectedSourceIds = sourceIds.filter(
    (id) => sources[id],
  );

  const connectedLabels = connectedSourceIds
    .map((id) => SOURCE_LIBRARY[id]?.label)
    .filter(Boolean);

  const activeSteps = useMemo(() => {
    const steps = ["business"];

    if (hasLocations) {
      steps.push("locations");
    }

    steps.push(
      "connect",
      "describe",
      "learn",
      "first-save",
      "control",
      "plan",
      "ready",
    );

    return steps;
  }, [hasLocations]);

  const currentStepKey =
    activeSteps[
      Math.min(
        stepIndex,
        activeSteps.length - 1,
      )
    ];

  const filteredCountries = useMemo(() => {
    const query = countryQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return COUNTRIES.slice(0, 8);
    }

    return COUNTRIES.filter((item) =>
      item.toLowerCase().includes(query),
    ).slice(0, 8);
  }, [countryQuery]);

  const selectedPermissionCount =
    Object.values(permissions).filter(Boolean)
      .length;

  const resolvedLevel =
    levelFromPermissionCount(
      selectedPermissionCount,
      PERMISSIONS.length,
    );

  const guessedCountry = useMemo(
    () => guessCountry(),
    [],
  );

  function goNext() {
    setStepIndex((current) =>
      Math.min(
        current + 1,
        activeSteps.length - 1,
      ),
    );
  }

  function toggleSource(id: string) {
    setSources((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function togglePermission(id: string) {
    setPermissions((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function selectCountry(value: string) {
    setCountry(value);
    goNext();
  }

  async function saveOnboarding(): Promise<OnboardingResult | null> {
    if (!industry) {
      setOnboardingError(
        "Please select your business type.",
      );
      return null;
    }

    if (
      industry === "Other" &&
      !customIndustry.trim()
    ) {
      setOnboardingError(
        "Please describe your industry.",
      );
      return null;
    }

    if (!businessName.trim()) {
      setOnboardingError(
        "Please enter your business name.",
      );
      return null;
    }

    setSavingOnboarding(true);
    setOnboardingError(null);

    try {
      setAutonomyLevel(resolvedLevel);

      const response = await fetch(
        "/api/onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: businessName,
            industry: effectiveIndustry,
            description:
              description.trim() || undefined,
            autonomyLevel: resolvedLevel,
          }),
        },
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.ok ||
        !data.organizationId
      ) {
        throw new Error(
          data.error ??
            "Unable to save onboarding.",
        );
      }

      const result = {
        organizationId: data.organizationId,
      };

      setOnboardingResult(result);

      /*
       * Keep the existing application store synchronized.
       * The API call above is the source of truth.
       */
      await completeOnboarding({
        name: businessName,
        industry: effectiveIndustry,
        description:
          description.trim() || undefined,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save onboarding.";

      setOnboardingError(message);
      return null;
    } finally {
      setSavingOnboarding(false);
    }
  }

  async function connectSource(id: string) {
    const source = SOURCE_LIBRARY[id];

    if (!source) {
      return;
    }

    /*
     * The existing backend supports these Composio
     * toolkits. Other source types remain visible but
     * are not falsely reported as connected.
     */
    const toolkitMap: Record<
      string,
      string
    > = {
      gmail: "gmail",
      slack: "slack",
      googlecalendar: "googlecalendar",
      googledrive: "googledrive",
    };

    const toolkit =
      toolkitMap[id.toLowerCase()];

    if (!toolkit) {
      setConnectionErrors((current) => ({
        ...current,
        [id]:
          "This integration is not connected to the backend yet.",
      }));

      setConnectionStatus((current) => ({
        ...current,
        [id]: "error",
      }));

      return;
    }

    setConnectionStatus((current) => ({
      ...current,
      [id]: "connecting",
    }));

    setConnectionErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    try {
      const response = await fetch(
        "/api/integrations/connect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            toolkit,
          }),
        },
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.ok ||
        !data.redirectUrl
      ) {
        throw new Error(
          data.error ??
            "Unable to start integration connection.",
        );
      }

      /*
       * Composio owns the OAuth connection flow.
       * We redirect to the real authorization URL.
       */
      window.location.href =
        data.redirectUrl;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect integration.";

      setConnectionStatus((current) => ({
        ...current,
        [id]: "error",
      }));

      setConnectionErrors((current) => ({
        ...current,
        [id]: message,
      }));
    }
  }

  async function runAnalysis() {
    if (!description.trim()) {
      setAnalysisError(
        "Describe your business first so Kloyya has real information to analyze.",
      );
      return;
    }

    if (!onboardingResult) {
      const saved = await saveOnboarding();

      if (!saved) {
        return;
      }
    }

    const organizationId =
      onboardingResult?.organizationId;

    if (!organizationId) {
      setAnalysisError(
        "The organization was not created.",
      );
      return;
    }

    setAnalysisStatus("running");
    setAnalysisError(null);

    try {
      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: "onboarding",
            content: description.trim(),
            organizationId,
            context: {
              businessName,
              industry: effectiveIndustry,
              country,
              connectedSources:
                connectedLabels,
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ??
            "Kloyya analysis failed.",
        );
      }

      setAnalysis(data);
      setAnalysisStatus("completed");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kloyya analysis failed.";

      setAnalysisError(message);
      setAnalysisStatus("error");
    }
  }

  async function continueAfterDescription() {
    if (!description.trim()) {
      setAnalysisError(
        "A real business description is required for Kloyya to perform its first analysis.",
      );
      return;
    }

    const saved = await saveOnboarding();

    if (!saved) {
      return;
    }

    goNext();
  }

  async function continueFromLearn() {
    if (analysisStatus === "completed") {
      goNext();
      return;
    }

    await runAnalysis();

    /*
     * Do not advance automatically.
     * The user must see that the real backend
     * analysis succeeded.
     */
  }

  const analysisIssue =
    analysis?.analysis?.issue ??
    analysis?.issue;

  const analysisRecommendation =
    analysis?.analysis?.recommendation ??
    analysis?.recommendation;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-12">
      <div className="mb-10 flex items-center gap-3">
        <Image
          src="/kloyya-mark.png"
          alt="Kloyya"
          width={22}
          height={22}
        />

        <div className="flex items-center gap-1.5">
          {activeSteps.map((key, index) => (
            <div
              key={key}
              className="flex items-center gap-1.5"
              title={STEP_META[key]}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  index === stepIndex
                    ? "bg-accent"
                    : index < stepIndex
                      ? "bg-good"
                      : "bg-white/15",
                )}
              />

              {index <
                activeSteps.length - 1 && (
                <div className="h-px w-4 bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "w-full transition-[max-width]",
          currentStepKey === "plan"
            ? "max-w-3xl"
            : "max-w-lg",
        )}
      >
        <AnimatePresence mode="wait">
          {currentStepKey === "business" && (
            <Step key="business">
              <Eyebrow>
                Let&apos;s set up Kloyya
              </Eyebrow>

              <Title>
                What should we call your business?
              </Title>

              <input
                autoFocus
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Acme Logistics"
                className="mt-5 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
              />

              <p className="mt-6 text-xs font-medium text-muted">
                What kind of operation is it?
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {INDUSTRIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setIndustry(item)
                    }
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs transition-colors",
                      industry === item
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-surface text-muted hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {industry === "Other" && (
                <input
                  autoFocus
                  value={customIndustry}
                  onChange={(event) =>
                    setCustomIndustry(
                      event.target.value,
                    )
                  }
                  placeholder="Write in what you do…"
                  className="mt-2.5 w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                />
              )}

              <NextButton
                disabled={
                  !industry ||
                  (industry === "Other" &&
                    !customIndustry.trim())
                }
                onClick={goNext}
              />
            </Step>
          )}

          {currentStepKey === "locations" && (
            <Step key="locations">
              <Eyebrow>
                Business location
              </Eyebrow>

              <Title>
                Where is {businessName} based?
              </Title>

              <p className="mt-2 text-sm text-muted">
                This information is stored as part of
                your onboarding context. Kloyya will
                not claim to have discovered locations
                until a real location integration is
                connected.
              </p>

              {guessedCountry && (
                <button
                  type="button"
                  onClick={() =>
                    selectCountry(
                      guessedCountry,
                    )
                  }
                  className="mt-4 flex w-full items-center justify-between rounded-md border border-accent/40 bg-accent/[0.06] p-3 text-left"
                >
                  <span className="flex items-center gap-2.5 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-accent" />

                    <span className="text-foreground">
                      Looks like you&apos;re in{" "}
                      <span className="font-medium">
                        {guessedCountry}
                      </span>
                    </span>
                  </span>

                  <span className="text-[11px] font-medium text-accent">
                    Use this
                  </span>
                </button>
              )}

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />

                <input
                  value={countryQuery}
                  onChange={(event) =>
                    setCountryQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search for your country…"
                  className="w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
                />
              </div>

              <div className="mt-2 flex flex-col gap-1.5">
                {filteredCountries.map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        selectCountry(item)
                      }
                      className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-left text-xs text-muted hover:border-accent/30 hover:text-foreground"
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={goNext}
                className="mt-5 text-xs text-muted hover:text-foreground"
              >
                Skip for now
              </button>
            </Step>
          )}

          {currentStepKey === "connect" && (
            <Step key="connect">
              <Eyebrow>
                Connect your world
              </Eyebrow>

              <Title>
                What should Kloyya be watching?
              </Title>

              <p className="mt-2 text-sm text-muted">
                Connections use the real Composio
                authorization flow. Kloyya will not mark
                an integration connected until the
                provider authorization actually starts.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {sourceIds.map((id) => {
                  const source =
                    SOURCE_LIBRARY[id];

                  if (!source) {
                    return null;
                  }

                  const selected =
                    sources[id];

                  const status =
                    connectionStatus[id] ??
                    "idle";

                  const error =
                    connectionErrors[id];

                  return (
                    <div
                      key={id}
                      className={cn(
                        "rounded-md border p-3 transition-colors",
                        selected
                          ? "border-accent/40 bg-accent/[0.06]"
                          : "border-border bg-surface",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded",
                            selected
                              ? "bg-accent/15 text-accent"
                              : "bg-white/[0.05] text-muted",
                          )}
                        >
                          <source.icon className="h-3.5 w-3.5" />
                        </div>

                        <span
                          className={cn(
                            "text-xs font-medium",
                            selected
                              ? "text-foreground"
                              : "text-muted",
                          )}
                        >
                          {source.label}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSources(
                            (current) => ({
                              ...current,
                              [id]: true,
                            }),
                          );

                          void connectSource(id);
                        }}
                        disabled={
                          status === "connecting"
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status ===
                        "connecting" ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Connecting…
                          </>
                        ) : status ===
                          "connected" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-good" />
                            Connected
                          </>
                        ) : (
                          "Connect"
                        )}
                      </button>

                      {error && (
                        <p className="mt-2 text-[10px] leading-relaxed text-red-400">
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-[11px] text-muted">
                {connectedSourceIds.length} selected
              </p>

              <NextButton
                onClick={goNext}
                label="Continue"
              />
            </Step>
          )}

          {currentStepKey === "describe" && (
            <Step key="describe">
              <Eyebrow>
                Tell Kloyya about it
              </Eyebrow>

              <Title>
                Describe your business in your own
                words.
              </Title>

              <p className="mt-2 text-sm text-muted">
                Kloyya will send this information to the
                real analysis backend. It will not invent
                an issue from a local template.
              </p>

              <textarea
                autoFocus
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={6}
                placeholder="What do you do, who are your customers, and what operational problem is currently costing you time or money?"
                className="mt-4 w-full resize-none rounded-md border border-border bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
              />

              <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                <span>
                  {description.trim()
                    ? `${description.trim().length} characters`
                    : "Required for the first real analysis"}
                </span>
              </div>

              {onboardingError && (
                <div className="mt-3 rounded-md border border-red-500/20 bg-red-500/[0.05] px-3 py-2.5 text-xs text-red-400">
                  {onboardingError}
                </div>
              )}

              <NextButton
                disabled={
                  !description.trim() ||
                  savingOnboarding
                }
                onClick={
                  continueAfterDescription
                }
                label={
                  savingOnboarding
                    ? "Creating your workspace…"
                    : "Create workspace"
                }
              />
            </Step>
          )}

          {currentStepKey === "learn" && (
            <Step key="learn">
              <Eyebrow>
                Real Kloyya analysis
              </Eyebrow>

              <Title>
                Let Kloyya analyze what you shared.
              </Title>

              <p className="mt-2 text-sm text-muted">
                This calls the backend AI analysis route
                and persists the resulting issue when the
                organization exists.
              </p>

              <div className="mt-5 rounded-md border border-border bg-surface p-4">
                <div className="flex items-center gap-2">
                  {analysisStatus ===
                    "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-good" />
                  ) : analysisStatus ===
                    "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-muted" />
                  )}

                  <span className="text-sm font-medium text-foreground">
                    {analysisStatus ===
                    "completed"
                      ? "Analysis completed"
                      : analysisStatus ===
                          "running"
                        ? "Kloyya is analyzing…"
                        : "Analysis ready"}
                  </span>
                </div>

                {analysisIssue && (
                  <div className="mt-4 rounded border border-border bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      {analysisIssue.severity && (
                        <Badge
                          tone={
                            analysisIssue.severity ===
                            "critical"
                              ? "critical"
                              : analysisIssue.severity ===
                                  "high"
                                ? "bad"
                                : "warn"
                          }
                        >
                          {
                            analysisIssue.severity
                          }
                        </Badge>
                      )}

                      <span className="text-xs font-medium text-foreground">
                        {analysisIssue.title}
                      </span>
                    </div>

                    {analysisIssue.description && (
                      <p className="mt-2 text-[11px] leading-relaxed text-muted">
                        {
                          analysisIssue.description
                        }
                      </p>
                    )}
                  </div>
                )}

                {analysisRecommendation && (
                  <div className="mt-3 rounded border border-accent/20 bg-accent/[0.04] p-3">
                    <div className="text-[11px] font-medium text-accent">
                      Recommendation
                    </div>

                    <div className="mt-1 text-xs font-medium text-foreground">
                      {
                        analysisRecommendation.title
                      }
                    </div>

                    {analysisRecommendation.reason && (
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {
                          analysisRecommendation.reason
                        }
                      </p>
                    )}
                  </div>
                )}

                {analysisError && (
                  <div className="mt-3 rounded-md border border-red-500/20 bg-red-500/[0.05] px-3 py-2.5 text-xs text-red-400">
                    {analysisError}
                  </div>
                )}
              </div>

              {analysisStatus !==
                "completed" && (
                <NextButton
                  disabled={
                    analysisStatus ===
                    "running"
                  }
                  onClick={
                    continueFromLearn
                  }
                  label={
                    analysisStatus ===
                    "running"
                      ? "Analyzing…"
                      : "Run real analysis"
                  }
                />
              )}

              {analysisStatus ===
                "completed" && (
                <NextButton
                  onClick={goNext}
                  label="Continue"
                />
              )}
            </Step>
          )}

          {currentStepKey === "first-save" && (
            <Step key="first-save">
              <Eyebrow>
                First result
              </Eyebrow>

              <Title>
                Kloyya found a real signal.
              </Title>

              <p className="mt-2 text-sm text-muted">
                This result came from the backend
                analysis. No local issue template was used.
              </p>

              {analysisIssue ? (
                <div className="mt-5 rounded-md border border-border bg-surface p-4">
                  <div className="flex items-center gap-2">
                    {analysisIssue.severity && (
                      <Badge
                        tone={
                          analysisIssue.severity ===
                          "critical"
                            ? "critical"
                            : analysisIssue.severity ===
                                "high"
                              ? "bad"
                              : "warn"
                        }
                      >
                        {
                          analysisIssue.severity
                        }
                      </Badge>
                    )}

                    <span className="text-sm font-medium text-foreground">
                      {analysisIssue.title}
                    </span>
                  </div>

                  {analysisIssue.description && (
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {
                        analysisIssue.description
                      }
                    </p>
                  )}

                  {analysisRecommendation && (
                    <div className="mt-4 rounded border border-border bg-white/[0.02] p-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-accent" />

                        <span className="text-xs font-medium text-foreground">
                          {
                            analysisRecommendation.title
                          }
                        </span>
                      </div>

                      {analysisRecommendation.reason && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                          {
                            analysisRecommendation.reason
                          }
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-md border border-red-500/20 bg-red-500/[0.05] p-4 text-xs text-red-400">
                  No persisted analysis result was
                  returned by the backend.
                </div>
              )}

              <NextButton
                disabled={!analysisIssue}
                onClick={goNext}
                label="Continue"
              />
            </Step>
          )}

          {currentStepKey === "control" && (
            <Step key="control">
              <Eyebrow>
                Stay in control
              </Eyebrow>

              <Title>
                What can Kloyya do without asking?
              </Title>

              <p className="mt-2 text-sm text-muted">
                These permissions determine the autonomy
                level saved with your organization.
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPermissions(
                      Object.fromEntries(
                        PERMISSIONS.map(
                          (permission) => [
                            permission.id,
                            true,
                          ],
                        ),
                      ),
                    )
                  }
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-foreground"
                >
                  Select all
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPermissions(
                      Object.fromEntries(
                        PERMISSIONS.map(
                          (
                            permission,
                            index,
                          ) => [
                            permission.id,
                            index < 2,
                          ],
                        ),
                      ),
                    )
                  }
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-foreground"
                >
                  Just the essentials
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {PERMISSIONS.map(
                  (permission) => {
                    const selected =
                      permissions[
                        permission.id
                      ];

                    return (
                      <button
                        key={
                          permission.id
                        }
                        type="button"
                        onClick={() =>
                          togglePermission(
                            permission.id,
                          )
                        }
                        className={cn(
                          "flex items-center justify-between rounded-md border p-3.5 text-left transition-colors",
                          selected
                            ? "border-accent/40 bg-accent/[0.06]"
                            : "border-border bg-surface hover:bg-white/[0.03]",
                        )}
                      >
                        <div>
                          <div className="text-xs font-medium text-foreground">
                            {
                              permission.label
                            }
                          </div>

                          <div className="mt-0.5 text-[11px] text-muted">
                            {
                              permission.desc
                            }
                          </div>
                        </div>

                        <div
                          className={cn(
                            "grid h-4 w-4 shrink-0 place-items-center rounded border",
                            selected
                              ? "border-accent bg-accent"
                              : "border-white/20",
                          )}
                        >
                          {selected && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-3 rounded-md border border-border bg-white/[0.02] px-3.5 py-2.5 text-[11px] text-muted">
                {selectedPermissionCount} of{" "}
                {PERMISSIONS.length} selected → Level{" "}
                {resolvedLevel} ·{" "}
                <span className="text-foreground">
                  {
                    LEVEL_LABEL[
                      resolvedLevel
                    ].title
                  }
                </span>{" "}
                —{" "}
                {
                  LEVEL_LABEL[
                    resolvedLevel
                  ].desc
                }
              </div>

              <NextButton
                onClick={goNext}
                label="Continue"
              />
            </Step>
          )}

          {currentStepKey === "plan" && (
            <Step key="plan">
              <Eyebrow>
                Choose your plan
              </Eyebrow>

              <Title>
                Choose the plan you&apos;ll use after
                your trial.
              </Title>

              <p className="mt-2 text-sm text-muted">
                Billing is intentionally not simulated
                here. No card is collected or "verified"
                by the frontend. A real billing provider
                must be connected before Kloyya claims a
                payment method exists.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="relative inline-flex rounded-md border border-border bg-surface p-1">
                  {(
                    ["monthly", "yearly"] as const
                  ).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() =>
                        setBillingCycle(
                          cycle,
                        )
                      }
                      className="relative rounded px-3 py-1.5 text-xs font-medium"
                    >
                      {billingCycle ===
                        cycle && (
                        <motion.div
                          layoutId="billing-pill"
                          className="absolute inset-0 rounded bg-accent"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 32,
                          }}
                        />
                      )}

                      <span
                        className={cn(
                          "relative z-10",
                          billingCycle ===
                            cycle
                            ? "text-white"
                            : "text-muted",
                        )}
                      >
                        {cycle ===
                        "monthly"
                          ? "Monthly"
                          : "Yearly"}
                      </span>
                    </button>
                  ))}
                </div>

                {billingCycle ===
                  "yearly" && (
                  <span className="text-[11px] font-medium text-good">
                    Save up to 24%
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {PLANS.map((plan) => {
                  const selected =
                    plan.id ===
                    selectedPlanId;

                  const price =
                    plan.monthly === null
                      ? null
                      : billingCycle ===
                          "yearly"
                        ? yearlyMonthlyPrice(
                            plan,
                          )
                        : plan.monthly;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() =>
                        setSelectedPlanId(
                          plan.id,
                        )
                      }
                      className={cn(
                        "flex flex-col rounded-md border p-3.5 text-left transition-colors",
                        selected
                          ? "border-accent/50 bg-accent/[0.06]"
                          : "border-border bg-surface hover:bg-white/[0.03]",
                      )}
                    >
                      {plan.badge ? (
                        <div className="mb-2 inline-block w-fit rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          {plan.badge}
                        </div>
                      ) : (
                        <div className="mb-2 h-[18px]" />
                      )}

                      <div className="text-xs font-medium text-foreground">
                        {plan.name}
                      </div>

                      <div className="mt-1.5 flex items-baseline gap-1">
                        {price === null ? (
                          <span className="text-lg font-semibold text-foreground">
                            Custom
                          </span>
                        ) : (
                          <>
                            <span className="text-lg font-semibold tabular-nums text-foreground">
                              ${price}
                            </span>

                            <span className="text-[10px] text-muted">
                              /mo
                            </span>
                          </>
                        )}
                      </div>

                      {price !== null &&
                        billingCycle ===
                          "yearly" && (
                          <div className="text-[10px] text-muted">
                            billed $
                            {
                              plan.yearly
                            }
                            /yr
                          </div>
                        )}

                      <ul className="mt-2.5 flex flex-1 flex-col gap-1 text-[10.5px] leading-relaxed text-muted">
                        {plan.features.map(
                          (feature) => (
                            <li
                              key={
                                feature
                              }
                              className="flex items-start gap-1.5"
                            >
                              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-good" />
                              {
                                feature
                              }
                            </li>
                          ),
                        )}
                      </ul>

                      <div
                        className={cn(
                          "mt-3 rounded px-2.5 py-1.5 text-center text-[11px] font-medium",
                          selected
                            ? "bg-accent text-white"
                            : "border border-border text-muted",
                        )}
                      >
                        {selected
                          ? "Selected"
                          : "Choose"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <NextButton
                onClick={goNext}
                label={`Continue with ${selectedPlan.name}`}
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

              <Title className="mt-4">
                {businessName} is live on Kloyya.
              </Title>

              <p className="mt-2 text-sm text-muted">
                Your organization has been created in
                Supabase and Kloyya has performed a real
                backend analysis of the information you
                provided.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <div className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-[11px] text-muted">
                  Organization ID:{" "}
                  <span className="font-mono text-foreground">
                    {
                      onboardingResult?.organizationId
                    }
                  </span>
                </div>

                <div className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-[11px] text-muted">
                  Autonomy: Level{" "}
                  <span className="text-foreground">
                    {resolvedLevel}
                  </span>{" "}
                  ·{" "}
                  {
                    LEVEL_LABEL[
                      resolvedLevel
                    ].title
                  }
                </div>

                <div className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-[11px] text-muted">
                  Analysis:{" "}
                  <span className="text-good">
                    persisted
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/command-center",
                  )
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/85"
              >
                Enter Command Center
                <ArrowRight className="h-4 w-4" />
              </button>
            </Step>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
