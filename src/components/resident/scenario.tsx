"use client";

import { CHUNK_BY_ID } from "@/lib/kb/chunks";
import { SOURCE_BY_ID } from "@/lib/kb/sources";
import { SCENARIO } from "@/lib/scenario";
import { useLang } from "../lang";
import { StatusChip } from "../status-chip";

const GLYPH: Record<string, string> = {
  rail: "M3 14h14M5 4h10a2 2 0 0 1 2 2v6H3V6a2 2 0 0 1 2-2Zm1 12-2 3m10-3 2 3M7 8h6",
  health: "M8 3h4v5h5v4h-5v5H8v-5H3V8h5z",
  care: "M10 17s-6-3.6-6-8a3.5 3.5 0 0 1 6-2.4A3.5 3.5 0 0 1 16 9c0 4.4-6 8-6 8Z",
  school: "M2 8l8-4 8 4-8 4-8-4Zm3 2v4c3 2 7 2 10 0v-4",
  work: "M3 7h14v9H3zM7 7V4h6v3",
  leaf: "M4 16C4 8 9 4 17 4c0 8-4 13-12 13m0-1 7-7",
  border: "M10 2v16M4 6l-2 4 2 4m12-8 2 4-2 4",
};

export function ScenarioExplorer() {
  const { t, lang, pick } = useLang();
  return (
    <section className="border-y border-ink bg-card/60">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-16 md:px-8 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-wetland">
            {lang === "zh" ? "功能二" : "Feature 02"}
          </p>
          <h2 className="font-display text-5xl leading-none">{t("scenarioTitle")}</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">{t("scenarioBody")}</p>
        </div>

        <div data-tour="scenario" className="border border-ink bg-card">
          <div className="grid grid-cols-[140px_1fr] border-b border-ink bg-ink font-mono text-[10px] uppercase tracking-[0.2em] text-card sm:grid-cols-[180px_1fr]">
            <span className="px-4 py-2">{t("need")}</span>
            <span className="border-l border-card/30 px-4 py-2">{t("planned")}</span>
          </div>
          {SCENARIO.map((row, i) => (
            <div
              key={row.icon}
              className="grid grid-cols-[140px_1fr] border-b border-rule last:border-b-0 sm:grid-cols-[180px_1fr]"
            >
              <div className="flex items-start gap-3 px-4 py-4">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-vermilion" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={GLYPH[row.icon]} />
                </svg>
                <div>
                  <span className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-xl leading-tight">{pick(row.need)}</p>
                </div>
              </div>
              <ul className="space-y-2.5 border-l border-rule px-4 py-4">
                {row.chunkIds.map((id) => {
                  const c = CHUNK_BY_ID.get(id)!;
                  const s = SOURCE_BY_ID.get(c.sourceId)!;
                  return (
                    <li key={id} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-3">
                      <div>
                        <p className="text-sm font-semibold">{lang === "zh" ? c.headingZh : c.heading}</p>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[10px] text-muted underline decoration-rule underline-offset-2 hover:text-vermilion"
                        >
                          {s.publisher} ↗
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        {c.timeline && (
                          <span className="font-mono text-[10px] text-ink-soft">{c.timeline}</span>
                        )}
                        <StatusChip status={c.status} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
