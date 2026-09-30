import { SENTIMENT_LABEL, STAKEHOLDER_LABEL, THEME_LABEL, T } from "@/lib/i18n";
import { ZONES } from "@/lib/kb/places";
import { describeFilters, formatHkt, type Filters } from "@/lib/report";
import type { Feedback, Lang } from "@/lib/types";
import { ReportChrome } from "./report-chrome";

export function FeedbackReport({
  filters,
  rows,
  generatedAt,
  lang,
}: {
  filters: Filters;
  rows: Feedback[];
  generatedAt: string;
  lang: Lang;
}) {
  const zh = lang === "zh";
  const L = <K extends keyof typeof T>(k: K) => T[k][lang];
  const date = formatHkt(generatedAt);
  const sorted = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="report-doc report-feedback pb-20">
      <ReportChrome kind="feedback" filters={filters} count={rows.length} lang={lang} />
      <article lang={zh ? "zh-HK" : "en"} className="mx-auto max-w-[1100px] px-5 py-10 md:px-8">
        <header className="border-b border-ink pb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-wetland">
            NorthLens · {zh ? "古洞北新發展區" : "Kwu Tung North NDA"}
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.95]">
            {zh ? "已確認意見報告" : "Confirmed feedback report"}
          </h1>
          <p className="mt-4 max-w-[40rem] text-sm leading-relaxed text-ink-soft">
            {zh
              ? "每行一份已由人工確認分類的回應。個人資料已在儲存前移除。可用「下載 CSV」在試算表中再開。"
              : "One row per response whose category a person has confirmed. Personal details were removed before storage. Use Download CSV to open the same rows in a spreadsheet."}
          </p>
          <dl className="mt-6 grid gap-3 font-mono text-[11px] uppercase tracking-wider text-muted sm:grid-cols-2">
            <div>
              <dt>{zh ? "產生時間（香港）" : "Generated (HKT)"}</dt>
              <dd className="mt-0.5 text-ink">{date}</dd>
            </div>
            <div>
              <dt>{zh ? "篩選範圍" : "Scope"}</dt>
              <dd className="mt-0.5 normal-case tracking-normal text-ink">{describeFilters(filters, lang)}</dd>
            </div>
            <div>
              <dt>{zh ? "已確認回應" : "Confirmed responses"}</dt>
              <dd className="mt-0.5 text-ink">{rows.length}</dd>
            </div>
            <div>
              <dt>{zh ? "示範數據" : "Demo data"}</dt>
              <dd className="mt-0.5 text-ink">{rows.filter((r) => r.synthetic).length}</dd>
            </div>
          </dl>
        </header>

        {rows.length === 0 ? (
          <p className="mt-10 border border-dashed border-ink p-10 text-center text-sm text-muted">{L("exportEmpty")}</p>
        ) : (
          <div className="report-table mt-6 overflow-x-auto border border-ink">
            <table className="w-full min-w-[960px] text-sm">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead className="bg-paper-deep/60 text-left font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-3 py-2 font-normal">{zh ? "提交時間" : "Submitted"}</th>
                  <th className="px-3 py-2 font-normal">{zh ? "原文" : "Text"}</th>
                  <th className="px-3 py-2 font-normal">{zh ? "主題（已確認）" : "Theme (confirmed)"}</th>
                  <th className="px-3 py-2 font-normal">{L("stakeholder")}</th>
                  <th className="px-3 py-2 font-normal">{L("zone")}</th>
                  <th className="px-3 py-2 font-normal">{L("sentiment")}</th>
                  <th className="px-3 py-2 font-normal">{L("suggestedIssue")}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((f) => (
                  <tr key={f.id} className="border-t border-rule align-top">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-muted">
                      {formatHkt(f.createdAt)}
                      <div>
                        {f.inputMode === "voice" ? (zh ? "語音" : "voice") : zh ? "文字" : "text"}
                        {f.synthetic && (zh ? " · 示範" : " · demo")}
                      </div>
                    </td>
                    <td className="max-w-[320px] px-3 py-2.5">
                      {f.text || <span className="text-muted">({f.priorities.join(", ")})</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {THEME_LABEL[f.theme][lang]}
                      {f.aiTheme && f.aiTheme !== f.theme && (
                        <div className="mt-1 text-[10px] text-muted line-through">
                          AI: {THEME_LABEL[f.aiTheme][lang]}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs">{STAKEHOLDER_LABEL[f.stakeholder][lang]}</td>
                    <td className="px-3 py-2.5 text-xs">{ZONES[f.zone][lang]}</td>
                    <td className="px-3 py-2.5 text-xs">{SENTIMENT_LABEL[f.sentiment][lang]}</td>
                    <td className="px-3 py-2.5 text-xs text-ink-soft">{f.suggestedIssue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="mt-10 border-t border-ink pt-6 text-xs leading-relaxed text-muted">
          <p>{L("exportNote")}</p>
          <p className="mt-2">{L("guardrails")}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider">
            {zh
              ? `NorthLens 意見報告 · ${date} · ${rows.length} 份已確認回應`
              : `NorthLens feedback report · ${date} · ${rows.length} confirmed responses`}
          </p>
        </footer>
      </article>
    </div>
  );
}
