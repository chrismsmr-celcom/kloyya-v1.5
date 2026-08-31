// app/login/page.tsx

"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const {
          data,
          error: signupError,
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signupError) throw signupError;

        if (data.session) {
          router.replace(
            searchParams.get("next") || "/onboarding",
          );
          router.refresh();
          return;
        }

        setMessage(
          "Account created. Check your email to confirm your account.",
        );
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (loginError) throw loginError;

        router.replace(
          searchParams.get("next") || "/onboarding",
        );

        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">
            Kloyya
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {mode === "login"
              ? "Welcome back."
              : "Create your Kloyya account."}
          </h1>

          <p className="mt-2 text-sm text-muted">
            {mode === "login"
              ? "Sign in to continue."
              : "Connect your business and start operating with Kloyya."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent/50"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent/50"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent/50"
          />

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-md border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(
              mode === "login"
                ? "signup"
                : "login",
            );
            setError("");
            setMessage("");
          }}
          className="mt-5 w-full text-center text-sm text-muted hover:text-foreground"
        >
          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
