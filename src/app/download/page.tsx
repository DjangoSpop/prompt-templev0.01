import DownloadHero from "@/components/DownloadHero";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata = {
  title: "Download - Prompt Temple Extension",
  description: "Install the Prompt Temple browser extension to access prompts everywhere.",
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen">
      <ClientOnly>
        <DownloadHero />
      </ClientOnly>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <h2 className="mt-12 text-2xl font-semibold">How the download flow works</h2>
        <p className="mt-3 text-muted-foreground">Click the download button to start the browser extension install flow. After the file is served, we'll detect install progress and provide next-step onboarding inside the app. This page is the primary iteration point for download UX improvements.</p>

        <div className="mt-6 flex gap-3">
          <a href="/download" className="rounded-md border px-4 py-2 text-sm">Start Download</a>
          <a href="/help" className="text-sm hover:underline">Read install instructions</a>
        </div>
      </section>
    </div>
  );
}
