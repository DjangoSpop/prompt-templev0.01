# Privacy Policy Maintenance & Update Guide

**For:** Prompt Temple Broadcaster Extension  
**Updated:** February 28, 2026

---

## Overview

This guide helps you keep your privacy policy current and compliant as your extension evolves. Use this whenever you add features, change permissions, or modify data handling.

---

## When to Update the Privacy Policy

### 🚩 Critical Updates Required

Update **immediately** when you:

1. **Add New Permissions**
   - Example: Added `contextMenus` permission
   - Action: Add justification to Permissions section
   - Timeline: Before publishing update

2. **Change Data Collection**
   - Example: Started collecting user research topics
   - Action: Update "What We Collect" section
   - Timeline: Before publishing update

3. **Modify Third-Party Integrations**
   - Example: Integrated with new API
   - Action: Update Third-Party Integrations section
   - Timeline: Before publishing update

4. **Change Authentication/Sync**
   - Example: Added Discord authentication
   - Action: Update identity permission justification
   - Timeline: Before publishing update

### ⚠️ Important Updates Within 30 Days

Update when you:

1. **Add New Features**
   - Example: Added export to JSON feature
   - Action: Update Core Features list
   - Timeline: Within 30 days

2. **Modify Access Patterns**
   - Example: Now access ChatGPT on new domain
   - Action: Update Host Permissions section
   - Timeline: Within 30 days

3. **Change Data Retention**
   - Example: Extend local storage from 30 to 90 days
   - Action: Update Data Storage section
   - Timeline: Within 30 days

4. **Update Security Measures**
   - Example: Added encryption to stored data
   - Action: Update Security section
   - Timeline: Within 30 days

### 📝 Standard Updates

Update within quarterly review when you:

1. **Add/Remove AI Providers**
2. **Change keyboard shortcuts**
3. **Modify UI/UX**
4. **Update support contact info**
5. **Change company information**

---

## How to Update the Privacy Policy

### Step 1: Identify What Changed

Create a checklist of what changed in your extension:

```
- [ ] New permission added
- [ ] Feature added/removed
- [ ] Data handling modified
- [ ] Third-party integration changed
- [ ] Company info updated
- [ ] UI/UX changed (user-facing)
- [ ] Authentication method changed
- [ ] Data storage method changed
```

### Step 2: Locate Relevant Sections

Use this map to find what to update:

| Change Type | Section to Update | File |
|------------|------------------|------|
| New permission | Permissions & Justifications | PrivacyPolicyContent.tsx |
| Data collection | Data Collection & Usage | PrivacyPolicyContent.tsx |
| Third-party | Data Sharing & Third Parties | PrivacyPolicyContent.tsx |
| Company info | All sections with company name | All files |
| Support email | Contact Information | All files |
| Features | Core Features + Policy intro | PrivacyPolicyContent.tsx |
| Security measures | Security section | PRIVACY_POLICY_CHROME_WEBSTORE.md |

### Step 3: Make the Updates

#### Example: Adding a New Permission

**Original:**
```tsx
// In permissions array
{
  id: 'identity',
  title: 'identity',
  // ...content
}
```

**Updated:**
```tsx
// Add new permission
{
  id: 'downloads',
  title: 'downloads',
  icon: <Download className="w-6 h-6" />,
  content: (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-lg border...">
        <h5 className="font-semibold">downloads</h5>
        <p className="text-sm text-gray-700">
          Used to enable users to download broadcast results and prompt history as JSON or CSV files.
        </p>
      </div>
    </div>
  ),
}
```

#### Example: Updating Core Features

**Original:**
```tsx
<li>Access side panel with prompt library and research tools</li>
<li>Optional cross-device sync with user authentication</li>
```

**Updated:**
```tsx
<li>Access side panel with prompt library and research tools</li>
<li>Optional cross-device sync with user authentication</li>
<li>Export prompts to JSON/CSV file format</li>
<li>Scheduled prompt broadcasting at specific times</li>
```

### Step 4: Update Markdown Version

Update [PRIVACY_POLICY_CHROME_WEBSTORE.md](PRIVACY_POLICY_CHROME_WEBSTORE.md):

1. Find matching section
2. Make same changes
3. Update "Last Updated" date
4. Keep both versions in sync

### Step 5: Test Changes

- [ ] Open Privacy Policy page in browser
- [ ] Check all accordion sections
- [ ] Verify new content displays correctly
- [ ] Test mobile responsiveness
- [ ] Test dark/light mode
- [ ] Verify no broken links
- [ ] Check spelling and grammar

### Step 6: Version Control

In your git repository:

```bash
git add src/components/privacy/PrivacyPolicyContent.tsx
git add PRIVACY_POLICY_CHROME_WEBSTORE.md
git commit -m "docs: Update privacy policy - add downloads permission and export feature"
git tag v1.0.1-privacy-update
```

---

## Common Updates & Templates

### When You Add a New Permission

**Template for Permission Justification:**

```
PERMISSION_NAME
Purpose: [Specific use case]
User Control: [How users are in control]
Data Handling: [Where data goes]
```

**Example:**

```
downloads
Purpose: Used to enable users to download broadcast results and prompt history as JSON or CSV files.
User Control: Only triggered when user explicitly clicks the export/download button.
Data Handling: Files are generated locally and downloaded to user's device. No data sent to servers.
```

### When You Add New Features

Update in **Core Features** section:

**Original:**
```tsx
<li>Inject user prompts into supported AI provider pages (ChatGPT, Claude, Gemini, etc.)</li>
<li>Broadcast prompts across multiple AI platforms simultaneously</li>
```

**Add new feature:**
```tsx
<li>Inject user prompts into supported AI provider pages (ChatGPT, Claude, Gemini, etc.)</li>
<li>Broadcast prompts across multiple AI platforms simultaneously</li>
<li>NEW FEATURE: [Description of new capability]</li>
```

### When You Add Third-Party Integration

Update **Third-Party Integrations** section:

```tsx
// Add to the list
{
  title: 'Anthropic (Claude)',
  desc: 'Injecting prompts into Claude interface. No data logging by extension.',
},
```

### When You Store New Data Locally

Update **What We Store Locally** section:

```tsx
{
  title: 'Broadcast Scheduled Tasks', // NEW
  desc: 'Scheduled prompts and timing preferences, kept local',
},
```

### When Changing Company Information

**Files to update:**

1. `PRIVACY_POLICY_CHROME_WEBSTORE.md`
   - Search: `prompt[Tt]emple|prompttemple\.dev`
   - Replace: Your company name and domain

2. `src/components/privacy/PrivacyPolicyContent.tsx`
   - Search: `support@prompttemple\.dev`
   - Replace: Your support email
   - Search: `prompts` (in branding context)
   - Replace: Your extension name

3. `src/app/privacy-policy/terms-of-service/page.tsx`
   - Same replacements as above

---

## Compliance Updates

### Quarterly Compliance Review

Every 3 months, check:

- [ ] Privacy policy matches actual extension behavior
- [ ] No undisclosed data collection
- [ ] All permissions are still necessary
- [ ] No security vulnerabilities
- [ ] Chrome Web Store listing is accurate
- [ ] GDPR/CCPA sections are current
- [ ] Contact info is up-to-date
- [ ] Terms of Service still applicable

### Annual Legal Review

Every year (or when significant changes):

- [ ] Have legal team review policy
- [ ] Update for new regulations
- [ ] Verify jurisdiction compliance
- [ ] Check for obsolete sections
- [ ] Update company information
- [ ] Archive previous version

### After Security Incident

If privacy/security issue occurs:

1. **Assess Impact**
   - What data affected?
   - How many users?
   - Duration of issue?

2. **Disclose Transparently**
   - Update privacy policy
   - Explain what happened
   - Describe resolution
   - Share timeline

3. **Add to Policy**
   ```markdown
   ## Security Incident Disclosure [Date]
   
   **What happened:** [Brief description]
   **Affected data:** [What was affected]
   **Resolution:** [How it was fixed]
   **User action:** [If any required]
   ```

---

## Version History Template

Keep a log of privacy policy changes:

```markdown
## Version History

### v1.0.1 (2026-03-15)
- Added downloads permission
- Added export to JSON/CSV feature
- Updated Core Features section

### v1.0.0 (2026-02-28)
- Initial privacy policy
- Prompt Temple Broadcaster v1.0 launch
- Chrome Web Store submission
```

---

## Testing Privacy Policy Changes

### Browser Inspector Tests

```javascript
// Test 1: Verify all accordion sections exist
const sections = document.querySelectorAll('[class*="accordion"]');
console.log('Total sections:', sections.length);

// Test 2: Verify all links are valid
const links = document.querySelectorAll('a[href*="http"]');
links.forEach(link => {
  console.log('Link:', link.href, 'Target:', link.target);
});

// Test 3: Verify dark mode works
document.documentElement.classList.toggle('dark');
// Check styling updates
```

### Manual Testing Checklist

- [ ] All section headers are clickable
- [ ] Sections expand/collapse correctly
- [ ] Content is readable in light mode
- [ ] Content is readable in dark mode
- [ ] Mobile view looks good (< 640px)
- [ ] Tablet view looks good (640px - 1024px)
- [ ] Desktop view looks good (> 1024px)
- [ ] All links open correctly
- [ ] No layout shifts when expanding sections
- [ ] Font sizes are readable
- [ ] Icons display correctly
- [ ] Color contrast meets WCAG standards

---

## Chrome Web Store Update Process

### When Publishing Extension Update

1. **Update Privacy Policy First**
   - Make all changes
   - Test thoroughly
   - Deploy to website

2. **Update Chrome Web Store Listing**
   - Copy updated policy to store
   - Update version number
   - Update changelog
   - Re-submit permission justifications if needed

3. **Notify Users** (if significant changes)
   - In-app notification
   - Email notification
   - Social media post

4. **Document**
   - Add to version history
   - Tag git commit
   - Archive old version

### Permission Update Timeline

```
Day 1: Update permission in code
Day 2: Update privacy policy
Day 3: Test in development
Day 4: Test on staging
Day 5: Prepare Chrome Web Store submission
Day 6: Submit to Chrome Web Store
Days 7-14: Wait for review
Day 15+: Update published
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Not Updating Policy with Permission Changes

**Wrong:**
- Add `downloads` permission to manifest
- Don't update privacy policy
- Submit to Chrome Web Store

**Right:**
- Update manifest with `downloads` permission
- Add downloads permission justification to privacy policy
- Update Core Features to mention download capability
- Submit both code and updated policy to Chrome Web Store

### ❌ Mistake 2: Overstating or Understating Permissions

**Wrong:**
```
"Justification: Used for general extension functionality
```

**Right:**
```
"Used specifically to download user's saved prompts as CSV files when user clicks the export button. Files are saved locally to user's device only."
```

### ❌ Mistake 3: Not Testing After Updates

**Wrong:**
- Update policy
- Immediately publish

**Right:**
- Update policy
- Test in browser
- Check mobile view
- Verify spelling
- Check for broken links
- Then publish

### ❌ Mistake 4: Forgetting to Sync Markdown and Component

**Wrong:**
- Update `PrivacyPolicyContent.tsx`
- Forget to update `PRIVACY_POLICY_CHROME_WEBSTORE.md`

**Right:**
- Update both files with same changes
- Verify both are in sync
- Test both versions

---

## Tools & Resources

### Helpful Tools

- **Grammarly:** Grammar checking
- **Color Contrast Checker:** WCAG compliance
- **Responsive Design Tester:** Mobile testing
- **Git:** Version control
- **VS Code:** Editing

### Reference Documents

- [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Google Privacy Policy Requirements](https://support.google.com/chrome_webstore/answer/10047207)
- [GDPR Compliance Guide](https://gdpr-info.eu/)
- [CCPA Compliance Guide](https://cpra-info.ca.gov/)

### Regulatory Requirements

- Check state privacy laws annually
- Monitor GDPR updates (if serving EU)
- Monitor CCPA updates (if serving CA)
- Research industry-specific regulations

---

## Quick Update Checklist

Before publishing any update that touches privacy:

- [ ] Identified all changes made
- [ ] Updated `PrivacyPolicyContent.tsx`
- [ ] Updated `PRIVACY_POLICY_CHROME_WEBSTORE.md`
- [ ] Tested on browser
- [ ] Tested on mobile
- [ ] Tested dark mode
- [ ] Verified links work
- [ ] Checked spelling/grammar
- [ ] Updated version history
- [ ] Git committed with clear message
- [ ] Chrome Web Store listing updated
- [ ] Users notified (if necessary)
- [ ] Archived old version

---

## Support & Questions

**If you need to update but unsure:**

1. Review relevant section in this guide
2. Check "Common Updates & Templates"
3. Use provided template
4. Test thoroughly
5. Have legal review if major changes

**Remember:**
- ✅ Be specific about what permissions do
- ✅ Be transparent about data practices
- ✅ Be clear about user control
- ✅ Update immediately for critical changes
- ✅ Keep historical versions
- ✅ Test thoroughly before publishing

---

Last Updated: February 28, 2026  
Next Scheduled Review: May 28, 2026
