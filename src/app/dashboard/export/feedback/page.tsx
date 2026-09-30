import type { Metadata } from "next";
import { FeedbackReport } from "@/components/dashboard/feedback-report";
import { confirmedInScope, parseFilters, parseLang } from "@/lib/report";
import { listFeedback } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NorthLens — Confirmed feedback report",
};

export default async function FeedbackExportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const lang = parseLang(q);
  const filters = parseFilters(q);
  const rows = confirmedInScope(await listFeedback(), filters);
  return <FeedbackReport filters={filters} rows={rows} generatedAt={new Date().toISOString()} lang={lang} />;
}
