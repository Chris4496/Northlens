import { PRIORITIES, SENTIMENT_LABEL, STAKEHOLDER_LABEL, STATUS_LABEL, THEME_LABEL } from "@/lib/i18n";
import { applyFilters, computeInsights, DEFAULT_FILTERS, OPEN_STATUSES, WINDOW_DAYS, type Filters, type Insights } from "@/lib/insights";
import { ZONES } from "@/lib/kb/places";
import type { Feedback, Lang, Stakeholder, ZoneId } from "@/lib/types";

export type { Filters };

export const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Exports only ever contain responses a person has confirmed in the review queue. */
export function confirmedInScope(all: Feedback[], f: Filters): Feedback[] {
  return applyFilters(all, f).filter((r) => r.reviewed);
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function param(p: Params, k: string): string | undefined {
  const v = p instanceof URLSearchParams ? p.get(k) : p[k];
  return (Array.isArray(v) ? v[0] : v) ?? undefined;
}

export function parseFilters(p: Params): Filters {
  const period = param(p, "period");
  const stakeholder = param(p, "stakeholder");
  const zone = param(p, "zone");
  const source = param(p, "source");
  return {
    period: period === "28" || period === "14" ? period : DEFAULT_FILTERS.period,
    stakeholder: stakeholder && stakeholder in STAKEHOLDER_LABEL ? (stakeholder as Stakeholder) : "all",
    zone: zone && zone in ZONES ? (zone as ZoneId) : "all",
    source: source === "live" ? "live" : "all",
  };
}

export const parseLang = (p: Params): Lang => (param(p, "lang") === "zh" ? "zh" : "en");

export function exportQuery(f: Filters, lang: Lang): string {
  const q = new URLSearchParams({ lang });
  for (const [k, v] of Object.entries(f)) if (v !== DEFAULT_FILTERS[k as keyof Filters]) q.set(k, v);
  return q.toString();
}

export function describeFilters(f: Filters, lang: Lang): string {
  const zh = lang === "zh";
  const parts = [
    f.period === "all" ? (zh ? "全部時間" : "All time") : zh ? `最近 ${f.period} 日` : `Last ${f.period} days`,
    f.stakeholder === "all" ? (zh ? "所有群組" : "All groups") : STAKEHOLDER_LABEL[f.stakeholder][lang],
    f.zone === "all" ? (zh ? "所有地點" : "All areas") : ZONES[f.zone][lang],
    f.source === "live" ? (zh ? "只計實時提交" : "Live submissions only") : zh ? "包括示範數據" : "Including demo data",
  ];
  return parts.join(" · ");
}

export function formatHkt(iso: string, withTime = true): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

const PRIORITY_LABEL = new Map(PRIORITIES.map((p) => [p.id, p]));

/** Quote every cell; prefix formula-like text so spreadsheets never evaluate resident input. */
function cell(v: string | number | boolean): string {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function feedbackCsv(rows: Feedback[], lang: Lang): string {
  const zh = lang === "zh";
  const yes = zh ? "是" : "yes";
  const no = zh ? "否" : "no";
  const header = zh
    ? ["編號", "提交時間（香港）", "語言", "輸入方式", "持份者", "地區", "主題（已確認）", "AI 建議主題", "經人工修正", "情緒", "關注摘要", "建議議題", "重視事項", "意見原文（已移除個人資料）", "曾移除個人資料", "分類方式", "示範數據"]
    : ["ID", "Submitted (HKT)", "Language", "Input", "Stakeholder", "Area", "Theme (confirmed)", "AI-proposed theme", "Corrected by reviewer", "Sentiment", "Concern summary", "Suggested issue", "Priorities", "Feedback text (personal details removed)", "Personal details removed", "Classified by", "Demo data"];

  const lines = rows.map((r) =>
    [
      r.id,
      formatHkt(r.createdAt),
      r.lang === "zh" ? "中文" : "English",
      r.inputMode === "voice" ? (zh ? "語音" : "voice") : zh ? "文字" : "text",
      STAKEHOLDER_LABEL[r.stakeholder][lang],
      ZONES[r.zone][lang],
      THEME_LABEL[r.theme][lang],
      r.aiTheme ? THEME_LABEL[r.aiTheme][lang] : "",
      r.aiTheme && r.aiTheme !== r.theme ? yes : no,
      SENTIMENT_LABEL[r.sentiment][lang],
      r.concern,
      r.suggestedIssue,
      r.priorities.map((p) => PRIORITY_LABEL.get(p)?.[lang] ?? p).join("; "),
      r.text,
      r.piiRedacted ? yes : no,
      r.classifiedBy === "gemini" ? "Gemini" : zh ? "規則" : "rules",
      r.synthetic ? yes : no,
    ]
      .map(cell)
      .join(","),
  );
  // BOM so Excel opens UTF-8 Chinese text correctly.
  return "\uFEFF" + [header.map(cell).join(","), ...lines].join("\r\n");
}

export function reportInsights(rows: Feedback[]): Insights {
  return computeInsights(rows);
}

/** Concrete checks planners can make, taken from confirmed counts and plan items still open to change. */
export function followUps(ins: Insights, lang: Lang): string[] {
  const zh = lang === "zh";
  const out: string[] = [];
  if (ins.emerging) {
    out.push(
      zh
        ? `核實${STAKEHOLDER_LABEL[ins.emerging.stakeholder].zh}對「${THEME_LABEL[ins.emerging.theme].zh}」的關注：${ins.emerging.count} 份已確認回應表達擔憂，其中 ${ins.emerging.recent} 份來自最近 ${WINDOW_DAYS} 日。`
        : `Check the concern about ${THEME_LABEL[ins.emerging.theme].en.toLowerCase()} among ${STAKEHOLDER_LABEL[ins.emerging.stakeholder].en.toLowerCase()} respondents: ${ins.emerging.count} confirmed responses express worry, ${ins.emerging.recent} of them in the last ${WINDOW_DAYS} days.`,
    );
  }
  for (const th of ins.themes) {
    const open = th.plan.chunks.filter((c) => OPEN_STATUSES.includes(c.status));
    const issue = th.issues[0];
    if (!open.length || !issue) continue;
    const heading = lang === "zh" ? open[0].headingZh : open[0].heading;
    out.push(
      zh
        ? `「${THEME_LABEL[th.theme].zh}」：居民最常提到「${issue.text}」（${issue.count} 份）。相關規劃「${heading}」仍屬${STATUS_LABEL[open[0].status].zh}，意見仍可影響。`
        : `${THEME_LABEL[th.theme].en}: residents most often asked for “${issue.text}” (${issue.count}). Related plan item “${heading}” is still ${STATUS_LABEL[open[0].status].en.toLowerCase()}, so feedback can still shape it.`,
    );
  }
  return out.slice(0, 6);
}
