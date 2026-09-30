import { getGemini } from "@/lib/server/clients";
import { config } from "@/lib/server/config";

const MAX_BYTES = 6 * 1024 * 1024;
const MIN_BYTES = 4 * 1024;

const SCHEMA = {
  type: "object",
  properties: {
    speech: { type: "boolean", description: "true only if the audio contains intelligible human speech addressed to the recorder" },
    transcript: { type: "string" },
  },
  required: ["speech", "transcript"],
};

const PROMPT = {
  yue: `Transcribe this Hong Kong Cantonese speech verbatim.
Write Cantonese in Traditional Chinese characters, keeping colloquial Cantonese words as spoken (e.g. 嘅、唔、咗、係、喺、啲). Keep English words and place names in English exactly as spoken — code-mixing is normal in Hong Kong.
Add natural punctuation. If the audio is silence, noise or unintelligible, set speech=false and leave transcript empty — never guess.`,
  en: `Transcribe this English speech verbatim (Hong Kong accents are common; it may contain Cantonese words or place names — keep those in Traditional Chinese characters).
Add natural punctuation. If the audio is silence, noise or unintelligible, set speech=false and leave transcript empty — never guess.`,
};

export async function POST(request: Request) {
  const ai = getGemini();
  if (!ai) return Response.json({ error: "Voice input needs GEMINI_API_KEY" }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  const lang = form?.get("lang") === "en" ? "en" : "yue";
  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json({ error: "No audio received" }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) return Response.json({ error: "Recording too long" }, { status: 413 });
  // Near-empty clips make the model invent speech rather than return nothing.
  if (audio.size < MIN_BYTES) return Response.json({ error: "too_short" }, { status: 422 });
  const mimeType = audio.type.split(";")[0] || "audio/webm";
  if (!mimeType.startsWith("audio/")) return Response.json({ error: "Unsupported audio type" }, { status: 415 });

  try {
    const data = Buffer.from(await audio.arrayBuffer()).toString("base64");
    const res = await ai.models.generateContent({
      model: config.geminiModel,
      contents: [{ role: "user", parts: [{ text: PROMPT[lang] }, { inlineData: { mimeType, data } }] }],
      config: { temperature: 0, responseMimeType: "application/json", responseJsonSchema: SCHEMA },
    });
    const out = JSON.parse(res.text ?? "{}");
    const text = out.speech === true && typeof out.transcript === "string" ? out.transcript.trim() : "";
    return Response.json({ text });
  } catch (err) {
    console.warn("[transcribe] Gemini failed", (err as Error).message);
    return Response.json({ error: "Transcription failed" }, { status: 502 });
  }
}
