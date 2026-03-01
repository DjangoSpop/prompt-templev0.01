# Privacy Policy & Chrome Web Store Compliance

## Prompt Temple Broadcaster - Professional Browser Extension

**Effective Date:** February 28, 2026  
**Last Updated:** February 28, 2026

---

## 1. Single Purpose & Core Functionality

✅ **Single Purpose Confirmed**

Prompt Temple Broadcaster is designed with a single, narrow purpose: to help users research and craft better prompts by opening selected AI provider tabs, injecting user prompts into active pages on request, and saving/reusing prompt templates locally.

### Core Features:
- Inject user prompts into supported AI provider pages (ChatGPT, Claude, Gemini, etc.)
- Broadcast prompts across multiple AI platforms simultaneously
- Save and reuse prompt templates locally in the browser
- Access side panel with prompt library and research tools
- Optional cross-device sync with user authentication

---

## 2. Permissions & Justifications

### activeTab
- **Purpose:** Used only when the user clicks "Broadcast" to access the currently active AI provider tab and insert the user's prompt into the page.
- **User Control:** Permission is only used when user explicitly triggers the broadcast action.

### tabs
- **Purpose:** Used to open, list, and manage AI provider tabs during user-initiated broadcasting and to return focus to the extension after completion.
- **User Control:** Users select which tabs to open and manage broadcast destinations.

### storage
- **Purpose:** Used to store user settings, selected providers, prompt history, templates, and saved prompts locally in the browser.
- **User Control:** All data stored locally on user's device. No data synced to servers without explicit user authentication.

### scripting
- **Purpose:** Required to run content scripts on supported AI provider domains selected by the user (e.g., ChatGPT, Claude, Gemini, etc.) to insert prompts and read response text for the results view.
- **User Control:** All executable code is bundled in the extension package. No remote code execution.

### clipboardWrite
- **Purpose:** Enables the "Copy" button to copy generated prompts/templates/results to the clipboard when the user explicitly clicks copy.
- **User Control:** Only triggered when user explicitly clicks the copy button.

### sidePanel
- **Purpose:** Provides an optional side panel UI to access prompt library, saved prompts, and research tools while browsing without interrupting the current tab.
- **User Control:** Optional side panel that doesn't interrupt user workflow. Can be dismissed anytime.

### clipboardRead
- **Purpose:** Used to read clipboard content when user initiates paste actions to pre-fill prompts from previously copied text.
- **User Control:** Only accessed when user explicitly requests paste functionality.

### alarms
- **Purpose:** Used to schedule lightweight periodic tasks such as cleaning expired cached results or rotating temporary session state.
- **User Control:** Only used for housekeeping. No data collection or monitoring.

### identity
- **Purpose:** Used for optional sign-in (e.g., Google/GitHub) to sync user prompt library and settings across devices. The extension works perfectly without sign-in.
- **User Control:** Users can choose to authenticate for cross-device sync or remain completely local.

### Host Permissions
- **Purpose:** The extension does not download or execute remote code. All executable code is bundled in the extension package. Network requests are used only for API calls and web page access to supported sites.
- **Remote Code:** No. All code is bundled locally. No external scripts or WASM files are loaded.

---

## 3. Data Collection & Usage

✅ **Privacy Guaranteed - No Data Collection**

Prompt Temple Broadcaster does NOT collect, track, or share any personally identifiable user data. All data remains local on your device.

### We DO NOT Collect:

- ✕ Personally identifiable information (name, address, email, age)
- ✕ Health information (heart rate, medical history, symptoms)
- ✕ Financial and payment information (transactions, credit cards)
- ✕ Authentication information (passwords, credentials, PINs)
- ✕ Personal communications (emails, texts, chat messages)
- ✕ Location data (IP address, GPS coordinates)
- ✕ Web history (pages visited, browsing history)
- ✕ User activity (keystroke logging, mouse tracking, network monitoring)
- ✕ Website content or AI responses
- ✕ Behavioral data for analytics or advertising

### What We Store Locally:

- **Prompt Templates:** Stored locally in your browser only
- **Broadcast History:** Your past broadcast records, kept local
- **User Preferences:** Extension settings you configure
- **Selected AI Providers:** Your chosen broadcast destinations
- **Session State:** Temporary data for current session only
- **Saved Prompt Library:** Your custom prompt collection

All local storage is encrypted in browser storage and never sent to external servers without your explicit consent through authentication.

---

## 4. Data Sharing & Third Parties

✅ **We Certify All Three Required Disclosures:**

1. **We do not sell or transfer user data to third parties** outside of approved use cases
2. **We do not use or transfer user data for purposes unrelated to the extension's single purpose**
3. **We do not use or transfer user data to determine creditworthiness or for lending purposes**

### Third-Party Integrations:

**AI Platforms (ChatGPT, Claude, Gemini, etc.)**
- User prompts are sent directly to these platforms as if the user typed them manually
- No data is intercepted, logged, or stored by our extension
- Your privacy with these platforms is governed by their own privacy policies

**Authentication Services (Optional)**
- Google/GitHub authentication is used only for optional cross-device sync
- Users remain completely local without authentication
- No sign-up required for core functionality

**No Third-Party Tracking:**
- ✕ No Google Analytics or similar analytics services
- ✕ No third-party ad networks
- ✕ No behavioral tracking or advertising
- ✕ No session tracking or cross-site tracking
- ✕ No data brokers or data aggregators

### Data Access Control:

- Prompts sent to AI providers are handled directly by those services
- Saved prompts and templates are encrypted in local browser storage
- No extension developer has access to user data unless explicitly shared for sync
- Users can clear all local data at any time
- Uninstalling the extension immediately deletes all stored data

---

## 5. Your Privacy Controls

You have complete control over your data and how the extension operates:

1. **Manage Permissions:** Enable/disable permissions anytime through browser extension settings
2. **Clear Local Storage:** Remove all saved prompts, templates, and settings through extension options
3. **Choose AI Providers:** Select which platforms you want to broadcast to
4. **Opt-In Sync:** Authentication and cross-device sync are completely optional
5. **Disable Side Panel:** Close or disable the side panel entirely from settings
6. **Uninstall Anytime:** Remove the extension, and all data is immediately deleted

---

## 6. Security

### Data Protection:
- All local data is stored in browser's secure local storage
- No unencrypted transmission of sensitive data
- Extension code is audited before Chrome Web Store publication
- Regular security reviews and updates

### What We Don't Do:
- Inject third-party tracking pixels or scripts
- Use hidden iframes for tracking
- Redirect traffic or manipulate page content for commercial purposes
- Request unnecessary elevated privileges

---

## 7. Children's Privacy

The Extension is not directed to children under 13. We do not knowingly collect information from children. If we become aware that we have collected information from a child without parental consent, we will delete such information.

---

## 8. Policy Updates & Compliance

### Updates to This Policy:
- We may update this privacy policy from time to time
- Material changes will be notified to users
- Users will be informed through extension updates or website notices
- Continued use constitutes acceptance of updated policy

### Chrome Web Store Compliance:
The extension complies with:
- Chrome Web Store Developer Program Policies
- Google Chrome Privacy Policy
- User data and privacy protection standards
- Transparency and disclosure requirements

---

## 9. Contact & Support

**Questions about this privacy policy?**

📧 **Email:** support@prompttemple.dev  
🌐 **Website:** prompttemple.dev  
💬 **Support:** Available through the extension's help section

---

## 10. User Consent & Agreement

By using Prompt Temple Broadcaster, you acknowledge that you have read and understood this Privacy Policy. You agree to our data practices as described above.

**You understand and accept:**
- ✓ The extension's single purpose and core functionality
- ✓ The permissions being used and their justifications
- ✓ Local storage of your prompt templates and settings
- ✓ That authentication and sync are optional features
- ✓ That you can remove or modify data anytime
- ✓ That this extension complies with Chrome Web Store policies

---

## 11. GDPR & International Compliance

For users in the European Union and other jurisdictions with strict data protection laws:

- **Data Processing:** Minimal data processing. All data remains local.
- **Your Rights:** Full control over your data. Delete, export, or modify anytime.
- **No Automated Decision Making:** The extension does not make automated decisions about you.
- **Data Residency:** Data never leaves your device unless you explicitly sync.

---

## 12. California Privacy Notice

For California residents under CCPA:

- **Categories of Information Collected:** Only preferences and templates, stored locally
- **Purposes:** To provide extension functionality
- **Your Rights:** You can delete data, opt-out of any optional features, and request information
- **No Sale of Data:** We do not sell personal information to third parties

---

## APPENDIX: Details for Chrome Web Store Review

### Development Statement:
The Prompt Temple Broadcaster extension is developed with user privacy, security, and compliance as top priorities. We adhere strictly to Chrome Web Store Developer Program Policies and maintain transparent communication with users about data practices.

### Manifest Permissions Breakdown:
All permissions in the extension manifest are justified and necessary for core functionality:
- No overly broad permissions requested
- No unnecessary host permissions
- All permissions documented in this policy

### Testing:
- Extension tested against Chrome Web Store policies
- All permissions verified to be used only for stated purposes
- No analytics or crash reporting enabled by default
- No telemetry collection

### Code Quality:
- No obfuscated or minified code hiding functionality
- Source available for review upon request
- Regular security audits
- Compliance with JavaScript best practices

---

## Summary Statement

**Prompt Temple Broadcaster** is a privacy-first extension that respects the user's data and choices. We do not collect, track, sell, or misuse user information. Your prompts, preferences, and templates remain under your complete control and stay on your device.

**Our commitment to you:**
1. ✅ Single purpose - Help you broadcast prompts to AI platforms
2. ✅ No tracking - No analytics, no telemetry, no monitoring
3. ✅ Your data, your device - Everything stored locally
4. ✅ Optional features - Authentication and sync are opt-in
5. ✅ Full transparency - This policy discloses everything
6. ✅ Easy control - Manage permissions and data anytime

---

**© 2024-2026 Prompt Temple. All rights reserved.**

*This privacy policy fully complies with Chrome Web Store Developer Program Policies, GDPR (where applicable), and industry best practices for user privacy protection.*

---

## Implementation Checklist for Your Extension

- [ ] Add link to `/privacy-policy` to your extension's options page
- [ ] Add "https://yoursite.com/privacy-policy" to Chrome Web Store listing
- [ ] Add "https://yoursite.com/privacy-policy/terms-of-service" as Terms of Service link (if required)
- [ ] Add "https://yoursite.com/privacy-policy/standalone" as embedded version for extension options
- [ ] Include privacy commitment in extension description
- [ ] Share this policy with your legal review team before publication
- [ ] Update Chrome Web Store data permissions forms with information from Section 3-4
- [ ] Ensure all permission justifications match manifest configuration
