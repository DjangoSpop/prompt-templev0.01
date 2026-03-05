"use client";

import { useEffect, useState } from "react";
import { CHROME_STORE_URL, detectExtension } from "@/lib/extension";
import { CheckCircle, Chrome } from "lucide-react";

export default function DownloadHero() {
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    detectExtension().then(setInstalled);
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Get the Prompt Temple Extension</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Install the browser extension to access your prompts anywhere — compose with templates,
          capture ideas, and export directly to your workflows.
        </p>

        {/* Extension status */}
        {installed === true && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 ring-1 ring-green-200">
            <CheckCircle className="h-4 w-4" />
            Extension installed and active
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {installed ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow">
              <CheckCircle className="h-4 w-4" />
              Already Installed
            </span>
          ) : (
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-rose-500 transition-colors"
            >
              <Chrome className="h-4 w-4" />
              {installed === null ? "Download for Chrome" : "Install from Chrome Web Store"}
            </a>
          )}
          <a href="#features" className="text-sm hover:underline">
            Why install?
          </a>
        </div>

        <div id="features" className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Quick Access</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Open the prompt composer from any website with a single click.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Save &amp; Sync</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Save to your Prompt Library and sync across devices.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Export Easily</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Export prompts to clipboard, files, or connected apps.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
