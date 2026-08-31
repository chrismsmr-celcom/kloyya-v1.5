// lib/server/auth.ts

import "server-only";

import { headers } from "next/headers";

export async function getKloyyaUserId(): Promise<string> {
  const headerStore = await headers();

  const authenticatedUser =
    headerStore.get("x-kloyya-user-id") ||
    process.env.KLOYYA_DEMO_USER_ID;

  if (!authenticatedUser) {
    throw new Error("KLOYYA_USER_ID_REQUIRED");
  }

  return authenticatedUser;
}