"use client";

import { SENTIMENT_LABEL, THEME_LABEL } from "@/lib/i18n";
import type { ThemeInsight } from "@/lib/insights";
import type { FeedbackTheme } from "@/lib/types";
import { useLang } from "../lang";
import { Momentum, Panel, pct, SentimentBar, SentimentLegend, Sparkline } from "./ui";

export function PriorityTable({
  themes,
  selected,
  onSelect,
}: {
  themes: ThemeInsight[];
  selected: FeedbackTheme | null;
  onSelect: (t: FeedbackTheme) => void;
}) {
  const { pick, lang } = useLang();
  const zh = lang === "zh";
  const top = themes[0]?.score || 1;
  const sentimentLabels = {
    support: pick(SENTIMENT_LABEL.support),
    neutral: pick(SENTIMENT_LABEL.neutral),
    mixed: pick(SENTIMENT_LABEL.mixed),
    concern: pick(SENTIMENT_LABEL.concern),
  };

  return (
    <Panel
      title={zh ? "優先議題" : "Priority issues"}
      aside={zh ? "點選議題查看詳情" : "Select an issue to see the evidence"}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-paper-deep/60 text-left font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            <tr>
              <th className="w-8 px-4 py-2 font-normal">#</th>
              <th className="px-3 py-2 font-normal">{zh ? "議題" : "Issue"}</th>
              <th className="px-3 py-2 text-right font-normal">{zh ? "回應" : "Responses"}</th>
              <th className="w-[150px] px-3 py-2 font-normal">{zh ? "取態" : "Sentiment"}</th>
              <th className="px-3 py-2 text-right font-normal">{zh ? "關注率" : "Concern"}</th>
              <th className="px-3 py-2 font-normal">{zh ? "6 週趨勢 · 14 日變化" : "6-wk trend · 14-day change"}</th>
              <th className="px-3 py-2 text-right font-normal">{zh ? "弱勢群組" : "Vulnerable"}</th>
              <th className="px-3 py-2 font-normal">{zh ? "規劃狀態" : "Plan status"}</th>
              <th className="w-[120px] px-4 py-2 font-normal">{zh ? "優先指數" : "Priority"}</th>
            </tr>
          </thead>
          <tbody>
            {themes.map((th, i) => {
              const on = th.theme === selected;
              return (
                <tr
                  key={th.theme}
                  onClick={() => onSelect(th.theme)}
                  className={`cursor-pointer border-t border-rule transition-colors ${
                    on ? "bg-ochre-soft/40" : "hover:bg-paper-deep/40"
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{i + 1}</td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      className={`text-left ${on ? "font-medium" : ""}`}
                      aria-pressed={on}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(th.theme);
                      }}
                    >
                      {on && <span className="mr-1 text-vermilion">▸</span>}
                      {pick(THEME_LABEL[th.theme])}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums">
                    {th.count} <span className="text-muted">· {pct(th.share)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <SentimentBar s={th.sentiment} total={th.count} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums">{pct(th.concernRate)}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-3 text-ink">
                      <Sparkline values={th.weekly} />
                      <Momentum m={th.momentum} recent={th.recent} zh={zh} />
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums">{pct(th.vulnerableShare)}</td>
                  <td className="px-3 py-2.5">
                    <PlanWindow open={th.plan.open} total={th.plan.chunks.length} zh={zh} />
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="relative h-2 flex-1 bg-paper-deep">
                        <span
                          className={`absolute inset-y-0 left-0 ${i === 0 ? "bg-vermilion" : "bg-ink"}`}
                          style={{ width: pct(th.score / top) }}
                        />
                      </span>
                      <span className="w-7 text-right font-mono text-[11px] tabular-nums">
                        {Math.round((th.score / top) * 100)}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 border-t border-rule px-5 py-3 text-xs text-muted">
        <SentimentLegend labels={sentimentLabels} />
        <p className="max-w-[640px]">
          {zh
            ? "優先指數 = 表達關注的回應數 × (1 + ½ × 弱勢群組比例) × 趨勢系數（0.75–1.25，按最近 14 日與之前 14 日比較），最高者定為 100。「仍可影響」表示相關規劃項目仍屬建議或檢討中。"
            : "Priority = concerned responses × (1 + ½ × vulnerable-group share) × trend factor (0.75–1.25, last 14 days vs the 14 before), scaled so the top issue is 100. “Open to change” means related plan items are still proposed or under review."}
        </p>
      </div>
    </Panel>
  );
}

function PlanWindow({ open, total, zh }: { open: number; total: number; zh: boolean }) {
  if (!total) return <span className="font-mono text-[11px] text-muted">—</span>;
  return open ? (
    <span className="inline-flex border border-dashed border-vermilion px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-vermilion">
      {zh ? `${open} 項仍可影響` : `${open} open to change`}
    </span>
  ) : (
    <span className="inline-flex border border-ink px-1.5 py-px font-mono text-[10px] uppercase tracking-wider">
      {zh ? "已規劃／進行中" : "Committed"}
    </span>
  );
}
