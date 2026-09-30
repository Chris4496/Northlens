import { STAKEHOLDER_LABEL, STATUS_LABEL, THEME_LABEL } from "@/lib/i18n";
import { applyFilters, computeInsights, DEFAULT_FILTERS, WINDOW_DAYS, type Filters } from "@/lib/insights";
import { getGemini } from "@/lib/server/clients";
import { config } from "@/lib/server/config";
import { listFeedback } from "@/lib/server/store";
import type { FeedbackTheme } from "@/lib/types";

const THEMES = Object.keys(THEME_LABEL) as FeedbackTheme[];
const pct = (x: number) => Math.round(x * 100);
const numbersIn = (s: string) => (s.replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

const SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: { theme: { type: "string", enum: THEMES }, text: { type: "string" } },
        required: ["theme", "text"],
      },
    },
    followUps: { type: "array", items: { type: "string" } },
  },
  required: ["headline", "findings", "followUps"],
};

const PROMPT = `You draft a short briefing for town planners about resident feedback on the Kwu Tung North New Development Area, Hong Kong.
Use ONLY the FACTS provided. Every number you write must appear in FACTS exactly (counts or whole percentages). Do not compute new numbers.
Write: one headline sentence; at most 3 findings, each one or two sentences, most important first; at most 3 follow-ups phrased as concrete things planners could check or clarify (e.g. "Confirm whether proposed footbridges include lifts").
Resident quotes show how people feel; they are not facts about the plan. Mention when an issue relates to plan items that are still proposed or under review, because feedback can still shape those.
Never recommend approving or rejecting development, and never claim to speak for all residents. If the data includes synthetic demo responses, do not hide that.`;

export async function POST(request: Request) {
  const ai = getGemini();
  if (!ai) return Response.json({ error: "AI briefing needs GEMINI_API_KEY" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const filters: Filters = { ...DEFAULT_FILTERS, ...(body?.filters ?? {}) };
  const lang = body?.lang === "zh" ? "zh" : "en";

  const rows = applyFilters(await listFeedback(), filters);
  if (rows.length < 5) return Response.json({ error: "not_enough" }, { status: 422 });
  const ins = computeInsights(rows);
  const synthetic = rows.filter((r) => r.synthetic).length;

  const top = ins.themes.slice(0, 5);
  const facts = [
    `Responses: ${ins.total} (${synthetic} synthetic demo, ${ins.total - synthetic} live). ${pct(ins.concernRate)}% express concern. ${pct(ins.vulnerableShare)}% from elderly/mobility-impaired, caregivers or families with children.`,
    ins.emerging &&
      `Emerging concern: ${THEME_LABEL[ins.emerging.theme].en} among ${STAKEHOLDER_LABEL[ins.emerging.stakeholder].en} — ${ins.emerging.count} concerned responses, ${ins.emerging.recent} in the last ${WINDOW_DAYS} days.`,
    ...top.map((th, i) => {
      const plan = th.plan.chunks.map((c) => `${c.heading} [${STATUS_LABEL[c.status].en}]`).join("; ") || "none";
      const issues = th.issues.map((x) => `${x.text} (${x.count})`).join("; ");
      const quotes = th.quotes.map((q) => `"${q.text.slice(0, 220)}"`).join(" ");
      return `#${i + 1} ${THEME_LABEL[th.theme].en} [theme=${th.theme}]: ${th.count} responses (${pct(th.share)}%), ${th.worried} concerned (${pct(th.concernRate)}%), last ${WINDOW_DAYS} days ${th.recent} vs previous ${WINDOW_DAYS} days ${th.prior}, ${pct(th.vulnerableShare)}% from vulnerable groups. Related plan items: ${plan}; ${th.plan.open} still proposed or under review. Suggested issues: ${issues || "none"}. Quotes: ${quotes}`;
    }),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await ai.models.generateContent({
      model: config.geminiModel,
      contents: `Language: ${lang === "zh" ? "Traditional Chinese (Hong Kong written style)" : "English"}.\nFACTS:\n${facts}`,
      config: {
        systemInstruction: PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: SCHEMA,
        temperature: 0.2,
      },
    });
    const out = JSON.parse(res.text ?? "{}");
    const allowed = new Set(numbersIn(facts));
    const numbersOk = (s: string) => numbersIn(s).every((n) => allowed.has(n));

    const findings = (Array.isArray(out.findings) ? out.findings : [])
      .filter((f: { theme: string; text: string }) => THEMES.includes(f.theme as FeedbackTheme) && typeof f.text === "string")
      .slice(0, 3);
    const kept = findings.filter((f: { text: string }) => numbersOk(f.text));
    const followUps = (Array.isArray(out.followUps) ? out.followUps : []).filter(
      (s: unknown): s is string => typeof s === "string" && numbersOk(s),
    );

    return Response.json({
      headline: typeof out.headline === "string" && numbersOk(out.headline) ? out.headline : null,
      findings: kept,
      followUps: followUps.slice(0, 3),
      dropped: findings.length - kept.length,
      basedOn: ins.total,
      synthetic,
      model: config.geminiModel,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[brief] Gemini failed", (err as Error).message);
    return Response.json({ error: "Briefing failed" }, { status: 502 });
  }
}
