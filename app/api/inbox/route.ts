import { NextResponse } from "next/server";
import { getKloyyaUserId } from "@/lib/server/auth";
import { executeComposioTool } from "@/lib/server/composio";

export async function GET() {
  try {
    const userId = await getKloyyaUserId();
    const messages = [];

    // Récupérer les emails récents depuis Gmail via Composio
    try {
      const gmailResult = await executeComposioTool("gmail_get_recent_emails", userId, { limit: 10 });
      if (gmailResult?.data) {
        messages.push(...gmailResult.data.map((msg: any) => ({
          id: `gmail-${msg.id}`,
          source: "Gmail",
          from: msg.from,
          subject: msg.subject,
          time: msg.date,
          unread: !msg.read,
        })));
      }
    } catch (e) {
      console.warn("Gmail not connected");
    }

    // Récupérer les messages Slack via Composio
    try {
      const slackResult = await executeComposioTool("slack_get_recent_messages", userId, { limit: 10 });
      if (slackResult?.data) {
        messages.push(...slackResult.data.map((msg: any) => ({
          id: `slack-${msg.ts}`,
          source: "Slack",
          from: msg.channel,
          subject: msg.text,
          time: msg.ts,
          unread: true,
        })));
      }
    } catch (e) {
      console.warn("Slack not connected");
    }

    messages.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    console.error("[KLOYYA_INBOX]", error);
    return NextResponse.json({ ok: false, error: "Failed to load inbox" }, { status: 500 });
  }
}
