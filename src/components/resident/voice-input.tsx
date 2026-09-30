"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "../lang";

type SpeechLang = "yue" | "en";
type Phase = "idle" | "recording" | "transcribing";

const MAX_MS = 60_000;
const MIN_MS = 1_000;
const VOICE_LEVEL = 0.12;
const MIN_VOICED_FRAMES = 15;
const MIME_PREFS = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];

const MSG = {
  speak: { en: "Speak", zh: "用講嘅" },
  stop: { en: "Stop", zh: "停止" },
  transcribing: { en: "Transcribing…", zh: "轉寫中…" },
  hint: {
    en: "Audio is transcribed, then discarded. Check the text before you submit.",
    zh: "錄音只用作轉寫，之後即時刪除。提交前請核對文字。",
  },
  blocked: { en: "Microphone access was blocked.", zh: "未能使用咪高峰，請允許權限。" },
  short: { en: "Didn't catch that — speak for at least a second.", zh: "聽唔清楚，請講多一秒以上。" },
  silent: { en: "Didn't hear any speech. Check your microphone and try again.", zh: "聽唔到聲音，請檢查咪高峰再試。" },
  failed: { en: "Couldn't transcribe. Please try again or type instead.", zh: "轉寫失敗，請再試或直接輸入。" },
  unavailable: { en: "Voice input needs the Gemini key on the server.", zh: "語音輸入需要伺服器設定 Gemini。" },
};

export function VoiceInput({ onTranscript }: { onTranscript: (text: string, lang: SpeechLang) => void }) {
  const { lang, pick } = useLang();
  const [speechLang, setSpeechLang] = useState<SpeechLang | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const cleanup = useRef<() => void>(() => {});

  const active: SpeechLang = speechLang ?? (lang === "zh" ? "yue" : "en");

  useEffect(() => {
    const supported = typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    fetch("/api/status")
      .then((r) => r.json())
      .then((s: { gemini: string | null }) => setEnabled(supported && Boolean(s.gemini)))
      .catch(() => setEnabled(false));
    return () => cleanup.current();
  }, []);

  async function start() {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setError(pick(MSG.blocked));
      return;
    }

    const mimeType = MIME_PREFS.find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const parts: Blob[] = [];
    const startedAt = performance.now();

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    let voicedFrames = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
      const lvl = Math.min(1, peak / 64);
      if (lvl > VOICE_LEVEL) voicedFrames++;
      setLevel(lvl);
      setElapsed(performance.now() - startedAt);
      raf = requestAnimationFrame(tick);
    };
    tick();
    const limit = setTimeout(() => rec.state === "recording" && rec.stop(), MAX_MS);

    cleanup.current = () => {
      cancelAnimationFrame(raf);
      clearTimeout(limit);
      stream.getTracks().forEach((t) => t.stop());
      audioCtx.close().catch(() => {});
    };

    rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
    rec.onstop = async () => {
      const duration = performance.now() - startedAt;
      cleanup.current();
      setLevel(0);
      if (duration < MIN_MS) {
        setPhase("idle");
        setError(pick(MSG.short));
        return;
      }
      // Silent clips invite the model to invent speech, so don't send them.
      if (voicedFrames < MIN_VOICED_FRAMES) {
        setPhase("idle");
        setError(pick(MSG.silent));
        return;
      }
      setPhase("transcribing");
      const blob = new Blob(parts, { type: rec.mimeType || mimeType || "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "voice");
      form.append("lang", active);
      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const body = await res.json().catch(() => ({}));
        if (res.status === 422) throw new Error(pick(MSG.short));
        if (!res.ok) throw new Error(pick(MSG.failed));
        if (!body.text) throw new Error(pick(MSG.short));
        onTranscript(body.text, active);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setPhase("idle");
      }
    };

    recorder.current = rec;
    rec.start();
    setElapsed(0);
    setPhase("recording");
  }

  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  if (enabled === false) {
    return <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">{pick(MSG.unavailable)}</p>;
  }

  const secs = Math.floor(elapsed / 1000);
  return (
    <div className="mb-2">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Speech language" className="flex border border-ink font-mono text-[11px]">
          {(
            [
              ["yue", "廣東話"],
              ["en", "English"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active === id}
              disabled={phase !== "idle"}
              onClick={() => setSpeechLang(id)}
              className={`px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed ${
                active === id ? "bg-ink text-card" : "hover:bg-paper-deep"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {phase === "recording" ? (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-2 border border-vermilion bg-vermilion px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-card"
          >
            <span className="h-2.5 w-2.5 bg-card" />
            {pick(MSG.stop)}
            <span className="tabular-nums">
              0:{String(secs).padStart(2, "0")} / 1:00
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={phase === "transcribing" || enabled === null}
            className="flex items-center gap-2 border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-ink hover:text-card disabled:opacity-50"
          >
            <MicIcon />
            {phase === "transcribing" ? pick(MSG.transcribing) : pick(MSG.speak)}
          </button>
        )}

        {phase === "recording" && <LevelMeter level={level} />}
      </div>
      <p className={`mt-1.5 text-xs ${error ? "text-vermilion" : "text-muted"}`}>{error ?? pick(MSG.hint)}</p>
    </div>
  );
}

function LevelMeter({ level }: { level: number }) {
  return (
    <span className="flex h-5 items-end gap-0.5" aria-hidden>
      {[0.2, 0.45, 0.7, 0.45, 0.2].map((w, i) => (
        <span
          key={i}
          className="w-1 bg-vermilion transition-[height] duration-75"
          style={{ height: `${Math.max(15, Math.min(100, level * 100 * (0.6 + w)))}%` }}
        />
      ))}
    </span>
  );
}

function MicIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="3.5" y="0.7" width="5" height="8" rx="2.5" />
      <path d="M1 6.5a5 5 0 0 0 10 0M6 11.5v2" />
    </svg>
  );
}
