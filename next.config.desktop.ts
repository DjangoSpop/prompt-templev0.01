import type { NextConfig } from "next";

/**
 * Desktop build overrides applied on top of the web `next.config.ts`.
 * Activated when `BUILD_TARGET=desktop` is set (see `npm run build:desktop`).
 *
 * The overlay loads from `http://127.0.0.1:<dynamic-port>`, so the CSP and
 * Server Actions allowlist must accept any localhost port. Image optimization
 * is disabled to avoid running sharp inside the bundled standalone server.
 */
export function applyDesktopOverrides(base: NextConfig): NextConfig {
  return {
    ...base,

    output: "standalone",

    images: {
      ...(base.images ?? {}),
      unoptimized: true,
    },

    compress: false,

    experimental: {
      ...(base.experimental ?? {}),
      serverActions: {
        allowedOrigins: ["127.0.0.1:*", "localhost:*"],
      },
    },

    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=()",
            },
            {
              key: "Content-Security-Policy",
              value: [
                "default-src 'self'",
                "connect-src 'self' https://api.prompt-temple.com https://api.z.ai wss://api.prompt-temple.com",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                "frame-ancestors 'self'",
              ].join("; "),
            },
          ],
        },
      ];
    },

    async redirects() {
      return [];
    },
  };
}
