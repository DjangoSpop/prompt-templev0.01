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

export const metadata: Metadata = {
  title: "PromptTemple — Transform Any Prompt Into a Pharaoh-Level Masterpiece",
  description: "The AI prompt optimization platform that turns bad prompts into genius-level instructions. Free to start. Average improvement: 1.8 → 9.4 out of 10. Used by 47,000+ AI builders.",
  keywords: [
    "prompt optimizer", "AI prompt engineering", "prompt temple", "prompt craft",
    "ChatGPT prompts", "AI tools", "prompt improvement", "DeepSeek", "prompt library",
    "wow score", "ai productivity", "pharaoh prompts"
  ],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "PromptTemple — Where Every Prompt Becomes Sacred 𓂀",
    description: "Transform bad prompts into Pharaoh-level masterpieces. Free. Average 1.8 → 9.4/10 improvement.",
    type: "website",
    siteName: "PromptTemple",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptTemple — AI Prompt Optimizer",
    description: "Transform any prompt from Apprentice to Pharaoh level. Free. No card needed.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PromptTemple",
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
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
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
