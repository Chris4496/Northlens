import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Feedback, FeedbackStructured } from "@/lib/types";
import { getSupabase } from "./clients";
import { buildSeed } from "./seed";

export type StoreMode = "supabase" | "local";

const FILE = path.join(process.cwd(), ".data", "feedback.json");
let lock: Promise<unknown> = Promise.resolve();

async function readLocal(): Promise<Feedback[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    const seed = buildSeed();
    await writeLocal(seed);
    return seed;
  }
}

async function writeLocal(rows: Feedback[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2));
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = lock.then(fn, fn);
  lock = next.catch(() => {});
  return next;
}

// snake_case <-> camelCase for the Supabase table
type DbRow = {
  id: string;
  created_at: string;
  text: string;
  priorities: string[];
  persona: string;
  lang: string;
  zone: string;
  theme: string;
  stakeholder: string;
  concern: string;
  sentiment: string;
  suggested_issue: string;
  pii_redacted: boolean;
  classified_by: string;
  ai_theme: string | null;
  input_mode: string;
  reviewed: boolean;
  synthetic: boolean;
};

const toDb = (f: Feedback): DbRow => ({
  id: f.id,
  created_at: f.createdAt,
  text: f.text,
  priorities: f.priorities,
  persona: f.persona,
  lang: f.lang,
  zone: f.zone,
  theme: f.theme,
  stakeholder: f.stakeholder,
  concern: f.concern,
  sentiment: f.sentiment,
  suggested_issue: f.suggestedIssue,
  pii_redacted: f.piiRedacted,
  classified_by: f.classifiedBy,
  ai_theme: f.aiTheme,
  input_mode: f.inputMode,
  reviewed: f.reviewed,
  synthetic: f.synthetic,
});

const fromDb = (r: DbRow): Feedback => ({
  id: r.id,
  createdAt: r.created_at,
  text: r.text,
  priorities: r.priorities ?? [],
  persona: r.persona as Feedback["persona"],
  lang: r.lang as Feedback["lang"],
  zone: r.zone as Feedback["zone"],
  theme: r.theme as Feedback["theme"],
  stakeholder: r.stakeholder as Feedback["stakeholder"],
  concern: r.concern,
  sentiment: r.sentiment as Feedback["sentiment"],
  suggestedIssue: r.suggested_issue,
  piiRedacted: r.pii_redacted,
  classifiedBy: r.classified_by as Feedback["classifiedBy"],
  aiTheme: (r.ai_theme as Feedback["aiTheme"]) ?? null,
  inputMode: r.input_mode === "voice" ? "voice" : "text",
  reviewed: r.reviewed,
  synthetic: r.synthetic,
});

// Rows written to the local file before these fields existed.
const normalizeLocal = (f: Feedback): Feedback => ({ ...f, aiTheme: f.aiTheme ?? f.theme, inputMode: f.inputMode ?? "text" });

export function storeMode(): StoreMode {
  return getSupabase() ? "supabase" : "local";
}

export async function listFeedback(): Promise<Feedback[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("feedback").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase: ${error.message}`);
    if (data.length === 0) {
      const seed = buildSeed();
      const { error: seedErr } = await sb.from("feedback").insert(seed.map(toDb));
      if (seedErr) throw new Error(`Supabase seed: ${seedErr.message}`);
      return seed.reverse();
    }
    return (data as DbRow[]).map(fromDb);
  }
  const rows = await withLock(readLocal);
  return rows.map(normalizeLocal).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addFeedback(f: Feedback): Promise<Feedback> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("feedback").insert(toDb(f));
    if (error) throw new Error(`Supabase: ${error.message}`);
    return f;
  }
  return withLock(async () => {
    const rows = await readLocal();
    rows.push(f);
    await writeLocal(rows);
    return f;
  });
}

export async function reviewFeedback(
  id: string,
  patch: Partial<Pick<FeedbackStructured, "theme" | "stakeholder" | "zone" | "sentiment">>,
): Promise<Feedback | null> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("feedback")
      .update({ ...patch, reviewed: true })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data ? fromDb(data as DbRow) : null;
  }
  return withLock(async () => {
    const rows = await readLocal();
    const row = rows.find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch, { reviewed: true });
    await writeLocal(rows);
    return row;
  });
}
