/**
 * Embeds the curated knowledge base with Gemini and upserts it into Supabase pgvector.
 * Usage: npm run ingest   (reads .env.local)
 */
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { CHUNKS } from "../src/lib/kb/chunks";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const model = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001";

  if (!apiKey || !url || !key) {
    console.error("Set GEMINI_API_KEY, SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const docs = CHUNKS.map((c) => `${c.heading}\n${c.text}\n${c.headingZh}\n${c.textZh}`);
  const res = await ai.models.embedContent({
    model,
    contents: docs,
    config: { taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: 768 },
  });
  const vectors = (res.embeddings ?? []).map((e) => {
    const v = e.values ?? [];
    const n = Math.hypot(...v) || 1;
    return v.map((x) => x / n);
  });
  if (vectors.length !== CHUNKS.length) throw new Error("Embedding count mismatch");

  const { error } = await sb.from("kb_chunks").upsert(
    CHUNKS.map((c, i) => ({
      id: c.id,
      source_id: c.sourceId,
      heading: c.heading,
      text: c.text,
      text_zh: c.textZh,
      topics: c.topics,
      status: c.status,
      embedding: vectors[i],
      updated_at: new Date().toISOString(),
    })),
  );
  if (error) throw error;
  console.log(`Upserted ${CHUNKS.length} chunks into kb_chunks using ${model}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
