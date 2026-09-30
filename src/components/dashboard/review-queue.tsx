"use client";

import { useState } from "react";
import { SENTIMENT_LABEL, STAKEHOLDER_LABEL, THEME_LABEL } from "@/lib/i18n";
import { ZONES } from "@/lib/kb/places";
import type { Feedback, FeedbackTheme } from "@/lib/types";
import { useLang } from "../lang";
import { Panel, Segmented, SentimentDot } from "./ui";

const PAGE = 12;

export function ReviewQueue({
  rows,
  onReview,
}: {
  rows: Feedback[];
  onReview: (id: string, theme?: FeedbackTheme) => void;
}) {
  const { t, pick, lang } = useLang();
  const zh = lang === "zh";
  const [view, setView] = useState<"pending" | "all">("pending");
  const [limit, setLimit] = useState(PAGE);
  const pending = rows.filter((r) => !r.reviewed);
  const list = (view === "pending" ? pending : rows).slice(0, limit);
  const total = view === "pending" ? pending.length : rows.length;

  return (
    <Panel
      title={t("recent")}
      aside={
        <span className="flex flex-wrap items-center gap-3">
          <span>{t("reviewNote")}</span>
          <Segmented
            label="Review view"
            value={view}
            onChange={(v) => {
              setView(v);
              setLimit(PAGE);
            }}
            options={[
              ["pending", zh ? `待覆核 (${pending.length})` : `Needs review (${pending.length})`],
              ["all", zh ? `全部 (${rows.length})` : `All (${rows.length})`],
            ]}
          />
        </span>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-paper-deep/60 text-left font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            <tr>
              <th className="px-4 py-2 font-normal">{zh ? "原文" : "Original text"}</th>
              <th className="px-3 py-2 font-normal">{t("theme")}</th>
              <th className="px-3 py-2 font-normal">{t("stakeholder")}</th>
              <th className="px-3 py-2 font-normal">{t("zone")}</th>
              <th className="px-3 py-2 font-normal">{t("sentiment")}</th>
              <th className="px-3 py-2 font-normal">{t("suggestedIssue")}</th>
              <th className="px-4 py-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className={`border-t border-rule align-top ${!f.synthetic ? "bg-vermilion-soft/40" : ""}`}>
                <td className="max-w-[340px] px-4 py-3">
                  {!f.synthetic && (
                    <span className="mr-2 bg-vermilion px-1.5 py-px font-mono text-[9px] text-card">{t("new")}</span>
                  )}
                  {f.text || <span className="text-muted">({f.priorities.join(", ")})</span>}
                  <div className="mt-1 font-mono text-[10px] text-muted">
                    {new Date(f.createdAt).toLocaleString(zh ? "zh-HK" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    {" · "}
                    {f.classifiedBy}
                    {f.inputMode === "voice" && (zh ? " · 語音" : " · voice")}
                    {f.piiRedacted && (zh ? " · 已移除個人資料" : " · PII redacted")}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <select
                    value={f.theme}
                    onChange={(e) => onReview(f.id, e.target.value as FeedbackTheme)}
                    className="max-w-[160px] border border-rule bg-transparent px-1 py-0.5 text-xs"
                    aria-label={t("theme")}
                  >
                    {(Object.keys(THEME_LABEL) as FeedbackTheme[]).map((k) => (
                      <option key={k} value={k}>
                        {pick(THEME_LABEL[k])}
                      </option>
                    ))}
                  </select>
                  {f.aiTheme && f.aiTheme !== f.theme && (
                    <div className="mt-1 text-[10px] text-muted line-through">AI: {pick(THEME_LABEL[f.aiTheme])}</div>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">{pick(STAKEHOLDER_LABEL[f.stakeholder])}</td>
                <td className="px-3 py-3 text-xs">{pick(ZONES[f.zone])}</td>
                <td className="whitespace-nowrap px-3 py-3 text-xs">
                  <SentimentDot s={f.sentiment} /> {pick(SENTIMENT_LABEL[f.sentiment])}
                </td>
                <td className="px-3 py-3 text-xs text-ink-soft">{f.suggestedIssue}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {f.reviewed ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-wetland">✓ {t("reviewed")}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onReview(f.id)}
                      className="border border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider hover:bg-ink hover:text-card"
                    >
                      {t("confirm")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                  {zh ? "沒有待覆核的回應" : "Nothing waiting for review"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {total > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE)}
          className="w-full border-t border-rule py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted hover:bg-paper-deep/50 hover:text-ink"
        >
          {zh ? `顯示更多（餘下 ${total - limit} 份）` : `Show more (${total - limit} more)`}
        </button>
      )}
    </Panel>
  );
}
