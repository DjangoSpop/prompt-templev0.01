import type { Metadata } from "next";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ConfigProvider } from "@/providers/ConfigProvider";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import { AppProviders } from "@/providers/AppProviders";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HealthBanner } from "@/components/HealthBanner";
import { TempleNavbar } from "@/components/TempleNavbar";
import { AppShell } from "@/components/layout/AppShell";
import { ClientOnly } from "@/components/ClientOnly";
import { HydrationGuard } from "@/components/HydrationGuard";
import dynamic from "next/dynamic";
// Dynamically load onboarding on client to avoid server bundling framer-motion

import "./globals.css";
import '../styles/chat.css';
import UserOnboarding from "@/components/onboarding/UserOnboarding";

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
      <body className="font-sans antialiased min-h-screen overflow-x-hidden bg-background text-foreground" suppressHydrationWarning>
        <AppProviders>
          <HydrationGuard>
            <QueryProvider>
              <ConfigProvider>
                <AuthProvider>
                  <AnalyticsProvider>
                    <TooltipProvider>
                      <div className="flex flex-col min-h-screen">
                        <ClientOnly fallback={<div className="h-16 bg-secondary/95 backdrop-blur-lg border-b border-primary/20"></div>}>
                          <HealthBanner />
                          <TempleNavbar />
                        </ClientOnly>
                        <main className="flex-1 overflow-y-auto">
                          {children}
                        </main>
                        {/* Onboarding system for new users (client-only) */}
                        <ClientOnly>
                          <UserOnboarding autoStart={true} />
                        </ClientOnly>
                      </div>
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
