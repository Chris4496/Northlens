"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STAKEHOLDER_LABEL, THEME_LABEL } from "@/lib/i18n";
import { applyFilters, computeInsights, DEFAULT_FILTERS, WINDOW_DAYS, type Filters } from "@/lib/insights";
import { ZONES } from "@/lib/kb/places";
import type { Feedback, FeedbackTheme, Stakeholder, ZoneId } from "@/lib/types";
import { DASHBOARD_TOUR } from "@/lib/tours";
import { useLang } from "../lang";
import { Tour } from "../tour";
import { Briefing } from "./briefing";
import { Heatmap } from "./heatmap";
import { PriorityTable } from "./priority-table";
import { ReviewQueue } from "./review-queue";
import { ThemeDetail } from "./theme-detail";
import { Kpi, pct, Segmented } from "./ui";

const HotspotMap = dynamic(() => import("../hotspot-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-deep" />,
});

interface Data {
  rows: Feedback[];
  store: "supabase" | "local";
}

async function fetchData(): Promise<Data> {
  const res = await fetch("/api/feedback", { cache: "no-store" });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export function Dashboard() {
  const { t, pick, lang } = useLang();
  const zh = lang === "zh";
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<FeedbackTheme | null>(null);
  const [mapScope, setMapScope] = useState<"all" | "theme">("all");
  const [gemini, setGemini] = useState(false);

  const load = useCallback(
    () =>
      fetchData().then(
        (d) => {
          setData(d);
          setError(null);
        },
        (e: Error) => setError(e.message),
      ),
    [],
  );

  useEffect(() => {
    load();
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => setGemini(Boolean(s.gemini)))
      .catch(() => {});
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  const rows = useMemo(() => (data ? applyFilters(data.rows, filters) : []), [data, filters]);
  const ins = useMemo(() => computeInsights(rows), [rows]);
  const current = ins.themes.find((x) => x.theme === selected) ?? ins.themes[0] ?? null;
  const mapZones = useMemo(
    () => (mapScope === "theme" && current ? computeInsights(rows.filter((r) => r.theme === current.theme)).byZone : ins.byZone),
    [mapScope, current, rows, ins.byZone],
  );

  async function review(id: string, theme?: FeedbackTheme) {
    await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(theme ? { theme } : {}),
    });
    load();
  }

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const filtered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  if (!data) {
    return (
      <div className="mx-auto max-w-[1400px] px-8 py-24 font-mono text-sm text-muted">
        {error ?? (zh ? "載入中…" : "Loading…")}
      </div>
    );
  }

  const stakeholders = Object.keys(STAKEHOLDER_LABEL) as Stakeholder[];
  const zones = Object.keys(ZONES) as ZoneId[];

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-12 pb-20 md:px-8">
      <header className="animate-rise border-b border-ink pb-6">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-wetland">{t("dashKicker")}</p>
        <h1 className="font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95]">{t("dashTitle")}</h1>
        <p className="mt-3 flex flex-wrap gap-x-4 font-mono text-[10px] uppercase tracking-wider text-muted">
          <span>{t("syntheticNote")}</span>
          <span>store: {data.store}</span>
        </p>
      </header>

      <div data-tour="filters" className="sticky top-[57px] z-40 -mx-5 mt-6 border-y border-ink bg-paper/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="Period"
            value={filters.period}
            onChange={(v) => set("period", v)}
            options={[
              ["all", zh ? "全部時間" : "All time"],
              ["28", zh ? "28 日" : "28 days"],
              ["14", zh ? "14 日" : "14 days"],
            ]}
          />
          <select
            value={filters.stakeholder}
            onChange={(e) => set("stakeholder", e.target.value as Filters["stakeholder"])}
            className="border border-ink bg-card px-2 py-1.5 text-xs"
            aria-label={t("stakeholder")}
          >
            <option value="all">{zh ? "所有群組" : "All groups"}</option>
            {stakeholders.map((s) => (
              <option key={s} value={s}>
                {pick(STAKEHOLDER_LABEL[s])}
              </option>
            ))}
          </select>
          <select
            value={filters.zone}
            onChange={(e) => set("zone", e.target.value as Filters["zone"])}
            className="border border-ink bg-card px-2 py-1.5 text-xs"
            aria-label={t("zone")}
          >
            <option value="all">{zh ? "所有地點" : "All areas"}</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {pick(ZONES[z])}
              </option>
            ))}
          </select>
          <Segmented
            label="Data"
            value={filters.source}
            onChange={(v) => set("source", v)}
            options={[
              ["all", zh ? "包括示範數據" : "Incl. demo data"],
              ["live", zh ? "只看實時" : "Live only"],
            ]}
          />
          <span className="ml-auto font-mono text-[11px] text-ink-soft">
            {zh ? `顯示 ${rows.length} / ${data.rows.length} 份回應` : `Showing ${rows.length} of ${data.rows.length} responses`}
            {filtered && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="ml-3 uppercase tracking-wider text-vermilion underline underline-offset-2"
              >
                {zh ? "重設" : "Reset"}
              </button>
            )}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 border border-dashed border-ink p-10 text-center text-sm text-muted">
          {zh ? "沒有符合篩選條件的回應。" : "No responses match these filters."}
        </p>
      ) : (
        <>
          <dl data-tour="kpis" className="mt-6 grid grid-cols-2 gap-px border border-ink bg-rule sm:grid-cols-3 lg:grid-cols-6">
            <Kpi value={String(ins.total)} label={t("responses")} sub={zh ? `${ins.live} 份實時提交` : `${ins.live} live`} />
            <Kpi value={pct(ins.concernRate)} label={zh ? "表達關注" : "Express concern"} sub={zh ? "關注或有保留" : "concern or mixed"} accent />
            <Kpi
              value={pct(ins.vulnerableShare)}
              label={zh ? "來自弱勢群組" : "From vulnerable groups"}
              sub={zh ? "長者、照顧者、家庭" : "elderly, carers, families"}
            />
            <Kpi
              value={pct(ins.reviewedShare)}
              label={zh ? "已人工覆核" : "Human-reviewed"}
              sub={zh ? `${ins.reviewed} 份` : `${ins.reviewed} responses`}
            />
            <Kpi
              value={ins.agreement === null ? "—" : pct(ins.agreement)}
              label={zh ? "AI 分類準確度" : "AI–reviewer agreement"}
              sub={zh ? `${ins.corrected} 份經人工修正` : `${ins.corrected} corrected by a person`}
            />
            <Kpi
              value={String(ins.voice)}
              label={zh ? "語音提交" : "Voice submissions"}
              sub={ins.total ? (zh ? `佔 ${pct(ins.voice / ins.total)}` : `${pct(ins.voice / ins.total)} of total`) : undefined}
            />
          </dl>

          {ins.emerging && (
            <section className="mt-6 animate-rise border border-ink bg-ink px-6 py-5 text-card shadow-[6px_6px_0_var(--color-vermilion)]">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-vermilion">{t("emerging")}</p>
              <p className="font-display text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight">
                {zh ? (
                  <>
                    <em className="text-ochre-soft">{pick(THEME_LABEL[ins.emerging.theme])}</em>是
                    <em className="text-ochre-soft">{pick(STAKEHOLDER_LABEL[ins.emerging.stakeholder])}</em>
                    最常提出的關注：{ins.emerging.count} 份回應表達擔憂，其中 {ins.emerging.recent} 份來自最近 {WINDOW_DAYS} 日。
                  </>
                ) : (
                  <>
                    <em className="text-ochre-soft">{pick(THEME_LABEL[ins.emerging.theme])}</em> is the most frequent worry among{" "}
                    <em className="text-ochre-soft">{pick(STAKEHOLDER_LABEL[ins.emerging.stakeholder]).toLowerCase()}</em>{" "}
                    respondents — {ins.emerging.count} responses express concern, {ins.emerging.recent} of them in the last{" "}
                    {WINDOW_DAYS} days.
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelected(ins.emerging!.theme);
                  document.getElementById("issue-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-3 font-mono text-[10px] uppercase tracking-wider text-card/60 underline underline-offset-2 hover:text-card"
              >
                {zh ? "查看證據 ↓" : "See the evidence ↓"}
              </button>
            </section>
          )}

          <div data-tour="priorities" className="mt-8">
            <PriorityTable themes={ins.themes} selected={current?.theme ?? null} onSelect={setSelected} />
          </div>

          {current && (
            <div id="issue-detail" data-tour="detail" className="mt-8 grid scroll-mt-32 gap-8 lg:grid-cols-[1.55fr_1fr]">
              <ThemeDetail key={current.theme} th={current} />
              <section className="flex min-h-[460px] flex-col border border-ink bg-card">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink px-4 py-2.5">
                  <h2 className="font-display text-2xl">{t("hotspots")}</h2>
                  <Segmented
                    label="Map scope"
                    value={mapScope}
                    onChange={setMapScope}
                    options={[
                      ["all", zh ? "所有議題" : "All issues"],
                      ["theme", zh ? "此議題" : "This issue"],
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <HotspotMap zones={mapZones} lang={lang} />
                </div>
                <p className="flex items-center gap-2 border-t border-rule px-4 py-2 font-mono text-[10px] text-muted">
                  <span className="h-2 w-8 bg-gradient-to-r from-wetland to-vermilion" />
                  {zh ? "圓圈大小＝回應數；顏色＝關注比例" : "size = responses · colour = share expressing concern"}
                </p>
              </section>
            </div>
          )}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <Heatmap
              matrix={ins.matrix}
              selected={current?.theme ?? null}
              onPick={(theme, stakeholder) => {
                set("stakeholder", stakeholder);
                setSelected(theme);
              }}
            />
            <div data-tour="briefing">
              <Briefing filters={filters} enabled={gemini} onSelectTheme={setSelected} />
            </div>
          </div>
        </>
      )}

      <div data-tour="review" className="mt-8">
        <ReviewQueue rows={rows} onReview={review} />
      </div>
      <p className="mt-6 text-xs text-muted">{t("methodology")}</p>
      <Tour id="dashboard" steps={DASHBOARD_TOUR} />
    </div>
  );
}
