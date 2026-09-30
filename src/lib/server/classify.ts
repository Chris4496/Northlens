import "server-only";
import type { FeedbackStructured, FeedbackTheme, PersonaId, Sentiment, Stakeholder, ZoneId } from "@/lib/types";
import { getGemini } from "./clients";
import { config } from "./config";

const THEMES: FeedbackTheme[] = [
  "accessible_transport",
  "public_transport",
  "healthcare",
  "elderly_services",
  "childcare_education",
  "green_space",
  "noise_environment",
  "affordability_housing",
  "employment",
  "other",
];
const STAKEHOLDERS: Stakeholder[] = [
  "elderly_mobility",
  "caregiver",
  "student",
  "working_adult",
  "family_children",
  "business",
  "other",
];
const ZONES: ZoneId[] = [
  "town_centre",
  "north_residential",
  "long_valley",
  "kwu_tung_south",
  "civic_hub",
  "business_park",
];
const SENTIMENTS: Sentiment[] = ["support", "concern", "mixed", "neutral"];

const SCHEMA = {
  type: "object",
  properties: {
    zone: { type: "string", enum: ZONES },
    theme: { type: "string", enum: THEMES },
    stakeholder: { type: "string", enum: STAKEHOLDERS },
    concern: { type: "string", description: "3–6 word English label for the specific concern" },
    sentiment: { type: "string", enum: SENTIMENTS },
    suggestedIssue: { type: "string", description: "Short English issue planners could act on" },
  },
  required: ["zone", "theme", "stakeholder", "concern", "sentiment", "suggestedIssue"],
};

const PROMPT = `Classify one piece of resident feedback about the Kwu Tung North New Development Area (Hong Kong).
Pick exactly one value for each enum. Zones: town_centre (station, town plaza, public transport interchange, housing next to the station), north_residential, long_valley (Long Valley Nature Park, Ho Sheung Heung, Yin Kong), kwu_tung_south (south of Fanling Highway), civic_hub (library, sports centre, Multi-welfare Services Complex), business_park.
Use accessible_transport when the issue is physically getting to or using transport (walking distance, lifts, wheelchairs, footbridges); public_transport for service, frequency, journey time or routes.
stakeholder = who is affected as described in the text; if a caregiver speaks about an elderly or disabled relative, choose elderly_mobility.
Describe only what the text says. Do not infer identity details beyond the text. Feedback may be English or Chinese; always output labels in English.`;

export async function classifyFeedback(
  text: string,
  persona: PersonaId,
  priorities: string[],
): Promise<{ result: FeedbackStructured; by: "gemini" | "rules" }> {
  const ai = getGemini();
  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: config.geminiModel,
        contents: `Resident persona chosen in the app: ${persona}. Priorities ticked: ${priorities.join(", ") || "none"}.\nFeedback: """${text}"""`,
        config: {
          systemInstruction: PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: SCHEMA,
          temperature: 0,
        },
      });
      const r = JSON.parse(res.text ?? "{}");
      if (
        THEMES.includes(r.theme) &&
        STAKEHOLDERS.includes(r.stakeholder) &&
        ZONES.includes(r.zone) &&
        SENTIMENTS.includes(r.sentiment)
      ) {
        return { result: r, by: "gemini" };
      }
    } catch (err) {
      console.warn("[classify] Gemini failed, using rules", (err as Error).message);
    }
  }
  return { result: classifyByRules(text, persona, priorities), by: "rules" };
}

const has = (s: string, re: RegExp) => re.test(s);

export function classifyByRules(text: string, persona: PersonaId, priorities: string[]): FeedbackStructured {
  const s = text.toLowerCase();
  const p = new Set(priorities);

  const mobility =
    has(s, /wheelchair|walk|mobility|lift|elevator|ramp|step|footbridge|stairs|distance|getting (from|to)|輪椅|行動不便|步行|走路|升降機|天橋|樓梯|扶手|距離|點去|去車站/) ||
    (has(s, /mother|father|parent|grand|elderly|媽|爸|父母|長者|婆|公公/) && has(s, /difficult|hard|struggle|困難|吃力|辛苦/)) ||
    p.has("accessibility");
  const transport = has(s, /station|rail|train|mtr|bus|minibus|commute|journey|interchange|northern link|車站|鐵路|港鐵|巴士|小巴|通勤|車程|北環/);

  let theme: FeedbackTheme = "other";
  if (mobility && transport) theme = "accessible_transport";
  else if (transport || p.has("shorter_commute")) theme = "public_transport";
  else if (has(s, /hospital|clinic|doctor|medical|health|醫院|診所|醫生|覆診/) || p.has("healthcare")) theme = "healthcare";
  else if (has(s, /elderly|care home|day care|senior|長者|老人|安老|護理/) || p.has("elderly_facilities")) theme = "elderly_services";
  else if (has(s, /school|kindergarten|childcare|nursery|學校|幼稚園|托兒/) || p.has("childcare")) theme = "childcare_education";
  else if (has(s, /park|green|tree|bird|long valley|wetland|biodivers|公園|綠化|塱原|雀鳥|濕地/) || p.has("green_space") || p.has("biodiversity")) theme = "green_space";
  else if (has(s, /noise|construction|dust|air|噪音|工程|塵/) || p.has("noise")) theme = "noise_environment";
  else if (has(s, /rent|price|afford|housing|flat|租|樓價|負擔|公屋|居屋/) || p.has("affordability")) theme = "affordability_housing";
  else if (has(s, /job|work|employ|business|shop|工作|就業|生意|店/) || p.has("employment")) theme = "employment";
  else if (mobility) theme = "accessible_transport";

  let stakeholder: Stakeholder =
    persona === "student" ? "student" : persona === "worker" ? "working_adult" : "caregiver";
  if (has(s, /mother|father|parent|grand|elderly|wheelchair|媽|爸|父母|長者|婆|公公|輪椅/)) stakeholder = "elderly_mobility";
  else if (has(s, /kid|child|son|daughter|baby|仔|女兒|小朋友|子女/)) stakeholder = "family_children";
  else if (has(s, /my shop|my business|restaurant|生意|店舖/)) stakeholder = "business";

  let zone: ZoneId = "town_centre";
  if (has(s, /long valley|ho sheung heung|yin kong|塱原|河上鄉|燕崗/)) zone = "long_valley";
  else if (has(s, /kwu tung south|fanling highway|古洞南|粉嶺公路/)) zone = "kwu_tung_south";
  else if (has(s, /library|sports centre|welfare|care home|圖書館|體育館|福利/)) zone = "civic_hub";
  else if (has(s, /north residential|north estate|北部住宅/)) zone = "north_residential";
  else if (has(s, /technology park|business park|科技園/)) zone = "business_park";

  const pos = has(s, /support|great|useful|welcome|good|happy|glad|支持|幾好|很好|方便|歡迎|期待/);
  const neg = has(s, /concern|worr|difficult|hard|far|lack|not enough|delay|problem|afraid|擔心|困難|太遠|不足|延誤|問題|唔夠|怕/);
  const sentiment: Sentiment = pos && neg ? "mixed" : neg ? "concern" : pos ? "support" : "neutral";

  const LABELS: Record<FeedbackTheme, [string, string]> = {
    accessible_transport: ["First/last-mile accessibility", "Walking distance and step-free route to station"],
    public_transport: ["Journey time and service levels", "Interim transport before rail opens"],
    healthcare: ["Distance to hospital services", "Local healthcare provision after hospital change"],
    elderly_services: ["Elderly care capacity", "Timing of elderly services vs population intake"],
    childcare_education: ["School and childcare places", "Timely opening of schools"],
    green_space: ["Protecting green and ecological space", "Access to Long Valley and open space"],
    noise_environment: ["Construction and traffic noise", "Noise mitigation near homes"],
    affordability_housing: ["Housing affordability", "Mix of subsidised housing"],
    employment: ["Local job opportunities", "Jobs near new housing"],
    other: ["General comment", "Needs human review"],
  };
  const [concern, suggestedIssue] = LABELS[theme];
  return { zone, theme, stakeholder, concern, sentiment, suggestedIssue };
}
