import type { Metadata, Viewport } from "next";
import { Young_Serif, DM_Sans } from "next/font/google";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { SerwistProvider } from "@/app/serwist";
import { OfflineMonitor } from "@/components/offline-monitor";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
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

const SITE_NAME = "Solidarize";
const SITE_DESCRIPTION =
  "Por trás de cada entrega, existe uma vida que importa. Gestão que transforma cuidado em impacto social.";
const OG_IMAGE_URL = "/og-image.jpg";

function resolveMetadataBase(): URL {
  const rawBaseUrl =
    process.env.BETTER_AUTH_URL?.trim()
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "")
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (rawBaseUrl) {
    try {
      return new URL(rawBaseUrl);
    } catch {
      // Fallback para localhost quando a variável de ambiente estiver vazia ou inválida.
    }
  }

  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Solidarize — Plataforma de gestão de doações",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    apple: "/icons/icon-192x192.png",
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
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`(function(){window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__solidarizeDeferredInstallPrompt=e;window.dispatchEvent(new Event("solidarize:beforeinstallprompt"));});})();`}
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
            <PwaInstallPrompt />
            {children}
            <Toaster />
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
