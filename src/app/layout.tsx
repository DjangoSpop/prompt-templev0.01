import type { Metadata } from "next";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ConfigProvider } from "@/providers/ConfigProvider";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import { AppProviders } from "@/providers/AppProviders";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HealthBanner } from "@/components/HealthBanner";
import { ClientOnly } from "@/components/ClientOnly";
import { HydrationGuard } from "@/components/HydrationGuard";
import "./globals.css";
import '../styles/chat.css';
import UserOnboarding from "@/components/onboarding/UserOnboarding";
import { AppLayoutWithSidebar } from "@/components/sidebar/AppLayoutWithSidebar";
import { PromptLibraryModals } from "@/components/prompt/PromptLibraryModals";
import { FastNavWidget } from "@/components/navbar/FastNavWidget";
import { KeyboardShortcutsProvider } from "@/components/shortcuts/KeyboardShortcutsProvider";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { GlobalCreditBanner } from "@/components/credits/GlobalCreditBanner";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";
import { DailyRefillToast } from "@/components/credits/DailyRefillToast";

export const metadata: Metadata = {
  metadataBase: new URL("https://prompt-temple.com"),
  title: {
    default: "Prompt Temple — AI Prompt Optimizer & Template Library",
    template: "%s | Prompt Temple",
  },
  description: "The AI prompt optimization platform that turns bad prompts into genius-level instructions. Free to start. Average improvement: 1.8 → 9.4 out of 10. Used by 47,000+ AI builders.",
  keywords: [
    "AI prompt optimizer", "prompt engineering tool", "ChatGPT prompt templates",
    "prompt library", "AI prompt enhancer", "Claude prompt optimizer",
    "prompt temple", "prompt craft", "AI tools", "prompt improvement",
    "ai productivity", "how to write better prompts", "prompt engineering",
  ],
  authors: [{ name: "Prompt Temple", url: "https://prompt-temple.com" }],
  creator: "Prompt Temple",
  publisher: "Prompt Temple",
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://prompt-temple.com",
  },
  verification: {
    google: "9080aa2e20ef498a",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prompt-temple.com",
    siteName: "Prompt Temple",
    title: "Prompt Temple — AI Prompt Optimizer & Template Library",
    description: "Transform bad prompts into Pharaoh-level masterpieces. Free. Average 1.8 → 9.4/10 improvement.",
    images: [
      {
        url: "/api/og/share",
        width: 1200,
        height: 630,
        alt: "Prompt Temple — AI Prompt Optimizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Temple — AI Prompt Optimizer",
    description: "Transform any prompt from Apprentice to Pharaoh level. Free. No card needed.",
    images: ["/api/og/share"],
    creator: "@prompttemple",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prompt Temple",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: "/eye-of-horus.svg",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font preconnects and Playfair + Inter preload for CLS stability */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Core UI fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
        {/* Egyptian theme fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        {/* PWA theme color (matches royal-gold brand) */}
        <meta name="theme-color" content="#CBA135" />
        {/* Full-screen viewport with safe-area support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Prompt Temple",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              url: "https://prompt-temple.com",
              description: "AI prompt optimization platform with 5000+ templates for ChatGPT, Claude, and Gemini.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free tier with 5 daily optimizations",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1247",
                bestRating: "5",
              },
              author: {
                "@type": "Organization",
                name: "Prompt Temple",
                url: "https://prompt-temple.com",
              },
            }),
          }}
        />
        <AppProviders>
          <HydrationGuard>
            <QueryProvider>
              <ConfigProvider>
                <AuthProvider>
                  <AnalyticsProvider>
                    <TooltipProvider>
                      <AppLayoutWithSidebar>
                        {children}
                      </AppLayoutWithSidebar>
                      <ClientOnly>
                        <UserOnboarding autoStart={true} />
                        <FastNavWidget />
                        <PromptLibraryModals />
                        <KeyboardShortcutsProvider />
                        <InstallBanner />
                        <GlobalCreditBanner />
                        <InsufficientCreditsModal />
                        <DailyRefillToast />
                      </ClientOnly>
                    </TooltipProvider>
                  </AnalyticsProvider>
                </AuthProvider>
              </ConfigProvider>
            </QueryProvider>
          </HydrationGuard>
        </AppProviders>
      </body>
    </html>
  );
}
