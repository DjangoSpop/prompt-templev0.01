# Sprint 11 — copy changes (English)

Every user-facing string changed on `sprint-11-identity`, grouped by file. Where the new string is
gated by `BRAND_V2`, the old one still ships with the flag off. For the Arabic pass: write the
Arabic from the "New" column, not from the old one.

## src/components/TempleNavbarEnhanced.tsx
| Old | New | Gated |
|---|---|---|
| Sacred Sanctuary (tagline) | Learn to ask | yes |
| The Academy | Academy | no |
| Master the art of prompting | Learn to write prompts that work | no |
| — | Pricing · Free to start. Credits when you need more | new nav item |

## src/components/try-me/*
| Old | New | File |
|---|---|---|
| Try Me | Try it on your own prompt | TryMeButton.tsx |
| Enhanced in {n}ms | Made clearer in {n}ms | EnhanceResultActions.tsx |
| Copied! | Copied | EnhanceResultActions.tsx |
| The Sacred Forge Awaits | Paste a rough prompt | ChatInterface.tsx |
| (intro body) | We add the context, format and constraints the model needs, and show you what changed. | ChatInterface.tsx |
| Sorry, something went wrong. Please try again. | That did not go through. Your prompt is still here. Try again, or create a free account to run it without waiting. | ChatInterface.tsx |
| Enter your prompt to optimize... | Paste your prompt. We will make it clearer. | ChatInterface.tsx |

## src/app/auth/login/page.tsx (gated)
| Old | New |
|---|---|
| Return to the Temple | Welcome back |
| Enter your sacred credentials to continue your journey | Sign in to your library, your credits and your saved prompts. |
| Sacred Access Portal | Sign in |
| Sacred Identifier | Email |
| Sacred Passphrase | Password |
| Enter the Temple | Sign in |
| Forgotten your sacred passphrase? | Forgot your password? |
| Seeking entry to the temple? / Begin your journey | New here? / Create a free account |
| — | Free. Nothing to install. (explain line under submit) |

## src/app/auth/register/page.tsx (gated)
| Old | New |
|---|---|
| Create your sacred account to unlock the temple's wisdom | A free account keeps your prompts, results and credits in one place. |
| Sacred Registration | Create your account |
| Or register with sacred credentials | Or register with your email |
| Sacred Identifier / Sacred Scroll Address / Sacred Passphrase / Sacred Tale | Username / Email / Password / About you |
| — | Free. Nothing to install. (explain line) |

## src/app/page.tsx + src/components/landing/v4/* (new homepage, gated)
| Old homepage | New |
|---|---|
| (v3 hero) | Learn to ask. — Clear questions get better answers. Prompt Temple shows you what good prompts produce, lets you use them in one tap, and teaches you to write your own. |
| — | Try it on your own prompt · Free. Nothing to install. · See today's trending prompts |
| — | How asking works: Give it a role / Say what good looks like / Ask for the format — "Three lines that change most answers. Try each one on your next prompt." |
| — | Trending today · Browse the library instead. · Live prompts could not be loaded right now. See the feed for real results. |
| — | Use it where you work · Free. Works in Chrome and Edge. Your prompts stay in your account. |
| — | Honest numbers: Licensed prompts, each shown with what it produces · Results judged automatically before they are shown · Free to start. No card needed · Written in both, not translated |

## src/app/academy/page.tsx (gated)
| Old | New |
|---|---|
| From prompt engineering foundations to production AI agents. Choose your learning path and start building. | From the first role line to production agents. Pick a path and start with a lesson you can use today. |
| Earn XP & Badges — … Bronze Scarab, Silver Ankh, Gold Eye of Horus, Lapis Crown. | Earn XP and badges — Track progress with XP. Levels: Scribe, Senior scribe, Master scribe. |
| Begin Your Journey | Start here |
| Ready to Master AI? | Learn to ask. |
| Start with any course for free. From prompt engineering to production AI agents — your path to mastery begins here. | Every course is free to start. Begin with prompt basics or go straight to agents. |
| Start Learning Now | Start a lesson |
| — | Short lessons. Each ends with a line to try. (explain line) |

## src/app/pricing/page.tsx + PricingPageClient.tsx (gated)
| Old | New |
|---|---|
| Simple, transparent pricing | Plain pricing |
| Start Free. Scale as You Grow. | Free to start. Pay when it earns its keep. |
| Get better AI results today — free. Upgrade when you need more power. | The free plan makes your prompts clearer every day. Paid plans add credits, remove ads, and keep the library free for everyone. |
| Get Started Free (free plan CTA) | Start free |
| — | No ads, more credits, and the library stays free. (explain line under the Pro CTA) |
| All paid plans include a 14-day money-back guarantee · No questions asked · Cancel anytime | Paid plans: 14-day money-back guarantee. Cancel any time from billing settings. |
| Frequently Asked Questions | Questions people ask |
| Yes! The Free plan includes daily AI prompt optimizations… No credit card required. | Yes. The free plan includes daily prompt improvements, the basic template library, and a quality score for every prompt. No card needed. |
| Absolutely. Cancel your subscription anytime… no cancellation fees. | Yes. Cancel from your billing settings at any time. There are no cancellation fees. |

## src/components/feed/FeedView.tsx (empty states)
| Tab | New |
|---|---|
| Trending | Nothing is trending yet. Be the first to like a prompt. |
| For you | Save or like three prompts and this tab fills up. |
| Filtered | No prompts match. Clear a filter. |

## src/app/not-found.tsx (new)
This page is not in the library. · (link) Back to the feed

## Still to rewrite (out of this sprint's file sets)
`AcademyHero`, `ModuleCard`, pricing `PLAN_META` taglines ("For teams and power users"), the
Discover/Templates pages, and the consent/PWA banners (Sprint 10). Log them here when done.
