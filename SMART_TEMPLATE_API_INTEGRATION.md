# Smart Template API Integration Guide

## Backend API Endpoints

The frontend is wired to call these backend endpoints:

### 1. Smart Fill
```
POST /api/v2/templates/{template_id}/smart-fill/
Body: { "variables": { "field1": "value1", "_context": "optional context" } }
Response: { 
  "filled_prompt": "string",
  "suggestions": { "field1": ["suggestion1", "suggestion2"] },
  "credits_used": 2
}
```

### 2. Template Recommendations
```
POST /api/v2/templates/recommend/
Body: { "intent": "search query", "context": "optional" }
Response: [
  {
    "template_id": "uuid",
    "title": "string",
    "relevance_score": 0.85,
    "reason": "string",
    "category": "string"
  }
]
```

### 3. Template Variations
```
POST /api/v2/templates/{template_id}/variations/
Body: { "count": 4 }
Response: [
  {
    "title": "Professional Version",
    "content": "template content",
    "difference_summary": "More formal tone"
  }
]
```

---

## Frontend Implementation Status

### ✅ Correctly Wired

1. **API Client** (`src/lib/api/typed-client.ts`):
   - `templateSmartFill(id, variables)` → POST /api/v2/templates/{id}/smart-fill/
   - `recommendTemplates(intent, context)` → POST /api/v2/templates/recommend/
   - `templateVariations(id, count)` → POST /api/v2/templates/{id}/variations/

2. **Hooks** (`src/hooks/api/useSmartTemplates.ts`):
   - `useSmartFill(templateId)` - mutation with credit deduction
   - `useTemplateVariations(templateId)` - mutation with credit deduction
   - `useRecommendTemplates(intent)` - query with caching

3. **Components**:
   - `SmartFillPanel` - calls `useSmartFill` with variables
   - `VariationsDrawer` - calls `useTemplateVariations`
   - `AISearchBar` - calls `useRecommendTemplates`

### ⚠️ Issue Found: Library Page Not Passing Variables

**Problem:** The library page passes `variables={{}}` to SmartFillPanel, so the backend doesn't know what fields to fill.

**Location:** `src/app/(app)/library/page.tsx` line ~668

**Current Code:**
```tsx
<SmartFillPanel
  open={smartFillOpen}
  onOpenChange={setSmartFillOpen}
  templateId={smartFillTemplateId}
  variables={{}}  // ❌ Empty - backend won't know what to fill!
  onApply={...}
/>
```

**Fix Needed:** Fetch the template fields and pass them as variables.

---

## Required Backend Response Format

### Smart Fill Response

The backend MUST return suggestions keyed by field label:

```json
{
  "filled_prompt": "Complete prompt with all fields filled",
  "suggestions": {
    "topic": ["AI in healthcare", "Machine learning for doctors"],
    "audience": ["Medical professionals", "Hospital administrators"],
    "tone": ["Professional", "Authoritative"]
  },
  "credits_used": 2
}
```

**Important:** The keys in `suggestions` must match the template's field labels exactly.

### How Backend Should Extract Fields

The backend should:
1. Load the template from DB
2. Parse `template_content` for variables: `{topic}`, `{audience}`, `{tone}`
3. Use AI to generate suggestions for each variable based on:
   - The variable name
   - Any provided context (`_context`)
   - Other variable values (if provided)

---

## Fix Implementation Plan

### Step 1: Update Library Page to Fetch Template Fields

The library page needs to:
1. Fetch the full template when Smart Fill is opened
2. Extract field names from `template.fields` or `template_content`
3. Pass field names with empty values to SmartFillPanel

### Step 2: Update SmartFillPanel to Handle Field Extraction

SmartFillPanel should:
1. Accept `template` object with `fields` array
2. Auto-extract field names if `fields` not available
3. Send field names to backend for AI suggestions

### Step 3: Ensure Backend Parses Fields Correctly

Backend must:
1. Parse template content for `{field_name}` patterns
2. Generate AI suggestions for each field
3. Return suggestions keyed by field name

---

## Testing Checklist

### Smart Fill Flow

- [ ] Open Smart Fill modal from library
- [ ] Verify modal shows template fields (not empty)
- [ ] Add context (optional)
- [ ] Confirm cost (2 credits)
- [ ] Verify backend returns suggestions for ALL fields
- [ ] Check suggestions display in UI
- [ ] Apply suggestions
- [ ] Verify navigation to optimizer with filled content

### Variations Flow

- [ ] Open Variations from template detail
- [ ] Confirm cost (5 credits)
- [ ] Verify backend returns 4 variations
- [ ] Check each variation has title, content, difference_summary
- [ ] Copy variation to clipboard
- [ ] Use variation (should update template content)

### AI Search Flow

- [ ] Type 10+ characters in search
- [ ] Verify AI dropdown appears
- [ ] Check relevance scores displayed
- [ ] Click recommendation
- [ ] Verify navigation to template

---

## Common Issues & Solutions

### Issue: "No fields to fill"

**Cause:** Backend can't find variables in template content

**Solution:** Ensure template content uses `{field_name}` syntax (not `{{field_name}}`)

### Issue: "Suggestions don't match fields"

**Cause:** Backend returns different field names than frontend expects

**Solution:** Backend must use exact field labels from template

### Issue: "Credits deducted but no suggestions"

**Cause:** API error after credit deduction

**Solution:** Frontend should refund credits on error (already implemented)

### Issue: "Smart Fill button disabled"

**Cause:** Template has no fields/variables

**Solution:** Check template has `{variables}` before showing button

---

## Backend Implementation Checklist

For the backend developer to ensure proper integration:

### Smart Fill Endpoint

- [ ] Parse template content for `{variable}` patterns
- [ ] Extract field names from template.fields if available
- [ ] Call AI with: template content + variables + context
- [ ] Generate 2-3 suggestions per variable
- [ ] Return format: `{ filled_prompt, suggestions, credits_used }`
- [ ] Deduct 2 credits from user's balance
- [ ] Return 402 if insufficient credits

### Recommendations Endpoint

- [ ] Accept intent string (min 10 chars for AI, less for keyword)
- [ ] Perform semantic search (vector similarity or AI-powered)
- [ ] Fall back to keyword search if credits depleted
- [ ] Return format: `[{ template_id, title, relevance_score, reason, category }]`
- [ ] Deduct 1 credit for AI search, 0 for keyword fallback
- [ ] Include relevance_score (0.0 - 1.0)

### Variations Endpoint

- [ ] Load template content
- [ ] Generate 4 variations with different tones:
  - Professional
  - Casual
  - Persuasive
  - Creative
- [ ] Return format: `[{ title, content, difference_summary }]`
- [ ] Deduct 5 credits
- [ ] Return 402 if insufficient credits

---

## API Request/Response Examples

### Smart Fill Request

```json
POST /api/v2/templates/550e8400-e29b-41d4-a716-446655440000/smart-fill/
Authorization: Bearer <token>
Content-Type: application/json

{
  "variables": {
    "topic": "",
    "audience": "",
    "tone": "",
    "_context": "Cold outreach email for B2B SaaS targeting HR managers"
  }
}
```

### Smart Fill Response

```json
{
  "filled_prompt": "Subject: Transform Your HR Operations with AI\n\nDear HR Director,\n\nAre you still manually processing employee data?...",
  "suggestions": {
    "topic": [
      "AI-powered HR automation",
      "Machine learning for recruitment"
    ],
    "audience": [
      "HR Directors at mid-size companies",
      "People Operations leaders"
    ],
    "tone": [
      "Professional yet approachable",
      "Confident and data-driven"
    ]
  },
  "credits_used": 2
}
```

### Variations Request

```json
POST /api/v2/templates/550e8400-e29b-41d4-a716-446655440000/variations/
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 4
}
```

### Variations Response

```json
[
  {
    "title": "Professional Version",
    "content": "Dear esteemed colleague,\n\nI am writing to formally introduce...",
    "difference_summary": "Formal business language, third-person perspective"
  },
  {
    "title": "Casual Version",
    "content": "Hey there!\n\nJust wanted to reach out and share...",
    "difference_summary": "Conversational tone, first-person, friendly"
  },
  {
    "title": "Persuasive Version",
    "content": "Stop losing customers to competitors!\n\nOur proven system...",
    "difference_summary": "Urgent language, pain-point focused, call-to-action"
  },
  {
    "title": "Creative Version",
    "content": "Imagine a world where...\n\nPicture this: your team effortlessly...",
    "difference_summary": "Storytelling approach, vivid imagery, emotional"
  }
]
```

---

## Next Steps

1. **Backend Developer:** Implement the 3 endpoints with exact response formats
2. **Frontend Developer:** Fix library page to fetch and pass template fields
3. **QA:** Test end-to-end flow with real credits and API calls
4. **Deploy:** Push to staging for integration testing

---

**Last Updated:** March 13, 2026  
**Status:** Frontend ready, awaiting backend implementation
