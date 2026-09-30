import "server-only";
import { CHUNKS, CHUNK_BY_ID } from "@/lib/kb/chunks";
import { CONCERN_BY_ID, PERSONA_BY_ID } from "@/lib/personas";
import type { Chunk, ConcernId, PersonaId, RetrievedChunk, Topic } from "@/lib/types";
import { embed, getSupabase } from "./clients";

export type RetrievalMode = "pgvector" | "embeddings" | "keyword";

const UNCERTAINTY_RE =
  /uncertain|confirm|sure|change|still|when|delay|risk|proposal|guarantee|未確定|確定|改變|幾時|何時|延誤|建議/i;

export function chunkDocument(c: Chunk): string {
  return `${c.heading}\n${c.text}\n${c.headingZh}\n${c.textZh}`;
}

// ── Keyword scoring (works with no API key) ────────────────────────────────

function tokenize(s: string): string[] {
  const lower = s.toLowerCase();
  const words = lower.match(/[a-z0-9]+/g)?.filter((w) => w.length > 2 && !STOP.has(w)) ?? [];
  const cjk = lower.match(/[\u3400-\u9fff]+/g) ?? [];
  const bigrams = cjk.flatMap((run) =>
    run.length === 1 ? [run] : Array.from({ length: run.length - 1 }, (_, i) => run.slice(i, i + 2)),
  );
  return [...words.map(stem), ...bigrams.filter((b) => !CJK_STOP.has(b))];
}

function stem(w: string): string {
  return w.replace(/(ing|ies|es|s|ed)$/, "");
}

const STOP = new Set(
  "the and for are with this that will what how who where which from have has into our your you can could would about there their they them near planned plan development".split(
    " ",
  ),
);

const CJK_STOP = new Set(
  "規劃 劃中 中的 發展 展會 會對 對我 我們 們有 有甚 甚麼 麼影 影響 響？ 甚么 什麼 古洞 洞北 新發 展區 我的 會否 是否 可以 如何 怎樣 哪裡".split(" "),
);

const SYNONYMS: Record<string, string[]> = {
  walk: ["pedestrian", "footbridge", "footpath", "500"],
  difficulty: ["pedestrian", "footbridge", "elderly"],
  媽媽: ["elderly", "長者"],
  爸爸: ["elderly", "長者"],
  父母: ["elderly", "長者"],
  不便: ["pedestrian", "footbridge", "行人", "天橋"],
  行動: ["pedestrian", "footbridge", "步行"],
  步行: ["pedestrian", "footbridge", "500", "行人"],
  輪椅: ["pedestrian", "footbridge", "行人", "天橋"],
  車站: ["railway", "station"],
  港鐵: ["railway", "station"],
  醫院: ["hospital", "healthcare"],
  睇醫: ["hospital", "clinic", "healthcare"],
  返工: ["employment", "railway", "journey"],
  上學: ["railway", "journey", "station"],
  wheelchair: ["pedestrian", "footbridge", "disabl", "access"],
  mother: ["elderly"],
  father: ["elderly"],
  parent: ["elderly"],
  commute: ["railway", "station", "journey", "transport"],
  university: ["railway", "journey", "station"],
  hospital: ["hospital", "healthcare", "clinic"],
  doctor: ["hospital", "clinic", "healthcare"],
  train: ["railway", "station"],
  mtr: ["railway", "station"],
  job: ["employment", "job", "business"],
  park: ["park", "green", "valley"],
  noise: ["noise", "barrier"],
  uncertain: ["proposed", "superseded", "review"],
};

const docTokens = new Map(CHUNKS.map((c) => [c.id, tokenize(chunkDocument(c))]));
const df = new Map<string, number>();
for (const toks of docTokens.values()) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);

function keywordScores(query: string): Map<string, number> {
  const q = tokenize(query);
  const expanded = [...q, ...q.flatMap((t) => SYNONYMS[t]?.map(stem) ?? [])];
  const N = CHUNKS.length;
  const scores = new Map<string, number>();
  for (const [id, toks] of docTokens) {
    let s = 0;
    for (const qt of expanded) {
      const tf = toks.filter((t) => t === qt || (qt.length > 4 && t.startsWith(qt))).length;
      if (!tf) continue;
      const idf = Math.log(1 + (N - (df.get(qt) ?? 0) + 0.5) / ((df.get(qt) ?? 0) + 0.5));
      s += (idf * tf * 2.2) / (tf + 1.2 * (0.25 + (0.75 * toks.length) / 80));
    }
    scores.set(id, s);
  }
  const max = Math.max(...scores.values(), 1e-9);
  for (const [id, s] of scores) scores.set(id, s / max);
  return scores;
}

// ── Semantic scoring ───────────────────────────────────────────────────────

let docVectors: Promise<Map<string, number[]> | null> | null = null;

function getDocVectors() {
  docVectors ??= embed(CHUNKS.map(chunkDocument), "RETRIEVAL_DOCUMENT")
    .then((vs) => (vs ? new Map(CHUNKS.map((c, i) => [c.id, vs[i]])) : null))
    .catch((err) => {
      console.warn("[retrieval] document embedding failed, using keyword search", err?.message);
      docVectors = null;
      return null;
    });
  return docVectors;
}

async function semanticScores(query: string): Promise<{ scores: Map<string, number>; mode: RetrievalMode } | null> {
  let qv: number[][] | null;
  try {
    qv = await embed([query], "RETRIEVAL_QUERY");
  } catch (err) {
    console.warn("[retrieval] query embedding failed", (err as Error).message);
    return null;
  }
  if (!qv) return null;

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.rpc("match_kb_chunks", {
      query_embedding: qv[0],
      match_count: CHUNKS.length,
    });
    if (!error && Array.isArray(data) && data.length) {
      return {
        scores: new Map(data.map((r: { id: string; similarity: number }) => [r.id, r.similarity])),
        mode: "pgvector",
      };
    }
    if (error) console.warn("[retrieval] pgvector query failed, falling back to in-memory", error.message);
  }

  const docs = await getDocVectors();
  if (!docs) return null;
  const scores = new Map<string, number>();
  for (const [id, v] of docs) scores.set(id, dot(qv[0], v));
  return { scores, mode: "embeddings" };
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// ── Hybrid ranking ─────────────────────────────────────────────────────────

export async function retrieve(opts: {
  question: string;
  persona: PersonaId;
  concern: ConcernId;
  k?: number;
}): Promise<{ chunks: RetrievedChunk[]; mode: RetrievalMode }> {
  const { question, persona, concern, k = 6 } = opts;
  const kw = keywordScores(question);
  const sem = await semanticScores(question);

  const boost = new Set<Topic>([
    ...(CONCERN_BY_ID.get(concern)?.topics ?? []),
    ...(PERSONA_BY_ID.get(persona)?.topicBoost ?? []),
  ]);
  const wantsUncertainty = UNCERTAINTY_RE.test(question);

  const ranked = CHUNKS.map((c) => {
    const topical = c.topics.filter((t) => boost.has(t)).length / Math.max(c.topics.length, 1);
    const semantic = sem?.scores.get(c.id) ?? 0;
    const lexical = kw.get(c.id) ?? 0;
    let score = sem ? 0.6 * semantic + 0.25 * lexical + 0.15 * topical : 0.75 * lexical + 0.25 * topical;
    if (wantsUncertainty && ["proposed", "superseded", "under_review"].includes(c.status)) score += 0.12;
    return { ...c, score };
  }).sort((a, b) => b.score - a.score);

  const floor = sem ? 0.2 : 0.08;
  const chunks = ranked.filter((c) => c.score >= floor).slice(0, k);
  return { chunks, mode: sem?.mode ?? "keyword" };
}

export function chunksById(ids: string[]): Chunk[] {
  return ids.map((id) => CHUNK_BY_ID.get(id)).filter((c): c is Chunk => Boolean(c));
}
