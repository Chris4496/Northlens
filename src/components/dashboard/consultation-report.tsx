import { STAKEHOLDER_LABEL, STATUS_LABEL, THEME_LABEL, T } from "@/lib/i18n";
import { WINDOW_DAYS, type Insights } from "@/lib/insights";
import { ZONES } from "@/lib/kb/places";
import { SOURCE_BY_ID } from "@/lib/kb/sources";
import { describeFilters, followUps, formatHkt, pct, type Filters } from "@/lib/report";
import type { Feedback, Lang, PlanStatus } from "@/lib/types";
import { ReportChrome } from "./report-chrome";

const SENT_COLOR: Record<Feedback["sentiment"], string> = {
  support: "var(--color-wetland)",
  mixed: "var(--color-ochre)",
  concern: "var(--color-vermilion)",
  neutral: "var(--color-muted)",
};

const CHIP: Record<PlanStatus, string> = {
  completed: "border-wetland bg-wetland text-card",
  under_construction: "border-ochre bg-ochre-soft",
  planned: "border-ink bg-card",
  proposed: "border-dashed border-vermilion text-vermilion",
  under_review: "border-dashed border-ochre text-ochre",
  superseded: "border-muted bg-paper-deep text-muted line-through",
};

export function ConsultationReport({
  filters,
  rows,
  ins,
  generatedAt,
  lang,
}: {
  filters: Filters;
  rows: Feedback[];
  ins: Insights;
  generatedAt: string;
  lang: Lang;
}) {
  const zh = lang === "zh";
  const L = <K extends keyof typeof T>(k: K) => T[k][lang];
  const live = rows.filter((r) => !r.synthetic).length;
  const synthetic = rows.length - live;
  const actions = followUps(ins, lang);
  const date = formatHkt(generatedAt);
  const top = ins.themes[0]?.score || 1;

  return (
    <div className="report-doc pb-20">
      <ReportChrome kind="consultation" filters={filters} count={rows.length} lang={lang} />
      <article lang={zh ? "zh-HK" : "en"} className="mx-auto max-w-[900px] px-5 py-10 md:px-8">
        {rows.length === 0 ? (
          <p className="border border-dashed border-ink p-10 text-center text-sm text-muted">{L("exportEmpty")}</p>
        ) : (
          <>
            <header className="border-b border-ink pb-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-wetland">
                NorthLens · {zh ? "古洞北新發展區" : "Kwu Tung North NDA"}
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.95]">
                {zh ? "社區意見諮詢報告" : "Community consultation report"}
              </h1>
              <p className="mt-4 max-w-[40rem] text-sm leading-relaxed text-ink-soft">
                {zh
                  ? "根據已由人工確認分類的居民意見整理，供規劃部門及社區組織使用。此文件不是城市規劃委員會申述，亦不代表全體居民。"
                  : "A briefing of resident feedback whose categories a person has confirmed. For planning teams and community organisations. This is not a Town Planning Board representation, and it does not speak for all residents."}
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
                  <dd className="mt-0.5 text-ink">
                    {ins.total}
                    {synthetic > 0 && (zh ? `（${synthetic} 份示範數據）` : ` (${synthetic} demo)`)}
                  </dd>
                </div>
                <div>
                  <dt>{zh ? "方法" : "Method"}</dt>
                  <dd className="mt-0.5 normal-case tracking-normal text-ink">
                    {zh
                      ? "只計覆核隊列中已確認的回應。比例為簡單計數。"
                      : "Only review-queue confirmed responses. Shares are simple counts."}
                  </dd>
                </div>
              </dl>
            </header>

            <dl className="mt-0 grid grid-cols-2 gap-px border-x border-b border-ink bg-rule sm:grid-cols-4">
              <Stat value={String(ins.total)} label={zh ? "已確認回應" : "Confirmed"} sub={zh ? `${live} 份實時` : `${live} live`} />
              <Stat value={pct(ins.concernRate)} label={zh ? "表達關注" : "Express concern"} accent />
              <Stat
                value={pct(ins.vulnerableShare)}
                label={zh ? "弱勢群組" : "Vulnerable groups"}
                sub={zh ? "長者、照顧者、家庭" : "elderly, carers, families"}
              />
              <Stat value={String(ins.voice)} label={zh ? "語音提交" : "Voice"} />
            </dl>

            {ins.emerging && (
              <section className="mt-10 break-inside-avoid">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-vermilion">{L("emerging")}</h2>
                <p className="mt-2 font-display text-2xl leading-snug">
                  {zh ? (
                    <>
                      <em className="text-vermilion">{THEME_LABEL[ins.emerging.theme].zh}</em>是
                      {STAKEHOLDER_LABEL[ins.emerging.stakeholder].zh}最常提出的關注：{ins.emerging.count}{" "}
                      份已確認回應表達擔憂，其中 {ins.emerging.recent} 份來自最近 {WINDOW_DAYS} 日。
                    </>
                  ) : (
                    <>
                      <em className="text-vermilion">{THEME_LABEL[ins.emerging.theme].en}</em> is the most frequent worry among{" "}
                      {STAKEHOLDER_LABEL[ins.emerging.stakeholder].en.toLowerCase()} respondents — {ins.emerging.count} confirmed
                      responses express concern, {ins.emerging.recent} of them in the last {WINDOW_DAYS} days.
                    </>
                  )}
                </p>
              </section>
            )}

            <section className="mt-10">
              <h2 className="font-display text-3xl">{zh ? "優先議題" : "Priority issues"}</h2>
              <p className="mt-2 max-w-[40rem] text-sm text-ink-soft">
                {zh
                  ? "優先指數 = 表達關注的回應數 × (1 + ½ × 弱勢群組比例) × 趨勢系數（最近 14 日與之前 14 日比較）。「仍可影響」表示相關規劃項目仍屬建議或檢討中。"
                  : "Priority = concerned responses × (1 + ½ × vulnerable-group share) × trend factor (last 14 days vs the 14 before). “Open to change” means related plan items are still proposed or under review."}
              </p>
              <div className="mt-4 overflow-x-auto border border-ink">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-paper-deep/60 text-left font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                    <tr>
                      <th className="px-3 py-2 font-normal">#</th>
                      <th className="px-3 py-2 font-normal">{zh ? "議題" : "Issue"}</th>
                      <th className="px-3 py-2 text-right font-normal">{zh ? "回應" : "n"}</th>
                      <th className="px-3 py-2 font-normal">{zh ? "取態" : "Sentiment"}</th>
                      <th className="px-3 py-2 text-right font-normal">{zh ? "關注" : "Concern"}</th>
                      <th className="px-3 py-2 text-right font-normal">{zh ? "弱勢" : "Vuln."}</th>
                      <th className="px-3 py-2 font-normal">{zh ? "規劃" : "Plan"}</th>
                      <th className="px-3 py-2 text-right font-normal">{zh ? "優先" : "Pri."}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ins.themes.map((th, i) => (
                      <tr key={th.theme} className="border-t border-rule">
                        <td className="px-3 py-2 font-mono text-xs text-muted">{i + 1}</td>
                        <td className="px-3 py-2">{THEME_LABEL[th.theme][lang]}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                          {th.count} · {pct(th.share)}
                        </td>
                        <td className="px-3 py-2">
                          <span className="flex h-2.5 w-24 overflow-hidden bg-paper-deep">
                            {(["support", "neutral", "mixed", "concern"] as const).map((k) =>
                              th.sentiment[k] ? (
                                <span
                                  key={k}
                                  style={{ width: `${(th.sentiment[k] / th.count) * 100}%`, background: SENT_COLOR[k] }}
                                />
                              ) : null,
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{pct(th.concernRate)}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{pct(th.vulnerableShare)}</td>
                        <td className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider">
                          {th.plan.open
                            ? zh
                              ? `${th.plan.open} 項仍可影響`
                              : `${th.plan.open} open`
                            : th.plan.chunks.length
                              ? zh
                                ? "已規劃"
                                : "Committed"
                              : "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                          {Math.round((th.score / top) * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted">
                {zh ? "綠＝支持 · 灰＝中性 · 黃＝混合 · 紅＝關注" : "green = support · grey = neutral · ochre = mixed · red = concern"}
              </p>
            </section>

            {ins.themes.map((th) => (
              <section key={th.theme} className="mt-10 break-inside-avoid border-t border-rule pt-8">
                <h2 className="font-display text-2xl">{THEME_LABEL[th.theme][lang]}</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {zh
                    ? `${th.count} 份已確認回應，其中 ${th.worried} 份（${pct(th.concernRate)}）表達關注。`
                    : `${th.count} confirmed responses, ${th.worried} (${pct(th.concernRate)}) expressing concern.`}
                </p>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {zh ? "居民提出的改善" : "What residents asked for"}
                    </h3>
                    {th.issues.length ? (
                      <ol className="mt-2 space-y-1.5 text-sm">
                        {th.issues.map((x) => (
                          <li key={x.text} className="flex gap-2">
                            <span className="w-6 shrink-0 font-mono text-xs text-vermilion tabular-nums">{x.count}×</span>
                            {x.text}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-2 text-sm text-muted">{zh ? "暫無關注意見" : "No concerns raised"}</p>
                    )}
                    <p className="mt-4 text-sm">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{zh ? "誰 · 何處" : "Who · where"} </span>
                      {th.stakeholders
                        .map((s) => `${STAKEHOLDER_LABEL[s.stakeholder][lang]} ${s.count}`)
                        .join(" · ")}
                      {" · "}
                      {th.zones.map((z) => `${ZONES[z.zone][lang]} ${z.count}`).join(" · ")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {zh ? "相關規劃項目" : "Related plan items"}
                    </h3>
                    {th.plan.chunks.length ? (
                      <ul className="mt-2 space-y-2 text-sm">
                        {th.plan.chunks.map((c) => {
                          const src = SOURCE_BY_ID.get(c.sourceId);
                          return (
                            <li key={c.id}>
                              <span
                                className={`mr-1.5 inline-flex border px-1.5 py-px font-mono text-[10px] uppercase tracking-wider ${CHIP[c.status]}`}
                              >
                                {STATUS_LABEL[c.status][lang]}
                              </span>
                              {zh ? c.headingZh : c.heading}
                              {src && (
                                <a href={src.url} className="ml-1 font-mono text-[10px] text-muted underline">
                                  {src.publisher}
                                </a>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted">{zh ? "沒有直接相關的規劃項目" : "No directly related plan items"}</p>
                    )}
                  </div>
                </div>
                {th.quotes.length > 0 && (
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {th.quotes.map((f) => (
                      <blockquote key={f.id} className="border border-rule bg-paper/50 p-3">
                        <p className="font-display text-base leading-snug">“{f.text}”</p>
                        <footer className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                          {STAKEHOLDER_LABEL[f.stakeholder][lang]} · {ZONES[f.zone][lang]}
                          {f.synthetic && (zh ? " · 示範" : " · demo")}
                        </footer>
                      </blockquote>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <section className="mt-10 grid gap-8 border-t border-rule pt-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl">{zh ? "誰在回應" : "Who is responding"}</h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {ins.byStakeholder.map((s) => (
                    <li key={s.stakeholder} className="flex justify-between gap-4 border-b border-rule py-1">
                      <span>{STAKEHOLDER_LABEL[s.stakeholder][lang]}</span>
                      <span className="font-mono text-xs tabular-nums">
                        {s.count} · {pct(s.share)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-2xl">{zh ? "地區" : "Where"}</h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {ins.byZone.map((z) => (
                    <li key={z.zone} className="flex justify-between gap-4 border-b border-rule py-1">
                      <span>
                        {ZONES[z.zone][lang]}
                        <span className="ml-2 text-muted">{THEME_LABEL[z.topTheme][lang]}</span>
                      </span>
                      <span className="font-mono text-xs tabular-nums">{z.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {actions.length > 0 && (
              <section className="mt-10 break-inside-avoid border-t border-rule pt-8">
                <h2 className="font-display text-2xl">{zh ? "可跟進事項" : "Things to check"}</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  {zh
                    ? "由已確認數字及仍屬建議／檢討中的規劃項目直接寫出，未經 AI 改寫。"
                    : "Taken directly from confirmed counts and plan items that are still proposed or under review. Not drafted by AI."}
                </p>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
                  {actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
              </section>
            )}

            <footer className="mt-12 border-t border-ink pt-6 text-xs leading-relaxed text-muted">
              <p>{L("methodology")}</p>
              <p className="mt-2">{L("exportNote")}</p>
              <p className="mt-2">{L("guardrails")}</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-wider">
                {zh
                  ? `NorthLens 諮詢報告 · ${date} · ${ins.total} 份已確認回應`
                  : `NorthLens consultation report · ${date} · ${ins.total} confirmed responses`}
              </p>
            </footer>
          </>
        )}
      </article>
    </div>
  );
}

function Stat({ value, label, sub, accent }: { value: string; label: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-card px-4 py-4">
      <dt className={`font-display text-3xl leading-none ${accent ? "text-vermilion" : ""}`}>{value}</dt>
      <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dd>
      {sub && <dd className="mt-0.5 text-[11px] text-ink-soft">{sub}</dd>}
    </div>
  );
}
