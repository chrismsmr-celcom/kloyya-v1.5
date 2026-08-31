// app/api/health/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "kloyya",
    version: "0.2.0",
    timestamp: new Date().toISOString(),
    services: {
      database: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      composio: Boolean(process.env.COMPOSIO_API_KEY),
      ai: Boolean(
        process.env.AI_API_KEY &&
          process.env.AI_BASE_URL &&
          process.env.AI_MODEL,
      ),
    },
  });
}