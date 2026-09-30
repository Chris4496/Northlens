"use client";

import type { Feedback } from "@/lib/types";

export const pct = (n: number) => `${Math.round(n * 100)}%`;

export function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-ink bg-card ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink px-5 py-3">
        <h2 className="font-display text-2xl">{title}</h2>
        {aside && <div className="text-xs text-muted">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function Kpi({ value, label, sub, accent }: { value: string; label: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-card px-4 py-3">
      <dt className={`font-display text-4xl leading-none ${accent ? "text-vermilion" : ""}`}>{value}</dt>
      <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dd>
      {sub && <dd className="mt-0.5 text-[11px] text-ink-soft">{sub}</dd>}
    </div>
  );
}

const SENT_COLOR: Record<Feedback["sentiment"], string> = {
  support: "var(--color-wetland)",
  neutral: "var(--color-muted)",
  mixed: "var(--color-ochre)",
  concern: "var(--color-vermilion)",
};

export function SentimentBar({ s, total }: { s: Record<Feedback["sentiment"], number>; total: number }) {
  return (
    <span className="flex h-3 w-full overflow-hidden bg-paper-deep" title={Object.entries(s).map(([k, v]) => `${k} ${v}`).join(" · ")}>
      {(["support", "neutral", "mixed", "concern"] as const).map((k) =>
        s[k] ? <span key={k} style={{ width: `${(s[k] / total) * 100}%`, background: SENT_COLOR[k] }} /> : null,
      )}
    </span>
  );
}

export function SentimentLegend({ labels }: { labels: Record<Feedback["sentiment"], string> }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {(["support", "neutral", "mixed", "concern"] as const).map((k) => (
        <span key={k} className="flex items-center gap-1">
          <span className="h-2 w-2" style={{ background: SENT_COLOR[k] }} />
          {labels[k]}
        </span>
      ))}
    </span>
  );
}

export function SentimentDot({ s }: { s: Feedback["sentiment"] }) {
  return <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: SENT_COLOR[s] }} />;
}

export function Sparkline({ values, width = 64, height = 20 }: { values: number[]; width?: number; height?: number }) {
  const max = Math.max(...values, 1);
  const step = width / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`);
  const last = pts[pts.length - 1]?.split(",");
  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.5" />
      {last && <circle cx={last[0]} cy={last[1]} r="2" fill="currentColor" />}
    </svg>
  );
}

export function Momentum({ m, recent, zh }: { m: number | null; recent: number; zh: boolean }) {
  if (m === null) {
    return recent ? (
      <span className="font-mono text-[11px] text-vermilion">{zh ? "新出現" : "new"}</span>
    ) : (
      <span className="font-mono text-[11px] text-muted">—</span>
    );
  }
  const r = Math.round(m * 100);
  const cls = r > 10 ? "text-vermilion" : r < -10 ? "text-wetland" : "text-muted";
  return (
    <span className={`font-mono text-[11px] tabular-nums ${cls}`}>
      {r > 0 ? "▲" : r < 0 ? "▼" : "■"} {r > 0 ? "+" : ""}
      {r}%
    </span>
  );
}

export function NewBadge({ label }: { label: string }) {
  return (
    <span className="absolute -top-2.5 right-3 animate-pulse-ring bg-vermilion px-2 py-0.5 font-mono text-[10px] text-card">
      {label}
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex border border-ink font-mono text-[11px]">
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`px-2.5 py-1.5 transition-colors ${value === id ? "bg-ink text-card" : "hover:bg-paper-deep"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
