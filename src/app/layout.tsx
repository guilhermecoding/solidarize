import type { Metadata, Viewport } from "next";
import { Young_Serif, DM_Sans } from "next/font/google";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { SerwistProvider } from "@/app/serwist";
import { OfflineMonitor } from "@/components/offline-monitor";
import { cn } from "@/lib/utils";
import SplashScreen from "@/components/splash-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";

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
  applicationName: "Solidarize",
  title: {
    default: "Solidarize",
    template: "%s | Solidarize",
  },
  description: "Solidarize é uma plataforma de gestão de doações para instituições de caridade.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Solidarize",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1B1B1B" },
  ],
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
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === "development"}
          cacheOnNavigation={false}
          reloadOnOnline={false}
        >
          <OfflineMonitor />
          <ThemeProvider>
            <NextTopLoader color="var(--primary)" showSpinner={false} shadow={false} height={3} />
            <SplashScreen />
            {children}
            <Toaster />
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
