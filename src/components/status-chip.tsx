"use client";

import { STATUS_LABEL } from "@/lib/i18n";
import type { PlanStatus } from "@/lib/types";
import { useLang } from "./lang";

const STYLE: Record<PlanStatus, string> = {
  completed: "bg-wetland text-card border-wetland",
  under_construction: "bg-ochre-soft text-ink border-ochre",
  planned: "bg-card text-ink border-ink",
  proposed: "bg-card text-vermilion border-vermilion border-dashed",
  under_review: "bg-card text-ochre border-ochre border-dashed",
  superseded: "bg-paper-deep text-muted border-muted line-through",
};

export function StatusChip({ status, className = "" }: { status: PlanStatus; className?: string }) {
  const { pick } = useLang();
  return (
    <span
      className={`inline-flex shrink-0 items-center border px-1.5 py-px font-mono text-[10px] uppercase tracking-wider ${STYLE[status]} ${className}`}
    >
      {pick(STATUS_LABEL[status])}
    </span>
  );
}

export function CiteMark({ n, active, onHover }: { n: number; active?: boolean; onHover?: (on: boolean) => void }) {
  return (
    <sup
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`ml-0.5 cursor-help px-1 font-mono text-[10px] transition-colors ${
        active ? "bg-vermilion text-card" : "bg-ink/10 text-ink hover:bg-ink hover:text-card"
      }`}
    >
      {n}
    </sup>
  );
}
