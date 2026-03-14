# AI Template Features - Quick Start Guide

## Overview

The Prompt Temple now includes **AI-powered template features** that transform passive template browsing into an active, intelligent experience. Use AI to fill templates, find relevant templates semantically, and generate variations.

---

## Features

### 1. 🪄 Smart Fill (2 credits)

**What it does:** Automatically fills template variables using AI based on your context.

**How to use:**
1. Go to `/library` or `/templates/[id]`
2. Click the **"AI Fill"** button (wand icon) on any template
3. (Optional) Add context in the textarea (e.g., "I'm writing a cold email for B2B SaaS")
4. Review the cost confirmation (2 credits)
5. Click **"Confirm"**
6. Wait for the Egyptian loading animation
7. Review AI suggestions for each variable
8. Toggle accept/reject for each suggestion
9. Click **"Apply Suggestions"**
10. Navigate to optimizer with filled template

**Best for:**
- Quickly getting started with templates
- Getting AI-powered suggestions for variable values
- Saving time on manual variable filling

---

### 2. 🔍 AI Search (1 credit)

**What it does:** Finds templates semantically, not just by keyword matching.

**How to use:**
1. Go to `/library`
2. Type in the search bar (10+ characters for AI search)
3. Wait 500ms for debounce
4. AI search activates automatically
5. See templates with relevance scores (e.g., "85% match")
6. Click a recommendation to navigate

**Pro tips:**
- Type natural language: "email marketing campaign" instead of "marketing email"
- AI finds templates even without exact keyword matches
- Toggle AI/KW button to switch between AI and keyword search
- Falls back to keyword search when credits are low

**Best for:**
- Finding templates by use case, not just title
- Discovering relevant templates you might miss with keywords
- Natural language searching

---

### 3. 🎭 Variations (5 credits)

**What it does:** Generates 4 alternative versions of a template with different tones/styles.

**How to use:**
1. Go to `/templates/[id]` (template detail page)
2. Click the **"Variations"** button (layers icon)
3. Review cost confirmation (5 credits)
4. Click **"Confirm"**
5. Wait for Egyptian loading animation
6. See 4 variations with difference summaries
7. Copy or "Use This" for any variation
8. Variation replaces template content

**Variation types:**
- Professional tone
- Casual tone
- Persuasive tone
- Creative tone

**Best for:**
- A/B testing different approaches
- Adapting templates for different audiences
- Getting creative alternatives
- Learning different writing styles

---

## Credit Costs Summary

| Feature | Cost | When Charged |
|---------|------|--------------|
| Smart Fill | 2 credits | When AI generates suggestions |
| AI Search | 1 credit | When AI returns recommendations (10+ chars) |
| Variations | 5 credits | When AI generates variations |

**Note:** Credits are deducted optimistically and refunded if the API call fails.

---

## User Flows

### Flow 1: Quick Template Usage with Smart Fill

```
Library → Search "marketing email" → Click template → 
Click "AI Fill" → Add context "B2B SaaS cold outreach" → 
Confirm (2cr) → Review suggestions → Apply → 
Optimizer opens with filled template
```

### Flow 2: Finding Templates with AI Search

```
Library → Type "customer onboarding sequence" in search → 
AI dropdown appears with 85% match → Click recommendation → 
Template detail page opens
```

### Flow 3: Generating Variations

```
Template detail → Click "Variations" → Confirm (5cr) → 
See 4 tone variations → Click "Use This" on persuasive version → 
Template content updated → Copy or optimize
```

---

## Error Handling

### Insufficient Credits

**Smart Fill/Variations:** Shows upgrade prompt with "Upgrade Plan" button

**AI Search:** Automatically falls back to keyword search (free)

### API Errors

All features show error messages with retry options. Credits are refunded automatically.

---

## Tips & Tricks

### Smart Fill
- ✅ Add specific context for better suggestions
- ✅ Review all suggestions before applying
- ✅ You can reject individual suggestions
- ✅ Works best with detailed variable names

### AI Search
- ✅ Type naturally, like you're asking a person
- ✅ 10+ characters needed for AI search
- ✅ Relevance scores help identify best matches
- ✅ Use AI mode for discovery, keyword for precision

### Variations
- ✅ Generate variations to see different perspectives
- ✅ Compare difference summaries quickly
- ✅ Use variations as learning examples
- ✅ Mix and match parts from different variations

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Smart Fill | Not assigned (click button) |
| Close modal | `Esc` key |
| Confirm action | `Enter` when focused on button |

---

## Accessibility

- All modals are keyboard navigable
- Screen reader friendly labels
- High contrast UI elements
- Clear cost indicators
- Loading state announcements

---

## Troubleshooting

### "AI Fill button not working"
- Check if you have at least 2 credits
- Ensure template has variables to fill
- Try refreshing the page

### "AI Search not showing results"
- Type at least 10 characters
- Check if AI mode is enabled (AI badge)
- Verify you have credits (or it will fallback to keyword)

### "Variations not generating"
- Ensure you have 5 credits
- Check if template content is valid
- Try the "Retry" button on error

---

## Support

For issues or questions:
1. Check this guide first
2. Review error messages carefully
3. Contact support with screenshot
4. Include credit balance in support request

---

**Last Updated:** March 13, 2026  
**Version:** 1.0
