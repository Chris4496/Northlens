import type { TourStep } from "@/components/tour";

export const RESIDENT_TOUR: TourStep[] = [
  {
    title: { en: "Welcome to NorthLens", zh: "歡迎使用 NorthLens 北覽" },
    body: {
      en: "Plain-language answers about the Kwu Tung North development, drawn only from official documents.",
      zh: "用淺白語言解答古洞北發展的問題，內容只取自官方文件。",
    },
    points: [
      { en: "See what the plan means for someone like you", zh: "了解規劃對像你這樣的人有甚麼影響" },
      { en: "Know what is confirmed and what is still only a proposal", zh: "分清哪些已確定、哪些仍屬建議" },
      { en: "Tell planners what matters to you, by typing or speaking", zh: "以文字或語音，告訴規劃者你關心甚麼" },
    ],
  },
  {
    target: "persona",
    title: { en: "1 · Tell us who you are", zh: "1 · 告訴我們你是誰" },
    body: {
      en: "Pick the profile closest to you, then what matters most. Answers focus on what affects that person, such as step-free routes for a caregiver.",
      zh: "揀最接近你的身份，再揀最關心的事。答案會集中講對該身份的影響，例如照顧者會看到無障礙路線。",
    },
  },
  {
    target: "ask",
    title: { en: "2 · Ask the plan", zh: "2 · 問問規劃" },
    body: {
      en: "Ask in your own words in English or Chinese, or tap a suggested question. Every statement has a numbered source and a label such as “Planned” or “Proposal · may change”.",
      zh: "用中文或英文自由提問，或按建議問題。每項說法都附編號來源及標籤，例如「已規劃」或「建議・可能改變」。",
    },
  },
  {
    target: "map",
    title: { en: "3 · See where it happens", zh: "3 · 看看在哪裡發生" },
    body: {
      en: "The map highlights the stations, facilities and routes mentioned in your answer. The dashed red line is the Northern Link, which is not built yet.",
      zh: "地圖會標示答案提及的車站、設施及路線。紅色虛線是尚未興建的北環綫。",
    },
  },
  {
    target: "scenario",
    title: { en: "4 · Imagine living here", zh: "4 · 想像住在這裡" },
    body: {
      en: "The scenario explorer matches everyday needs such as transport, healthcare, elderly care and schools to what the plans say, with the status of each item.",
      zh: "情境探索把日常需要，例如交通、醫療、安老及學校，對應到規劃內容，並標示每項的進度。",
    },
  },
  {
    target: "voice",
    title: { en: "5 · Have your say", zh: "5 · 發表意見" },
    body: {
      en: "Tick what matters, then type or press Speak and talk in Cantonese or English. Personal details are removed automatically. Planners see your view grouped with others on the community dashboard.",
      zh: "剔選你關心的事，然後輸入文字，或按「用講嘅」以廣東話或英文發言。個人資料會自動移除，規劃者會在社區洞察頁看到歸類後的意見。",
    },
  },
];

export const DASHBOARD_TOUR: TourStep[] = [
  {
    title: { en: "The community insight dashboard", zh: "社區洞察儀表板" },
    body: {
      en: "For planners and community groups: what residents are saying, who is saying it, and where feedback can still change the plan.",
      zh: "供規劃者及社區團體使用：居民在說甚麼、誰在說，以及意見仍可影響規劃的地方。",
    },
    points: [
      { en: "Statistics are calculated directly from the responses", zh: "統計數字直接由回應計算" },
      { en: "AI is used only to sort feedback and draft an optional briefing", zh: "AI 只用於分類意見及按需要草擬簡報" },
      {
        en: "Confirm responses, then export a consultation report or a feedback CSV. Only confirmed rows are included.",
        zh: "確認回應後，可匯出諮詢報告或意見 CSV。只包括已確認的列。",
      },
    ],
  },
  {
    target: "filters",
    title: { en: "1 · Narrow it down", zh: "1 · 篩選" },
    body: {
      en: "Filter by period, group, area, or live responses only. Everything below updates straight away.",
      zh: "按時間、群組、地點或只看實時回應篩選，下面所有內容會即時更新。",
    },
  },
  {
    target: "kpis",
    title: { en: "2 · The headline numbers", zh: "2 · 重點數字" },
    body: {
      en: "How many people are concerned, how many come from vulnerable groups, how much has been checked by a person, and how often reviewers agree with the AI’s category.",
      zh: "多少人表達關注、多少來自弱勢群組、多少已經人工覆核，以及覆核者有幾常同意 AI 的分類。",
    },
  },
  {
    target: "priorities",
    title: { en: "3 · What to act on first", zh: "3 · 先處理甚麼" },
    body: {
      en: "Issues are ranked by concern, weighted towards vulnerable groups and rising trends. “Open to change” means related plan items are still proposed or under review, so feedback can still shape them. Click a row to see the evidence.",
      zh: "議題按關注程度排序，並加重弱勢群組及上升趨勢。「仍可影響」表示相關規劃項目仍屬建議或檢討中，意見仍可影響結果。點選一行查看證據。",
    },
  },
  {
    target: "detail",
    title: { en: "4 · The evidence behind an issue", zh: "4 · 議題背後的證據" },
    body: {
      en: "What residents ask for, who is raising it, where, which plan items it relates to, and what people actually said. The map can show this issue on its own.",
      zh: "居民的要求、由誰提出、在哪裡、涉及哪些規劃項目，以及居民的原話。地圖可只顯示此議題。",
    },
  },
  {
    target: "briefing",
    title: { en: "5 · An optional AI briefing", zh: "5 · 可選的 AI 簡報" },
    body: {
      en: "Turns the statistics into three findings and follow-up questions. Numbers are checked against the data, but it is a draft. Verify it before you use it.",
      zh: "把統計整理成三項重點及跟進問題。數字已與數據核對，但這只是草稿，使用前請核實。",
    },
  },
  {
    target: "review",
    title: { en: "6 · A person has the final say", zh: "6 · 最終由人決定" },
    body: {
      en: "The AI suggests a category for each response. Confirm it or correct it here. The original words are always kept.",
      zh: "AI 為每份回應建議分類，你可在此確認或修正，原文會一直保留。",
    },
  },
  {
    target: "export",
    title: { en: "7 · Export what you have confirmed", zh: "7 · 匯出已確認的內容" },
    body: {
      en: "The consultation report is a briefing you can print or save as a PDF. The feedback report is the full list, with a CSV for spreadsheets. Both use only responses a person has confirmed.",
      zh: "諮詢報告是可供列印或另存 PDF 的簡報。意見報告是完整列表，並可下載 CSV。兩者都只使用已由人確認的回應。",
    },
  },
];
