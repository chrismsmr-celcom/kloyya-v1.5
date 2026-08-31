// lib/server/auth.ts

import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getKloyyaUserId(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user.id;
}
