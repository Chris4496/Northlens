import "server-only";
import type { Feedback, FeedbackTheme, Lang, PersonaId, Sentiment, Stakeholder, ZoneId } from "@/lib/types";

type Row = [string, FeedbackTheme, Stakeholder, ZoneId, Sentiment, string, string, PersonaId, Lang];

/** Synthetic demonstration responses — always flagged `synthetic: true` in the UI. */
const ROWS: Row[] = [
  ["The station opening in 2027 is great, but what buses will run before then? Right now I need two transfers to get to Sheung Shui.", "public_transport", "student", "town_centre", "mixed", "Interim transport before 2027", "Interim bus/minibus routes to Sheung Shui", "student", "en"],
  ["Please make sure late-night trains or buses serve Kwu Tung. My lectures end at 9pm.", "public_transport", "student", "town_centre", "concern", "Late-evening service", "Late-night service frequency", "student", "en"],
  ["北環綫要2034年先通車，太遲了，之前去元朗點算？", "public_transport", "working_adult", "town_centre", "concern", "Northern Link timing", "Interim east–west connection to Yuen Long", "worker", "zh"],
  ["Rail to Kam Sheung Road in 12 minutes would change my life. I currently spend over an hour each way.", "public_transport", "working_adult", "north_residential", "support", "Cross-NT journey time", "Keep Northern Link on schedule", "worker", "en"],
  ["Worried the East Rail Line will be packed by the time trains reach Kwu Tung from Lok Ma Chau.", "public_transport", "working_adult", "town_centre", "concern", "Train crowding at peak", "Peak capacity on East Rail Line", "worker", "en"],
  ["希望公共運輸交匯處有足夠巴士線去沙田同九龍。", "public_transport", "working_adult", "town_centre", "neutral", "Bus routes to urban area", "Bus route planning at PTI", "worker", "zh"],
  ["Good to have a station in the middle of the town, less reliance on minibuses.", "public_transport", "student", "town_centre", "support", "Station in town centre", "Station location supported", "student", "en"],
  ["Will fares from Kwu Tung be affordable for students? Cross-harbour trips already cost a lot.", "public_transport", "student", "town_centre", "concern", "Fare affordability", "Student fare concessions", "student", "en"],
  ["The Northern Link Spur Line to Huanggang would help me work in Shenzhen. Please publish a clearer timeline.", "public_transport", "working_adult", "business_park", "mixed", "Cross-boundary rail timeline", "Publish Spur Line milestones", "worker", "en"],
  ["我每日去上水轉車，古洞站開咗應該會快好多。", "public_transport", "working_adult", "kwu_tung_south", "support", "Journey to Sheung Shui", "Rail journey time benefit", "worker", "zh"],
  ["Cycle parking near the station please, lots of us cycle from the villages.", "public_transport", "working_adult", "long_valley", "neutral", "Cycle parking at station", "Cycle parking capacity", "worker", "en"],
  ["Traffic on Fanling Highway is already bad in the morning. More residents will make it worse until 2031.", "public_transport", "working_adult", "kwu_tung_south", "concern", "Road congestion", "Interim traffic management", "worker", "en"],
  ["Minibus 17 is my only option now and it's always full.", "public_transport", "student", "long_valley", "concern", "Minibus capacity", "Minibus frequency", "student", "en"],

  ["So the Kwu Tung North hospital is cancelled? Ngau Tam Mei is far for my father who has dialysis three times a week.", "healthcare", "elderly_mobility", "civic_hub", "concern", "Hospital distance after plan change", "Clinic/dialysis provision in KTN", "caregiver", "en"],
  ["北區醫院已經好多人等，新增幾萬人口點應付？", "healthcare", "elderly_mobility", "town_centre", "concern", "Hospital capacity", "Healthcare capacity vs population intake", "caregiver", "zh"],
  ["Please at least keep a polyclinic in Area 28. We need a GP within walking distance.", "healthcare", "caregiver", "civic_hub", "concern", "Local clinic", "Retain polyclinic at Area 28", "caregiver", "en"],
  ["It would help to know which hospital cluster we will belong to once the new estates open.", "healthcare", "caregiver", "north_residential", "neutral", "Hospital cluster clarity", "Communicate hospital cluster", "caregiver", "en"],
  ["我阿媽要定期覆診，搬入新屋苑後唔知去邊間醫院。", "healthcare", "elderly_mobility", "town_centre", "concern", "Follow-up appointments", "Transport to hospital for regular visits", "caregiver", "zh"],
  ["The North District Hospital expansion is welcome but 2029 is after the first residents move in.", "healthcare", "working_adult", "town_centre", "mixed", "Timing of hospital expansion", "Interim healthcare before 2029", "worker", "en"],
  ["Is there going to be an elderly health centre or just the big hospital far away?", "healthcare", "elderly_mobility", "civic_hub", "concern", "Community health services", "Elderly health centre", "caregiver", "en"],
  ["A shuttle bus to the new Ngau Tam Mei hospital would help a lot of elderly people.", "healthcare", "elderly_mobility", "town_centre", "neutral", "Access to distant hospital", "Hospital shuttle service", "caregiver", "en"],
  ["We need a 24-hour clinic, children get sick at night.", "healthcare", "family_children", "north_residential", "concern", "Out-of-hours care", "24-hour clinic", "worker", "en"],

  ["The railway looks useful, but my mother uses a wheelchair and I am concerned about the walking distance between the estate and the station.", "accessible_transport", "elderly_mobility", "town_centre", "mixed", "First/last-mile accessibility", "Walking distance to station", "caregiver", "en"],
  ["Footbridges over Fanling Highway need lifts, not just stairs. My father cannot climb.", "accessible_transport", "elderly_mobility", "kwu_tung_south", "concern", "Step-free footbridges", "Lifts on Fanling Highway footbridges", "caregiver", "en"],
  ["500米對後生仔唔遠，但我婆婆行十分鐘都要停兩次。沿路要有座椅同上蓋。", "accessible_transport", "elderly_mobility", "town_centre", "concern", "Covered walkway with seating", "Rest points and covers on walking routes", "caregiver", "zh"],
  ["Please make the Town Plaza fully step-free with covered walkways — it rains a lot.", "accessible_transport", "elderly_mobility", "town_centre", "concern", "Covered step-free routes", "Weather protection on walkways", "caregiver", "en"],
  ["From Ho Sheung Heung the walk to the new station is long for older villagers.", "accessible_transport", "elderly_mobility", "long_valley", "concern", "Village access to station", "Feeder service from villages", "caregiver", "en"],
  ["Pushing a pram across multiple footbridges is exhausting. Level crossings where possible please.", "accessible_transport", "family_children", "kwu_tung_south", "concern", "At-grade crossings", "Pram-friendly crossings", "worker", "en"],
  ["Good that the elderly care complex is near the station, but the lift capacity at the station matters.", "accessible_transport", "elderly_mobility", "civic_hub", "mixed", "Station lift capacity", "Lift provision at station", "caregiver", "en"],

  ["1,750 elderly places sounds great. When will it open relative to the public housing intake?", "elderly_services", "caregiver", "civic_hub", "mixed", "Timing of elderly care", "Align welfare complex with intake", "caregiver", "en"],
  ["希望長者地區中心早啲開，唔好等所有人入伙先起。", "elderly_services", "elderly_mobility", "town_centre", "concern", "Early opening of elderly centre", "Phase elderly centre early", "caregiver", "zh"],
  ["Day care for the elderly near home means I could keep working. Please prioritise it.", "elderly_services", "caregiver", "civic_hub", "support", "Day care for working caregivers", "Prioritise day care units", "worker", "en"],
  ["Residents moving from Dills Corner Garden care homes need a smooth transition.", "elderly_services", "elderly_mobility", "civic_hub", "concern", "Care home reprovisioning", "Transition plan for relocated residents", "caregiver", "en"],

  ["Long Valley Nature Park is beautiful. Please keep construction noise and lighting away from the wetlands.", "green_space", "other", "long_valley", "mixed", "Protecting the wetland", "Buffer between works and Long Valley", "student", "en"],
  ["塱原好靚，但無障礙泊車位得一個，唔夠。", "green_space", "elderly_mobility", "long_valley", "concern", "Accessible access to nature park", "More accessible parking / shuttle", "caregiver", "zh"],
  ["The riverside promenade and cycle tracks are the best part of the plan.", "green_space", "student", "north_residential", "support", "Riverside promenade", "Deliver promenade early", "student", "en"],
  ["Worried the high-rises will block the view to Fung Kong Shan.", "green_space", "working_adult", "north_residential", "concern", "Visual corridors", "Building heights near hills", "worker", "en"],
  ["Please plant shade trees along the walk to the station, summer is brutal.", "green_space", "elderly_mobility", "town_centre", "concern", "Shade on walking routes", "Tree planting along station routes", "caregiver", "en"],
  ["Black-faced spoonbills are increasing at Long Valley. Development must not reverse that.", "green_space", "other", "long_valley", "concern", "Biodiversity gains", "Ecological monitoring", "student", "en"],

  ["Will there be enough primary school places when thousands of families move in?", "childcare_education", "family_children", "north_residential", "concern", "School places", "School opening timeline", "worker", "en"],
  ["幼稚園同托兒要同時開，雙職家庭好需要。", "childcare_education", "family_children", "town_centre", "concern", "Childcare for dual-income families", "Open nurseries with intake", "worker", "zh"],
  ["A library near the station would be a great study space.", "childcare_education", "student", "civic_hub", "support", "Library as study space", "Library opening hours", "student", "en"],
  ["Please add a secondary school close to the North Residential Area.", "childcare_education", "family_children", "north_residential", "neutral", "Secondary school location", "Secondary school siting", "worker", "en"],

  ["The care complex is right next to Fanling Highway. Noise barriers are essential.", "noise_environment", "elderly_mobility", "civic_hub", "concern", "Traffic noise at care complex", "Noise barriers near welfare complex", "caregiver", "en"],
  ["Construction dust from site formation is already affecting Kwu Tung South.", "noise_environment", "working_adult", "kwu_tung_south", "concern", "Construction dust", "Dust control on works sites", "worker", "en"],
  ["Helicopter noise from the firing range area is a problem at night.", "noise_environment", "other", "north_residential", "concern", "Aviation noise", "Noise from firing ranges", "worker", "en"],

  ["Will the subsidised flats near the station be affordable for young families?", "affordability_housing", "family_children", "town_centre", "concern", "Affordability of subsidised flats", "Price of subsidised housing", "worker", "en"],
  ["I'd love to work in the Business and Technology Park instead of commuting to Kowloon.", "employment", "working_adult", "business_park", "support", "Local jobs", "Timeline for business park", "worker", "en"],
  ["Small shops in Kwu Tung South may lose customers to the new mall.", "employment", "business", "kwu_tung_south", "concern", "Impact on existing shops", "Support for existing businesses", "worker", "en"],
  ["It's hard to find one place that tells us all this. More sessions at the community centre please.", "other", "other", "kwu_tung_south", "neutral", "Access to information", "More in-person briefings", "caregiver", "en"],
];

export function buildSeed(now = Date.now()): Feedback[] {
  const n = ROWS.length;
  return ROWS.map(([text, theme, stakeholder, zone, sentiment, concern, suggestedIssue, persona, lang], i) => ({
    id: `seed-${String(i + 1).padStart(3, "0")}`,
    // spread themes across time with a fixed permutation (7 is coprime with the row count)
    createdAt: new Date(now - (n - ((i * 7) % n)) * 17 * 3600_000).toISOString(),
    text,
    priorities: [],
    persona,
    lang,
    zone,
    theme,
    stakeholder,
    concern,
    sentiment,
    suggestedIssue,
    piiRedacted: false,
    classifiedBy: "rules",
    aiTheme: theme,
    inputMode: "text",
    reviewed: i % 3 === 0,
    synthetic: true,
  }));
}
