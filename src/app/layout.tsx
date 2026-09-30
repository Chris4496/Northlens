import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Noto_Sans_TC, Noto_Serif_TC, Public_Sans } from "next/font/google";
import { LangProvider } from "@/components/lang";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Instrument_Serif({ variable: "--nf-display", weight: "400", style: ["normal", "italic"], subsets: ["latin"] });
const body = Public_Sans({ variable: "--nf-body", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--nf-mono", weight: ["400", "500"], subsets: ["latin"] });
const serifTc = Noto_Serif_TC({ variable: "--nf-display-tc", weight: ["500", "700"], preload: false });
const sansTc = Noto_Sans_TC({ variable: "--nf-body-tc", weight: ["400", "500", "700"], preload: false });

export const metadata: Metadata = {
  title: "NorthLens — Kwu Tung North, explained",
  description:
    "Turning Northern Metropolis plans into source-grounded explanations residents can understand — and feedback planners can act on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${serifTc.variable} ${sansTc.variable} antialiased`}
    >
      <body className="min-h-screen">
        <LangProvider>
          <SiteHeader />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
