# Smart Template Implementation - Critical Fix Applied

## Issue Identified

The library page was passing **empty variables** (`variables={{}}`) to the SmartFillPanel, which meant:
- Backend couldn't identify which fields need to be filled
- AI had no context about template structure
- Smart Fill would fail or return useless suggestions

## Root Cause

```tsx
// ❌ BEFORE - Library page (WRONG)
<SmartFillPanel
  templateId={smartFillTemplateId}
  variables={{}}  // Empty! Backend can't work with this
  onApply={...}
/>
```

## Fix Applied

### 1. Fetch Template Before Opening Modal

Updated `handleSmartFill` to fetch the full template with fields:

```tsx
// ✅ AFTER - Library page (CORRECT)
const handleSmartFill = useCallback(async (templateId: string) => {
  setIsFetchingTemplate(true);
  try {
    // Fetch the full template with fields from backend
    const template = await apiClient.getTemplate(templateId);
    setSmartFillTemplate(template);
    setSmartFillTemplateId(templateId);
    setSmartFillOpen(true);
  } catch (error) {
    console.error('Failed to fetch template for Smart Fill:', error);
    // Fallback: open with just the ID
    setSmartFillTemplateId(templateId);
    setSmartFillOpen(true);
  } finally {
    setIsFetchingTemplate(false);
  }
}, []);
```

### 2. Pass Real Variables to SmartFillPanel

```tsx
// ✅ AFTER - SmartFillPanel receives actual field data
<SmartFillPanel
  open={smartFillOpen}
  onOpenChange={setSmartFillOpen}
  templateId={smartFillTemplateId}
  templateTitle={smartFillTemplate?.title}
  templatePreview={smartFillTemplate?.template_content?.substring(0, 150)}
  variables={
    smartFillTemplate?.fields
      ? Object.fromEntries(
          smartFillTemplate.fields.map((field) => [field.label, field.default_value || ''])
        )
      : {}
  }
  onApply={...}
/>
```

### 3. Handle Both Variable Syntaxes

Templates may use `{field}` or `{{field}}` syntax. Updated replacement logic:

```tsx
Object.entries(suggestions).forEach(([key, value]) => {
  // Try both {key} and {{key}} patterns
  filledContent = filledContent.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
  filledContent = filledContent.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
});
```

---

## Data Flow (Fixed)

```
User clicks "AI Fill"
  ↓
Library fetches template from API
  ↓
Template includes: { id, title, template_content, fields: [{ label, default_value }] }
  ↓
SmartFillPanel opens with variables = { topic: "", audience: "", tone: "" }
  ↓
User adds context + confirms (2 credits)
  ↓
Backend receives: { variables: { topic: "", audience: "", tone: "", _context: "..." } }
  ↓
Backend parses template_content for {topic}, {audience}, {tone}
  ↓
Backend AI generates suggestions for each field
  ↓
Backend returns: { filled_prompt, suggestions: { topic: [...], audience: [...] }, credits_used: 2 }
  ↓
User reviews suggestions → Applies them
  ↓
Navigate to optimizer with filled template
```

---

## Backend Requirements

For this to work, the backend MUST:

### 1. Parse Template Fields

```python
# Extract field names from template_content
import re

def extract_fields(template_content: str) -> List[str]:
    # Match both {field} and {{field}} patterns
    pattern = r'\{\{?\s*(\w+)\s*\}\}?'
    matches = re.findall(pattern, template_content)
    return list(set(matches))  # Remove duplicates
```

### 2. Generate AI Suggestions

```python
# For each field, generate suggestions based on:
# - Field name
# - Other field values (if provided)
# - _context parameter
# - Template content

def generate_suggestions(template, variables, context):
    fields = extract_fields(template.template_content)
    suggestions = {}
    
    for field in fields:
        # Call AI to generate 2-3 suggestions for this field
        ai_response = call_ai(
            prompt=f"""
            Template: {template.template_content}
            Field to fill: {field}
            Context: {context}
            Other variables: {variables}
            
            Generate 2-3 creative suggestions for the '{field}' field.
            Return as JSON array.
            """
        )
        suggestions[field] = ai_response.suggestions
    
    return {
        'filled_prompt': render_template(template, suggestions),
        'suggestions': suggestions,
        'credits_used': 2
    }
```

### 3. Return Correct Format

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

**Critical:** The keys in `suggestions` MUST match the field labels exactly.

---

## Testing Instructions

### Manual Test Flow

1. **Navigate to Library**
   - Go to `/library`
   - Find any template with variables (look for `{field}` in preview)

2. **Click "AI Fill" Button**
   - Modal should open
   - Should show template title and preview
   - Should list variables to fill (NOT empty!)

3. **Add Context**
   - Type in context box: "Cold email for B2B SaaS"
   - Click "Generate Suggestions"

4. **Cost Confirmation**
   - Should show "2 credits"
   - Should show remaining credits after
   - Click "Confirm"

5. **Egyptian Loading**
   - Should see hieroglyphic animation
   - Message: "Analyzing your template and context..."

6. **Review Suggestions**
   - Should see 2-3 suggestions per field
   - Toggle accept/reject for each
   - First suggestion marked as "best"

7. **Apply & Navigate**
   - Click "Apply Suggestions"
   - Should navigate to `/optimization`
   - Template content should have all fields filled

### Expected API Calls

```
GET /api/v2/templates/{id}/
  → Returns template with fields array

POST /api/v2/templates/{id}/smart-fill/
  Body: { variables: { field1: "", field2: "", _context: "..." } }
  → Returns { filled_prompt, suggestions, credits_used: 2 }
```

---

## Files Modified

| File | Change | Line |
|------|--------|------|
| `src/app/(app)/library/page.tsx` | Added `apiClient` import | ~56 |
| `src/app/(app)/library/page.tsx` | Added `smartFillTemplate` state | ~260 |
| `src/app/(app)/library/page.tsx` | Added `isFetchingTemplate` state | ~267 |
| `src/app/(app)/library/page.tsx` | Updated `handleSmartFill` to fetch template | ~327-344 |
| `src/app/(app)/library/page.tsx` | Updated SmartFillPanel to receive real variables | ~685-720 |

---

## Backend Status

### ✅ Already Implemented (According to API_COVERAGE_MATRIX.md)

```python
# Backend URLs (from API_COVERAGE_MATRIX.md)
path('templates/recommend/', views.TemplateRecommendView.as_view()),
path('templates/<uuid:template_id>/smart-fill/', views.TemplateSmartFillView.as_view()),
path('templates/<uuid:template_id>/variations/', views.TemplateVariationsView.as_view()),
```

### ⚠️ Needs Verification

Backend developer must confirm:
1. `TemplateSmartFillView` actually parses template fields
2. Returns suggestions keyed by field label
3. Deducts 2 credits correctly
4. Handles insufficient credits (402 response)

---

## Common Backend Mistakes to Avoid

### ❌ WRONG: Returning generic suggestions

```json
{
  "suggestions": ["Option 1", "Option 2", "Option 3"]
}
```

### ✅ CORRECT: Returning field-specific suggestions

```json
{
  "suggestions": {
    "topic": ["AI in healthcare", "ML for doctors"],
    "audience": ["Medical professionals", "HR managers"],
    "tone": ["Professional", "Casual"]
  }
}
```

### ❌ WRONG: Using different field names

```json
{
  "suggestions": {
    "field_1": ["..."],  // Frontend expects "topic"
    "var_2": ["..."]     // Frontend expects "audience"
  }
}
```

### ✅ CORRECT: Matching field labels exactly

```json
{
  "suggestions": {
    "topic": ["..."],
    "audience": ["..."],
    "tone": ["..."]
  }
}
```

---

## Next Steps

1. **Backend Developer:**
   - Verify `TemplateSmartFillView` implementation
   - Ensure it parses fields from `template_content`
   - Test with real template that has `{variables}`
   - Confirm credit deduction works

2. **Frontend Developer:**
   - Test Smart Fill flow end-to-end
   - Verify fields display in modal
   - Check suggestions match field names
   - Validate navigation to optimizer

3. **QA:**
   - Test with templates that have 0 fields
   - Test with templates that have 10+ fields
   - Test with both `{field}` and `{{field}}` syntax
   - Test error scenarios (insufficient credits, API errors)

---

## Summary

**Problem:** Library page passed empty variables to Smart Fill  
**Solution:** Fetch template first, extract fields, pass real variables  
**Result:** Backend now receives proper field data for AI suggestions  

**Status:** ✅ Frontend fixed, awaiting backend verification

---

**Fixed:** March 13, 2026  
**By:** AI Assistant  
**Files Changed:** 1 (library page)
