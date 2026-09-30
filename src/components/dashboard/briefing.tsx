"use client";

import { useState } from "react";
import { THEME_LABEL } from "@/lib/i18n";
import type { Filters } from "@/lib/insights";
import type { FeedbackTheme, Lang } from "@/lib/types";
import { useLang } from "../lang";
import { Panel } from "./ui";

interface Brief {
  headline: string | null;
  findings: { theme: FeedbackTheme; text: string }[];
  followUps: string[];
  dropped: number;
  basedOn: number;
  synthetic: number;
  model: string;
  generatedAt: string;
  key: string;
}

export function Briefing({
  filters,
  onSelectTheme,
  enabled,
}: {
  filters: Filters;
  onSelectTheme: (t: FeedbackTheme) => void;
  enabled: boolean;
}) {
  const { pick, lang } = useLang();
  const zh = lang === "zh";
  const [brief, setBrief] = useState<Brief | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify({ filters, lang });
  const stale = brief && brief.key !== key;

  async function generate(l: Lang) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/insights/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filters, lang: l }),
      });
      const body = await res.json();
      if (res.status === 422) throw new Error(zh ? "篩選後回應太少（最少 5 份）。" : "Too few responses for a briefing (need at least 5).");
      if (!res.ok) throw new Error(zh ? "未能生成簡報，請再試。" : "Couldn't generate a briefing. Try again.");
      setBrief({ ...body, key });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title={zh ? "AI 簡報草稿" : "AI briefing draft"}
      aside={
        <button
          type="button"
          disabled={busy || !enabled}
          onClick={() => generate(lang)}
          className="border border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-card disabled:opacity-40"
        >
          {busy ? (zh ? "生成中…" : "Drafting…") : brief ? (zh ? "重新生成" : "Regenerate") : zh ? "生成簡報" : "Draft briefing"}
        </button>
      }
    >
      <div className="p-5">
        {!brief && !error && (
          <p className="text-sm text-ink-soft">
            {!enabled
              ? zh
                ? "需要伺服器設定 Gemini 才可生成簡報。以上統計不受影響。"
                : "Needs the Gemini key on the server. All statistics above work without it."
              : zh
                ? "按目前篩選，由 AI 把上面的統計整理成三點重點及跟進事項。數字只會取自已計算的統計。"
                : "Summarises the statistics above, for the current filters, into up to three findings and follow-ups. Numbers are taken only from the computed statistics."}
          </p>
        )}
        {error && <p className="text-sm text-vermilion">{error}</p>}

        {brief && (
          <div className={stale ? "opacity-50" : ""}>
            {stale && (
              <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-vermilion">
                {zh ? "篩選已更改 — 請重新生成" : "Filters changed — regenerate"}
              </p>
            )}
            {brief.headline && <p className="font-display text-xl leading-snug">{brief.headline}</p>}
            <ol className="mt-4 space-y-3">
              {brief.findings.map((f, i) => (
                <li key={i} className="grid grid-cols-[20px_1fr] gap-2 text-sm">
                  <span className="font-mono text-xs text-vermilion">{i + 1}</span>
                  <span>
                    <button
                      type="button"
                      onClick={() => onSelectTheme(f.theme)}
                      className="mr-1.5 border border-ink px-1 font-mono text-[10px] uppercase tracking-wider hover:bg-ink hover:text-card"
                    >
                      {pick(THEME_LABEL[f.theme])}
                    </button>
                    {f.text}
                  </span>
                </li>
              ))}
            </ol>
            {brief.followUps.length > 0 && (
              <>
                <h3 className="mt-5 mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {zh ? "建議跟進" : "Suggested follow-ups"}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {brief.followUps.map((q, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted">□</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-5 border-t border-rule pt-3 font-mono text-[10px] leading-relaxed text-muted">
              {zh
                ? `AI 草稿 · ${brief.model} · 根據 ${brief.basedOn} 份回應（${brief.synthetic} 份為示範數據）· 數字已與統計核對${brief.dropped ? `，移除 ${brief.dropped} 項未能核實的內容` : ""} · 使用前請人工核實`
                : `AI draft · ${brief.model} · based on ${brief.basedOn} responses (${brief.synthetic} synthetic) · numbers checked against the statistics${brief.dropped ? `, ${brief.dropped} unverifiable statement${brief.dropped > 1 ? "s" : ""} removed` : ""} · verify before use`}
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
