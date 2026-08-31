import type { Metadata } from "next";
import { Young_Serif, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-young-serif"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans"
});

export const metadata: Metadata = {
  title: "Solidarize",
  description: "Solidarize é uma plataforma de gestão de doações para instituições de caridade.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", youngSerif.variable, dmSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
