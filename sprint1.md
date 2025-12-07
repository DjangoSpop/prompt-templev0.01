Prompt Temple — Mobile UX/UI Fix Sprint (Production Hotfix)

Role: Senior UI/UX Engineer
Goal: Fix mobile issues in production without changing API integrations. Improve multi-screen responsiveness, input accessibility, and walkthrough usability.

1. Multi-Screen Responsiveness

Problem: Templates pages, registration, detail modals, and NavBar are not scaling correctly on mobile.

Fix:

Apply Tailwind responsive classes (sm:, md:, lg:, xl:) across layouts.

Use flex-col fallbacks for small screens where grid overflows.

Ensure NavBar collapses into a hamburger menu on <md.

Test on widths: 375px (iPhone SE), 414px (iPhone 12), 768px (iPad Mini).

2. Registration & Login Forms

Problem: Poor contrast on username/password inputs; no guidance; server errors not visible.

Fix:

Increase contrast ratio to WCAG AA (4.5:1). Example: bg-gray-900 text-white or border-gray-300 focus:border-blue-500.

Add tooltip/helper text under each field:

Username: “Min. 4 characters, letters & numbers only.”

Password: “Min. 8 characters, 1 uppercase, 1 number.”

Display server responses inline (below inputs) in red for errors or green for success.

Add aria-invalid and aria-describedby for accessibility.

3. Templates Detail Modal

Problem: Input scroll not working on mobile; questions fixed, causing overflow.

Fix:

Replace fixed height with max-h-[80vh] overflow-y-auto inside modal content.

Ensure body scroll lock is active only for background, not modal.

Add sticky header/footer for modal actions (Save, Close) while allowing scroll in content area.

4. Walkthrough/Tour Guide

Problem: On mobile, “Next” button sometimes goes below viewport; user cannot progress.

Fix:

Make walkthrough container position: fixed; bottom: 0; width: 100% with safe-area insets (env(safe-area-inset-bottom)).

Add overflow-y-auto for long steps.

Ensure step targets scroll into view automatically with element.scrollIntoView({ behavior: "smooth", block: "center" }).

5. NavBar

Problem: Static layout; does not collapse dynamically.

Fix:

Convert to responsive drawer menu:

Desktop: horizontal NavBar with logo + links.

Mobile: hamburger → slide-in drawer using Framer Motion or Radix UI Sheet.

Preserve same contrast and branding.

Add focus trap for accessibility in mobile menu.

6. Definition of Done

✅ Templates list and detail modal scroll correctly on mobile.

✅ Registration form has proper contrast, tooltips, and visible server responses.

✅ NavBar collapses dynamically and is usable across all screen sizes.

✅ Walkthrough guide buttons always visible and steps scroll correctly.

✅ No changes to API configuration or integration.

✅ npm run typecheck, npm run lint, and next build succeed with 0 errors.

7. Commit Message
fix(ui): improve mobile responsiveness, contrast, tooltips, and walkthrough UX