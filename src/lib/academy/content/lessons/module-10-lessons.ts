/**
 * Module 10: Google Maps Lead Generation
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module10Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 10.1: Introduction to Automated Lead Generation
  // ==========================================================================
  {
    id: 'lesson-10-1',
    moduleId: 'module-10',
    title: 'Introduction to Automated Lead Generation',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Lead generation is the lifeblood of any B2B business. But manually searching Google Maps, visiting websites, and collecting contact information is tedious and time-consuming. In this module, you\'ll build an n8n workflow that automates the entire process.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'An automated lead generation pipeline that takes search queries (like "dental clinic London"), finds businesses on Google Maps, scrapes their websites for email addresses, and saves validated leads to Google Sheets.',
      },
      {
        type: 'list',
        items: [
          'Takes a list of search queries as input',
          'Searches Google Maps for each query',
          'Extracts website URLs from search results',
          'Visits each website and scrapes email addresses',
          'Deduplicates and validates found emails',
          'Saves clean leads to Google Sheets',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `[Execute Workflow Trigger]
         │
         ▼
[Split in Batches: Loop over queries]
         │
         ▼
[HTTP Request: Google Maps API search]
         │
         ▼
[Code Node: Extract URLs from results]
         │
         ▼
[Filter: Remove irrelevant URLs]
         │
         ▼
[Remove Duplicates: URL dedup]
         │
         ▼
[Split in Batches: Loop over URLs]
         │
         ▼
[HTTP Request: Fetch webpage]
         │
         ▼
[Code Node: Regex email extraction]
         │
         ▼
[Aggregate: Collect all emails]
         │
         ▼
[Remove Duplicates: Email dedup]
         │
         ▼
[Filter: Remove invalid emails]
         │
         ▼
[Google Sheets: Save leads]`,
        caption: 'The complete Google Maps lead generation pipeline',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Ethical Lead Generation',
        text: 'This workflow only collects publicly available business contact information from websites that businesses have published themselves. Always respect robots.txt, rate limits, and applicable data protection regulations (GDPR, CAN-SPAM).',
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.2: Setting Up Search Queries
  // ==========================================================================
  {
    id: 'lesson-10-2',
    moduleId: 'module-10',
    title: 'Setting Up Search Queries',
    estimatedTime: 2,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The workflow starts with a list of search queries that define what businesses you\'re looking for. The more specific your queries, the better your leads will be.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Crafting Effective Search Queries',
      },
      {
        type: 'list',
        items: [
          '"dental clinic London" — Industry + Location: the most common pattern',
          '"marketing agency New York Manhattan" — Adding neighborhood narrows results',
          '"SaaS startup Berlin" — Industry type + location for B2B targeting',
          '"restaurant Italian downtown Chicago" — Specific cuisine + area',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Input Methods',
      },
      {
        type: 'text',
        value: 'You can feed search queries into the workflow in several ways:',
      },
      {
        type: 'list',
        items: [
          'Manual Trigger with parameters — Enter queries directly when triggering the workflow',
          'Google Sheets input — Read queries from a spreadsheet (best for large campaigns)',
          'Webhook — Accept queries from an external system or form',
          'Hardcoded list — For simple, repeating use cases',
        ],
      },
      {
        type: 'code',
        language: 'json',
        code: `// Example: Google Sheets input format
[
  { "query": "dental clinic London", "category": "Healthcare" },
  { "query": "law firm Manchester", "category": "Legal" },
  { "query": "accounting firm Birmingham", "category": "Finance" },
  { "query": "web design agency Bristol", "category": "Tech" }
]`,
        caption: 'Feed multiple queries with categories for organized lead lists',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Query Volume',
        text: 'Start with 5-10 queries to test and refine your pipeline. Once validated, scale to 50-100 queries. Each query typically returns 20 Google Maps results, so 10 queries = ~200 businesses to process.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.3: Searching Google Maps API
  // ==========================================================================
  {
    id: 'lesson-10-3',
    moduleId: 'module-10',
    title: 'Searching Google Maps API',
    estimatedTime: 3,
    order: 3,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The Google Maps Places API (or its alternative, SerpAPI) lets you programmatically search for businesses. Each result includes the business name, address, phone number, website URL, and rating.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Google Places API Approach',
      },
      {
        type: 'code',
        language: 'text',
        code: `HTTP Request Node Configuration:
─────────────────────────────────
Method:  GET
URL:     https://maps.googleapis.com/maps/api/place/textsearch/json
Query Parameters:
  query:  {{ $json.searchQuery }}
  key:    {{ $credentials.googleApiKey }}
  type:   establishment
─────────────────────────────────

Response includes:
  - name: "Bright Smile Dental Clinic"
  - formatted_address: "123 Oxford St, London"
  - rating: 4.7
  - website: "https://brightsmile.co.uk"
  - place_id: "ChIJ..."`,
        caption: 'Google Places API returns structured business data',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Extracting Useful Data',
      },
      {
        type: 'text',
        value: 'The API returns rich data, but we only need specific fields for lead generation:',
      },
      {
        type: 'list',
        items: [
          'Business name — For personalized outreach',
          'Website URL — The target for email scraping',
          'Rating — Filter out low-quality businesses',
          'Address — For geographic segmentation',
          'Place ID — Unique identifier for deduplication',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'API Costs',
        text: 'Google Places API charges $17 per 1000 requests (Text Search). SerpAPI is an alternative at $50/month for 5000 searches. For smaller volumes, consider scraping Google Maps directly with a Code node (though this is less reliable and may violate ToS).',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Pagination',
      },
      {
        type: 'text',
        value: 'The Google Places API returns a maximum of 20 results per request, with a next_page_token for additional results. To get all results (up to 60), you need to make up to 3 sequential requests with a 2-second delay between each.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.4: Extracting and Filtering URLs
  // ==========================================================================
  {
    id: 'lesson-10-4',
    moduleId: 'module-10',
    title: 'Extracting and Filtering URLs',
    estimatedTime: 2,
    order: 4,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Not every Google Maps result has a website, and not every website is worth scraping. This step extracts URLs from the API results and filters out irrelevant entries.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'URL Extraction Code Node',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Extract website URLs from Google Maps results
const results = $input.all();
const urls = [];

for (const item of results) {
  const website = item.json.website;
  if (website) {
    urls.push({
      json: {
        businessName: item.json.name,
        website: website,
        rating: item.json.rating,
        address: item.json.formatted_address,
        query: item.json.originalQuery
      }
    });
  }
}

return urls;`,
        caption: 'Extract and structure URL data from API results',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Filtering Irrelevant URLs',
      },
      {
        type: 'text',
        value: 'Use an n8n Filter node to remove URLs that won\'t yield useful leads:',
      },
      {
        type: 'list',
        items: [
          'Remove social media URLs (facebook.com, instagram.com) — These won\'t have email addresses',
          'Remove marketplace listings (yelp.com, tripadvisor.com) — These are aggregators, not business sites',
          'Remove government/generic sites (.gov, wikipedia.org) — Not relevant for B2B outreach',
          'Filter by rating — Optionally exclude businesses below a threshold (e.g., < 3.5 stars)',
        ],
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Filter out unwanted domains
const blocklist = [
  'facebook.com', 'instagram.com', 'twitter.com',
  'yelp.com', 'tripadvisor.com', 'linkedin.com',
  'wikipedia.org', 'google.com', 'youtube.com'
];

const items = $input.all();
return items.filter(item => {
  const url = item.json.website.toLowerCase();
  return !blocklist.some(domain => url.includes(domain));
});`,
        caption: 'Domain blocklist removes URLs that won\'t contain business emails',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Deduplication',
        text: 'After filtering, use n8n\'s "Remove Duplicates" node on the website field. Different search queries may return the same business, and scraping the same site twice wastes time and increases your chance of being blocked.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.5: Web Scraping for Emails
  // ==========================================================================
  {
    id: 'lesson-10-5',
    moduleId: 'module-10',
    title: 'Web Scraping for Emails',
    estimatedTime: 3,
    order: 5,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The core of the lead generation pipeline: visiting each business website and extracting email addresses. We\'ll use an HTTP Request node to fetch the HTML and a Code node with regex to find emails.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Fetching Web Pages',
      },
      {
        type: 'code',
        language: 'text',
        code: `HTTP Request Node Configuration:
─────────────────────────────────
Method:       GET
URL:          {{ $json.website }}
Timeout:      10000 (10 seconds)
Response:     Text (HTML)
Options:
  Follow Redirects: true
  Ignore SSL: false
─────────────────────────────────`,
        caption: 'Fetch the business website HTML for email extraction',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Email Extraction Code Node',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Extract emails from HTML using regex
const html = $input.first().json.html || '';
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
const emails = html.match(emailRegex) || [];

return emails.map(email => ({ json: { email } }));`,
        caption: 'The email regex pattern catches standard email formats from webpage HTML',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Improving Email Discovery',
      },
      {
        type: 'text',
        value: 'The homepage may not contain email addresses. Check these additional pages:',
      },
      {
        type: 'list',
        items: [
          '/contact — The most common location for business emails',
          '/about — Often includes team or company email addresses',
          '/imprint or /impressum — Required by law in some countries, always has contact info',
          '/privacy-policy — Sometimes contains data controller email addresses',
        ],
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Check multiple pages for emails
const baseUrl = $input.first().json.website;
const paths = ['', '/contact', '/about', '/imprint'];
const allEmails = new Set();

for (const path of paths) {
  // Each path is fetched by the HTTP Request node
  // in a sub-workflow or loop
  const url = new URL(path, baseUrl).href;
  // ... fetch and extract emails
}

return [...allEmails].map(email => ({ json: { email } }));`,
        caption: 'Scraping multiple pages increases email discovery rate significantly',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Respect Rate Limits',
        text: 'Add a 1-2 second delay between website requests using n8n\'s Wait node. Sending rapid requests can get your IP blocked and is disrespectful to website owners. Use the "Split in Batches" node with a batch size of 5-10.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.6: Email Validation and Deduplication
  // ==========================================================================
  {
    id: 'lesson-10-6',
    moduleId: 'module-10',
    title: 'Email Validation and Deduplication',
    estimatedTime: 2,
    order: 6,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Raw email extraction produces messy data — duplicates, false positives, and invalid addresses. This step cleans the data to ensure your lead list is high-quality.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Common False Positives',
      },
      {
        type: 'text',
        value: 'The regex catches anything that looks like an email, including these common false positives:',
      },
      {
        type: 'list',
        items: [
          'placeholder@example.com — Dummy emails in website templates',
          'name@2x.png — Image filenames that match the email pattern',
          'support@wix.com — Platform support emails, not the business',
          'noreply@domain.com — Automated no-reply addresses',
          'user@sentry.io — Error tracking service emails in scripts',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Validation Filters',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Validate and clean extracted emails
const emails = $input.all();
const invalidDomains = [
  'example.com', 'test.com', 'localhost',
  'wix.com', 'squarespace.com', 'wordpress.com',
  'sentry.io', 'cloudflare.com'
];
const invalidPrefixes = [
  'noreply', 'no-reply', 'donotreply',
  'mailer-daemon', 'postmaster'
];

return emails.filter(item => {
  const email = item.json.email.toLowerCase();
  const [prefix, domain] = email.split('@');

  // Check domain validity
  if (invalidDomains.some(d => domain.includes(d))) return false;

  // Check prefix validity
  if (invalidPrefixes.some(p => prefix.includes(p))) return false;

  // Check for image file patterns
  if (email.match(/\\.(png|jpg|gif|svg|webp)/)) return false;

  // Check minimum domain length
  if (domain.split('.')[0].length < 2) return false;

  return true;
});`,
        caption: 'Multi-layer email validation removes false positives and junk addresses',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Deduplication Strategy',
        text: 'Use n8n\'s "Remove Duplicates" node on the email field AFTER validation. This way, you don\'t waste processing on emails that will be filtered out anyway. Also deduplicate on domain — if you found info@business.com and support@business.com, keep the more personal one.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.7: Saving Leads to Google Sheets
  // ==========================================================================
  {
    id: 'lesson-10-7',
    moduleId: 'module-10',
    title: 'Saving Leads to Google Sheets',
    estimatedTime: 2,
    order: 7,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The final step stores your validated leads in a Google Sheet — organized, deduplicated, and ready for outreach. Google Sheets is ideal because it\'s collaborative, accessible, and integrates with email marketing tools.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Google Sheets Structure',
      },
      {
        type: 'code',
        language: 'text',
        code: `┌──────────────┬────────────────────────┬────────┬──────────┬──────────┐
│ Business     │ Email                  │ Website│ Rating   │ Category │
├──────────────┼────────────────────────┼────────┼──────────┼──────────┤
│ Bright Smile │ info@brightsmile.co.uk │ bright │ 4.7      │ Dental   │
│ Law & Co     │ contact@lawco.uk       │ lawco  │ 4.5      │ Legal    │
│ TechDesign   │ hello@techdesign.io    │ techd  │ 4.8      │ Tech     │
└──────────────┴────────────────────────┴────────┴──────────┴──────────┘

Additional columns:
  - Address
  - Search Query (which query found this lead)
  - Scraped Date
  - Status (New / Contacted / Responded)`,
        caption: 'Organized lead sheet with business context and outreach status tracking',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring the Google Sheets Node',
      },
      {
        type: 'code',
        language: 'text',
        code: `Google Sheets Node Configuration:
─────────────────────────────────
Operation:    Append Row
Spreadsheet:  "Lead Generation Results"
Sheet:        "Leads"
Column Mapping:
  A → businessName
  B → email
  C → website
  D → rating
  E → category
  F → address
  G → searchQuery
  H → {{ $now.format('yyyy-MM-dd') }}
  I → "New"
─────────────────────────────────`,
        caption: 'Append each validated lead as a new row with automatic date stamping',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Avoid Duplicate Rows',
        text: 'Before appending, use a Google Sheets "Get Rows" node to check if the email already exists in the sheet. This prevents duplicates across multiple workflow runs. Alternatively, use the "Update" operation with email as the match key.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Export Alternatives',
      },
      {
        type: 'list',
        items: [
          'Airtable — More powerful filtering and views, better for team collaboration',
          'HubSpot — Direct CRM integration for sales teams',
          'CSV file — Simple export for one-time campaigns',
          'Notion database — If your team already uses Notion for workflow management',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.8: Rate Limiting and Error Handling
  // ==========================================================================
  {
    id: 'lesson-10-8',
    moduleId: 'module-10',
    title: 'Rate Limiting and Error Handling',
    estimatedTime: 3,
    order: 8,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Lead generation workflows make many HTTP requests. Without proper rate limiting and error handling, you\'ll get blocked by websites, hit API quotas, and lose data when individual requests fail.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Rate Limiting Best Practices',
      },
      {
        type: 'list',
        items: [
          'Add a Wait node (1-2 seconds) between website requests to avoid being flagged as a bot',
          'Use "Split in Batches" with batch size of 5-10 to process URLs in groups',
          'Implement exponential backoff — if a request fails with 429 (Too Many Requests), wait 4s, then 8s, then 16s',
          'Rotate User-Agent headers to appear as different browsers',
          'Respect robots.txt — check before scraping a domain',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Handling with Try/Catch',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Wrap email extraction in try/catch
try {
  const html = $input.first().json.html || '';

  // Timeout protection
  if (!html || html.length < 100) {
    return [{ json: { error: 'Empty or invalid HTML', url } }];
  }

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex) || [];

  return emails.map(email => ({
    json: { email, source: $input.first().json.website }
  }));
} catch (error) {
  // Log the error but don't stop the workflow
  return [{
    json: {
      error: error.message,
      url: $input.first().json.website,
      skipped: true
    }
  }];
}`,
        caption: 'Try/catch prevents individual failures from crashing the entire batch',
      },
      {
        type: 'heading',
        level: 2,
        value: 'n8n Error Handling Features',
      },
      {
        type: 'list',
        items: [
          'Retry on Fail — Configure nodes to retry 2-3 times with a delay before giving up',
          'Error Trigger — A separate workflow that runs when the main workflow fails',
          'Continue on Fail — Nodes can be set to pass errors downstream instead of stopping',
          'Error Output — Connect a separate branch to handle failures (log to sheet, send notification)',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Don\'t Ignore Errors',
        text: 'Silently swallowing errors means you lose data. Always log failed URLs to a separate sheet or Slack channel so you can manually check them later. A 10% failure rate on 200 URLs means 20 missed leads.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.9: Scaling and Compliance
  // ==========================================================================
  {
    id: 'lesson-10-9',
    moduleId: 'module-10',
    title: 'Scaling and Compliance',
    estimatedTime: 2,
    order: 9,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Before scaling your lead generation to thousands of queries, you need to understand compliance requirements and technical scaling strategies.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Legal Compliance',
      },
      {
        type: 'list',
        items: [
          'GDPR (EU) — Publicly available business emails are generally permissible for B2B outreach, but you must provide an opt-out mechanism and state your legitimate interest.',
          'CAN-SPAM (US) — Commercial emails must include a physical address, clear sender identity, and unsubscribe option. No deceptive subject lines.',
          'CASL (Canada) — Stricter than CAN-SPAM. Requires implied or express consent. Business emails published on websites imply consent for relevant communications.',
          'robots.txt — Always check before scraping. If a site disallows scraping, skip it.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Important Disclaimer',
        text: 'This module teaches technical automation skills. Always consult legal counsel before launching large-scale email outreach campaigns. Compliance requirements vary by jurisdiction and industry.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Scaling Strategies',
      },
      {
        type: 'list',
        items: [
          'Proxy rotation — Use a proxy service to distribute requests across multiple IP addresses and avoid bans',
          'Scheduled runs — Don\'t run everything at once. Schedule batches (e.g., 50 queries per day) to stay under rate limits',
          'Caching — Store previously scraped websites to avoid re-fetching. Use a Redis or Notion cache database',
          'Parallel workers — Run multiple n8n workflow instances to process batches concurrently',
          'Cloud execution — Move from local n8n to n8n Cloud or a dedicated server for 24/7 operation',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Data Quality Metrics',
      },
      {
        type: 'text',
        value: 'Track these metrics to evaluate your pipeline\'s effectiveness:',
      },
      {
        type: 'list',
        items: [
          'Scrape success rate — What % of URLs successfully returned HTML? (Target: >90%)',
          'Email discovery rate — What % of businesses yielded at least one email? (Target: >40%)',
          'Validation pass rate — What % of extracted emails passed validation? (Target: >80%)',
          'Bounce rate — When sending emails, what % bounce? (Target: <5%)',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 10.10: Complete Pipeline Assembly & Testing
  // ==========================================================================
  {
    id: 'lesson-10-10',
    moduleId: 'module-10',
    title: 'Complete Pipeline Assembly & Testing',
    estimatedTime: 2,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Let\'s bring everything together — connect all the nodes, test the full pipeline end-to-end, and optimize for production use.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Full Pipeline Checklist',
      },
      {
        type: 'list',
        items: [
          'Trigger node configured (Manual or Schedule)',
          'Search queries loaded (from Sheet or hardcoded list)',
          'Google Maps API connected with valid credentials',
          'URL extraction Code node tested with sample data',
          'URL filter removing social media and aggregator domains',
          'URL deduplication active',
          'HTTP Request node fetching webpages with timeout set',
          'Email extraction regex working correctly',
          'Email validation filtering false positives',
          'Email deduplication removing duplicates',
          'Google Sheets node appending with correct column mapping',
          'Error handling on all HTTP and Code nodes',
          'Wait nodes between batches (1-2 seconds)',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Testing Strategy',
      },
      {
        type: 'list',
        items: [
          'Start with 1 search query and verify the full pipeline end-to-end',
          'Check each node\'s output individually using n8n\'s execution view',
          'Verify emails in Google Sheets are valid and properly formatted',
          'Test error handling by using an invalid URL to ensure the workflow continues',
          'Scale to 5 queries and verify deduplication works across queries',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a complete lead generation automation pipeline! From Google Maps search to validated emails in a spreadsheet — this workflow can generate hundreds of leads per day with minimal manual effort.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Connect to an email marketing tool (Mailchimp, SendGrid) for automated outreach',
          'Add AI enrichment — Use OpenAI to generate personalized email templates per lead',
          'Build a lead scoring model — Prioritize leads by website quality, rating, and industry fit',
          'Create a dashboard — Track pipeline metrics (leads per day, email discovery rate, conversion)',
          'Integrate with CRM — Push leads directly into HubSpot, Salesforce, or Pipedrive',
        ],
      },
    ],
  },
];
