"use client";

import { Wifi, WifiOff } from "lucide-react";
import clsx from "clsx";

export type ConnectionStatusProps = {
  isConnected: boolean;
  latency?: number | null;
};

/**
 * Accessible, reusable connection indicator.
 * Announces status changes to screen-readers via aria-live.
 */
export const ConnectionStatus = ({ isConnected, latency }: ConnectionStatusProps) => (
  <output
    aria-live="polite"
    aria-atomic="true"
    className={clsx(
      "flex items-center gap-2 px-3 py-1.5 rounded-cartouche border",
      isConnected
        ? "bg-sand-50 border-stone-200"
        : "bg-red-50 border-red-200"
    )}
    title={isConnected ? "Connected" : "Disconnected"}
  >
    {isConnected ? (
      <Wifi className="h-4 w-4 text-nile" aria-hidden />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" aria-hidden />
    )}

    <span className="text-sm font-ui text-stone-700">
      {isConnected ? "Connected to Prompt Temple" : "Disconnected"}
    </span>

    {typeof latency === "number" && latency >= 0 && (
      <span className="px-2 py-1 bg-sun/10 text-sun font-mono text-xs rounded-full">
        {latency} ms
      </span>
    )}
  </output>
);