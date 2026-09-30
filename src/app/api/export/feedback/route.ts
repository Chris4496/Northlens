import type { NextRequest } from "next/server";
import { confirmedInScope, feedbackCsv, formatHkt, parseFilters, parseLang } from "@/lib/report";
import { listFeedback } from "@/lib/server/store";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const rows = confirmedInScope(await listFeedback(), parseFilters(q));
  const date = formatHkt(new Date().toISOString(), false);
  return new Response(feedbackCsv(rows, parseLang(q)), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="northlens-confirmed-feedback-${date}.csv"`,
      "cache-control": "no-store",
      "x-row-count": String(rows.length),
    },
  });
}
