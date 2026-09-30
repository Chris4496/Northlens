import type { FeedbackTheme, Lang, PlanStatus, Sentiment, Stakeholder } from "@/lib/types";

type Dict = Record<string, { en: string; zh: string }>;

export const T = {
  brandTag: { en: "Kwu Tung North · pilot", zh: "古洞北 · 試點" },
  navResident: { en: "Explore the plan", zh: "了解規劃" },
  navDashboard: { en: "Community insight", zh: "社區洞察" },
  heroKicker: { en: "Northern Metropolis, in plain language", zh: "用淺白語言看北部都會區" },
  heroTitle: { en: "What does this plan mean for you?", zh: "這份規劃對你有甚麼影響？" },
  heroBody: {
    en: "NorthLens reads verified planning documents for Kwu Tung North and explains them for your situation — with a source beside every claim, and a clear line between what is confirmed and what is still a proposal.",
    zh: "NorthLens 閱讀古洞北的官方規劃文件，按你的處境解釋——每項說法旁均附來源，並清楚區分已確定事項與仍屬建議的內容。",
  },
  step1: { en: "Who are you?", zh: "你是誰？" },
  step2: { en: "What matters most?", zh: "你最關心甚麼？" },
  step3: { en: "Ask the plan", zh: "問問規劃" },
  location: { en: "Location", zh: "地點" },
  askPlaceholder: {
    en: "Ask in your own words, e.g. “How far will my mother need to walk to the station?”",
    zh: "用你自己的說法提問，例如「媽媽要走多遠才到車站？」",
  },
  ask: { en: "Ask", zh: "提問" },
  asking: { en: "Reading the sources…", zh: "正在閱讀資料…" },
  tryAsking: { en: "Try asking", zh: "試試問" },
  whatMayChange: { en: "What may change", zh: "可能出現的改變" },
  whyItMatters: { en: "Why it matters to you", zh: "對你的意義" },
  uncertain: { en: "What remains uncertain", zh: "仍未確定的事項" },
  sources: { en: "Sources", zh: "資料來源" },
  evidence: { en: "Evidence retrieved", zh: "檢索到的證據" },
  insufficient: {
    en: "The verified sources don't contain enough information to answer this confidently. Treat anything below as incomplete.",
    zh: "已核實資料未有足夠資訊可靠地回答此問題，以下內容或不完整。",
  },
  offlineNote: {
    en: "Offline mode: answer assembled directly from retrieved source passages (no Gemini key configured).",
    zh: "離線模式：答案直接由檢索到的原文段落組成（未設定 Gemini 金鑰）。",
  },
  mapTitle: { en: "Where this happens", zh: "發生在哪裡" },
  mapNote: { en: "Locations are indicative, not survey-accurate.", zh: "位置僅供示意，並非測量準確。" },
  scenarioTitle: { en: "Scenario explorer: living here", zh: "情境探索：在這裡生活" },
  scenarioBody: {
    en: "Considering a move to a future Kwu Tung North estate? Here is each daily need matched to what the plans say — not a prediction, just the plans seen from your front door.",
    zh: "考慮搬到未來的古洞北屋苑？以下把日常需要對應到規劃內容——不是預測，而是從你家門口看規劃。",
  },
  need: { en: "Daily need", zh: "日常需要" },
  planned: { en: "What the plans say", zh: "規劃內容" },
  feedbackTitle: { en: "Community voice", zh: "社區之聲" },
  feedbackBody: {
    en: "Tell planners what matters to you. Submissions are anonymous; personal details are removed automatically before anything is stored.",
    zh: "告訴規劃者你最重視甚麼。提交內容匿名，個人資料會在儲存前自動移除。",
  },
  priorities: { en: "What matters most to you?", zh: "你最重視甚麼？" },
  yourWords: { en: "In your own words", zh: "用你自己的話" },
  feedbackPlaceholder: {
    en: "e.g. “I support the new station, but getting from the housing estate to the station may still be difficult for my mother.”",
    zh: "例如「我支持新車站，但由屋苑去車站對我媽媽來說可能仍然困難。」",
  },
  submit: { en: "Submit feedback", zh: "提交意見" },
  submitting: { en: "Structuring your feedback…", zh: "正在整理你的意見…" },
  thanks: { en: "Thank you — here is how your feedback was understood", zh: "謝謝——以下是系統對你意見的理解" },
  thanksNote: {
    en: "Planners see this category, never your identity. It now appears on the community-insight dashboard.",
    zh: "規劃者只會看到分類，不會看到你的身份。你的意見已顯示在社區洞察儀表板。",
  },
  seeDashboard: { en: "See it on the dashboard →", zh: "在儀表板查看 →" },
  piiRemoved: { en: "Personal details were removed before storage.", zh: "個人資料已在儲存前移除。" },
  dashKicker: { en: "For planners & community organisations", zh: "供規劃者及社區組織使用" },
  dashTitle: { en: "Kwu Tung North — what residents are telling us", zh: "古洞北——居民告訴我們甚麼" },
  responses: { en: "responses", zh: "份回應" },
  concernShare: { en: "Share of responses by theme", zh: "各主題回應比例" },
  byStakeholder: { en: "Who is responding", zh: "回應者是誰" },
  emerging: { en: "Emerging concern", zh: "浮現中的關注" },
  hotspots: { en: "Geographic hotspots", zh: "地區熱點" },
  representative: { en: "Representative feedback", zh: "代表性意見" },
  recent: { en: "Latest submissions — human review", zh: "最新提交——人工覆核" },
  reviewNote: {
    en: "AI proposes a category; a person confirms or corrects it. Original text is always preserved.",
    zh: "AI 建議分類，由人確認或修正。原文一律保留。",
  },
  confirm: { en: "Confirm", zh: "確認" },
  reviewed: { en: "Reviewed", zh: "已覆核" },
  syntheticNote: {
    en: "Includes clearly-flagged synthetic seed responses for demonstration. Live submissions are marked NEW.",
    zh: "包括已標示的示範用合成回應。實時提交標示為「新」。",
  },
  sentiment: { en: "Sentiment", zh: "情緒" },
  methodology: {
    en: "Method: each response is classified into one theme, one stakeholder group and one zone. Shares are simple counts. Humans make final interpretations.",
    zh: "方法：每份回應歸入一個主題、一個持份者組別及一個地區。比例為簡單計數，最終解讀由人作出。",
  },
  guardrails: {
    en: "NorthLens explains and organises. It never approves development, gives legal advice, predicts compensation or claims to speak for the community.",
    zh: "NorthLens 只作解釋和整理，不會批准發展、提供法律意見、預測補償或聲稱代表社區。",
  },
  closing: {
    en: "NorthLens doesn't ask AI to design Hong Kong. It uses AI to help Hong Kong design with its communities.",
    zh: "NorthLens 不是讓 AI 設計香港，而是用 AI 幫助香港與社區一起規劃。",
  },
  new: { en: "NEW", zh: "新" },
  zone: { en: "Area", zh: "地區" },
  theme: { en: "Theme", zh: "主題" },
  stakeholder: { en: "Stakeholder", zh: "持份者" },
  concern: { en: "Concern", zh: "關注" },
  suggestedIssue: { en: "Suggested issue", zh: "建議議題" },
  exportConsultation: { en: "Consultation report", zh: "諮詢報告" },
  exportFeedback: { en: "Feedback report", zh: "意見報告" },
  exportNote: {
    en: "Exports include only responses a person has confirmed in the review queue. Unreviewed AI classifications are excluded.",
    zh: "匯出只包括已在覆核隊列中由人確認的回應，未覆核的 AI 分類不會列入。",
  },
  exportPrint: { en: "Print / save as PDF", zh: "列印／另存 PDF" },
  exportCsv: { en: "Download CSV", zh: "下載 CSV" },
  exportBack: { en: "Back to dashboard", zh: "返回儀表板" },
  exportEmpty: {
    en: "No confirmed responses match these filters. Confirm items in the review queue, then export.",
    zh: "沒有符合篩選條件的已確認回應。請先在覆核隊列中確認，再匯出。",
  },
  seedFeedback: { en: "Use the demo feedback", zh: "使用示範意見" },
  status: { en: "Status", zh: "狀態" },
} satisfies Dict;

export type TKey = keyof typeof T;

export function t(key: TKey, lang: Lang): string {
  return T[key][lang];
}

export const STATUS_LABEL: Record<PlanStatus, { en: string; zh: string }> = {
  completed: { en: "Completed", zh: "已完成" },
  under_construction: { en: "Under construction", zh: "施工中" },
  planned: { en: "Planned", zh: "已規劃" },
  proposed: { en: "Proposal · may change", zh: "建議·或會改變" },
  under_review: { en: "Under review", zh: "檢討中" },
  superseded: { en: "Superseded", zh: "已被取代" },
};

export const THEME_LABEL: Record<FeedbackTheme, { en: string; zh: string }> = {
  accessible_transport: { en: "Accessible transport", zh: "無障礙交通" },
  public_transport: { en: "Public transport", zh: "公共交通" },
  healthcare: { en: "Healthcare", zh: "醫療" },
  elderly_services: { en: "Elderly services", zh: "長者服務" },
  childcare_education: { en: "Childcare & schools", zh: "托兒及學校" },
  green_space: { en: "Green space & biodiversity", zh: "綠化及生物多樣性" },
  noise_environment: { en: "Noise & environment", zh: "噪音及環境" },
  affordability_housing: { en: "Housing & affordability", zh: "住屋及負擔能力" },
  employment: { en: "Employment", zh: "就業" },
  other: { en: "Other", zh: "其他" },
};

export const STAKEHOLDER_LABEL: Record<Stakeholder, { en: string; zh: string }> = {
  elderly_mobility: { en: "Elderly / mobility-impaired", zh: "長者／行動不便人士" },
  caregiver: { en: "Caregiver", zh: "照顧者" },
  student: { en: "Student", zh: "學生" },
  working_adult: { en: "Working adult", zh: "在職人士" },
  family_children: { en: "Family with children", zh: "有子女家庭" },
  business: { en: "Small business", zh: "小商戶" },
  other: { en: "Other", zh: "其他" },
};

export const SENTIMENT_LABEL: Record<Sentiment, { en: string; zh: string }> = {
  support: { en: "Support", zh: "支持" },
  concern: { en: "Concern", zh: "關注" },
  mixed: { en: "Mixed", zh: "混合" },
  neutral: { en: "Neutral", zh: "中性" },
};

export const PRIORITIES: { id: string; en: string; zh: string }[] = [
  { id: "shorter_commute", en: "Shorter commute", zh: "縮短通勤" },
  { id: "elderly_facilities", en: "Elderly facilities", zh: "長者設施" },
  { id: "childcare", en: "Childcare", zh: "托兒服務" },
  { id: "affordability", en: "Affordability", zh: "負擔能力" },
  { id: "noise", en: "Less noise", zh: "減少噪音" },
  { id: "green_space", en: "Green space", zh: "綠化空間" },
  { id: "biodiversity", en: "Biodiversity", zh: "生物多樣性" },
  { id: "employment", en: "Local jobs", zh: "本區就業" },
  { id: "accessibility", en: "Step-free access", zh: "無障礙通道" },
  { id: "healthcare", en: "Healthcare nearby", zh: "就近醫療" },
];
