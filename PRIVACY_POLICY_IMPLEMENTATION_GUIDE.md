# Privacy Policy Implementation Guide

## Overview

This guide explains how to use the privacy policy pages created for Prompt Temple Broadcaster extension and how to integrate them with Chrome Web Store.

---

## Files Created

### 1. **Main Privacy Policy Component**
- **File:** `src/components/privacy/PrivacyPolicyContent.tsx`
- **Type:** Reusable React component with accordion sections
- **Features:**
  - Expandable sections for easy navigation
  - Chrome Web Store compliance checklist
  - Permission justifications
  - Data handling disclosures
  - User consent agreements
  - Dark mode support
  - Mobile responsive

### 2. **Privacy Policy Page (With Sidebar)**
- **File:** `src/app/privacy-policy/page.tsx`
- **URL:** `https://yoursite.com/privacy-policy`
- **Layout:** Full-page with sidebar navigation
- **Use Case:** Primary privacy policy page on your website

### 3. **Standalone Privacy Policy Page (No Sidebar)**
- **File:** `src/app/privacy-policy/standalone/page.tsx`
- **URL:** `https://yoursite.com/privacy-policy/standalone`
- **Layout:** Clean, standalone version without navigation
- **Use Case:** Can be embedded or used in extension settings page

### 4. **Terms of Service Page**
- **File:** `src/app/privacy-policy/terms-of-service/page.tsx`
- **URL:** `https://yoursite.com/privacy-policy/terms-of-service`
- **Features:**
  - Complete T&S documentation
  - Warranty disclaimers
  - Limitation of liability
  - Third-party service terms
  - Governing law provisions
  - Contact information

### 5. **Markdown Export for Chrome Web Store**
- **File:** `PRIVACY_POLICY_CHROME_WEBSTORE.md`
- **Use Case:** 
  - Copy-paste content for Chrome Web Store listing
  - GDPR and CCPA compliance statements
  - Implementation checklist
  - Developer notes for review team

---

## How to Use

### For Website Deployment

1. **Add Navigation Links**
   Add to your main navigation/footer:
   ```tsx
   <Link href="/privacy-policy">Privacy Policy</Link>
   <Link href="/privacy-policy/terms-of-service">Terms of Service</Link>
   ```

2. **Access the Pages**
   - Privacy Policy: `https://yoursite.com/privacy-policy`
   - Terms of Service: `https://yoursite.com/privacy-policy/terms-of-service`

3. **Customize Links**
   Edit the support email in components:
   - Search for `support@prompttemple.dev`
   - Replace with your actual support email

### For Chrome Web Store Extension Listing

1. **Add to Extension Manifest**
   Update your `manifest.json`:
   ```json
   {
     "name": "Prompt Temple Broadcaster",
     "short_name": "Prompt Broadcaster",
     "description": "Broadcast prompts across multiple AI platforms efficiently",
     "homepage_url": "https://prompttemple.dev",
     "action": {
       "default_popup": "popup.html"
     }
   }
   ```

2. **Chrome Web Store Data Form**
   When submitting to Chrome Web Store:
   - **Privacy Policy URL:** `https://yoursite.com/privacy-policy`
   - **Terms of Service* (if required):** `https://yoursite.com/privacy-policy/terms-of-service`
   - **Privacy Practices:** Copy content from `PRIVACY_POLICY_CHROME_WEBSTORE.md`

3. **Permission Justifications**
   Use the permission justifications in the Privacy Policy component:
   - activeTab - Opens current AI provider tab
   - tabs - Manages broadcast destinations
   - storage - Saves templates locally
   - scripting - Injects prompts on AI sites
   - clipboardWrite/Read - Copy/paste prompts
   - sidePanel - Optional research panel
   - alarms - Lightweight housekeeping
   - identity - Optional sign-in for sync

4. **Data Collection Disclosure**
   Select "No" for all data collection questions:
   - ✓ No personally identifiable information
   - ✓ No health information
   - ✓ No financial information
   - ✓ No authentication credentials
   - ✓ No personal communications
   - ✓ No location data
   - ✓ No web history
   - ✓ No user activity tracking
   - ✓ No website content extraction

---

## Customization Guide

### Update Company Information

1. **Support Email**
   - File: `src/components/privacy/PrivacyPolicyContent.tsx`
   - Search for: `support@prompttemple.dev`
   - Replace with your email

2. **Website Links**
   - File: Both privacy pages
   - Search for: `prompttemple.dev`
   - Replace with your domain

3. **Company Name**
   - File: All files containing "Prompt Temple"
   - Replace with your company/extension name

4. **Contact Information**
   - Update email address
   - Add physical address (if required by law)
   - Add support form link (if available)

### Add Additional Sections

To add new sections to the privacy policy:

1. Open `src/components/privacy/PrivacyPolicyContent.tsx`
2. Find the `sections` array
3. Add new section object:
   ```tsx
   {
     id: 'section-id',
     title: 'Section Title',
     icon: <IconComponent className="w-6 h-6" />,
     content: (
       <div>
         Your content here
       </div>
     ),
   }
   ```

### Customize Styling

- **Colors:** Edit Tailwind classes (e.g., `from-blue-600 to-pink-600`)
- **Icons:** Import from `lucide-react` library
- **Layout:** Modified in page component wrappers
- **Dark Mode:** Already included with Tailwind dark: prefix

---

## Deployment Checklist

### Before Publishing

- [ ] Update all company/extension names
- [ ] Update support email address
- [ ] Update website URL/domain
- [ ] Review all permission justifications
- [ ] Verify data collection disclosures
- [ ] Test all accordion sections open/close
- [ ] Test responsive design on mobile
- [ ] Test dark/light mode toggle
- [ ] Verify links are not broken
- [ ] Review for typos and grammar
- [ ] Have legal review if required
- [ ] Test on Chrome, Firefox, Edge browsers

### Chrome Web Store Submission

- [ ] Privacy Policy URL deployed and accessible
- [ ] Terms of Service URL ready (if needed)
- [ ] Copy CHROME_WEBSTORE.md content to store listing
- [ ] Fill out all permission justifications
- [ ] Provide clear description of data practices
- [ ] Ensure manifest matches privacy claims
- [ ] Remove any analytics/tracking code before submission
- [ ] Test extension functionality without analytics
- [ ] Prepare for potential in-depth review (host permissions)
- [ ] Keep documentation updated post-launch

### Post-Launch

- [ ] Monitor Chrome Web Store reviews for privacy concerns
- [ ] Update privacy policy if practices change
- [ ] Maintain version history of policy changes
- [ ] Respond to user privacy inquiries
- [ ] Keep contact information current
- [ ] Regular security audits
- [ ] Update GDPR/CCPA sections annually

---

## Legal Considerations

### Important Notes

1. **This is not legal advice** - Review with your legal team
2. **Jurisdiction matters** - Adapt based on where users are located
3. **GDPR/CCPA compliance** - Sections included but verify application
4. **Regular updates** - keep policy current with any changes

### Required Changes

You may need to add:
- Physical address or business entity information
- Specific jurisdiction information
- Data retention policies (if applicable)
- Technical security measures (if needed)
- Links to parent company policies (if applicable)

### Legal Review Checklist

- [ ] Have a lawyer review before publication
- [ ] Verify GDPR compliance (if applicable)
- [ ] Check CCPA requirements (if serving CA users)
- [ ] Review state-specific privacy laws
- [ ] Verify Chrome Web Store compliance
- [ ] Check Google terms requirements
- [ ] Ensure matches actual extension behavior

---

## Integration Examples

### Adding Privacy Link to Extension Options Page

```tsx
// manifest.json
{
  "options_page": "src/app/options/page.html",
  "permissions": ["storage"]
}

// In your options page component:
<a 
  href="https://yoursite.com/privacy-policy/standalone" 
  target="_blank" 
  rel="noopener noreferrer"
>
  View Privacy Policy
</a>
```

### Adding to Extension Popup

```tsx
// popup.tsx
import Link from 'next/link';

export default function Popup() {
  return (
    <div>
      <p>Settings & Information</p>
      <Link href="/privacy-policy">Privacy Policy</Link>
      <Link href="/privacy-policy/terms-of-service">Terms</Link>
    </div>
  );
}
```

### Environment Variables (if needed)

Create `.env.local`:
```
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourcompany.com
NEXT_PUBLIC_COMPANY_NAME=Your Company Name
NEXT_PUBLIC_WEBSITE_URL=https://yoursite.com
```

Then update components to use these variables.

---

## FAQ

### Q: Can I use this for other extensions?
**A:** Yes! The component is generic and reusable. Just customize the content and permissions to match your extension.

### Q: Do I need Terms of Service?
**A:** It's recommended, especially for extensions handling data. Chrome Web Store doesn't always require it, but it's good practice.

### Q: Can I inline this on my extension's options page?
**A:** Yes! Use the `/privacy-policy/standalone` version or import the `PrivacyPolicyContent` component directly.

### Q: How often should I update this?
**A:** Update whenever:
- Your extension's functionality changes
- Permissions are added/removed
- Data practices change
- New features are launched
- Legal requirements change

### Q: Is this GDPR compliant?
**A:** The policy includes GDPR sections, but have a lawyer review for your specific situation.

### Q: Can I translate this?
**A:** Yes! Extract the text to a i18n library (like next-intl) and provide translations.

---

## Support

For questions about implementing this privacy policy:
1. Review the PrivacyPolicyContent component documentation
2. Check the markdown version for detailed explanations
3. Have your legal team review before publication
4. Test thoroughly on Chrome Web Store review process

---

**Important:** This is a template. Customize it completely for your extension before publication.

Last updated: February 28, 2026
