import type { ZoneId } from "@/lib/types";

export type PlaceKind = "rail" | "facility" | "housing" | "green" | "employment" | "healthcare";

export interface Place {
  id: string;
  name: string;
  nameZh: string;
  kind: PlaceKind;
  /** Indicative only — not survey-accurate. */
  point?: [number, number];
  line?: [number, number][];
  dashed?: boolean;
}

export const KTN_CENTER: [number, number] = [22.5065, 114.103];

export const PLACES: Place[] = [
  {
    id: "ktu-station",
    name: "Kwu Tung Station (East Rail Line, target 2027)",
    nameZh: "古洞站（東鐵綫，目標2027年）",
    kind: "rail",
    point: [22.5075, 114.0996],
  },
  {
    id: "erl-spur",
    name: "East Rail Line – Lok Ma Chau Spur",
    nameZh: "東鐵綫落馬洲支綫",
    kind: "rail",
    line: [
      [22.5013, 114.1281],
      [22.505, 114.115],
      [22.5075, 114.0996],
      [22.5105, 114.085],
      [22.5149, 114.0656],
    ],
  },
  {
    id: "nol-main",
    name: "Northern Link Main Line (target by 2034)",
    nameZh: "北環綫主綫（目標2034年或之前）",
    kind: "rail",
    dashed: true,
    line: [
      [22.5075, 114.0996],
      [22.4985, 114.0735],
      [22.4812, 114.062],
      [22.4545, 114.0455],
      [22.4348, 114.0633],
    ],
  },
  {
    id: "sheung-shui",
    name: "Sheung Shui Station",
    nameZh: "上水站",
    kind: "rail",
    point: [22.5013, 114.1281],
  },
  {
    id: "town-centre",
    name: "Town Centre, Town Plaza & public transport interchange",
    nameZh: "市中心、市鎮廣場及公共運輸交匯處",
    kind: "facility",
    point: [22.5065, 114.101],
  },
  {
    id: "area-19-housing",
    name: "Subsidised housing sites within 500 m of the station (Areas 19, 21, 24)",
    nameZh: "鐵路站500米範圍內的資助房屋用地（第19、21、24區）",
    kind: "housing",
    point: [22.5058, 114.103],
  },
  {
    id: "north-residential",
    name: "North Residential Area (Areas 12–13)",
    nameZh: "北部住宅區（第12至13區）",
    kind: "housing",
    point: [22.511, 114.0985],
  },
  {
    id: "area-29-civic",
    name: "Civic hub: library, sports centre, community hall (Area 29)",
    nameZh: "社區樞紐：圖書館、體育館、社區會堂（第29區）",
    kind: "facility",
    point: [22.5058, 114.1],
  },
  {
    id: "mwsc",
    name: "Multi-welfare Services Complex (elderly care & day care)",
    nameZh: "多福利服務綜合大樓（安老院舍及日間護理）",
    kind: "facility",
    point: [22.5053, 114.0972],
  },
  {
    id: "area-28-health",
    name: "Area 28 healthcare site (hospital proposal superseded)",
    nameZh: "第28區醫療用地（醫院方案已被取代）",
    kind: "healthcare",
    point: [22.5056, 114.0935],
  },
  {
    id: "ntm-hospital",
    name: "Ngau Tam Mei – planned integrated hospital (~3,000 beds)",
    nameZh: "牛潭尾 — 規劃中的綜合醫院（約3,000張病床）",
    kind: "healthcare",
    point: [22.4815, 114.0605],
  },
  {
    id: "ndh",
    name: "North District Hospital (expansion underway)",
    nameZh: "北區醫院（擴建中）",
    kind: "healthcare",
    point: [22.4968, 114.1245],
  },
  {
    id: "footbridges-kts",
    name: "Proposed footbridges to Kwu Tung South across Fanling Highway",
    nameZh: "擬建跨粉嶺公路往古洞南的行人天橋",
    kind: "facility",
    point: [22.5036, 114.1008],
  },
  {
    id: "long-valley",
    name: "Long Valley Nature Park (opened Nov 2024)",
    nameZh: "塱原自然公園（2024年11月開放）",
    kind: "green",
    point: [22.5098, 114.1155],
  },
  {
    id: "recreation-fks",
    name: "Recreational Area – Fung Kong Shan Park, sports ground, pool",
    nameZh: "康樂區 — 鳳崗山公園、運動場、游泳池",
    kind: "green",
    point: [22.5125, 114.104],
  },
  {
    id: "btp",
    name: "Business and Technology Park",
    nameZh: "商業及科技園",
    kind: "employment",
    point: [22.5052, 114.1085],
  },
];

export const PLACE_BY_ID = new Map(PLACES.map((p) => [p.id, p]));

export const ZONES: Record<ZoneId, { en: string; zh: string; point: [number, number] }> = {
  town_centre: { en: "Town Centre / station", zh: "市中心／鐵路站", point: [22.5068, 114.1008] },
  north_residential: { en: "North Residential Area", zh: "北部住宅區", point: [22.511, 114.0985] },
  long_valley: { en: "Long Valley / Ho Sheung Heung", zh: "塱原／河上鄉", point: [22.5098, 114.1155] },
  kwu_tung_south: { en: "Kwu Tung South", zh: "古洞南", point: [22.501, 114.103] },
  civic_hub: { en: "Civic hub & welfare complex", zh: "社區樞紐及福利大樓", point: [22.5056, 114.0985] },
  business_park: { en: "Business and Technology Park", zh: "商業及科技園", point: [22.5052, 114.1085] },
};
