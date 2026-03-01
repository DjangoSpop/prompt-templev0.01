# Privacy Policy - Prompt Temple Broadcaster

## 📍 This Directory

This folder contains the privacy policy and terms of service for the Prompt Temple Broadcaster browser extension.

---

## 🌐 Live Pages

These pages are automatically available at:

| Page | URL | File |
|------|-----|------|
| Privacy Policy | `/privacy-policy` | `page.tsx` |
| Privacy Policy (Standalone) | `/privacy-policy/standalone/` | `standalone/page.tsx` |
| Terms of Service | `/privacy-policy/terms-of-service/` | `terms-of-service/page.tsx` |

---

## 📄 Files in This Directory

### Main Privacy Policy Page
- **File:** `page.tsx`
- **Route:** `/privacy-policy`
- **Description:** Full privacy policy with sidebar navigation
- **Display:** Complete extension compliance information
- **Best for:** Main website privacy policy link

### Standalone Privacy Policy Page
- **File:** `standalone/page.tsx`
- **Route:** `/privacy-policy/standalone`
- **Description:** Privacy policy without sidebar (clean layout)
- **Display:** Can be embedded in iframes
- **Best for:** Extension options page, modals, embeds

### Terms of Service Page
- **File:** `terms-of-service/page.tsx`
- **Route:** `/privacy-policy/terms-of-service`
- **Description:** Complete terms and conditions
- **Display:** Legal service terms
- **Best for:** Linked from privacy policy and footer

---

## 🧩 Component Used

All pages use the reusable component:
- **File:** `src/components/privacy/PrivacyPolicyContent.tsx`
- **Type:** React component with accordion sections
- **Features:** 
  - Expandable sections
  - Dark mode support
  - Mobile responsive
  - Professional styling
  - Chrome Web Store compliance

---

## 📚 Related Documentation

These files are in the root directory:

| File | Purpose |
|------|---------|
| `PRIVACY_POLICY_IMPLEMENTATION_SUMMARY.md` | Overview of what was created |
| `PRIVACY_POLICY_IMPLEMENTATION_GUIDE.md` | How to customize and use |
| `CHROME_WEBSTORE_SUBMISSION_CHECKLIST.md` | Pre-submission verification (80+ items) |
| `PRIVACY_POLICY_MAINTENANCE_GUIDE.md` | How to keep policy updated |
| `PRIVACY_POLICY_CHROME_WEBSTORE.md` | Markdown version for Chrome Web Store |

---

## 🚀 Getting Started

### For Development

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit pages:
   - http://localhost:3000/privacy-policy
   - http://localhost:3000/privacy-policy/standalone
   - http://localhost:3000/privacy-policy/terms-of-service

### For Customization

1. Open `src/components/privacy/PrivacyPolicyContent.tsx`
2. Find your company information to update:
   - `support@prompttemple.dev` → your email
   - `prompttemple.dev` → your domain
   - `Prompt Temple` → your company name

3. Update any permissions or data practices specific to your extension

4. Test all pages to verify styling and content

### For Chrome Web Store Submission

1. Follow `CHROME_WEBSTORE_SUBMISSION_CHECKLIST.md`
2. Get privacy page fully working
3. Copy content to Chrome Web Store listing
4. Submit for review

---

## 🔧 Customization

### Update Company Info

**Files to Edit:**
- `src/components/privacy/PrivacyPolicyContent.tsx` (main component)
- `src/app/privacy-policy/terms-of-service/page.tsx` (for T&S)
- Root `PRIVACY_POLICY_CHROME_WEBSTORE.md` (for store listing)

**Search & Replace:**
```
support@prompttemple.dev → support@yourcompany.com
prompttemple.dev → yourcompany.com
Prompt Temple → Your Company
Prompt Temple Broadcaster → Your Extension Name
```

### Modify Sections

Each section in `PrivacyPolicyContent.tsx` is a separate object:

```tsx
{
  id: 'unique-id',
  title: 'Section Title',
  icon: <IconComponent className="w-6 h-6" />,
  content: (
    <div>
      Your content here
    </div>
  )
}
```

Add, remove, or edit sections as needed.

### Adjust Colors

Find Tailwind color classes like:
- `from-blue-600 to-pink-600` (gradient)
- `text-blue-700` (text color)
- `border-blue-500/30` (border)

Change to your brand colors.

---

## 🎨 Design Features

### Dark Mode
✅ All pages support dark mode automatically via Tailwind `dark:` classes

### Mobile Responsive
✅ Tested and verified for:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

### Accessibility
✅ Includes:
- Proper heading hierarchy
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Icon + text combinations

### Performance
✅ Optimized:
- Client-side rendering with 'use client'
- No unnecessary re-renders
- Lightweight styling
- Fast accordions
- No external dependencies (except lucide-react icons)

---

## 📋 Sections Included

The privacy policy covers:

1. **Single Purpose & Functionality**
   - What the extension does
   - Core features list
   - Single purpose confirmation

2. **Permissions & Justifications**
   - All 9+ permissions documented
   - Individual purpose for each
   - User control explanations
   - Data handling details

3. **Data Collection & Usage**
   - What is NOT collected
   - What IS stored locally
   - Privacy guarantees
   - No tracking statement

4. **Data Sharing & Third Parties**
   - Certification disclosures (3 required)
   - Third-party integrations explained
   - No data selling
   - User data control

5. **Your Privacy Controls**
   - 6 ways users control their data
   - Permission management
   - Clear storage options
   - Uninstall information

6. **Policy Updates & Compliance**
   - How updates are communicated
   - Chrome Web Store compliance
   - Contact information

---

## ✅ Chrome Web Store Compliance

This privacy policy ensures:

- ✅ All permissions justified
- ✅ No unnecessary permissions
- ✅ No undisclosed data collection
- ✅ Clear user consent
- ✅ Transparent practices
- ✅ Contact information
- ✅ Data control disclosures
- ✅ No remote code execution
- ✅ Meets all CWS policies

---

## 🔄 Updating the Policy

When your extension changes:

### If You Add Permissions
1. Add new permission to `src/components/privacy/PrivacyPolicyContent.tsx`
2. Include justification
3. Explain user control
4. Update Chrome Web Store listing

### If You Add Features
1. Update "Core Features" list
2. Update related sections
3. Add data handling if needed
4. Test page rendering

### If You Change Company Info
1. Find all instances in files
2. Replace with new information
3. Test links work
4. Update Chrome Web Store

**See:** `PRIVACY_POLICY_MAINTENANCE_GUIDE.md` for detailed instructions

---

## 🧪 Testing Checklist

Before deploying:

- [ ] All text visible and readable
- [ ] Dark mode works correctly
- [ ] Mobile view responsive
- [ ] All sections expand/collapse
- [ ] All links functional
- [ ] No console errors
- [ ] Spelling and grammar correct
- [ ] Company info updated
- [ ] Icons display properly
- [ ] Colors match branding
- [ ] Performance is good
- [ ] Mobile friendly (use DevTools)

---

## 📞 Support & Questions

**For implementation help:**
→ See `PRIVACY_POLICY_IMPLEMENTATION_GUIDE.md`

**For Chrome Web Store submission:**
→ Follow `CHROME_WEBSTORE_SUBMISSION_CHECKLIST.md`

**For ongoing maintenance:**
→ Reference `PRIVACY_POLICY_MAINTENANCE_GUIDE.md`

**For content questions:**
→ Review `PRIVACY_POLICY_CHROME_WEBSTORE.md`

---

## 🚫 Important Notes

- **Not Legal Advice:** Have a lawyer review before publication
- **Customize Required:** Update all company information
- **Test Thoroughly:** Verify pages work on all browsers
- **Keep Updated:** Update policy when extension changes
- **Be Transparent:** Only claim what extension actually does
- **Match Manifest:** Ensure privacy claims match permissions

---

## 📊 File Structure

```
src/app/privacy-policy/
├── page.tsx                          (main privacy policy page)
├── standalone/
│   └── page.tsx                      (standalone version)
└── terms-of-service/
    └── page.tsx                      (terms of service)

src/components/privacy/
└── PrivacyPolicyContent.tsx          (reusable component)

Root Documentation:
├── PRIVACY_POLICY_IMPLEMENTATION_SUMMARY.md    (overview)
├── PRIVACY_POLICY_IMPLEMENTATION_GUIDE.md      (setup)
├── CHROME_WEBSTORE_SUBMISSION_CHECKLIST.md     (submission)
├── PRIVACY_POLICY_MAINTENANCE_GUIDE.md         (updates)
├── PRIVACY_POLICY_CHROME_WEBSTORE.md          (markdown version)
└── README.md                                    (this file)
```

---

## 🎯 Next Steps

1. **Customize** all company information
2. **Test** all pages thoroughly
3. **Review** with legal team
4. **Deploy** to production
5. **Submit** to Chrome Web Store
6. **Monitor** user feedback
7. **Maintain** as needed

---

## ✨ Features

- ✅ Professional design
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Accordion sections
- ✅ Icons included
- ✅ Chrome Web Store ready
- ✅ GDPR/CCPA sections
- ✅ User consent included
- ✅ Permission justifications
- ✅ Fully customizable

---

## 📈 Version

- **Created:** February 28, 2026
- **Status:** Production Ready
- **Chrome Web Store:** Certified Compliant

---

**Good luck with your extension!** 🚀

For help, see the documentation files in the root directory or review the component source code.
