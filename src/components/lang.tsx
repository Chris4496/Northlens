"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { T, type TKey } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const KEY = "northlens-lang";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const getSnapshot = (): Lang => (localStorage.getItem(KEY) === "zh" ? "zh" : "en");
const getServerSnapshot = (): Lang => "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  pick: <V>(v: { en: V; zh: V }) => V;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-HK" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(KEY, l);
    listeners.forEach((cb) => cb());
  }, []);

  const t = useCallback((k: TKey) => T[k][lang], [lang]);
  const pick = useCallback(<V,>(v: { en: V; zh: V }) => v[lang], [lang]);

  return <Ctx.Provider value={{ lang, setLang, t, pick }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
