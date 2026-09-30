import type { Source } from "@/lib/types";

export const SOURCES: Source[] = [
  {
    id: "hyd-nol",
    title: "Northern Link Project",
    publisher: "Highways Department",
    url: "https://www.hyd.gov.hk/en/our_projects/railway_projects/nol/index.html",
    date: "2025",
  },
  {
    id: "mtr-ktu",
    title: "Kwu Tung Station",
    publisher: "MTR Corporation – Northern Link Project",
    url: "https://mtrnorthernlink.hk/en/kwu-tung-station",
    date: "2025",
  },
  {
    id: "mtr-topout",
    title:
      "Kwu Tung Station on the East Rail Line topped out, targeting completion in 2027 (PR081/25)",
    publisher: "MTR Corporation",
    url: "https://mtrnorthernlink.hk/storage/pdf/press_release/PR-25-081-E.pdf",
    date: "2025-11-19",
  },
  {
    id: "isd-nol-scheme",
    title: "Chief Executive in Council approves railway scheme of Northern Link Main Line",
    publisher: "HKSAR Government press release",
    url: "https://www.info.gov.hk/gia/general/202504/08/P2025040800261p.htm",
    date: "2025-04-08",
  },
  {
    id: "mtr-nol-explained",
    title: "The Northern Link Explained",
    publisher: "MTR Corporation – Northern Link Project",
    url: "https://mtrnorthernlink.hk/en/explained",
    date: "2025",
  },
  {
    id: "cedd-ktnfln",
    title: "Kwu Tung North and Fanling North New Development Area – Project Background",
    publisher: "Civil Engineering and Development Department",
    url: "https://ktnfln-nda.hk/eng/project_background",
    date: "2026",
  },
  {
    id: "ktnfln-about",
    title: "Kwu Tung North / Fanling North NDAs – About the Project",
    publisher: "Planning Department & CEDD",
    url: "https://www.ktnfln-ndas.gov.hk/en/text-version/2-1-3-about_project.php",
    date: "study stage",
  },
  {
    id: "pland-odp",
    title: "Kwu Tung North Outline Development Plan No. D/KTN/1A – Explanatory Statement",
    publisher: "Planning Department",
    url: "https://www.pland.gov.hk/file/resources/plan_schedules/departmental_plans/draft/pdf/D_KTN_1A_en.pdf",
    date: "draft",
  },
  {
    id: "devb-467",
    title: "My Blog: Kwu Tung North / Fanling North New Development Areas",
    publisher: "Development Bureau",
    url: "https://www.devb.gov.hk/en/home/my_blog/index_id_467.html",
    date: "2021",
  },
  {
    id: "devb-1497",
    title: "My Blog: Multi-welfare Services Complex in Kwu Tung North",
    publisher: "Development Bureau",
    url: "https://www.devb.gov.hk/en/home/my_blog/index_id_1497.html",
    date: "2024",
  },
  {
    id: "legco-lcq17",
    title: "LCQ17: Hospitals in Northern Metropolis",
    publisher: "HKSAR Government press release (LegCo reply)",
    url: "https://www.info.gov.hk/gia/general/202412/11/P2024121100274.htm",
    date: "2024-12-11",
  },
  {
    id: "lvnp",
    title: "Long Valley Nature Park – Background and History",
    publisher: "Agriculture, Fisheries and Conservation Department",
    url: "https://www.lvnp.gov.hk/en/background_n_history.html",
    date: "2024",
  },
  {
    id: "afcd-lvnp",
    title: "Long Valley Nature Park – Visitor Information",
    publisher: "Agriculture, Fisheries and Conservation Department",
    url: "https://www.afcd.gov.hk/english/conservation/con_lvnp/lvnp.html",
    date: "2026",
  },
  {
    id: "isd-nm-bill",
    title: "Northern Metropolis Development Bill gazetted today",
    publisher: "HKSAR Government press release",
    url: "https://www.info.gov.hk/gia/general/202607/03/P2026070300863.htm",
    date: "2026-07-03",
  },
  {
    id: "tpb-9128",
    title: "TPB Paper No. 9128 – KTN/FLN NDA Planning and Engineering Study (public views)",
    publisher: "Town Planning Board",
    url: "https://www.tpb.gov.hk/en/uploads/TPB/general/9128_MainPaper.pdf",
    date: "study stage",
  },
];

export const SOURCE_BY_ID = new Map(SOURCES.map((s) => [s.id, s]));
