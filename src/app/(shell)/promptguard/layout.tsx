import './promptguard.css';
import type { ReactNode } from 'react';
import { Cormorant_Garamond } from 'next/font/google';

/**
 * PromptGuard route layout (Sprint 5 — visual identity).
 *
 * Loads the Cormorant Garamond serif (exposed as the `--font-cormorant` CSS
 * variable that promptguard.css consumes) and applies the `.pg-scope` wrapper
 * that re-themes shadcn's tokens to the Pharaonic palette — scoped to this
 * route only, so the rest of the app is unaffected.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata = {
  title: 'PromptGuard · Live Eval Theater',
  description: 'Autonomous LLM quality engineer — watch the agent think.',
};

export default function PromptGuardLayout({ children }: { children: ReactNode }) {
  return <div className={`${cormorant.variable} pg-scope`}>{children}</div>;
}
