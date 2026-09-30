import type { PlaceKind } from "@/lib/kb/places";

export const KIND_COLOR: Record<PlaceKind, string> = {
  rail: "#13203a",
  facility: "#bf8a22",
  housing: "#d2462a",
  green: "#2c7a68",
  employment: "#6b5aa6",
  healthcare: "#c2185b",
};

export const LEGEND: { kind: PlaceKind; en: string; zh: string }[] = [
  { kind: "rail", en: "Rail", zh: "鐵路" },
  { kind: "housing", en: "Housing", zh: "房屋" },
  { kind: "facility", en: "Community", zh: "社區設施" },
  { kind: "healthcare", en: "Healthcare", zh: "醫療" },
  { kind: "green", en: "Green space", zh: "綠化" },
  { kind: "employment", en: "Jobs", zh: "就業" },
];

/** HKSAR Lands Department basemap via the GeoData Store (no key required). */
export const TILE_URL = "https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/WGS84/{z}/{x}/{y}.png";
export const labelUrl = (lang: "en" | "zh") =>
  `https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/${lang === "zh" ? "tc" : "en"}/WGS84/{z}/{x}/{y}.png`;
export const TILE_ATTR =
  '<a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank">&copy; Map information from Lands Department</a>';
