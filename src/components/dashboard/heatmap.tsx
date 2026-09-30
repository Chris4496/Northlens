"use client";

import { STAKEHOLDER_LABEL, THEME_LABEL } from "@/lib/i18n";
import type { Insights } from "@/lib/insights";
import type { FeedbackTheme, Stakeholder } from "@/lib/types";
import { useLang } from "../lang";
import { Panel } from "./ui";

export function Heatmap({
  matrix,
  selected,
  onPick,
}: {
  matrix: Insights["matrix"];
  selected: FeedbackTheme | null;
  onPick: (theme: FeedbackTheme, stakeholder: Stakeholder) => void;
}) {
  const { pick, lang } = useLang();
  const zh = lang === "zh";
  const max = Math.max(...Object.values(matrix.cells).map((c) => c.worried), 1);

  return (
    <Panel
      title={zh ? "誰關注甚麼" : "Who worries about what"}
      aside={zh ? "數字＝回應數；顏色＝表達關注的數量" : "number = responses · colour = how many express concern"}
    >
      <div className="overflow-x-auto p-4">
        <table className="w-full border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr>
              <th />
              {matrix.stakeholders.map((s) => (
                <th key={s} className="h-28 w-12 pb-1 align-bottom font-normal">
                  <span
                    title={pick(STAKEHOLDER_LABEL[s])}
                    className="mx-auto block max-h-28 rotate-180 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[10px] text-ink-soft [writing-mode:vertical-rl]">
                    {pick(STAKEHOLDER_LABEL[s])}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.themes.map((th) => (
              <tr key={th}>
                <th
                  className={`max-w-[150px] truncate pr-2 text-left font-normal ${th === selected ? "text-vermilion" : ""}`}
                >
                  {pick(THEME_LABEL[th])}
                </th>
                {matrix.stakeholders.map((s) => {
                  const c = matrix.cells[`${th}|${s}`];
                  if (!c) return <td key={s} className="h-8 bg-paper-deep/40" />;
                  const a = c.worried / max;
                  return (
                    <td key={s} className="h-8 p-0">
                      <button
                        type="button"
                        onClick={() => onPick(th, s)}
                        title={`${pick(THEME_LABEL[th])} · ${pick(STAKEHOLDER_LABEL[s])}: ${c.count} (${c.worried} ${zh ? "關注" : "concerned"})`}
                        className="h-full w-full font-mono tabular-nums outline-offset-1 hover:outline hover:outline-ink"
                        style={{
                          background: c.worried ? `rgba(210, 70, 42, ${0.12 + 0.78 * a})` : "var(--color-paper-deep)",
                          color: a > 0.55 ? "var(--color-card)" : "var(--color-ink)",
                        }}
                      >
                        {c.count}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted">
          {zh ? "點擊格子：以該群組篩選並查看議題詳情。" : "Click a cell to filter by that group and open the issue."}
        </p>
      </div>
    </Panel>
  );
}
