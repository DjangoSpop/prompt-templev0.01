import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompt Temple — Quick Capture",
  robots: { index: false, follow: false },
};

/**
 * Overlay layout. The Next.js root layout still wraps this (because there can
 * only be one root layout), but `AppLayoutWithSidebar` short-circuits when the
 * pathname starts with `/desktop/`, so no sidebar / banners / chrome render.
 *
 * The inline <style> below makes the document body transparent so the frameless
 * Electron overlay window's transparency is not occluded by the root layout's
 * `bg-background` body class.
 */
export default function OverlayRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body { background: transparent !important; }
        body { overflow: hidden !important; }
      `}</style>
      {children}
    </>
  );
}
