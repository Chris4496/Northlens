import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "NorthLens — Community insight dashboard" };

export default function DashboardPage() {
  return (
    <main>
      <Dashboard />
      <SiteFooter />
    </main>
  );
}
