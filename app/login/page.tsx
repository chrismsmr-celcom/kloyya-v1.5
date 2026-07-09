"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Aperture } from "@/components/aperture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth";
import { founder } from "@/lib/demo-data";
import { useDemo } from "@/lib/store";
import { fadeUp, stagger } from "@/lib/motion";

/**
 * Prefilled on purpose. On stage this is one click, and the 800ms of fake
 * latency in `lib/auth.ts` is the only thing standing between here and the
 * dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const setAuthed = useDemo((s) => s.signIn);

  const [email, setEmail] = useState<string>(founder.email);
  const [password, setPassword] = useState<string>("demo-password");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { session, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }
    if (session) {
      setAuthed();
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <div aria-hidden className="grid-lines absolute inset-0 -z-10" />

      <motion.div
        variants={stagger(0.05, 0.07)}
        initial="hidden"
        animate="show"
        className="w-full max-w-[400px]"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center">
          <div className="bloom relative">
            <Aperture size={72} />
          </div>
          <h1 className="mt-6 font-display text-[28px] font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-[14.5px] text-paper-dim">
            Sign in to pick up where your context left off.
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          onSubmit={onSubmit}
          className="glass mt-8 space-y-4 p-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-faint"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-faint"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] text-signal"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? (
              <>
                <Loader2 className="animate-spin" />
                Signing in
              </>
            ) : (
              <>
                Sign in
                <ArrowRight />
              </>
            )}
          </Button>

          <p className="pt-1 text-center font-mono text-[10.5px] leading-relaxed text-paper-faint">
            Prototype — authentication is stubbed.
            <br />
            Any email and password will sign you in.
          </p>
        </motion.form>

        <motion.p variants={fadeUp} className="mt-6 text-center text-[13px] text-paper-faint">
          <Link href="/" className="transition-colors hover:text-paper-dim">
            Back to home
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
