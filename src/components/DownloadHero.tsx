"use client";
import Link from "next/link";

export default function DownloadHero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Get the Prompt Temple Extension</h1>
        <p className="mt-4 text-lg text-muted-foreground">Install the browser extension to access your prompts anywhere — compose with templates, capture ideas, and export directly to your workflows.</p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/download" className="inline-flex items-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-rose-500">
            Download for Chrome
          </Link>
          <Link href="#features" className="text-sm hover:underline">Why install?</Link>
        </div>

        <div id="features" className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Quick Access</h3>
            <p className="mt-2 text-sm text-muted-foreground">Open the prompt composer from any website with a single click.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Save & Sync</h3>
            <p className="mt-2 text-sm text-muted-foreground">Save to your Prompt Library and sync across devices.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Export Easily</h3>
            <p className="mt-2 text-sm text-muted-foreground">Export prompts to clipboard, files, or connected apps.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
