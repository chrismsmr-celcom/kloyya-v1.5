import { NextResponse } from "next/server";
import { getKloyyaUserId } from "@/lib/server/auth";
import { executeComposioTool } from "@/lib/server/composio";

export async function GET() {
  try {
    const userId = await getKloyyaUserId();

    const result = await executeComposioTool("googlecalendar_list_events", userId, {
      timeMin: new Date().toISOString(),
      maxResults: 50,
    });

    const events = (result?.data || []).map((event: any) => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
    }));

    return NextResponse.json({ ok: true, events });
  } catch (error) {
    console.error("[KLOYYA_CALENDAR]", error);
    return NextResponse.json({ ok: false, error: "Failed to load calendar" }, { status: 500 });
  }
}
