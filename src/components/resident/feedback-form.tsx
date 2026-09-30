"use client";

import Link from "next/link";
import { useState } from "react";
import { PRIORITIES, SENTIMENT_LABEL, STAKEHOLDER_LABEL, THEME_LABEL } from "@/lib/i18n";
import { ZONES } from "@/lib/kb/places";
import type { Feedback, PersonaId } from "@/lib/types";
import { useLang } from "../lang";
import { VoiceInput } from "./voice-input";

const DEMO = {
  en: "I support the new station, but getting from the housing estate to the station may still be difficult for my mother.",
  zh: "我支持新車站，但由屋苑去車站對我媽媽來說可能仍然困難。",
};

export function FeedbackForm({ persona }: { persona: PersonaId }) {
  const { t, lang, pick } = useLang();
  const [priorities, setPriorities] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setPriorities((ps) => (ps.includes(id) ? ps.filter((p) => p !== id) : [...ps, id]));

  const submitLang = /[\u3400-\u9fff]/.test(text) ? "zh" : text.trim() ? "en" : lang;

  function addTranscript(transcript: string) {
    setText((prev) => (prev.trim() ? `${prev.trimEnd()} ${transcript}` : transcript));
    setInputMode("voice");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, priorities, persona, lang: submitLang, inputMode }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
      setResult(await res.json());
      setText("");
      setInputMode("text");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="voice" className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 md:px-8 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-vermilion">
          {lang === "zh" ? "功能四" : "Feature 04"}
        </p>
        <h2 className="font-display text-5xl leading-none">{t("feedbackTitle")}</h2>
        <p className="mt-4 leading-relaxed text-ink-soft">{t("feedbackBody")}</p>
        <p className="mt-6 border-l-2 border-ink pl-3 text-sm text-muted">{t("guardrails")}</p>
      </div>

      <div>
        <form data-tour="voice" onSubmit={submit} className="border border-ink bg-card p-5">
          <h3 className="mb-3 font-display text-xl">{t("priorities")}</h3>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => {
              const on = priorities.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  className={`border px-2.5 py-1 text-sm transition-colors ${
                    on ? "border-wetland bg-wetland text-card" : "border-rule hover:border-ink"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {pick(p)}
                </button>
              );
            })}
          </div>

          <div className="mt-5 mb-2 flex items-baseline justify-between">
            <h3 className="font-display text-xl">{t("yourWords")}</h3>
            <button
              type="button"
              onClick={() => setText(DEMO[lang])}
              className="font-mono text-[10px] uppercase tracking-wider text-muted underline underline-offset-2 hover:text-ink"
            >
              {t("seedFeedback")}
            </button>
          </div>
          <VoiceInput onTranscript={addTranscript} />
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!e.target.value.trim()) setInputMode("text");
            }}
            rows={4}
            maxLength={2000}
            placeholder={t("feedbackPlaceholder")}
            className="w-full resize-y border border-ink bg-paper/40 px-3 py-2.5 text-[15px] outline-none placeholder:text-muted focus:shadow-[3px_3px_0_var(--color-ink)]"
          />
          <button
            type="submit"
            disabled={busy || (!text.trim() && priorities.length === 0)}
            className="mt-4 w-full bg-vermilion py-3 font-mono text-xs uppercase tracking-[0.2em] text-card transition-colors hover:bg-ink disabled:opacity-40"
          >
            {busy ? t("submitting") : t("submit")}
          </button>
          {error && <p className="mt-3 text-sm text-vermilion">{error}</p>}
        </form>

        {result && (
          <div className="mt-6 animate-rise border border-ink bg-ink p-5 text-card shadow-[6px_6px_0_var(--color-vermilion)]">
            <p className="font-display text-2xl">{t("thanks")}</p>
            {result.text && <p className="mt-2 text-sm italic text-card/70">“{result.text}”</p>}
            <dl className="mt-4 grid grid-cols-2 gap-px bg-card/20 font-mono text-xs sm:grid-cols-3">
              {[
                [t("zone"), pick(ZONES[result.zone])],
                [t("theme"), pick(THEME_LABEL[result.theme])],
                [t("stakeholder"), pick(STAKEHOLDER_LABEL[result.stakeholder])],
                [t("concern"), result.concern],
                [t("sentiment"), pick(SENTIMENT_LABEL[result.sentiment])],
                [t("suggestedIssue"), result.suggestedIssue],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-card/50">{k}</dt>
                  <dd className="mt-1 text-sm text-card">{v}</dd>
                </div>
              ))}
            </dl>
            {result.piiRedacted && <p className="mt-3 text-xs text-ochre-soft">{t("piiRemoved")}</p>}
            <p className="mt-3 text-xs text-card/60">
              {t("thanksNote")} · {result.classifiedBy === "gemini" ? "Gemini" : lang === "zh" ? "規則分類" : "rule-based"}
              {result.inputMode === "voice" && (lang === "zh" ? " · 語音輸入" : " · voice input")}
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block border border-card px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-card hover:text-ink"
            >
              {t("seeDashboard")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
