import type { Metadata } from "next";
import { Young_Serif, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

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
  title: {
    default: "Solidarize",
    template: "%s | Solidarize",
  },
  description: "Solidarize é uma plataforma de gestão de doações para instituições de caridade.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", youngSerif.variable, dmSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <Script id="login-default-theme" strategy="beforeInteractive">
          {`(function(){try{var p=location.pathname;if((p==="/entrar"||p.indexOf("/entrar/")===0)&&!localStorage.getItem("theme")){var root=document.documentElement;root.classList.remove("dark");root.classList.add("light");root.style.colorScheme="light"}}catch(e){}})();`}
        </Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
