import { reviewFeedback } from "@/lib/server/store";

const FIELDS = ["theme", "stakeholder", "zone", "sentiment"] as const;

export async function PATCH(request: Request, ctx: RouteContext<"/api/feedback/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const patch = Object.fromEntries(
    FIELDS.filter((f) => typeof body?.[f] === "string").map((f) => [f, body[f]]),
  );
  const row = await reviewFeedback(id, patch);
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(row);
}
