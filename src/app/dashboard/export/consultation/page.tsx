import type { Metadata } from "next";
import { ConsultationReport } from "@/components/dashboard/consultation-report";
import { confirmedInScope, parseFilters, parseLang, reportInsights } from "@/lib/report";
import { listFeedback } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NorthLens — Consultation report",
};

export default async function ConsultationExportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const lang = parseLang(q);
  const filters = parseFilters(q);
  const rows = confirmedInScope(await listFeedback(), filters);
  return <ConsultationReport filters={filters} rows={rows} ins={reportInsights(rows)} generatedAt={new Date().toISOString()} lang={lang} />;
}
