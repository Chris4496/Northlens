"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLang } from "./lang";

type Text = { en: string; zh: string };

export interface TourStep {
  /** `data-tour` value of the element to spotlight; omit for a centred card. */
  target?: string;
  title: Text;
  body: Text;
  points?: Text[];
}

export const TOUR_EVENT = "northlens:tour";

const listeners = new Set<() => void>();
const storageKey = (id: string) => `northlens-tour-${id}-v1`;

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function markSeen(id: string) {
  localStorage.setItem(storageKey(id), "1");
  listeners.forEach((cb) => cb());
}

const UI = {
  next: { en: "Next", zh: "下一步" },
  back: { en: "Back", zh: "上一步" },
  skip: { en: "Skip tour", zh: "略過導覽" },
  start: { en: "Show me around", zh: "開始導覽" },
  done: { en: "Start exploring", zh: "開始使用" },
  replay: { en: "Replay any time from “Guide” in the header.", zh: "之後可按頁首「導覽」重溫。" },
};

const PAD = 8;
const CARD_W = 380;
const TOP_CHROME = 130;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function Tour({ id, steps }: { id: string; steps: TourStep[] }) {
  const { lang, setLang, pick } = useLang();
  const seen = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(storageKey(id)) === "1",
    () => true,
  );
  const [replay, setReplay] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardH, setCardH] = useState(0);
  const card = useRef<HTMLDivElement>(null);

  const open = !seen || replay;
  const current = steps[step];
  const last = step === steps.length - 1;

  const close = useCallback(() => {
    markSeen(id);
    setReplay(false);
    setStep(0);
    setRect(null);
  }, [id]);

  useEffect(() => {
    const onReplay = () => {
      setStep(0);
      setReplay(true);
    };
    window.addEventListener(TOUR_EVENT, onReplay);
    return () => window.removeEventListener(TOUR_EVENT, onReplay);
  }, []);

  // Bring the target into view, then keep the spotlight glued to it while the page scrolls or resizes.
  useEffect(() => {
    if (!open) return;
    const el = current?.target ? document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`) : null;
    if (el) {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const offset = r.height > vh - TOP_CHROME - 220 ? TOP_CHROME : Math.max(TOP_CHROME, (vh - r.height) / 2 - 60);
      window.scrollTo({ top: r.top + window.scrollY - offset, behavior: "smooth" });
    }
    let raf = 0;
    let prev = "";
    const tick = () => {
      const r = el?.getBoundingClientRect();
      const next = r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null;
      const key = JSON.stringify(next);
      if (key !== prev) {
        prev = key;
        setRect(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, current]);

  useLayoutEffect(() => {
    if (!open || !card.current) return;
    const ro = new ResizeObserver(([e]) => setCardH(e.target.getBoundingClientRect().height));
    ro.observe(card.current);
    return () => ro.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    card.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, steps.length - 1));
      else if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, steps.length]);

  if (!open || !current) return null;

  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const width = Math.min(CARD_W, vw - 32);

  // Spotlight clamped to the visible area below the sticky header.
  const spot = rect && {
    top: Math.max(rect.top - PAD, 64),
    left: Math.max(rect.left - PAD, 8),
    right: Math.min(rect.left + rect.width + PAD, vw - 8),
    bottom: Math.min(rect.top + rect.height + PAD, vh - 8),
  };

  let cardStyle: React.CSSProperties;
  if (!spot) {
    cardStyle = { width: Math.min(520, vw - 32) };
  } else {
    const h = cardH || 260;
    const below = vh - spot.bottom - 28;
    const above = spot.top - 76;
    const rightRoom = vw - spot.right - 16;
    const leftRoom = spot.left - 16;
    const besideTop = Math.min(Math.max(spot.top, 76), vh - h - 16);
    let top: number;
    let left = Math.min(Math.max(spot.left, 16), vw - width - 16);
    if (below >= h) top = spot.bottom + 12;
    else if (above >= h) top = spot.top - 12 - h;
    else if (rightRoom >= width) [left, top] = [spot.right + 12, besideTop];
    else if (leftRoom >= width) [left, top] = [spot.left - 12 - width, besideTop];
    else top = vh - h - 16;
    cardStyle = { top, left, width };
  }

  const welcome = step === 0 && !current.target;

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {spot ? (
        <div
          className="pointer-events-none fixed border-2 border-vermilion transition-all duration-300 ease-out"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.right - spot.left,
            height: Math.max(spot.bottom - spot.top, 0),
            boxShadow: "0 0 0 9999px rgba(19, 32, 58, 0.58)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-[2px]" />
      )}

      <div className={spot ? "contents" : "fixed inset-0 flex items-center justify-center p-4"}>
        <div
          ref={card}
          tabIndex={-1}
          className={`animate-rise border border-ink bg-card p-5 text-ink shadow-[6px_6px_0_var(--color-vermilion)] outline-none ${
            spot ? "fixed transition-[top,left] duration-300 ease-out" : "relative"
          }`}
          style={cardStyle}
        >
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            <span className="text-vermilion">
              {welcome ? "NorthLens 北覽" : `${step} / ${steps.length - 1}`}
            </span>
            <button type="button" onClick={close} className="underline underline-offset-2 hover:text-ink">
              {pick(UI.skip)}
            </button>
          </div>

          <h2 id="tour-title" className={`font-display leading-tight ${welcome ? "text-4xl" : "text-2xl"}`}>
            {pick(current.title)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pick(current.body)}</p>
          {current.points && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {current.points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-vermilion" />
                  <span>{pick(p)}</span>
                </li>
              ))}
            </ul>
          )}

          {welcome && (
            <div className="mt-4 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Language · 語言</span>
              <div className="flex border border-ink font-mono text-xs">
                {(["en", "zh"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={`px-3 py-1 ${lang === l ? "bg-ink text-card" : "hover:bg-paper-deep"}`}
                  >
                    {l === "en" ? "English" : "繁體中文"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!welcome && (
            <div className="mt-4 flex gap-1" aria-hidden>
              {steps.slice(1).map((_, i) => (
                <span key={i} className={`h-1 flex-1 ${i < step ? "bg-vermilion" : "bg-paper-deep"}`} />
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"
              >
                ← {pick(UI.back)}
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => (last ? close() : setStep((s) => s + 1))}
              className="bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-card transition-colors hover:bg-vermilion"
            >
              {welcome ? pick(UI.start) : last ? pick(UI.done) : `${pick(UI.next)} →`}
            </button>
          </div>
          {last && <p className="mt-3 text-xs text-muted">{pick(UI.replay)}</p>}
        </div>
      </div>
    </div>
  );
}
