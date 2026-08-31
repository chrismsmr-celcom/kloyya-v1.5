// lib/server/ai.ts

import "server-only";

import { z } from "zod";

const AnalysisSchema = z.object({
  issue: z.object({
    title: z.string(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    confidence: z.number().min(0).max(1),
  }),
  impact: z.object({
    summary: z.string(),
    business: z.string().optional(),
    financial: z.string().optional(),
    customer: z.string().optional(),
  }),
  recommendation: z.object({
    title: z.string(),
    reason: z.string(),
    confidence: z.number().min(0).max(1),
    estimatedImpact: z.string(),
  }),
});

export type KloyyaAnalysis = z.infer<typeof AnalysisSchema>;

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);

  if (fenced?.[1]) {
    return fenced[1];
  }

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first >= 0 && last > first) {
    return text.slice(first, last + 1);
  }

  return text;
}

export async function analyzeBusinessSignal(input: {
  source: string;
  content: string;
  context?: unknown;
}): Promise<KloyyaAnalysis> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;

  if (!apiKey || !baseUrl || !model) {
    throw new Error("AI_PROVIDER_NOT_CONFIGURED");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
You are Kloyya's operational intelligence engine.

You do not merely summarize business information.

You must determine:
1. What happened?
2. Why does it matter?
3. What is the operational risk?
4. What should the company do next?

Rules:
- Never invent evidence.
- Never invent financial values.
- Separate facts from inference.
- Prefer conservative severity.
- Return valid JSON only.

Schema:
{
  "issue": {
    "title": "string",
    "description": "string",
    "severity": "low|medium|high|critical",
    "confidence": 0
  },
  "impact": {
    "summary": "string",
    "business": "string",
    "financial": "string",
    "customer": "string"
  },
  "recommendation": {
    "title": "string",
    "reason": "string",
    "confidence": 0,
    "estimatedImpact": "string"
  }
}
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `AI_PROVIDER_ERROR:${response.status}:${await response.text()}`,
    );
  }

  const json = await response.json();

  const content = json?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("AI_INVALID_RESPONSE");
  }

  return AnalysisSchema.parse(JSON.parse(extractJson(content)));
}