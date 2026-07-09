"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SourceId } from "./demo-data";

/**
 * The demo's choreography. Pages read this and render themselves accordingly —
 * "Building context", "Risk detected" and "Dashboard updated" are not routes,
 * they are states of this object.
 *
 * Persisted to sessionStorage so a mis-click or a refresh mid-presentation
 * doesn't drop the presenter back at the empty state.
 */

export type DemoState = {
  authed: boolean;
  connected: Record<SourceId, boolean>;
  contextBuilt: boolean;
  briefGenerated: boolean;
  riskDetected: boolean;
  riskResolved: boolean;

  signIn: () => void;
  signOut: () => void;
  connect: (id: SourceId) => void;
  setContextBuilt: (v: boolean) => void;
  setBriefGenerated: (v: boolean) => void;
  detectRisk: () => void;
  resolveRisk: () => void;
  reset: () => void;
};

const initial = {
  authed: false,
  connected: { gmail: false, calendar: false, notion: false },
  contextBuilt: false,
  briefGenerated: false,
  riskDetected: false,
  riskResolved: false,
};

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      ...initial,
      signIn: () => set({ authed: true }),
      signOut: () => set({ ...initial }),
      connect: (id) =>
        set((s) => ({ connected: { ...s.connected, [id]: true } })),
      setContextBuilt: (v) => set({ contextBuilt: v }),
      setBriefGenerated: (v) => set({ briefGenerated: v }),
      detectRisk: () => set({ riskDetected: true }),
      resolveRisk: () => set({ riskResolved: true }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "kloyya-demo",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

/** True once all three connectors are live. */
export const allConnected = (c: Record<SourceId, boolean>) =>
  c.gmail && c.calendar && c.notion;

export const connectedCount = (c: Record<SourceId, boolean>) =>
  Object.values(c).filter(Boolean).length;
