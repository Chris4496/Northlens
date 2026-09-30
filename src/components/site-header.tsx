"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./lang";
import { TOUR_EVENT } from "./tour";

export function SiteHeader() {
  const { lang, setLang, t } = useLang();
  const path = usePathname();

  const nav = [
    { href: "/", label: t("navResident") },
    { href: "/dashboard", label: t("navDashboard") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink/80 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 py-3 md:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <LensMark />
          <span className="font-display text-[28px] leading-none">
            North<span className="italic text-vermilion">Lens</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:inline">
            北覽 · {t("brandTag")}
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {nav.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-ink text-card" : "text-ink-soft hover:bg-paper-deep"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}
          className="flex items-center gap-1.5 border border-ink px-2.5 py-1 font-mono text-xs hover:bg-paper-deep"
          title={lang === "zh" ? "重溫導覽" : "Replay the guided tour"}
        >
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[9px]">?</span>
          {lang === "zh" ? "導覽" : "Guide"}
        </button>

        <div className="flex border border-ink font-mono text-xs" role="group" aria-label="Language">
          {(["en", "zh"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-2.5 py-1 ${lang === l ? "bg-ink text-card" : "hover:bg-paper-deep"}`}
            >
              {l === "en" ? "EN" : "繁"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function LensMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" className="self-center" aria-hidden>
      <circle cx="11" cy="11" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4 13.5c3-2 5 1 7-1s4-2.5 7-.5" fill="none" stroke="var(--color-vermilion)" strokeWidth="1.6" />
      <path d="M4.8 9c2.5-1.5 4 .5 6-.7s3.6-1.8 6.4-.3" fill="none" stroke="var(--color-wetland)" strokeWidth="1.2" />
      <path d="M17.5 17.5 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    </svg>
  );
}
