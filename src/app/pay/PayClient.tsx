"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PaddleEvent = { name?: string };
type PaddleJs = {
  Environment: { set: (env: string) => void };
  Initialize: (opts: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    Paddle?: PaddleJs;
  }
}

const TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";
const ENV = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";

/** Only ever redirect to a page on this site, never to another domain (covers "//x", "/\\x", "/%09/x"). */
function nextPath(): string {
  const fallback = "/billing?upgraded=1";
  const n = new URLSearchParams(window.location.search).get("next") || "";
  if (!n.startsWith("/") || /[\\\u0000-\u001f]/.test(n)) return fallback;
  try {
    const url = new URL(n, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}

export default function PayClient() {
  const [state, setState] = useState<"loading" | "open" | "done" | "closed" | "error">("loading");
  const [message, setMessage] = useState("");
  const completed = useRef(false);
  const started = useRef(false);

  const start = () => {
    if (started.current || !window.Paddle) return;
    started.current = true;
    if (!TOKEN) {
      setState("error");
      setMessage("Payments are not switched on yet. Please try again later.");
      return;
    }
    if (!new URLSearchParams(window.location.search).get("_ptxn")) {
      setState("error");
      setMessage("There is no checkout to open. Pick a plan on the pricing page first.");
      return;
    }
    if (ENV === "sandbox") window.Paddle.Environment.set("sandbox");
    window.Paddle.Initialize({
      token: TOKEN,
      checkout: { settings: { displayMode: "overlay", theme: "dark", locale: "en" } },
      eventCallback: (event: PaddleEvent) => {
        if (event?.name === "checkout.loaded") setState("open");
        if (event?.name === "checkout.completed") {
          completed.current = true;
          setState("done");
          window.setTimeout(() => {
            window.location.href = nextPath();
          }, 1500);
        }
        if (event?.name === "checkout.closed" && !completed.current) setState("closed");
      },
    });
  };

  // Paddle.js may already be cached and loaded before this component mounts.
  useEffect(() => {
    start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" onLoad={start} />
      <div className="max-w-md text-center space-y-4">
        {state === "loading" && <p className="text-lg opacity-80">Opening secure checkout…</p>}
        {state === "open" && <p className="text-lg opacity-80">Complete your purchase in the checkout window.</p>}
        {state === "done" && (
          <p className="text-lg">Payment received. Your plan is being activated; taking you back…</p>
        )}
        {state === "closed" && (
          <>
            <p className="text-lg">Checkout closed. You have not been charged.</p>
            <Link href="/pricing" className="underline">Back to pricing</Link>
          </>
        )}
        {state === "error" && (
          <>
            <p className="text-lg">{message}</p>
            <Link href="/pricing" className="underline">Back to pricing</Link>
          </>
        )}
        <p className="text-xs opacity-60">
          Payments are processed by Paddle.com, our reseller and merchant of record, who handles
          billing, tax and receipts.
        </p>
      </div>
    </main>
  );
}
