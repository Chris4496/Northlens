# NorthLens 北覽

A GenAI participatory-planning prototype for the Northern Metropolis, piloted on the **Kwu Tung North** New Development Area.

> NorthLens doesn't ask AI to design Hong Kong. It uses AI to help Hong Kong design with its communities.

- **Resident view (`/`)**: pick a persona and concern, then ask the plan in English or Traditional Chinese. Answers are grounded in 26 verified passages from 15 official sources. Every claim is cited and tagged by status (completed, under construction, planned, proposal, under review, superseded). The map highlights the places mentioned. Also includes the Scenario Explorer and Community Voice feedback.
- **Voice feedback**: residents can speak in Cantonese or English, including a mix of both. Gemini transcribes the recording into the text box so the resident can check it before submitting. Audio is never stored. Silent recordings are blocked in the browser, because the model invents speech when given silence.
- **Planner view (`/dashboard`)**: submissions are anonymised and classified into theme, stakeholder, area, sentiment and suggested issue. The dashboard includes:
  - Filters for period, group, area, and live versus demo data.
  - Headline numbers: concern rate, share from vulnerable groups, review coverage, how often reviewers agree with the AI's category, and voice share.
  - A **priority issues** table showing volume, sentiment, a 6-week trend, the 14-day change, vulnerable share, and whether related plan items are still open to change. The priority score uses a transparent formula.
  - An issue drill-down with suggested actions, affected groups, areas, related plan items with sources, and quotes.
  - A heatmap of which groups worry about which issues, and the hotspot map.
  - One on-demand **AI briefing**. It is written from the computed statistics, and any statement whose numbers aren't in those statistics is dropped.
  - A human-review queue.

## Run it

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev
```

It works with **no keys at all**:

| Missing | Fallback |
| --- | --- |
| `GEMINI_API_KEY` | Keyword (BM25-style, CJK bigram) retrieval + template answers composed only from retrieved passages; rule-based feedback classifier; voice input and the AI briefing are hidden (all dashboard statistics still work) |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | In-memory Gemini embeddings (if key present), and feedback stored in `.data/feedback.json` |

The header status dot shows which mode is live.

### Full mode

1. Get a Gemini key from Google AI Studio and set `GEMINI_API_KEY`.
2. Create a Supabase project and apply the files in `supabase/migrations/` in order. They enable pgvector, create the `kb_chunks` and `feedback` tables with RLS on and no public policies, add the `match_kb_chunks` RPC, and add the `input_mode` and `ai_theme` feedback columns.
3. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. These are server-only; never prefix them with `NEXT_PUBLIC_`.
4. `npm run ingest` embeds the knowledge base into `kb_chunks`.

The feedback table auto-seeds 50 synthetic responses when empty. They are flagged `synthetic` in the data and the UI.

## Guardrails

- Gemini may only cite passage IDs it was given. Citations outside the retrieved set are dropped. Claims whose numbers don't appear in the cited passage are dropped.
- Each claim's status is the weakest status among its sources, so a proposal is never presented as confirmed.
- If evidence is thin, the answer says so rather than guessing.
- Personal details (names, phone numbers, HKID, emails, flat addresses) are redacted before classification or storage.
- The AI proposes categories; people confirm them. Original text is always kept.

## Demo script (≈3 min)

1. `/`: persona **Caregiver of an elderly parent**, concern **Accessibility**.
2. Ask *"My mother has difficulty walking. How will the planned development affect us?"* The answer shows what may change, why it matters, and what is uncertain, with numbered citations and the map.
3. Ask *"What is still uncertain?"* The answer surfaces proposals, superseded plans and items under review.
4. Community voice: tick *Step-free access*, click **Use the demo feedback**, then **Submit**. The submission is classified as Accessible transport, First/last-mile accessibility, Elderly / mobility-impaired.
5. Open `/dashboard`. The **NEW** submission tops the review table, and the emerging concern reads *Accessible transport among elderly / mobility-impaired respondents*.
6. Toggle **繁** to show the same flow in Traditional Chinese.

Before a demo, delete `.data/` to reset to the synthetic seed.

## Stack

Next.js 16 (App Router, API routes) · React 19 · Tailwind v4 · `@google/genai` (Gemini + `gemini-embedding-001`) · Supabase Postgres + pgvector · Leaflet with the HKSAR Lands Department basemap.

Knowledge-base passages are paraphrased from public Government, Town Planning Board and MTR documents; see `src/lib/kb/sources.ts`. This is a prototype: plans change, so always check the latest official release.
