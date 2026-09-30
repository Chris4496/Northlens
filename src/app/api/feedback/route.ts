import { PRIORITIES } from "@/lib/i18n";
import { randomUUID } from "node:crypto";
import { classifyFeedback } from "@/lib/server/classify";
import { redactPII } from "@/lib/server/pii";
import { addFeedback, listFeedback, storeMode } from "@/lib/server/store";
import type { Feedback, PersonaId } from "@/lib/types";

const PERSONAS: PersonaId[] = ["student", "worker", "caregiver"];

export async function GET() {
  const rows = await listFeedback();
  return Response.json({ rows: rows.slice(0, 2000), store: storeMode() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.text === "string" ? body.text.trim().slice(0, 2000) : "";
  const persona: PersonaId = PERSONAS.includes(body?.persona) ? body.persona : "caregiver";
  const priorities: string[] = Array.isArray(body?.priorities)
    ? [...new Set<string>(body.priorities.filter((p: unknown) => typeof p === "string" && PRIORITIES.some((option) => option.id === p)))].slice(0, 10)
    : [];
  if (!raw && priorities.length === 0) {
    return Response.json({ error: "Feedback text or priorities required" }, { status: 400 });
  }

  const { text, redacted } = redactPII(raw);
  const { result, by } = await classifyFeedback(text || priorities.join(", "), persona, priorities);

  const feedback: Feedback = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    text,
    priorities,
    persona,
    lang: body?.lang === "zh" ? "zh" : "en",
    ...result,
    piiRedacted: redacted,
    classifiedBy: by,
    aiTheme: result.theme,
    inputMode: body?.inputMode === "voice" ? "voice" : "text",
    reviewed: false,
    synthetic: false,
  };
  await addFeedback(feedback);
  return Response.json(feedback, { status: 201 });
}
