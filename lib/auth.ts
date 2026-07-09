import type { Session, User } from "@supabase/supabase-js";
import { founder } from "./demo-data";
import { sleep } from "./utils";

/**
 * ⚠️  MOCKED. There is no auth server behind this.
 *
 * The signatures below mirror `supabase.auth.signInWithPassword` /
 * `signOut` / `getSession` so that swapping in a real Supabase client is a
 * change to this file and nothing else. `@supabase/supabase-js` is a real
 * dependency and its types are used here, but no network call is made:
 * `signIn` resolves after a fixed delay and returns a hand-built session.
 *
 * To make this real:
 *   1. create a Supabase project, set NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY
 *   2. `const supabase = createBrowserClient(url, key)`
 *   3. replace the three function bodies with the calls named above
 */

const FAKE_LATENCY_MS = 800;

const mockUser = {
  id: "00000000-0000-4000-8000-000000000000",
  aud: "authenticated",
  role: "authenticated",
  email: founder.email,
  app_metadata: { provider: "email" },
  user_metadata: { full_name: founder.name },
  created_at: new Date(0).toISOString(),
} as unknown as User;

const mockSession = {
  access_token: "demo-access-token",
  refresh_token: "demo-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: mockUser,
} as unknown as Session;

export type AuthResult =
  | { session: Session; error: null }
  | { session: null; error: { message: string } };

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  await sleep(FAKE_LATENCY_MS);

  if (!email.trim() || !password.trim()) {
    return { session: null, error: { message: "Enter an email and password." } };
  }
  if (!email.includes("@")) {
    return { session: null, error: { message: "That doesn't look like an email address." } };
  }

  return { session: mockSession, error: null };
}

export async function signOut(): Promise<void> {
  await sleep(120);
}

export async function getSession(): Promise<Session | null> {
  return mockSession;
}

/** Surfaced in Settings so nobody mistakes the prototype for the product. */
export const AUTH_IS_MOCKED = true;
