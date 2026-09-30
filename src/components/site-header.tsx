"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLang } from "./lang";
import { TOUR_EVENT } from "./tour";

export function SiteHeader() {
  const { lang, setLang, t } = useLang();
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);

  // Sticky elements below the header (dashboard filters, tour spotlight) offset by --header-h.
  // Skip measuring while printing: Safari lays the page out again for the preview, and writing
  // --header-h from that pass reflows the sticky header in a loop.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const measure = () => {
      if (root.classList.contains("printing")) return;
      root.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const clearBlur = () => {
      el.style.removeProperty("--tw-backdrop-blur");
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
    };
    const onBeforePrint = () => {
      root.classList.add("printing");
      el.style.setProperty("--tw-backdrop-blur", "initial", "important");
      el.style.setProperty("backdrop-filter", "none", "important");
      el.style.setProperty("-webkit-backdrop-filter", "none", "important");
    };
    const onAfterPrint = () => {
      root.classList.remove("printing");
      clearBlur();
      measure();
    };
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      ro.disconnect();
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      root.classList.remove("printing");
    };
  }, []);

  const nav = [
    { href: "/", label: t("navResident") },
    { href: "/dashboard", label: t("navDashboard") },
  ];

  return (
    <header ref={ref} className="sticky top-0 z-50 border-b border-ink/80 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-3 px-4 pt-2.5 md:flex-nowrap md:gap-6 md:px-8 md:py-3">
        <Link href="/" className="mr-auto flex min-w-0 items-baseline gap-2 md:mr-0">
          <LensMark />
          <span className="font-display text-[24px] leading-none md:text-[28px]">
            North<span className="italic text-vermilion">Lens</span>
          </span>
          <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:inline md:hidden lg:inline">
            北覽 · {t("brandTag")}
          </span>
        </Link>

        <nav className="order-last -mx-4 mt-2.5 grid w-[calc(100%+2rem)] grid-cols-2 border-t border-ink/20 md:order-none md:mx-0 md:ml-auto md:mt-0 md:flex md:w-auto md:gap-1 md:border-0">
          {nav.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap px-3 py-2.5 text-center text-sm transition-colors md:py-1.5 ${
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
          className="flex h-8 items-center gap-1.5 border border-ink px-2 font-mono text-xs hover:bg-paper-deep sm:px-2.5 md:h-auto md:py-1"
          title={lang === "zh" ? "重溫導覽" : "Replay the guided tour"}
          aria-label={lang === "zh" ? "重溫導覽" : "Replay the guided tour"}
        >
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[9px]">?</span>
          <span className="hidden sm:inline">{lang === "zh" ? "導覽" : "Guide"}</span>
        </button>

        <div className="flex h-8 border border-ink font-mono text-xs md:h-auto" role="group" aria-label="Language">
          {(["en", "zh"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-2.5 md:py-1 ${lang === l ? "bg-ink text-card" : "hover:bg-paper-deep"}`}
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
    <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0 self-center" aria-hidden>
      <circle cx="11" cy="11" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4 13.5c3-2 5 1 7-1s4-2.5 7-.5" fill="none" stroke="var(--color-vermilion)" strokeWidth="1.6" />
      <path d="M4.8 9c2.5-1.5 4 .5 6-.7s3.6-1.8 6.4-.3" fill="none" stroke="var(--color-wetland)" strokeWidth="1.2" />
      <path d="M17.5 17.5 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    </svg>
  );
}
