"use client";

import Link from "next/link";
import { exportQuery, type Filters } from "@/lib/report";
import { useLang } from "../lang";

export function ExportBar({ filters, confirmed, total }: { filters: Filters; confirmed: number; total: number }) {
  const { lang, t } = useLang();
  const zh = lang === "zh";
  const q = exportQuery(filters, lang);
  const disabled = confirmed === 0;

  return (
    <div data-tour="export" className="mt-6 border border-ink bg-card px-5 py-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">{zh ? "匯出報告" : "Export reports"}</h2>
          <p className="mt-1 max-w-[52rem] text-sm text-ink-soft">{t("exportNote")}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted">
            {zh
              ? `目前篩選中 ${confirmed} / ${total} 份已確認`
              : `${confirmed} of ${total} in this filter confirmed`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {disabled ? (
            <>
              <span className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                {t("exportConsultation")}
              </span>
              <span className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                {t("exportFeedback")}
              </span>
            </>
          ) : (
            <>
              <Link
                href={`/dashboard/export/consultation?${q}`}
                target="_blank"
                rel="noreferrer"
                className="border border-ink bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-card hover:bg-vermilion"
              >
                {t("exportConsultation")}
              </Link>
              <Link
                href={`/dashboard/export/feedback?${q}`}
                target="_blank"
                rel="noreferrer"
                className="border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider hover:bg-paper-deep"
              >
                {t("exportFeedback")}
              </Link>
            </>
          )}
        </div>
      </div>
      {disabled && <p className="mt-3 text-sm text-vermilion">{t("exportEmpty")}</p>}
    </div>
  );
}
