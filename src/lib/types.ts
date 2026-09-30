export type Lang = "en" | "zh";

export type Topic =
  | "transport"
  | "community"
  | "accessibility"
  | "healthcare"
  | "elderly"
  | "education"
  | "employment"
  | "green"
  | "housing"
  | "crossborder"
  | "environment"
  | "governance";

/**
 * How firm a piece of planning information is. Drives the
 * "confirmed vs proposal" distinction shown to residents.
 */
export type PlanStatus =
  | "completed"
  | "under_construction"
  | "planned"
  | "proposed"
  | "under_review"
  | "superseded";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  date: string;
}

export interface Chunk {
  id: string;
  sourceId: string;
  heading: string;
  headingZh: string;
  text: string;
  textZh: string;
  topics: Topic[];
  status: PlanStatus;
  placeIds: string[];
  timeline?: string;
}

export interface RetrievedChunk extends Chunk {
  score: number;
}

export type PersonaId = "student" | "worker" | "caregiver";
export type ConcernId = "transport" | "community" | "accessibility";

export interface AskRequest {
  question: string;
  persona: PersonaId;
  concern: ConcernId;
  lang: Lang;
}

export interface Claim {
  text: string;
  citations: string[];
  status: PlanStatus;
}

export interface Answer {
  summary: string;
  whatMayChange: Claim[];
  whyItMatters: Claim[];
  uncertain: Claim[];
  insufficientEvidence: boolean;
  placeIds: string[];
  chunks: RetrievedChunk[];
  sources: Source[];
  mode: "gemini" | "offline";
  retrieval: "pgvector" | "embeddings" | "keyword";
  droppedCitations: number;
}

export type Sentiment = "support" | "concern" | "mixed" | "neutral";

export type FeedbackTheme =
  | "accessible_transport"
  | "public_transport"
  | "healthcare"
  | "elderly_services"
  | "childcare_education"
  | "green_space"
  | "noise_environment"
  | "affordability_housing"
  | "employment"
  | "other";

export type Stakeholder =
  | "elderly_mobility"
  | "caregiver"
  | "student"
  | "working_adult"
  | "family_children"
  | "business"
  | "other";

export type ZoneId =
  | "town_centre"
  | "north_residential"
  | "long_valley"
  | "kwu_tung_south"
  | "civic_hub"
  | "business_park";

export interface FeedbackStructured {
  zone: ZoneId;
  theme: FeedbackTheme;
  stakeholder: Stakeholder;
  concern: string;
  sentiment: Sentiment;
  suggestedIssue: string;
}

export interface Feedback extends FeedbackStructured {
  id: string;
  createdAt: string;
  text: string;
  priorities: string[];
  persona: PersonaId;
  lang: Lang;
  piiRedacted: boolean;
  classifiedBy: "gemini" | "rules";
  /** Theme as first proposed by the classifier; differs from `theme` once a reviewer corrects it. */
  aiTheme: FeedbackTheme | null;
  inputMode: "text" | "voice";
  reviewed: boolean;
  synthetic: boolean;
}
