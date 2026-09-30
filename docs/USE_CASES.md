# NorthLens use cases

Each use case is marked:

- **Works today**: the current MVP (Kwu Tung North, three personas, two views) already supports it.
- **Extension**: a suggested next step that builds on the same retrieval, citation and feedback pipeline.

---

## A. Residents and prospective residents

### A1. Caregiver checking step-free access — *Works today*

**Who:** An adult living with a parent who has limited mobility.
**Situation:** They hear that Kwu Tung Station is coming and want to know if their mother can actually get there.

**Flow**
1. Choose persona *Caregiver of an elderly parent* and concern *Accessibility*.
2. Ask: *"My mother has difficulty walking. How will the planned development affect us?"*
3. Read the answer in three parts: what may change (car-free Town Centre, elderly services, homes within 500 m of the station), why it matters for her, and what is uncertain (footbridges across Fanling Highway are only proposed; lifts aren't specified).
4. Follow up: *"What is still uncertain?"*
5. Submit feedback: *"I support the new station, but getting from the housing estate to the station may still be difficult for my mother."*

**Value:** The resident sees a clear line between what is confirmed and what is still a proposal. The planner receives structured feedback: Accessible transport, First/last-mile, Elderly.

### A2. University student weighing commute and cost — *Works today*

**Who:** A student deciding whether to move with family into a new public housing estate.

**Questions**
- *"How will I get to the rest of Hong Kong once the station opens?"*
- *"When will the Northern Link open, and is the date confirmed?"*

**Value:** Answers separate the East Rail Line station (under construction, 2027) from the Northern Link phasing (proposed, may change), so the student doesn't plan around a date that isn't guaranteed.

### A3. Working adult comparing jobs and housing — *Works today*

**Who:** A peak-hour commuter considering a move to the Northern Metropolis.

**Flow:** Uses the **Scenario Explorer** ("living here") to scan transport, employment, healthcare and green space side by side. Each row is linked to a cited passage and a status chip.

**Value:** A single screen replaces reading several Government, Town Planning Board and MTR documents.

### A4. Family asking about healthcare — *Works today*

**Question:** *"Where is the nearest hospital going to be?"*

**Value:** Shows why grounding matters. The original Kwu Tung North hospital plan was **superseded** by the Ngau Tam Mei proposal, and the Area 28 reservation is **under review**. An unguarded chatbot might repeat the old plan; NorthLens tags it as superseded and cites the LegCo reply.

### A5. Cantonese-first elderly resident — *Works today (text + voice feedback)* / *Extension (voice questions, read-aloud)*

**Today:** Toggle to 繁. Questions and answers work fully in Traditional Chinese. Feedback can be **spoken** in Cantonese, including Cantonese mixed with English (e.g. "天橋一定要有 lift"). The resident sees the transcript and can edit it before submitting.
**Extension:** Voice for asking questions too, read-aloud answers, and a larger-text mode.

### A6. Village resident affected by land resumption — *Extension, with guardrails*

**Question:** *"Will my village house be affected?"*

**Approach:** Answer only from published zoning (the Outline Development Plan), point to the official enquiry channels, and state explicitly that NorthLens does **not** predict compensation or give legal advice. This matches the guardrail shown on every page.

---

## B. Planners and government teams

### B1. Reading early signals from engagement — *Works today*

**Who:** A planner preparing for a consultation round.

**Flow:** Open `/dashboard` to see:
- theme shares
- who is responding
- hotspot areas
- the **emerging concern**, meaning the theme × stakeholder pair with the most concern, weighted towards recent submissions

**Value:** Instead of reading hundreds of free-text submissions, the planner sees that "Accessible transport among elderly / mobility-impaired respondents" is rising, and reads representative quotes.

### B2. Human-in-the-loop review — *Works today*

**Flow:** In the review table, the AI's proposed theme is shown beside the original text. A reviewer confirms it or corrects it from a dropdown. Reviewed rows are marked, and the original text is never changed.

**Value:** A defensible audit trail, because a person signs off every category the AI assigns.

### B3. Consultation report drafting — *Extension*

Generate a draft "what we heard" summary per theme. It would be built only from reviewed submissions, quoting counts and representative (anonymised) quotes, and exported to Word/PDF for the formal consultation report.

### B4. Knowledge-base freshness check — *Extension*

When a new press release, Town Planning Board paper or LegCo reply is ingested, flag existing passages whose status may have changed (e.g. *proposed → planned*). A person then approves the update before residents see it.

---

## C. NGOs, social workers and district groups

### C1. Outreach with elderly and low-literacy residents — *Works today*

**Who:** A social worker at an elderly centre.

**Flow:** Sits with residents and asks their questions in Cantonese or English. Shows the map highlighting the places mentioned. Submits each resident's concern anonymously on their behalf; names, phone numbers and HKID numbers are removed automatically.

**Value:** Brings in voices that rarely reach formal consultations, in a form planners can aggregate.

### C2. Evidence for advocacy — *Works today (manual)* / *Extension (export)*

**Today:** An NGO can point to the dashboard's share figures and cited passages, e.g. "footbridges are only proposed and lift provision isn't specified."
**Extension:** A CSV/PDF export of aggregated, anonymised results per theme, which an NGO can attach to a Town Planning Board representation.

### C3. Environmental groups monitoring Long Valley — *Works today (Q&A)* / *Extension (tracking)*

**Question:** *"How will the development affect Long Valley?"* The answer cites the Nature Park passages.
**Extension:** Filter the dashboard for biodiversity and green-space feedback, and track it over time.

---

## D. Education and public understanding

### D1. Secondary-school or university civic lessons — *Extension*

A classroom mode where students explore a real district plan. They compare what is confirmed with what is still proposed, and submit mock feedback to a separate sandbox dashboard, not the live one.

### D2. Journalists fact-checking claims — *Works today*

Ask *"Is the Kwu Tung North hospital still going ahead?"* and get a status-tagged answer with a link to the official source. This is quicker than searching across departments.

---

## E. Scaling beyond the pilot

| Next step | What changes | What stays the same |
| --- | --- | --- |
| Add San Tin Technopole, Ngau Tam Mei, Hung Shui Kiu | New sources, passages and places | Retrieval, citation checks, dashboard |
| More personas (ethnic minority residents, small business owners, farmers) | New persona lens, sample questions, topic boosts | Answer structure |
| More languages (Simplified Chinese, Urdu, Nepali, Tagalog) | UI strings plus answer language | Knowledge base stays in English and Traditional Chinese |
| Link to formal consultations | Tag feedback to a specific consultation paper | Anonymisation and human review |

---

## What NorthLens will not do

These limits apply to every use case above:

- It does not approve or reject development.
- It does not give legal advice or predict compensation.
- It does not claim to speak for the community. Aggregates show who responded, and synthetic demo data is clearly labelled.
- It does not present a proposal as confirmed. A claim takes the weakest status among its sources.
