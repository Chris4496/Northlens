import { answerQuestion } from "@/lib/server/answer";
import type { AskRequest } from "@/lib/types";

const PERSONAS = ["student", "worker", "caregiver"];
const CONCERNS = ["transport", "community", "accessibility"];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<AskRequest> | null;
  const question = body?.question?.trim().slice(0, 600);
  if (!question || !PERSONAS.includes(body!.persona!) || !CONCERNS.includes(body!.concern!)) {
    return Response.json({ error: "question, persona and concern are required" }, { status: 400 });
  }
  const answer = await answerQuestion({
    question,
    persona: body!.persona!,
    concern: body!.concern!,
    lang: body!.lang === "zh" ? "zh" : "en",
  });
  return Response.json(answer);
}
