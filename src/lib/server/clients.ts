import "server-only";
import { GoogleGenAI } from "@google/genai";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config, hasGemini, hasSupabase } from "./config";

let gemini: GoogleGenAI | null = null;
let supabase: SupabaseClient | null = null;

export function getGemini(): GoogleGenAI | null {
  if (!hasGemini()) return null;
  gemini ??= new GoogleGenAI({ apiKey: config.geminiKey });
  return gemini;
}

/** Server-only client using the secret key; tables have RLS with no public policies. */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  supabase ??= createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

export async function embed(
  texts: string[],
  taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT",
): Promise<number[][] | null> {
  const ai = getGemini();
  if (!ai) return null;
  const res = await ai.models.embedContent({
    model: config.embedModel,
    contents: texts,
    config: { taskType, outputDimensionality: config.embedDims },
  });
  const vectors = res.embeddings?.map((e) => e.values ?? []) ?? [];
  if (vectors.length !== texts.length || vectors.some((v) => v.length === 0)) return null;
  return vectors.map(normalize);
}

function normalize(v: number[]): number[] {
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n);
}
