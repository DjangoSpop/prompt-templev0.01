# Prompt Temple — Landing Page UX/UI Enhancement Spec
> **Version:** 1.0 | **Date:** 2026-03-20 | **Author:** UX/UI Audit (Professional Analysis)
> **Stack context:** React + Tailwind CSS + Cinzel/Inter fonts | Egyptian/Pharaonic brand theme
> **Primary color token:** `--lapis-blue: hsl(220 85% 30%)` | **Accent:** `--royal-gold / --pharaoh-gold: hsl(45 80% 45%)`

---

## 📋 Executive Summary

The current landing page has a strong brand identity (Egyptian/temple aesthetic), solid copywriting bones, and all the right sections. However, **retention and conversion are being lost** due to:

1. No sticky nav bar with CTA visible at all scroll depths
2. Hero section is **below the fold** — users see a chat input before they see the headline
3. The "Discover the Temple" slider has dots but **no visible prev/next arrows**, no auto-play, no touch swipe feedback
4. Social proof numbers are **not animated** (counter effect missed)
5. No urgency/scarcity signal
6. The "Sound Familiar?" pain section has no visual separation or emotional color signal
7. No progress indicator for onboarding (what happens after sign-up)
8. Mobile experience has a wide sidebar competing with content
9. Missing: "As seen in / Trusted by" logo strip
10. Missing: A dedicated FAQ accordion section (critical for conversion)

---

## 🏗️ Section-by-Section Audit & Fixes

### 1. HERO SECTION (`#hero-section`)

#### Current Issues
- Headline uses small Cinzel font mixed with golden subtitle — not enough contrast weight
- The interactive chat box (prompt input) dominates the hero but has no example pre-filled to show value
- CTAs ("Start Free" + "Browse Templates") are **below the fold** on most screens
- The Eye of Horus logo animation is subtle and not leveraged as a trust signal
- No social proof snippet near the fold ("Trusted by 5,031 users")

#### Recommended Fixes

**A. Restructure hero layout (2-column on desktop, stacked on mobile)**
```
LEFT COLUMN (55%):
  - Badge chip: "🏛️ #1 AI Prompt Tool — 4.8★ from 5,000+ users"
  - H1: "Stop Getting Mediocre AI Results."
  - Subtitle (gold): "Your Prompts Are the Problem."
  - Body copy (unchanged)
  - CTA row: [Start Free — No Credit Card] [▶ Watch 60-sec Demo]
  - Trust strip: avatars + "5,031 users • 46,932 prompts enhanced"

RIGHT COLUMN (45%):
  - Animated product mockup / prompt optimizer card
  - OR keep the chat input here as a product demo
```

**B. Add a "social proof badge" chip directly under the headline:**
```html
<div class="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 text-sm mb-4">
  <span class="text-gold">★★★★★</span>
  <span>Trusted by <strong>5,031</strong> prompt engineers</span>
</div>
```

**C. Pre-fill the prompt input with an animated example:**
```
Cycling placeholder (typewriter effect):
  → "Write a cold email to a SaaS prospect..."
  → "Create a Python script that parses CSV files..."
  → "Help me write a LinkedIn post about AI trends..."
```

**D. Add a sticky top navbar** that appears on scroll (position: fixed, backdrop-blur):
```
[🏛️ Prompt Temple]  [Templates] [Pricing] [Academy]  [Log In]  [Start Free →]
```

---

### 2. DISCOVER THE TEMPLE SLIDER (`section:nth-of-type(2)`)

#### Current Issues
- Slider has **11 dot indicators** but **zero navigation arrows** — users don't know they can slide
- No auto-advance / auto-play
- No visible slide counter ("1 / 11")
- Cards are cut off on the right edge with no affordance
- No hover state on cards indicating clickability
- Dot indicators are very small and low-contrast

#### 🎠 Full Slider Enhancement Spec

**Component: `DiscoverSlider.tsx`**

```tsx
// Dependencies: already using a dot-based carousel, enhance with:
// - Prev/Next arrow buttons
// - Auto-play (5s interval, pause on hover)
// - Slide counter
// - Touch/swipe support (if not already via library)
// - Keyboard navigation (ArrowLeft / ArrowRight)

interface SliderProps {
  autoPlay?: boolean;          // default: true
  autoPlayInterval?: number;   // default: 5000ms
  showArrows?: boolean;        // default: true
  showCounter?: boolean;       // default: true
  showDots?: boolean;          // default: true
  pauseOnHover?: boolean;      // default: true
  slidesPerView?: number;      // default: 3 (desktop), 1.2 (mobile)
  gap?: number;                // default: 24px
}
```

**Arrow Button Design (add to both sides of slider):**
```tsx
// LEFT ARROW
<button
  aria-label="Previous slide"
  className="absolute left-0 top-1/2 -translate-y-1/2 z-10
             w-10 h-10 rounded-full bg-white/90 shadow-md
             border border-gold/20 flex items-center justify-center
             hover:bg-gold hover:text-white transition-all duration-200
             disabled:opacity-30 disabled:cursor-not-allowed"
  onClick={prevSlide}
>
  <ChevronLeft className="w-5 h-5" />
</button>

// RIGHT ARROW  
<button
  aria-label="Next slide"
  className="absolute right-0 top-1/2 -translate-y-1/2 z-10
             w-10 h-10 rounded-full bg-white/90 shadow-md
             border border-gold/20 flex items-center justify-center
             hover:bg-gold hover:text-white transition-all duration-200
             disabled:opacity-30 disabled:cursor-not-allowed"
  onClick={nextSlide}
>
  <ChevronRight className="w-5 h-5" />
</button>
```

**Slide Counter (top-right of section):**
```tsx
<div className="text-sm text-muted-foreground font-medium">
  <span className="text-foreground font-semibold">{currentSlide + 1}</span>
  <span> / {totalSlides}</span>
</div>
```

**Enhanced Dot Indicators:**
```tsx
// Replace small dots with pill-shaped indicators
{slides.map((_, i) => (
  <button
    key={i}
    aria-label={`Go to slide ${i + 1}`}
    onClick={() => goToSlide(i)}
    className={`h-2 rounded-full transition-all duration-300
      ${i === currentSlide
        ? 'w-8 bg-pharaoh-gold'          // active: wide gold pill
        : 'w-2 bg-stone-300 hover:bg-stone-400'  // inactive: small grey dot
      }`}
  />
))}
```

**Auto-play Logic:**
```tsx
useEffect(() => {
  if (!autoPlay || isPaused) return;
  const timer = setInterval(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  }, autoPlayInterval);
  return () => clearInterval(timer);
}, [autoPlay, isPaused, currentSlide, autoPlayInterval, totalSlides]);
```

**Card Hover Enhancement:**
```tsx
// Add to each card:
className="... group cursor-pointer transition-all duration-300
           hover:shadow-lg hover:-translate-y-1 hover:border-gold/40"

// Add hover CTA that appears on hover:
<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3">
  <span className="text-sm text-lapis-blue font-medium">Use this prompt →</span>
</div>
```

**"Peek" Effect (right-side partial card visibility):**
```tsx
// Slider container should show ~80% of next card to imply scrollability:
className="overflow-hidden"  // on container
// Cards: 
style={{ width: 'calc(33.33% - 8px)' }}  // desktop: 3 visible
// On mobile:
style={{ width: 'calc(85% - 8px)' }}     // mobile: 1 + peek of 2nd
```

---

### 3. PAIN SECTION (`#problem-section` — "Sound Familiar?")

#### Current Issues
- Plain text bullets on cream background — no visual urgency
- Images for each pain point are missing (only alt text exists, no visible image)
- No emotional color coding (red for pain, green for solution)
- "There's a better way." is a weak bridge — no visual separator

#### Recommended Fixes

**A. Add a subtle red-tinted card background for each pain point:**
```tsx
<div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start">
  <span className="text-red-400 text-xl mt-0.5">✗</span>
  <p className="text-stone-700">{painPoint}</p>
</div>
```

**B. Add visual contrast: before/after comparison block:**
```
❌ BEFORE (red background card)      ✅ AFTER (green background card)
"20 minutes writing a prompt..."  →  "10 seconds. Search, click, done."
```

**C. Strengthen the bridge copy:**
```
Current:  "There's a better way."
Improved: "There's a smarter way. And 5,031 people already found it."
```

---

### 4. TEMPLATE GALLERY SECTION

#### Current Issues
- Grid of 8 static cards works well, but:
- No visible star ratings in the card design (only text "4.9")
- "Use This Template →" is a hyperlink styled as a button — low click affordance
- No filtering animation (category switch should animate)
- Missing "Most Popular" or "Trending 🔥" badge

#### Recommended Fixes

**A. Render stars visually:**
```tsx
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i}
        className={`w-3.5 h-3.5 ${i <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
      />
    ))}
    <span className="text-sm text-muted-foreground ml-1">{rating}</span>
  </div>
);
```

**B. Add "Trending 🔥" badge to top 2 cards:**
```tsx
{isTrending && (
  <span className="absolute top-3 right-3 text-xs bg-orange-100 text-orange-600
                   border border-orange-200 rounded-full px-2 py-0.5 font-medium">
    🔥 Trending
  </span>
)}
```

**C. Animate category filter (framer-motion or CSS):**
```tsx
// Wrap cards in AnimatePresence + motion.div for smooth filter transitions
<motion.div
  layout
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  <TemplateCard {...card} />
</motion.div>
```

---

### 5. SOCIAL PROOF / STATS SECTION

#### Current Issues
- Stats (46,932 / 4,121+ / 5,031 / 4.8★) are **static text** — huge missed opportunity
- Testimonial cards have avatar initials (SK, JL, MD) — no photo = lower trust
- No "Verified User" or "via Google/Trustpilot" badge
- Stats section background blends into page — not enough visual pop

#### Recommended Fixes

**A. Animate counters on scroll (IntersectionObserver):**
```tsx
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const duration = 2000;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      observer.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
};
```

**B. Give the stats section a dark/lapis background for visual pop:**
```tsx
<section className="bg-lapis-blue py-16">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
    <AnimatedCounter target={46932} label="Prompts Enhanced" />
    <AnimatedCounter target={4121} suffix="+" label="Templates Available" />
    <AnimatedCounter target={5031} label="Active Users" />
    <div className="text-4xl font-bold">4.8★<span className="block text-sm font-normal opacity-80">Average Rating</span></div>
  </div>
</section>
```

**C. Add testimonial carousel (auto-advancing, 3 visible desktop / 1 mobile):**
```tsx
// Wrap the 3 testimonial cards in the same DiscoverSlider component
// Add "Verified User ✓" badge below each name
// Use realistic avatar placeholder images (UI Avatars API):
// src={`https://ui-avatars.com/api/?name=Sarah+K&background=e8d5a3&color=2d3748`}
```

---

### 6. FEATURES SECTION ("Everything You Need. Zero Learning Curve.")

#### Current Issues
- Tab-based layout is good but the tab buttons are small and don't have active state contrast
- The product mockup (ChatGPT window) is solid but static
- No "before/after" animation showing prompt improvement

#### Recommended Fixes

**A. Enhance tab active state:**
```tsx
// Active tab:
className="bg-lapis-blue text-white shadow-sm"
// Inactive tab:
className="text-muted-foreground hover:text-foreground hover:bg-stone-100"
```

**B. Add a typing animation for the "before/after" prompt demo:**
```tsx
// Animate the "What you type" → "What Prompt Temple creates" transition
// Use a typewriter effect on the optimized output
// Add a "✨ Optimizing..." loading state for 1.5s before showing the result
```

---

### 7. MISSING SECTION: LOGO / INTEGRATION STRIP

Add a "Works With" logo strip with proper brand logos (currently just text):

```tsx
<section className="py-8 border-y border-stone-200">
  <p className="text-center text-sm text-muted-foreground mb-6">Works seamlessly with</p>
  <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap opacity-70 grayscale hover:grayscale-0 transition-all">
    <img src="/logos/chatgpt.svg" alt="ChatGPT" className="h-6" />
    <img src="/logos/claude.svg" alt="Claude" className="h-6" />
    <img src="/logos/gemini.svg" alt="Gemini" className="h-6" />
    <img src="/logos/perplexity.svg" alt="Perplexity" className="h-6" />
    <img src="/logos/copilot.svg" alt="Copilot" className="h-6" />
  </div>
</section>
```

---

### 8. MISSING SECTION: FAQ ACCORDION

Add before the footer — critical for conversion (handles objections):

```tsx
const faqs = [
  {
    q: "Is it really free to start?",
    a: "Yes. You get 500 free credits on signup and 5 free prompt optimizations daily — no credit card required."
  },
  {
    q: "Does it work with ChatGPT, Claude, and Gemini?",
    a: "Yes. The browser extension works inside ChatGPT, Claude, Gemini, Perplexity, and Copilot. One library, every AI."
  },
  {
    q: "What makes these prompts better than what I write myself?",
    a: "Our prompts include expert techniques: role assignment, chain-of-thought instructions, output format specs, and constraint layers — the same methods used by prompt engineers."
  },
  {
    q: "Can I save and organize my own prompts?",
    a: "Yes. Your personal prompt library syncs across devices and integrates with the browser extension."
  },
  {
    q: "What is the Academy?",
    a: "The Academy includes free and paid courses on MCP, agent design, and AI prompt engineering — with certifications."
  }
];

// Render as accessible accordion (details/summary or headless UI Disclosure)
```

---

### 9. MISSING SECTION: URGENCY / ONBOARDING PROGRESS

Add a visual "What happens next" section between hero and discover:

```
Step 1: Sign up free (30 seconds)
Step 2: Paste or search for a prompt
Step 3: Copy to ChatGPT / use via extension
Step 4: Get dramatically better AI results
```

---

### 10. STICKY CTA BAR (Scroll Trigger)

Appears after user scrolls past hero (~600px):

```tsx
const StickyBar = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300
                     bg-white border-t border-stone-200 shadow-lg px-4 py-3
                     flex items-center justify-between
                     ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div>
        <p className="font-semibold text-sm">Start optimizing your prompts today</p>
        <p className="text-xs text-muted-foreground">Free • No credit card • 500 credits on signup</p>
      </div>
      <a href="/auth/register"
         className="bg-pharaoh-gold text-white px-4 py-2 rounded-lg text-sm font-medium
                    hover:bg-royal-gold transition-colors whitespace-nowrap">
        Start Free →
      </a>
    </div>
  );
};
```

---

## 🎨 Visual Design Tokens (No Changes — Keep Brand)

| Token | Value | Usage |
|---|---|---|
| `--lapis-blue` | hsl(220 85% 30%) | Primary buttons, headings |
| `--pharaoh-gold` | hsl(45 80% 45%) | Accent, CTAs, highlights |
| `--royal-gold` | hsl(45 65% 50%) | Secondary accent |
| `--desert-sand` | hsl(40 50% 90%) | Section backgrounds |
| `--obsidian` | hsl(240 10% 6%) | Dark text |
| Font: Headings | Cinzel, serif | All H1-H3 |
| Font: Body | Inter, system-ui | All body copy |

---

## 📱 Mobile UX Fixes

1. **Sidebar** — on mobile landing page view, the left sidebar icons compete for space. Add `lg:hidden` to sidebar on the landing route (unauthenticated view).
2. **Hero CTA buttons** — stack vertically on mobile with full width
3. **Slider** — on mobile show 1 card + 20% peek of next card. Arrow buttons should be inside the card strip, not outside.
4. **Stats bar** — 2×2 grid on mobile instead of 1×4
5. **Template grid** — 1 column on mobile, 2 on tablet

---

## 🚀 Priority Implementation Order

| Priority | Component | Impact | Effort |
|---|---|---|---|
| 🔴 P0 | Sticky bottom CTA bar | High conversion lift | Low (new component) |
| 🔴 P0 | Slider prev/next arrows | Immediate UX fix | Low (add buttons) |
| 🔴 P0 | Animated stat counters | Trust & polish | Low (hook) |
| 🟠 P1 | Auto-play + pill dots on slider | Retention | Medium |
| 🟠 P1 | Hero 2-column layout + social proof badge | First impression | Medium |
| 🟠 P1 | FAQ accordion section | Objection handling | Medium |
| 🟡 P2 | Testimonial carousel | Social proof | Medium |
| 🟡 P2 | Logo strip with real SVG logos | Trust | Low |
| 🟡 P2 | Pain section red card styling | Emotional resonance | Low |
| 🟢 P3 | Typewriter hero placeholder | Delight | Low |
| 🟢 P3 | Trending badge on templates | Discovery | Low |
| 🟢 P3 | Onboarding progress steps section | Clarity | Medium |

---

## 🎠 Slider — Complete Implementation Reference

### File: `src/components/landing/DiscoverSlider.tsx`

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscoverSliderProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function DiscoverSlider({
  children,
  autoPlay = true,
  interval = 5000,
  className
}: DiscoverSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const total = children.length;

  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || paused) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [autoPlay, paused, interval, next]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  // Touch / drag
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    setIsDragging(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStart.current;
    if (delta < -50) next();
    else if (delta > 50) prev();
    setIsDragging(false);
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide counter */}
      <div className="absolute top-0 right-0 text-sm text-muted-foreground font-medium z-10">
        <span className="text-foreground font-semibold">{current + 1}</span>
        <span className="mx-1 opacity-40">/</span>
        <span>{total}</span>
      </div>

      {/* Prev arrow */}
      <button
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 rounded-full bg-white shadow-md
                   border border-stone-200 flex items-center justify-center
                   hover:bg-amber-50 hover:border-amber-300 transition-all duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <ChevronLeft className="w-5 h-5 text-stone-600" />
      </button>

      {/* Slides track */}
      <div
        className="overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {children.map((child, i) => (
            <div
              key={i}
              className="min-w-full"
              aria-hidden={i !== current}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Next arrow */}
      <button
        aria-label="Next slide"
        onClick={next}
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 rounded-full bg-white shadow-md
                   border border-stone-200 flex items-center justify-center
                   hover:bg-amber-50 hover:border-amber-300 transition-all duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <ChevronRight className="w-5 h-5 text-stone-600" />
      </button>

      {/* Pill dots */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current
                ? 'w-8 bg-amber-500'
                : 'w-2 bg-stone-300 hover:bg-stone-400'
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 Expected Retention / Conversion Impact

| Enhancement | Estimated Lift |
|---|---|
| Sticky bottom CTA | +8–12% conversion rate |
| Animated counters | +5% trust / time on page |
| Slider arrows + auto-play | +15% section engagement |
| Hero social proof badge | +10% sign-up rate |
| FAQ section | -20% bounce from pricing confusion |
| Pain section red cards | +8% emotional engagement |
| Typewriter placeholder | +6% prompt input interaction |

---

*Generated by UX/UI Professional Audit — Prompt Temple Landing Page — 2026-03-20*
