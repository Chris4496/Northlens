"use client";

import Link from "next/link";
import { T } from "@/lib/i18n";
import { exportQuery, type Filters } from "@/lib/report";
import type { Lang } from "@/lib/types";

/** Drop Safari-crashing compositor layers, paint once, then open the print dialog. */
function printReport() {
  const root = document.documentElement;
  root.classList.add("printing");
  document.querySelectorAll<HTMLElement>("header").forEach((el) => {
    el.style.setProperty("--tw-backdrop-blur", "initial", "important");
    el.style.setProperty("backdrop-filter", "none", "important");
    el.style.setProperty("-webkit-backdrop-filter", "none", "important");
  });
  void root.offsetHeight;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.print());
  });
}

export function ReportChrome({
  kind,
  filters,
  count,
  lang,
}: {
  kind: "consultation" | "feedback";
  filters: Filters;
  count: number;
  lang: Lang;
}) {
  const zh = lang === "zh";
  const q = exportQuery(filters, lang);
  const other: Lang = zh ? "en" : "zh";
  const otherQ = exportQuery(filters, other);

  return (
    <div data-export-chrome className="sticky top-(--header-h) z-40 border-b border-ink bg-paper/95 print:hidden">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-2 px-5 py-2.5 md:px-8">
        <Link href="/dashboard" className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink">
          ← {T.exportBack[lang]}
        </Link>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/export/${kind === "consultation" ? "feedback" : "consultation"}?${q}`}
            className="border border-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider hover:bg-paper-deep"
          >
            {kind === "consultation" ? T.exportFeedback[lang] : T.exportConsultation[lang]}
          </Link>
          {kind === "feedback" && count > 0 && (
            <a
              href={`/api/export/feedback?${q}`}
              className="border border-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider hover:bg-paper-deep"
            >
              {T.exportCsv[lang]}
            </a>
          )}
          {count > 0 && (
            <button
              type="button"
              onClick={printReport}
              className="border border-ink bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-card hover:bg-vermilion"
            >
              {T.exportPrint[lang]}
            </button>
          )}
          <Link
            href={`?${otherQ}`}
            className="border border-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider hover:bg-paper-deep"
            hrefLang={other === "zh" ? "zh-HK" : "en"}
          >
            {other === "zh" ? "繁" : "EN"}
          </Link>
        </span>
      </div>
      <p className="mx-auto max-w-[1100px] px-5 pb-2.5 font-mono text-[10px] leading-relaxed text-muted md:px-8">
        {zh
          ? `已確認 ${count} 份 · 未覆核的回應不會列入 · 此報告不是城市規劃委員會申述`
          : `${count} confirmed · unreviewed responses are excluded · this is not a Town Planning Board representation`}
      </p>
    </div>
  );
}
