import "server-only";

export const config = {
  geminiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  embedModel: process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001",
  embedDims: 768,
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

export const hasGemini = () => Boolean(config.geminiKey);
export const hasSupabase = () => Boolean(config.supabaseUrl && config.supabaseKey);
