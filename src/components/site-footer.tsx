"use client";

import { useEffect, useState } from "react";
import { useLang } from "./lang";

export function SiteFooter() {
  const { t, lang } = useLang();
  const [status, setStatus] = useState<{ gemini: string | null; supabase: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-ink bg-ink text-card">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-14 md:px-8 lg:grid-cols-[2fr_1fr]">
        <p className="font-display text-[clamp(1.8rem,3.4vw,3rem)] leading-tight">{t("closing")}</p>
        <div className="space-y-3 self-end font-mono text-[11px] leading-relaxed text-card/60">
          <p>{t("guardrails")}</p>
          <p>
            {lang === "zh"
              ? "原型資料只涵蓋古洞北，取自政府及港鐵公開文件。規劃資料會改變，請以官方最新公布為準。"
              : "Prototype knowledge base covers Kwu Tung North only, drawn from public Government and MTR documents. Plans change — always check the latest official release."}
          </p>
          {status && (
            <div
              className="flex items-center gap-2 border-t border-card/20 pt-3 text-[10px] uppercase tracking-wider text-card/50"
              title="Runtime mode"
            >
              <Dot on={Boolean(status.gemini)} />
              {status.gemini ?? "offline"}
              <Dot on={status.supabase} />
              {status.supabase ? "supabase" : "local store"}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function Dot({ on }: { on: boolean }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${on ? "bg-wetland" : "bg-ochre"}`} />;
}
