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

export const metadata: Metadata = {
  title: "Prompt Temple - The Ultimate AI Prompt Sanctuary",
  description: "Discover, craft, and master AI prompt templates in our sacred digital sanctuary. Experience the power of professional prompt engineering with advanced analytics, collaboration, and gamification.",
  keywords: ["prompt temple", "AI prompts", "prompt engineering", "templates", "prompt sanctuary", "AI tools", "prompt library", "analytics", "collaboration", "gamification"],
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
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
