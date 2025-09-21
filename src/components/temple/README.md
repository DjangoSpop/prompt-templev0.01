This folder contains presentational Pharaonic-themed UI components added as a UI-only layer. These components are safe to use without changing API contracts.

Components:
- TempleGateHero — marketing hero with layered gate panels and optional scroll-driven motion (GSAP lazy-loaded). Respects prefers-reduced-motion.
- ModelBadge — small pill badge for model compatibility. Uses existing `Tooltip` primitive for accessible tooltips.
- TagChip — simple tag chip with active state and keyboard focus styles.

Notes:
- Heavy modules (gsap) are dynamically imported to keep initial bundle small.
- All interactive controls include focus-visible outlines matching the Pharaonic gold accent.
- Animations respect `prefers-reduced-motion` and are GPU-friendly (transform/opacity).

Usage:
Import dynamically where possible:

import dynamic from 'next/dynamic';
const TempleGateHero = dynamic(() => import('./TempleGateHero').then(m => m.TempleGateHero), { ssr: false });

Accessibility:
- Tooltip uses Radix primitives; tooltip content is keyboard accessible.
- Buttons and chips expose aria-pressed/aria-label where appropriate.
