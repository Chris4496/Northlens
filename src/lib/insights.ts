import { CHUNK_BY_ID } from "@/lib/kb/chunks";
import type { Chunk, Feedback, FeedbackTheme, PlanStatus, Stakeholder, ZoneId } from "@/lib/types";

/** Plan passages that each feedback theme is about — used to show whether the plan can still change. */
export const THEME_PLAN_ITEMS: Record<FeedbackTheme, string[]> = {
  accessible_transport: ["odp-footbridges", "works-fanling-highway", "odp-pedestrian-env", "odp-500m", "ktu-location"],
  public_transport: ["ktu-erl-station", "kwu-chun-intake", "nol-journey-time", "nol-phasing", "roads", "works-fanling-highway"],
  healthcare: ["hospital-superseded", "ndh-expansion", "odp-area28", "ozp-hospital-2023"],
  elderly_services: ["mwsc-detail", "town-centre-elderly", "ozp-area29-complex"],
  childcare_education: ["ozp-schools", "ozp-area29-complex", "schools", "area19-facilities"],
  green_space: ["lvnp", "lvnp-access", "recreation", "ozp-recreation", "ozp-riverside", "lvnp-works"],
  noise_environment: ["noise", "works-fanling-highway", "works-first-phase"],
  affordability_housing: ["kwu-chun-intake", "kwu-chun-estate", "housing-12000", "ozp-population", "ozp-rezoning", "scale-cedd", "population-odp"],
  employment: ["ozp-rezoning", "urban-rural", "joint-user-complex", "recreation"],
  other: ["kwu-chun-intake", "joint-user-complex", "urban-rural", "ozp-objections"],
};

export const OPEN_STATUSES: PlanStatus[] = ["proposed", "under_review"];
export const VULNERABLE: Stakeholder[] = ["elderly_mobility", "caregiver", "family_children"];
export const WINDOW_DAYS = 14;
const WEEKS = 6;
const DAY = 86_400_000;

export interface Filters {
  period: "all" | "28" | "14";
  stakeholder: Stakeholder | "all";
  zone: ZoneId | "all";
  source: "all" | "live";
}

export const DEFAULT_FILTERS: Filters = { period: "all", stakeholder: "all", zone: "all", source: "all" };

/** Time anchor = latest submission, so "recent" stays meaningful for any dataset. */
export function anchorOf(rows: Feedback[]): number {
  return rows.reduce((m, r) => Math.max(m, Date.parse(r.createdAt)), 0) || Date.now();
}

export function applyFilters(rows: Feedback[], f: Filters, anchor = anchorOf(rows)): Feedback[] {
  const since = f.period === "all" ? -Infinity : anchor - Number(f.period) * DAY;
  return rows.filter(
    (r) =>
      Date.parse(r.createdAt) > since &&
      (f.stakeholder === "all" || r.stakeholder === f.stakeholder) &&
      (f.zone === "all" || r.zone === f.zone) &&
      (f.source === "all" || !r.synthetic),
  );
}

const isWorried = (r: Feedback) => r.sentiment === "concern" || r.sentiment === "mixed";

export interface ThemeInsight {
  theme: FeedbackTheme;
  count: number;
  share: number;
  sentiment: Record<Feedback["sentiment"], number>;
  worried: number;
  concernRate: number;
  recent: number;
  prior: number;
  /** Relative change of the last 14 days vs the 14 before; null when there is no prior baseline. */
  momentum: number | null;
  vulnerableShare: number;
  weekly: number[];
  score: number;
  plan: { chunks: Chunk[]; open: number };
  zones: { zone: ZoneId; count: number }[];
  stakeholders: { stakeholder: Stakeholder; count: number }[];
  issues: { text: string; count: number }[];
  quotes: Feedback[];
}

export interface Insights {
  total: number;
  live: number;
  worried: number;
  concernRate: number;
  vulnerableShare: number;
  reviewed: number;
  reviewedShare: number;
  corrected: number;
  agreement: number | null;
  voice: number;
  themes: ThemeInsight[];
  byStakeholder: { stakeholder: Stakeholder; count: number; share: number }[];
  byZone: { zone: ZoneId; count: number; topTheme: FeedbackTheme; concernShare: number }[];
  matrix: { themes: FeedbackTheme[]; stakeholders: Stakeholder[]; cells: Record<string, { count: number; worried: number }> };
  emerging: { theme: FeedbackTheme; stakeholder: Stakeholder; count: number; recent: number } | null;
}

function tally<K extends string>(rows: Feedback[], key: (f: Feedback) => K): [K, number][] {
  const m = new Map<K, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/**
 * Priority = responses expressing concern × (1 + ½·share from vulnerable groups) × trend factor,
 * where the trend factor ranges 0.75–1.25 from the 14-day momentum. Transparent on purpose.
 */
function priorityScore(worried: number, vulnerableShare: number, momentum: number | null) {
  const trend = momentum === null ? 1 : 1 + 0.25 * Math.max(-1, Math.min(1, momentum));
  return worried * (1 + 0.5 * vulnerableShare) * trend;
}

export function computeInsights(rows: Feedback[], anchor = anchorOf(rows)): Insights {
  const total = rows.length;
  const share = (n: number, d = total) => (d ? n / d : 0);
  const recentSince = anchor - WINDOW_DAYS * DAY;
  const priorSince = anchor - 2 * WINDOW_DAYS * DAY;
  const t = (r: Feedback) => Date.parse(r.createdAt);

  const themes: ThemeInsight[] = tally(rows, (r) => r.theme).map(([theme, count]) => {
    const inTheme = rows.filter((r) => r.theme === theme);
    const worried = inTheme.filter(isWorried).length;
    const recent = inTheme.filter((r) => t(r) > recentSince).length;
    const prior = inTheme.filter((r) => t(r) > priorSince && t(r) <= recentSince).length;
    const momentum = prior ? (recent - prior) / prior : null;
    const vulnerableShare = share(inTheme.filter((r) => VULNERABLE.includes(r.stakeholder)).length, count);
    const weekly = Array.from({ length: WEEKS }, (_, i) => {
      const end = anchor - (WEEKS - 1 - i) * 7 * DAY;
      return inTheme.filter((r) => t(r) > end - 7 * DAY && t(r) <= end).length;
    });
    const chunks = THEME_PLAN_ITEMS[theme].map((id) => CHUNK_BY_ID.get(id)).filter((c): c is Chunk => !!c);
    const sentiment = { support: 0, concern: 0, mixed: 0, neutral: 0 };
    for (const r of inTheme) sentiment[r.sentiment]++;

    const issueCounts = new Map<string, number>();
    for (const r of inTheme.filter(isWorried)) {
      const k = r.suggestedIssue.trim();
      if (k) issueCounts.set(k, (issueCounts.get(k) ?? 0) + 1);
    }

    return {
      theme,
      count,
      share: share(count),
      sentiment,
      worried,
      concernRate: share(worried, count),
      recent,
      prior,
      momentum,
      vulnerableShare,
      weekly,
      score: priorityScore(worried, vulnerableShare, momentum),
      plan: { chunks, open: chunks.filter((c) => OPEN_STATUSES.includes(c.status)).length },
      zones: tally(inTheme, (r) => r.zone).map(([zone, n]) => ({ zone, count: n })),
      stakeholders: tally(inTheme, (r) => r.stakeholder).map(([stakeholder, n]) => ({ stakeholder, count: n })),
      issues: [...issueCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([text, n]) => ({ text, count: n })),
      quotes: inTheme
        .filter((r) => r.text)
        .sort(
          (a, b) =>
            Number(a.synthetic) - Number(b.synthetic) ||
            Number(isWorried(b)) - Number(isWorried(a)) ||
            b.createdAt.localeCompare(a.createdAt),
        )
        .slice(0, 3),
    };
  });
  themes.sort((a, b) => b.score - a.score || b.count - a.count);

  const byStakeholder = tally(rows, (r) => r.stakeholder).map(([stakeholder, count]) => ({
    stakeholder,
    count,
    share: share(count),
  }));

  const byZone = tally(rows, (r) => r.zone).map(([zone, count]) => {
    const inZone = rows.filter((r) => r.zone === zone);
    return {
      zone,
      count,
      topTheme: tally(inZone, (r) => r.theme)[0][0],
      concernShare: share(inZone.filter(isWorried).length, count),
    };
  });

  const cells: Insights["matrix"]["cells"] = {};
  for (const r of rows) {
    const k = `${r.theme}|${r.stakeholder}`;
    const c = (cells[k] ??= { count: 0, worried: 0 });
    c.count++;
    if (isWorried(r)) c.worried++;
  }

  let emerging: Insights["emerging"] = null;
  for (const [k, c] of Object.entries(cells)) {
    if (k.startsWith("other|") || !c.worried) continue;
    const [theme, stakeholder] = k.split("|") as [FeedbackTheme, Stakeholder];
    const recent = rows.filter(
      (r) => r.theme === theme && r.stakeholder === stakeholder && isWorried(r) && t(r) > recentSince,
    ).length;
    if (!emerging || c.worried + recent > emerging.count + emerging.recent) {
      emerging = { theme, stakeholder, count: c.worried, recent };
    }
  }

  const reviewedRows = rows.filter((r) => r.reviewed);
  const judged = reviewedRows.filter((r) => r.aiTheme);
  const corrected = judged.filter((r) => r.aiTheme !== r.theme).length;
  const worried = rows.filter(isWorried).length;

  return {
    total,
    live: rows.filter((r) => !r.synthetic).length,
    worried,
    concernRate: share(worried),
    vulnerableShare: share(rows.filter((r) => VULNERABLE.includes(r.stakeholder)).length),
    reviewed: reviewedRows.length,
    reviewedShare: share(reviewedRows.length),
    corrected,
    agreement: judged.length ? (judged.length - corrected) / judged.length : null,
    voice: rows.filter((r) => r.inputMode === "voice").length,
    themes,
    byStakeholder,
    byZone,
    matrix: {
      themes: themes.map((x) => x.theme),
      stakeholders: byStakeholder.map((s) => s.stakeholder),
      cells,
    },
    emerging,
  };
}
