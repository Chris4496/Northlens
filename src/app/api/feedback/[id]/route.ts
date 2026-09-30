import { SENTIMENT_LABEL, STAKEHOLDER_LABEL, THEME_LABEL } from "@/lib/i18n";
import { ZONES } from "@/lib/kb/places";
import { reviewFeedback } from "@/lib/server/store";

const VALUES = { theme: THEME_LABEL, stakeholder: STAKEHOLDER_LABEL, zone: ZONES, sentiment: SENTIMENT_LABEL };

const FIELDS = ["theme", "stakeholder", "zone", "sentiment"] as const;

export async function PATCH(request: Request, ctx: RouteContext<"/api/feedback/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Expected a review object" }, { status: 400 });
  }
  for (const field of FIELDS) {
    if (Object.hasOwn(body, field) && (typeof body[field] !== "string" || !Object.hasOwn(VALUES[field], body[field]))) {
      return Response.json({ error: `Invalid ${field}` }, { status: 400 });
    }
  }
  const patch = Object.fromEntries(
    FIELDS.filter((f) => typeof body?.[f] === "string").map((f) => [f, body[f]]),
  );
  const row = await reviewFeedback(id, patch);
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(row);
}
