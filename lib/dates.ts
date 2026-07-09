/**
 * The demo must feel like it is happening today, not on the day it was built.
 * Every date in `demo-data.ts` is derived from `now`, so the contradiction at
 * the center of the demo ("the roadmap says next Friday, the email says three
 * weeks") stays true whenever it is presented.
 *
 * The app shell sets `dynamic = "force-dynamic"` so the server renders with the
 * same clock the browser hydrates with.
 */

const WEEKDAY_SHORT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
};

const MONTH_DAY: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

function shift(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/** "Fri, Jul 17" */
export const longDate = (d: Date) => d.toLocaleDateString("en-US", WEEKDAY_SHORT);
/** "Jul 17" */
export const shortDate = (d: Date) => d.toLocaleDateString("en-US", MONTH_DAY);

/** "3d ago" / "in 3d" / "today" — the register used by source chips. */
export function relative(days: number): string {
  if (days === 0) return "today";
  if (days === -1) return "yesterday";
  if (days < 0) return `${Math.abs(days)}d ago`;
  return `in ${days}d`;
}

/** Demos get presented in the evening as often as the morning. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export type DemoDates = ReturnType<typeof getDemoDates>;

export function getDemoDates(now: Date = new Date()) {
  const roadmapGA = shift(now, 8);
  const revisedGA = shift(now, 22); // Priya's email: auth slipped two weeks
  const investorUpdate = shift(now, 3);
  const roadmapEdited = shift(now, -19); // stale — this is the tell
  const priyaEmail = shift(now, -3);

  return {
    now,
    /** What the Notion roadmap still claims. */
    roadmapGA,
    /** What engineering actually said. */
    revisedGA,
    /** The meeting where the wrong date would have been said out loud. */
    investorUpdate,
    roadmapEdited,
    priyaEmail,

    slipDays: 14,
    daysToInvestorUpdate: 3,
  };
}
