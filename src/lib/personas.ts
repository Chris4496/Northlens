import type { ConcernId, PersonaId, Topic } from "@/lib/types";

export interface Persona {
  id: PersonaId;
  label: { en: string; zh: string };
  blurb: { en: string; zh: string };
  lens: string;
  topicBoost: Topic[];
  sampleQuestions: { en: string[]; zh: string[] };
}

export const PERSONAS: Persona[] = [
  {
    id: "student",
    label: { en: "University student", zh: "大學生" },
    blurb: {
      en: "Commutes by public transport, budget-conscious, off-peak and late trips.",
      zh: "以公共交通通勤，預算有限，常有非繁忙時段及夜歸行程。",
    },
    lens: "a university student who relies on public transport, cares about journey time, interchanges, cost and late-evening trips",
    topicBoost: ["transport", "education", "employment"],
    sampleQuestions: {
      en: [
        "I live in Kwu Tung and take public transport to university. How could these developments affect my commute?",
        "When will the new station actually open?",
        "Where could I study or do sport locally?",
      ],
      zh: [
        "我住古洞，搭公共交通返大學。這些發展會怎樣影響我的通勤？",
        "新車站實際上何時啟用？",
        "區內有甚麼地方可以溫習或做運動？",
      ],
    },
  },
  {
    id: "worker",
    label: { en: "Working adult", zh: "在職人士" },
    blurb: {
      en: "Peak-hour commuter weighing jobs, housing and cross-district travel.",
      zh: "繁忙時間通勤，考慮工作、住屋及跨區交通。",
    },
    lens: "a working adult commuting at peak hours who cares about travel time to jobs across the New Territories and urban area, local employment and housing",
    topicBoost: ["transport", "employment", "housing"],
    sampleQuestions: {
      en: [
        "I'm considering moving to a new housing estate here. What would daily life look like?",
        "Will there be jobs nearby, or will I still commute to the city?",
        "What changes when the Northern Link opens?",
      ],
      zh: [
        "我考慮搬到這裡的新屋苑，日常生活會是怎樣？",
        "附近會有工作機會嗎？還是仍要出市區上班？",
        "北環綫通車後會有甚麼改變？",
      ],
    },
  },
  {
    id: "caregiver",
    label: { en: "Caregiver of an elderly parent", zh: "照顧年長父母的照顧者" },
    blurb: {
      en: "Lives with a parent who has limited mobility; step-free access and care services matter.",
      zh: "與行動不便的父母同住，重視無障礙通道及護理服務。",
    },
    lens: "a caregiver living with an elderly parent who has difficulty walking; cares about walking distance, step-free access, elderly services, healthcare and noise",
    topicBoost: ["accessibility", "elderly", "healthcare", "community"],
    sampleQuestions: {
      en: [
        "My mother has difficulty walking. How will the planned development affect us?",
        "What is still uncertain?",
        "Where is the nearest hospital going to be?",
      ],
      zh: [
        "我媽媽行動不便，規劃中的發展會對我們有甚麼影響？",
        "還有甚麼未確定？",
        "最近的醫院會在哪裡？",
      ],
    },
  },
];

export const PERSONA_BY_ID = new Map(PERSONAS.map((p) => [p.id, p]));

export const CONCERNS: { id: ConcernId; label: { en: string; zh: string }; topics: Topic[] }[] = [
  { id: "transport", label: { en: "Transport", zh: "交通" }, topics: ["transport", "crossborder"] },
  {
    id: "community",
    label: { en: "Community facilities", zh: "社區設施" },
    topics: ["community", "healthcare", "elderly", "education"],
  },
  {
    id: "accessibility",
    label: { en: "Accessibility", zh: "無障礙" },
    topics: ["accessibility", "elderly"],
  },
];

export const CONCERN_BY_ID = new Map(CONCERNS.map((c) => [c.id, c]));
