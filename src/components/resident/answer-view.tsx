"use client";

import { useMemo } from "react";
import { SOURCE_BY_ID } from "@/lib/kb/sources";
import type { Answer, Claim } from "@/lib/types";
import { useLang } from "../lang";
import { CiteMark, StatusChip } from "../status-chip";

export function AnswerView({
  answer,
  question,
  hovered,
  onHoverChunk,
}: {
  answer: Answer;
  question: string;
  hovered: string | null;
  onHoverChunk: (id: string | null) => void;
}) {
  const { t, lang } = useLang();

  const numbering = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of [...answer.whatMayChange, ...answer.whyItMatters, ...answer.uncertain]) {
      for (const id of c.citations) if (!m.has(id)) m.set(id, m.size + 1);
    }
    return m;
  }, [answer]);

  const evidence = [...numbering.keys()].map((id) => answer.chunks.find((c) => c.id === id)!).filter(Boolean);

  const section = (title: string, claims: Claim[], accent: string) =>
    claims.length > 0 && (
      <div className="border-t border-rule pt-4">
        <h4 className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${accent}`}>{title}</h4>
        <ul className="space-y-3">
          {claims.map((c, i) => (
            <li key={i} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
              <StatusChip status={c.status} className="mt-0.5 sm:w-[150px] sm:justify-center" />
              <p className="text-[15px] leading-relaxed">
                {c.text}
                {c.citations.map((id) => (
                  <CiteMark
                    key={id}
                    n={numbering.get(id)!}
                    active={hovered === id}
                    onHover={(on) => onHoverChunk(on ? id : null)}
                  />
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <article className="animate-rise border border-ink bg-card shadow-[6px_6px_0_var(--color-ink)]">
      <header className="border-b border-ink bg-ink px-5 py-4 text-card">
        <p className="font-display text-xl italic leading-snug">“{question}”</p>
      </header>

      <div className="space-y-5 px-5 py-5">
        {answer.insufficientEvidence && (
          <p className="border-l-4 border-ochre bg-ochre-soft px-3 py-2 text-sm">{t("insufficient")}</p>
        )}
        {answer.summary && <p className="font-display text-2xl leading-snug">{answer.summary}</p>}

        {section(t("whatMayChange"), answer.whatMayChange, "text-ink")}
        {section(t("whyItMatters"), answer.whyItMatters, "text-wetland")}
        {section(t("uncertain"), answer.uncertain, "text-vermilion")}

        {evidence.length > 0 && (
          <details className="group border-t border-rule pt-4" open>
            <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              <span className="transition-transform group-open:rotate-90">▸</span>
              {t("evidence")} · {evidence.length}
            </summary>
            <ol className="mt-3 space-y-2">
              {evidence.map((c) => {
                const src = SOURCE_BY_ID.get(c.sourceId)!;
                const on = hovered === c.id;
                return (
                  <li
                    key={c.id}
                    onMouseEnter={() => onHoverChunk(c.id)}
                    onMouseLeave={() => onHoverChunk(null)}
                    className={`grid grid-cols-[28px_1fr] gap-2 border p-2.5 text-sm transition-colors ${
                      on ? "border-vermilion bg-vermilion-soft/50" : "border-rule bg-paper/50"
                    }`}
                  >
                    <span className="font-mono text-xs text-vermilion">[{numbering.get(c.id)}]</span>
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <strong className="font-semibold">{lang === "zh" ? c.headingZh : c.heading}</strong>
                        <StatusChip status={c.status} />
                      </div>
                      <p className="text-ink-soft">{lang === "zh" ? c.textZh : c.text}</p>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-block font-mono text-[11px] text-ink underline decoration-vermilion underline-offset-2 hover:text-vermilion"
                      >
                        {src.publisher} — {src.title} ({src.date}) ↗
                      </a>
                    </div>
                  </li>
                );
              })}
            </ol>
          </details>
        )}

        <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-rule pt-3 font-mono text-[10px] uppercase tracking-wider text-muted">
          <span>
            {lang === "zh" ? "生成" : "generation"}: {answer.mode === "gemini" ? "Gemini" : lang === "zh" ? "離線" : "offline"}
          </span>
          <span>
            {lang === "zh" ? "檢索" : "retrieval"}: {answer.retrieval}
          </span>
          <span>
            {lang === "zh" ? "引用核查移除" : "citation check removed"}: {answer.droppedCitations}
          </span>
        </footer>
        {answer.mode === "offline" && <p className="text-xs text-muted">{t("offlineNote")}</p>}
      </div>
    </article>
  );
}
