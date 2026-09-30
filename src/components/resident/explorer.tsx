"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CHUNK_BY_ID, CHUNKS } from "@/lib/kb/chunks";
import { SOURCES } from "@/lib/kb/sources";
import { CONCERNS, PERSONAS } from "@/lib/personas";
import { RESIDENT_TOUR } from "@/lib/tours";
import type { Answer, ConcernId, PersonaId } from "@/lib/types";
import { useLang } from "../lang";
import { KIND_COLOR, LEGEND } from "../map-style";
import { Tour } from "../tour";
import { AnswerView } from "./answer-view";
import { FeedbackForm } from "./feedback-form";
import { ScenarioExplorer } from "./scenario";

const PlanMap = dynamic(() => import("../plan-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-deep" />,
});

interface Turn {
  question: string;
  answer: Answer | null;
  error?: string;
}

export function Explorer() {
  const { t, pick, lang } = useLang();
  const [persona, setPersona] = useState<PersonaId>("caregiver");
  const [concern, setConcern] = useState<ConcernId>("accessibility");
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const loading = turns.at(-1)?.answer === null && !turns.at(-1)?.error;
  const threadEnd = useRef<HTMLDivElement>(null);

  const p = PERSONAS.find((x) => x.id === persona)!;
  const latest = [...turns].reverse().find((x) => x.answer)?.answer;
  const focus = hovered ? CHUNK_BY_ID.get(hovered)?.placeIds : undefined;

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length]);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    setQuestion("");
    setTurns((ts) => [...ts, { question: text, answer: null }]);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, persona, concern, lang }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
      const answer: Answer = await res.json();
      setTurns((ts) => ts.map((x, i) => (i === ts.length - 1 ? { ...x, answer } : x)));
    } catch (e) {
      setTurns((ts) => ts.map((x, i) => (i === ts.length - 1 ? { ...x, error: (e as Error).message } : x)));
    }
  }

  return (
    <>
      <section className="mx-auto grid max-w-[1400px] gap-8 px-5 pt-12 pb-10 md:px-8 lg:grid-cols-[1.25fr_1fr] lg:pt-16">
        <div className="animate-rise">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-vermilion">{t("heroKicker")}</p>
          <h1 className="font-display text-[clamp(2.8rem,6.5vw,5.6rem)] leading-[0.95]">{t("heroTitle")}</h1>
        </div>
        <div className="animate-rise self-end [animation-delay:120ms]">
          <p className="text-lg leading-relaxed text-ink-soft">{t("heroBody")}</p>
          <dl className="mt-6 grid grid-cols-3 border-y border-ink font-mono text-[11px] uppercase tracking-wider">
            {[
              [String(SOURCES.length), lang === "zh" ? "官方來源" : "official sources"],
              [String(CHUNKS.length), lang === "zh" ? "已核實段落" : "verified passages"],
              ["100%", lang === "zh" ? "說法附引用" : "claims cited"],
            ].map(([n, l], i) => (
              <div key={l} className={`py-3 ${i ? "border-l border-rule pl-3" : ""}`}>
                <dt className="font-display text-3xl normal-case tracking-normal">{n}</dt>
                <dd className="text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="space-y-8">
          <div className="animate-rise border border-ink bg-card p-5 [animation-delay:200ms]">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-rule pb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{t("location")}</span>
              <span className="flex items-center gap-2 font-display text-2xl">
                <span className="inline-block h-2.5 w-2.5 animate-pulse-ring rounded-full bg-vermilion" />
                {lang === "zh" ? "古洞北新發展區" : "Kwu Tung North NDA"}
              </span>
            </div>

            <div data-tour="persona">
              <StepLabel n="01" label={t("step1")} />
              <div className="grid gap-2 sm:grid-cols-3">
                {PERSONAS.map((x) => {
                  const on = x.id === persona;
                  return (
                    <button
                      key={x.id}
                      onClick={() => setPersona(x.id)}
                      aria-pressed={on}
                      className={`border p-3 text-left transition-all ${
                        on ? "border-ink bg-ink text-card shadow-[3px_3px_0_var(--color-vermilion)]" : "border-rule hover:border-ink"
                      }`}
                    >
                      <span className="block font-semibold">{pick(x.label)}</span>
                      <span className={`mt-1 block text-xs leading-snug ${on ? "text-card/75" : "text-muted"}`}>
                        {pick(x.blurb)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <StepLabel n="02" label={t("step2")} className="mt-6" />
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setConcern(c.id)}
                    aria-pressed={c.id === concern}
                    className={`border px-3 py-1.5 text-sm transition-colors ${
                      c.id === concern ? "border-vermilion bg-vermilion text-card" : "border-rule hover:border-ink"
                    }`}
                  >
                    {pick(c.label)}
                  </button>
                ))}
              </div>
            </div>

            <div data-tour="ask">
              <StepLabel n="03" label={t("step3")} className="mt-6" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(question);
                }}
                className="flex border border-ink focus-within:shadow-[3px_3px_0_var(--color-ink)]"
              >
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                      e.preventDefault();
                      ask(question);
                    }
                  }}
                  rows={2}
                  placeholder={t("askPlaceholder")}
                  className="min-h-[64px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="border-l border-ink bg-ink px-5 font-mono text-xs uppercase tracking-widest text-card transition-colors hover:bg-vermilion disabled:opacity-40"
                >
                  {t("ask")}
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t("tryAsking")}</span>
                {pick(p.sampleQuestions).map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    disabled={loading}
                    className="border border-dashed border-ink/40 px-2 py-1 text-left text-xs text-ink-soft hover:border-ink hover:bg-paper disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8" aria-live="polite">
            {turns.map((turn, i) =>
              turn.answer ? (
                <AnswerView
                  key={i}
                  answer={turn.answer}
                  question={turn.question}
                  hovered={hovered}
                  onHoverChunk={setHovered}
                />
              ) : turn.error ? (
                <p key={i} className="border border-vermilion bg-vermilion-soft p-4 text-sm">
                  {turn.error}
                </p>
              ) : (
                <Thinking key={i} question={turn.question} label={t("asking")} />
              ),
            )}
            <div ref={threadEnd} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-[76px] lg:self-start">
          <div data-tour="map" className="border border-ink bg-card">
            <div className="flex items-baseline justify-between border-b border-ink px-4 py-2.5">
              <h2 className="font-display text-xl">{t("mapTitle")}</h2>
              <span className="font-mono text-[10px] text-muted">{t("mapNote")}</span>
            </div>
            <div className="h-[420px] lg:h-[calc(100vh-190px)]">
              <PlanMap highlight={latest?.placeIds ?? []} focus={focus} lang={lang} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-ink px-4 py-2 font-mono text-[10px] uppercase tracking-wider">
              {LEGEND.map((l) => (
                <span key={l.kind} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-ink" style={{ background: KIND_COLOR[l.kind] }} />
                  {pick(l)}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="w-5 border-t-2 border-dashed border-vermilion" />
                {lang === "zh" ? "北環綫（規劃中）" : "Northern Link (planned)"}
              </span>
            </div>
          </div>
        </aside>
      </section>

      <ScenarioExplorer />
      <FeedbackForm persona={persona} />
      <Tour id="resident" steps={RESIDENT_TOUR} />
    </>
  );
}

function StepLabel({ n, label, className = "" }: { n: string; label: string; className?: string }) {
  return (
    <h3 className={`mb-2.5 flex items-baseline gap-3 ${className}`}>
      <span className="font-mono text-xs text-vermilion">{n}</span>
      <span className="font-display text-xl">{label}</span>
    </h3>
  );
}

function Thinking({ question, label }: { question: string; label: string }) {
  return (
    <div className="border border-ink bg-card">
      <p className="border-b border-ink bg-ink px-5 py-4 font-display text-xl italic text-card">“{question}”</p>
      <div className="space-y-3 px-5 py-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{label}</p>
        {[92, 78, 85].map((w, i) => (
          <div key={i} className="h-3 animate-pulse bg-paper-deep" style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}
