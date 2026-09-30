export interface ScenarioRow {
  need: { en: string; zh: string };
  icon: string;
  chunkIds: string[];
}

export const SCENARIO: ScenarioRow[] = [
  { need: { en: "Transport", zh: "交通" }, icon: "rail", chunkIds: ["ktu-erl-station", "nol-journey-time", "odp-500m"] },
  { need: { en: "Healthcare", zh: "醫療" }, icon: "health", chunkIds: ["hospital-superseded", "ndh-expansion", "odp-area28"] },
  { need: { en: "Elderly care", zh: "長者照顧" }, icon: "care", chunkIds: ["mwsc-detail", "town-centre-elderly"] },
  { need: { en: "Education", zh: "教育" }, icon: "school", chunkIds: ["schools", "town-centre-elderly", "civic-hub"] },
  { need: { en: "Employment", zh: "就業" }, icon: "work", chunkIds: ["scale-cedd", "recreation"] },
  { need: { en: "Green space", zh: "綠化空間" }, icon: "leaf", chunkIds: ["lvnp", "recreation", "odp-pedestrian-env"] },
  { need: { en: "Cross-border access", zh: "跨境往來" }, icon: "border", chunkIds: ["ktu-erl-station", "nol-phasing"] },
];
