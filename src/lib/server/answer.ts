import "server-only";
import { SOURCE_BY_ID } from "@/lib/kb/sources";
import { PERSONA_BY_ID, CONCERN_BY_ID } from "@/lib/personas";
import type { Answer, AskRequest, Claim, Lang, PlanStatus, RetrievedChunk, Source, Topic } from "@/lib/types";
import { getGemini } from "./clients";
import { config } from "./config";
import { retrieve } from "./retrieval";

const FIRMNESS: PlanStatus[] = [
  "completed",
  "under_construction",
  "planned",
  "proposed",
  "under_review",
  "superseded",
];

function weakestStatus(ids: string[], byId: Map<string, RetrievedChunk>): PlanStatus {
  const statuses = ids.map((id) => byId.get(id)?.status).filter(Boolean) as PlanStatus[];
  return statuses.sort((a, b) => FIRMNESS.indexOf(b) - FIRMNESS.indexOf(a))[0] ?? "proposed";
}

const CLAIM_LIST = {
  type: "array",
  items: {
    type: "object",
    properties: {
      text: { type: "string" },
      citations: { type: "array", items: { type: "string" } },
    },
    required: ["text", "citations"],
  },
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    insufficientEvidence: { type: "boolean" },
    whatMayChange: CLAIM_LIST,
    whyItMatters: CLAIM_LIST,
    uncertain: CLAIM_LIST,
  },
  required: ["summary", "insufficientEvidence", "whatMayChange", "whyItMatters", "uncertain"],
};

function systemPrompt(lang: Lang) {
  const language =
    lang === "zh"
      ? "Write in Traditional Chinese as used in Hong Kong (繁體中文，香港用語), warm and conversational, suitable for Cantonese speakers."
      : "Write in plain British English at roughly a secondary-school reading level.";
  return `You are NorthLens, a civic explainer for Hong Kong's Northern Metropolis (Kwu Tung North pilot).

Rules — follow strictly:
1. Use ONLY the numbered source passages provided. Never use outside knowledge about Hong Kong.
2. Every claim must cite one or more passage ids exactly as given (e.g. "ktu-erl-station"). Claims without support must be omitted.
3. Copy any number, date or figure exactly as it appears in the cited passage. Do not calculate, estimate or round.
4. Respect each passage's STATUS. Never present a proposal, review item or superseded plan as certain. If a plan was superseded, say so.
5. "whyItMatters" explains implications for this specific resident using cautious language ("could", "may"). It must still cite the passage it reasons from.
6. "uncertain" lists what is not yet confirmed: proposals, items under review, superseded plans, conflicting figures, and details the passages do not cover that the resident asked about.
7. If the passages do not answer the question, set insufficientEvidence=true and say what information is missing instead of guessing.
8. Never give legal advice, predict compensation, recommend decisions, or claim to represent community opinion.
9. 2–4 short claims per section. Each claim one or two sentences. Summary: one sentence.
${language}`;
}

function contextBlock(chunks: RetrievedChunk[]) {
  return chunks
    .map((c) => {
      const src = SOURCE_BY_ID.get(c.sourceId);
      return `[${c.id}] STATUS=${c.status}${c.timeline ? ` TIMELINE=${c.timeline}` : ""}
SOURCE: ${src?.publisher} — ${src?.title} (${src?.date})
${c.heading}: ${c.text}`;
    })
    .join("\n\n");
}

const numberRe = /\d[\d,.]*/g;
const normNum = (s: string) => s.replace(/,/g, "").replace(/\.$/, "");

/** Drops citations to passages not retrieved, and claims whose figures don't appear in their sources. */
function verifyClaims(
  raw: { text: string; citations: string[] }[] | undefined,
  byId: Map<string, RetrievedChunk>,
): { claims: Claim[]; dropped: number } {
  let dropped = 0;
  const claims: Claim[] = [];
  for (const r of raw ?? []) {
    const cites = [...new Set((r.citations ?? []).filter((id) => byId.has(id)))];
    dropped += (r.citations?.length ?? 0) - cites.length;
    if (!cites.length || !r.text?.trim()) {
      dropped++;
      continue;
    }
    const evidence = cites.map((id) => `${byId.get(id)!.text} ${byId.get(id)!.textZh}`).join(" ");
    const evidenceNums = new Set((evidence.match(numberRe) ?? []).map(normNum));
    const unsupported = (r.text.match(numberRe) ?? []).map(normNum).filter((n) => !evidenceNums.has(n));
    if (unsupported.length) {
      dropped++;
      continue;
    }
    claims.push({ text: r.text.trim(), citations: cites, status: weakestStatus(cites, byId) });
  }
  return { claims, dropped };
}

async function generateWithGemini(req: AskRequest, chunks: RetrievedChunk[]) {
  const ai = getGemini()!;
  const persona = PERSONA_BY_ID.get(req.persona)!;
  const concern = CONCERN_BY_ID.get(req.concern)!;
  const res = await ai.models.generateContent({
    model: config.geminiModel,
    contents: `RESIDENT: lives in Kwu Tung. They are ${persona.lens}. Main concern: ${concern.label.en}.
QUESTION: ${req.question}

SOURCE PASSAGES:
${contextBlock(chunks)}`,
    config: {
      systemInstruction: systemPrompt(req.lang),
      responseMimeType: "application/json",
      responseJsonSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });
  return JSON.parse(res.text ?? "{}");
}

// ── Offline composition (no LLM) ────────────────────────────────────────────

const IMPLICATION: Partial<Record<Topic, Record<string, { en: string; zh: string }>>> = {
  transport: {
    student: {
      en: "Your commute could gain a rail option from the heart of Kwu Tung once this opens, with more interchange choices later.",
      zh: "通車後，你可在古洞中心直接乘搭鐵路上學，日後亦可能有更多轉乘選擇。",
    },
    worker: {
      en: "Peak-hour trips across the New Territories could become more direct once these lines are running.",
      zh: "這些路綫投入服務後，繁忙時間往返新界各區的行程可能更直接。",
    },
    caregiver: {
      en: "A station in the town centre could mean shorter trips to appointments — if the route from your home is step-free.",
      zh: "市中心設站或可縮短覆診等行程——前提是由家門到車站的路線無障礙。",
    },
  },
  accessibility: {
    student: {
      en: "Homes are planned close to the station, which could make short walks the norm for daily trips.",
      zh: "住宅規劃貼近車站，日常出行或只需短距離步行。",
    },
    worker: {
      en: "Living within a short walk of the station could cut time off every commute.",
      zh: "住在車站步行範圍內，每次通勤都可能節省時間。",
    },
    caregiver: {
      en: "What counts as a short walk for many people can be hard for someone with limited mobility — the actual route, lifts and footbridges will matter.",
      zh: "對很多人來說不遠的步行距離，對行動不便人士可能吃力——實際路線、升降機及天橋設計至為重要。",
    },
  },
  elderly: {
    caregiver: {
      en: "Elderly day care and residential care places are planned near the new homes, which could reduce travel for your parent.",
      zh: "新住宅附近規劃了長者日間護理及院舍宿位，或可減少父母外出的路程。",
    },
  },
  healthcare: {
    caregiver: {
      en: "Hospital plans have shifted, so the nearest major hospital may not be inside Kwu Tung North — worth factoring into regular appointments.",
      zh: "醫院規劃已有改變，最近的大型醫院未必位於古洞北區內——安排定期覆診時值得留意。",
    },
  },
  community: {
    student: {
      en: "A library and sports centre are planned near the station, which could give you places to study and train locally.",
      zh: "車站附近規劃了圖書館和體育館，或可讓你在區內溫習和運動。",
    },
  },
  employment: {
    worker: {
      en: "New jobs are planned in the area, which could open options closer to home.",
      zh: "區內規劃了新就業機會，或可提供較近家的工作選擇。",
    },
  },
};

function firstSentence(s: string) {
  const m = s.match(/^.+?[.。](\s|$)/);
  return (m ? m[0] : s).trim();
}

function composeOffline(req: AskRequest, chunks: RetrievedChunk[]) {
  const pick = (c: RetrievedChunk) => (req.lang === "zh" ? c.textZh : c.text);
  const firm = chunks.filter((c) => ["completed", "under_construction", "planned"].includes(c.status));
  const unsure = chunks.filter((c) => ["proposed", "superseded", "under_review"].includes(c.status));

  const whatMayChange = firm.slice(0, 3).map((c) => ({ text: firstSentence(pick(c)), citations: [c.id] }));

  // Templates attach only to a chunk's primary topic so the cited passage actually supports the line.
  const whyItMatters: { text: string; citations: string[] }[] = [];
  for (const c of chunks) {
    const line = IMPLICATION[c.topics[0]]?.[req.persona];
    if (line && !whyItMatters.some((w) => w.text === line[req.lang])) {
      whyItMatters.push({ text: line[req.lang], citations: [c.id] });
    }
    if (whyItMatters.length >= 2) break;
  }

  const uncertain = unsure.slice(0, 3).map((c) => ({ text: firstSentence(pick(c)), citations: [c.id] }));
  const anchor = chunks.find((c) => c.topics[0] === "transport");
  if (anchor) {
    uncertain.push({
      text:
        req.lang === "zh"
          ? "最終走線、車站出入口位置及工程時間表可能在詳細規劃及施工期間改變。"
          : "Final alignments, station entrances and schedules can change during detailed planning and construction.",
      citations: [anchor.id],
    });
  }

  const top = chunks[0];
  return {
    summary: top
      ? req.lang === "zh"
        ? `與你問題最相關的是「${top.headingZh}」，以下按已確定及未確定分開說明。`
        : `The most relevant plan for your question is “${top.heading}” — here is what is confirmed and what is not.`
      : "",
    insufficientEvidence: chunks.length === 0,
    whatMayChange,
    whyItMatters,
    uncertain,
  };
}

export async function answerQuestion(req: AskRequest): Promise<Answer> {
  const { chunks, mode: retrieval } = await retrieve(req);
  const byId = new Map(chunks.map((c) => [c.id, c]));

  let raw: ReturnType<typeof composeOffline> | null = null;
  let mode: Answer["mode"] = "offline";
  if (getGemini() && chunks.length) {
    try {
      raw = await generateWithGemini(req, chunks);
      mode = "gemini";
    } catch (err) {
      console.warn("[answer] Gemini generation failed, composing offline", (err as Error).message);
    }
  }
  raw ??= composeOffline(req, chunks);

  const a = verifyClaims(raw.whatMayChange, byId);
  const b = verifyClaims(raw.whyItMatters, byId);
  const c = verifyClaims(raw.uncertain, byId);

  const citedIds = new Set([...a.claims, ...b.claims, ...c.claims].flatMap((cl) => cl.citations));
  const usedChunks = chunks.filter((ch) => citedIds.has(ch.id));
  const sources = [...new Set(usedChunks.map((ch) => ch.sourceId))]
    .map((id) => SOURCE_BY_ID.get(id))
    .filter((s): s is Source => Boolean(s));

  return {
    summary: raw.summary ?? "",
    whatMayChange: a.claims,
    whyItMatters: b.claims,
    uncertain: c.claims,
    insufficientEvidence: Boolean(raw.insufficientEvidence) || citedIds.size === 0,
    placeIds: [...new Set(usedChunks.flatMap((ch) => ch.placeIds))],
    chunks,
    sources,
    mode,
    retrieval,
    droppedCitations: a.dropped + b.dropped + c.dropped,
  };
}
