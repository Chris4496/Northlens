"use client";

import { STAKEHOLDER_LABEL, THEME_LABEL } from "@/lib/i18n";
import type { ThemeInsight } from "@/lib/insights";
import { ZONES } from "@/lib/kb/places";
import { SOURCE_BY_ID } from "@/lib/kb/sources";
import { useLang } from "../lang";
import { StatusChip } from "../status-chip";
import { NewBadge, pct } from "./ui";

export function ThemeDetail({ th }: { th: ThemeInsight }) {
  const { pick, lang, t } = useLang();
  const zh = lang === "zh";
  const maxStake = th.stakeholders[0]?.count || 1;

  return (
    <section className="animate-rise border border-ink bg-card">
      <div className="border-b border-ink px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermilion">{zh ? "議題詳情" : "Issue detail"}</p>
        <h2 className="mt-1 font-display text-3xl">{pick(THEME_LABEL[th.theme])}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {zh
            ? `${th.count} 份回應，其中 ${th.worried} 份（${pct(th.concernRate)}）表達關注；最近 14 日 ${th.recent} 份，之前 14 日 ${th.prior} 份。`
            : `${th.count} responses, ${th.worried} (${pct(th.concernRate)}) expressing concern; ${th.recent} in the last 14 days vs ${th.prior} in the 14 before.`}
        </p>
      </div>

      <div className="grid gap-px bg-rule md:grid-cols-3">
        <div className="bg-card p-5">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">
            {zh ? "居民提出的改善" : "What residents are asking for"}
          </h3>
          {th.issues.length ? (
            <ol className="space-y-2 text-sm">
              {th.issues.map((x) => (
                <li key={x.text} className="flex gap-2">
                  <span className="w-5 shrink-0 font-mono text-xs text-vermilion tabular-nums">{x.count}×</span>
                  <span>{x.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">{zh ? "暫無關注意見" : "No concerns raised"}</p>
          )}
        </div>

        <div className="bg-card p-5">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">{zh ? "誰在關注" : "Who is raising it"}</h3>
          <ul className="space-y-1.5 text-xs">
            {th.stakeholders.map((s) => (
              <li key={s.stakeholder} className="grid grid-cols-[1fr_70px_22px] items-center gap-2">
                <span className="truncate">{pick(STAKEHOLDER_LABEL[s.stakeholder])}</span>
                <span className="h-2 bg-paper-deep">
                  <span className="block h-full bg-ink" style={{ width: pct(s.count / maxStake) }} />
                </span>
                <span className="text-right font-mono tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-5 mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">{zh ? "地點" : "Where"}</h3>
          <p className="text-xs leading-relaxed">
            {th.zones.map((z, i) => (
              <span key={z.zone}>
                {i > 0 && <span className="text-muted"> · </span>}
                {pick(ZONES[z.zone])} <span className="font-mono text-muted">{z.count}</span>
              </span>
            ))}
          </p>
        </div>

        <div className="bg-card p-5">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">
            {zh ? "相關規劃項目" : "Related plan items"}
          </h3>
          {th.plan.chunks.length ? (
            <ul className="space-y-2.5 text-sm">
              {th.plan.chunks.map((c) => {
                const src = SOURCE_BY_ID.get(c.sourceId);
                return (
                  <li key={c.id}>
                    <StatusChip status={c.status} className="mb-1" />
                    <p className="leading-snug">
                      {zh ? c.headingZh : c.heading}
                      {src && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1.5 font-mono text-[10px] text-muted underline underline-offset-2 hover:text-ink"
                        >
                          {src.publisher} ↗
                        </a>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted">{zh ? "沒有直接相關的規劃項目" : "No directly related plan items"}</p>
          )}
          {th.plan.open > 0 && (
            <p className="mt-3 border-l-2 border-vermilion pl-2 text-xs text-ink-soft">
              {zh
                ? "部分項目仍屬建議或檢討中，居民意見仍有機會影響設計。"
                : "Some items are still proposed or under review, so resident input can still shape them."}
            </p>
          )}
        </div>
      </div>

      {th.quotes.length > 0 && (
        <div className="grid gap-4 border-t border-ink p-5 md:grid-cols-3">
          {th.quotes.map((f) => (
            <blockquote key={f.id} className="relative border border-rule bg-paper/40 p-4">
              {!f.synthetic && <NewBadge label={t("new")} />}
              <p className="font-display text-lg leading-snug">“{f.text}”</p>
              <footer className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                {pick(STAKEHOLDER_LABEL[f.stakeholder])} · {pick(ZONES[f.zone])}
                {f.inputMode === "voice" && (zh ? " · 語音" : " · voice")}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </section>
  );
}
