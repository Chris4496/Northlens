import { config, hasGemini, hasSupabase } from "@/lib/server/config";

export async function GET() {
  return Response.json({
    gemini: hasGemini() ? config.geminiModel : null,
    supabase: hasSupabase(),
  });
}
