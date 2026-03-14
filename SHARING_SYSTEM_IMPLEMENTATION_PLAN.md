# Prompt Temple Sharing System - Implementation Plan

## 1. Sprint Understanding

**Objective:** Transform prompt artifacts (prompts, optimized results, smart templates, Multi-AI Broadcast comparisons) into growth surfaces through professional sharing with dynamic Open Graph images.

**Current State:**
- Next.js App Router with TypeScript ✓
- React Query for server state ✓
- Zustand for client state ✓
- Existing OG image generation for certificates ✓
- Smart templates implemented ✓
- Credits and gamification systems ✓
- Basic share button infrastructure exists (ViralShareButton) ✓

**What's Missing:**
- Public shareable pages for all artifact types
- Dynamic OG images for prompts, templates, broadcasts
- Multi-AI Broadcast share experience (flagship feature)
- Unified sharing system architecture
- Reward/gamification integration for sharing
- Backend API contracts for share management
- Abuse prevention mechanisms

**Technical Constraints:**
- Next.js App Router patterns
- File-based metadata and route-level metadata
- Dynamic opengraph-image/twitter-image generation
- Server data in React Query only
- Zustand for ephemeral UI state only
- No private data in public share pages
- Server-side validation for all privileged actions

---

## 2. Product Strategy for Share Growth

### Growth Flywheel

```
User creates artifact → Shares publicly → Viral loop → New visitors view → Sign up → Create more artifacts → Repeat
```

### Key Growth Levers

1. **Multi-AI Broadcast as Flagship**
   - "I tested this prompt across 4 AI models" creates FOMO
   - Comparison results are inherently shareable
   - Best-model winner creates social proof
   - Competitive nature drives engagement

2. **Smart Template Viral Loop**
   - Templates solve real problems immediately
   - Results are practical and shareable
   - Category-based organization enables discovery
   - "This template saved me X hours" narrative

3. **Prompt Optimization Showcase**
   - Before/after transformation is visually compelling
   - Score improvement (1.8 → 9.4) is quantifiable
   - Improvements list provides concrete value
   - Achievement unlocks (Pharaoh level) motivate sharing

### Acquisition Funnel

```
Public Share Page → View Artifact → CTA to Try → Sign Up → First Win → Share → Viral Loop
```

### Virality Multipliers

- Social proof (view counts, share counts)
- Achievement badges on share pages
- Referral tracking with rewards
- "Remix this" functionality
- Template duplication with one click
- Best-result highlighting for broadcasts

---

## 3. Shareable Object Model

### Core Entity Types

```typescript
export enum ShareableEntityType {
  PROMPT = 'prompt',
  OPTIMIZATION_RESULT = 'optimization_result',
  SMART_TEMPLATE_RESULT = 'smart_template_result',
  BROADCAST_RESULT = 'broadcast_result',
}

export interface ShareableArtifact {
  id: string;
  slug: string; // Public URL identifier (e.g., 'abc123xyz')
  type: ShareableEntityType;
  ownerId: string;
  visibility: 'public' | 'private' | 'unlisted';
  title: string;
  summary: string;
  previewPayload: {
    text: string;
    metadata: Record<string, unknown>;
  };
  ctaPayload: {
    action: 'try_in_app' | 'clone_prompt' | 'use_template' | 'run_broadcast';
    destination?: string;
  };
  rewardEligible: boolean;
  createdAt: string;
  expiresAt?: string; // Optional expiration
  isRevoked: boolean;
  analytics: {
    views: number;
    shares: number;
    conversions: number;
  };
}

// Type-specific extensions
export interface PromptArtifact extends ShareableArtifact {
  type: ShareableEntityType.PROMPT;
  previewPayload: {
    text: string;
    beforeScore?: number;
    afterScore?: number;
    improvements?: string[];
  };
}

export interface OptimizationArtifact extends ShareableArtifact {
  type: ShareableEntityType.OPTIMIZATION_RESULT;
  previewPayload: {
    original: string;
    optimized: string;
    beforeScore: number;
    afterScore: number;
    wowScore: number;
    improvements: string[];
    mode: 'fast' | 'deep';
  };
}

export interface SmartTemplateArtifact extends ShareableArtifact {
  type: ShareableEntityType.SMART_TEMPLATE_RESULT;
  previewPayload: {
    templateId: string;
    templateTitle: string;
    category: string;
    filledVariables: Record<string, string>;
    resultText: string;
    aiGenerated: boolean;
  };
}

export interface BroadcastArtifact extends ShareableArtifact {
  type: ShareableEntityType.BROADCAST_RESULT;
  previewPayload: {
    prompt: string;
    providers: Array<{
      id: string;
      name: string;
      model: string;
      result: string;
      score?: number;
      latency?: number;
    }>;
    bestProvider: {
      id: string;
      name: string;
      model: string;
      reason: string;
    };
    comparisonSummary: string;
    totalProviders: number;
  };
}
```

### Share Link Entity

```typescript
export interface ShareLink {
  id: string;
  slug: string;
  artifactId: string;
  artifactType: ShareableEntityType;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  visitCount: number;
  shareCount: number;
  conversionCount: number;
  rewardStatus: {
    claimed: boolean;
    claimedAt?: string;
    rewardType: 'xp' | 'credits' | 'badge';
    rewardAmount: number;
  };
  metadata: {
    source: string; // 'optimizer', 'broadcast', 'template', 'prompt_library'
    utmParams?: Record<string, string>;
  };
}
```

---

## 4. Route Architecture

### Route Structure

```
src/app/
├── share/
│   ├── [slug]/
│   │   ├── page.tsx                 # Public share page (main entry)
│   │   ├── opengraph-image.tsx      # Dynamic OG image generation
│   │   └── twitter-image.tsx        # Twitter-specific OG image
│   ├── layout.tsx                   # Share page layout (minimal, no sidebar)
│   └── error.tsx                    # Custom error page for expired/revoked shares
├── api/
│   ├── shares/
│   │   ├── route.ts                 # POST create share, GET list user shares
│   │   ├── [slug]/
│   │   │   ├── route.ts             # GET public data, PATCH revoke, DELETE
│   │   │   ├── visit/
│   │   │   │   └── route.ts         # POST record visit
│   │   │   ├── convert/
│   │   │   │   └── route.ts         # POST record conversion (signup/remix)
│   │   │   └── reward/
│   │   │       └── route.ts         # POST claim reward
│   │   └── analytics/
│   │       └── [slug]/
│   │           └── route.ts         # GET share analytics (auth required)
│   └── og/
│       ├── share/
│       │   ├── route.ts              # Fallback OG image
│       │   ├── prompt.tsx           # Prompt OG variant
│       │   ├── optimization.tsx      # Optimization OG variant
│       │   ├── template.tsx         # Template OG variant
│       │   └── broadcast.tsx        # Broadcast OG variant (flagship)
└── components/
    ├── sharing/
    │   ├── ShareModal.tsx            # Unified share modal
    │   ├── ShareButton.tsx           # Share button trigger
    │   ├── PublicSharePage.tsx      # Public page content
    │   ├── SharePreviewCard.tsx      # Preview component
    │   ├── CopyLinkButton.tsx        # Copy link with feedback
    │   ├── SocialShareButtons.tsx   # Twitter, LinkedIn, etc.
    │   └── index.ts
    └── [feature]/
        └── [Feature]ResultPanel.tsx  # Integrate share buttons
```

### URL Patterns

```
/share/{slug}                     # Public share page
/api/og/share?type={type}&...    # OG image with params
/share/{slug}/opengraph-image    # Route-level OG (Next.js)
/api/shares                       # Create/list shares (POST/GET)
/api/shares/{slug}                # Get/revoke/delete (GET/PATCH/DELETE)
/api/shares/{slug}/visit          # Record visit (POST)
/api/shares/{slug}/convert        # Record conversion (POST)
/api/shares/{slug}/reward         # Claim reward (POST)
/api/shares/{slug}/analytics      # Get analytics (GET)
```

---

## 5. Metadata / Next OG Architecture

### Dynamic Metadata Strategy

#### Route-Level Metadata (Primary)

```typescript
// src/app/share/[slug]/page.tsx
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://prompttemple.vercel.app';
  const artifact = await getPublicArtifact(params.slug);

  if (!artifact || artifact.isRevoked) {
    return {
      title: 'Shared Artifact Not Found | Prompt Temple',
      description: 'This shared prompt, template, or result is no longer available.',
    };
  }

  const titles = {
    [ShareableEntityType.PROMPT]: `Shared Prompt: ${artifact.title}`,
    [ShareableEntityType.OPTIMIZATION_RESULT]: `Prompt Optimization: ${artifact.beforeScore} → ${artifact.afterScore}`,
    [ShareableEntityType.SMART_TEMPLATE_RESULT]: `Smart Template: ${artifact.title}`,
    [ShareableEntityType.BROADCAST_RESULT]: `AI Model Comparison: ${artifact.bestProvider.name}`,
  };

  const descriptions = {
    [ShareableEntityType.PROMPT]: `View this shared prompt on Prompt Temple. ${artifact.summary}`,
    [ShareableEntityType.OPTIMIZATION_RESULT]: `See how this prompt was improved from ${artifact.beforeScore}/10 to ${artifact.afterScore}/10. ${artifact.summary}`,
    [ShareableEntityType.SMART_TEMPLATE_RESULT]: `Use this smart template result on Prompt Temple. ${artifact.summary}`,
    [ShareableEntityType.BROADCAST_RESULT]: `Compare ${artifact.totalProviders} AI models for this prompt. Best: ${artifact.bestProvider.name}. ${artifact.summary}`,
  };

  return {
    title: titles[artifact.type],
    description: descriptions[artifact.type],
    alternates: {
      canonical: `${baseUrl}/share/${params.slug}`,
    },
    openGraph: {
      type: 'article',
      title: titles[artifact.type],
      description: descriptions[artifact.type],
      url: `${baseUrl}/share/${params.slug}`,
      siteName: 'Prompt Temple',
      images: [
        {
          url: `${baseUrl}/share/${params.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: titles[artifact.type],
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[artifact.type],
      description: descriptions[artifact.type],
      images: [`${baseUrl}/share/${params.slug}/twitter-image`],
    },
  };
}
```

#### Dynamic OG Image Generation

```typescript
// src/app/share/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const artifact = await getPublicArtifact(params.slug);

  if (!artifact || artifact.isRevoked) {
    return new ImageResponse(<DefaultOGCard />);
  }

  switch (artifact.type) {
    case ShareableEntityType.PROMPT:
      return new ImageResponse(<PromptOGCard artifact={artifact as PromptArtifact} />);
    case ShareableEntityType.OPTIMIZATION_RESULT:
      return new ImageResponse(<OptimizationOGCard artifact={artifact as OptimizationArtifact} />);
    case ShareableEntityType.SMART_TEMPLATE_RESULT:
      return new ImageResponse(<TemplateOGCard artifact={artifact as SmartTemplateArtifact} />);
    case ShareableEntityType.BROADCAST_RESULT:
      return new ImageResponse(<BroadcastOGCard artifact={artifact as BroadcastArtifact} />);
    default:
      return new ImageResponse(<DefaultOGCard />);
  }
}

// Broadcast OG Card (Flagship)
function BroadcastOGCard({ artifact }: { artifact: BroadcastArtifact }) {
  const bestProvider = artifact.previewPayload.bestProvider;
  const providers = artifact.previewPayload.providers;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0E0E10 0%, #1A1A2E 50%, #0E0E10 100%)',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Branding */}
      <div style={{ fontSize: '14px', color: '#C5A55A', marginBottom: '24px', letterSpacing: '4px' }}>
        PROMPT TEMPLE
      </div>

      {/* Main Title */}
      <div style={{ fontSize: '48px', fontWeight: 700, color: '#E6D5A8', marginBottom: '12px' }}>
        AI Model Comparison
      </div>

      <div style={{ fontSize: '16px', color: 'rgba(235, 213, 167, 0.7)', marginBottom: '32px' }}>
        Tested across {providers.length} models
      </div>

      {/* Best Model Badge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(45, 212, 168, 0.2) 0%, rgba(45, 212, 168, 0.1) 100%)',
          border: '2px solid #2DD4A8',
          borderRadius: '12px',
          padding: '24px 48px',
          marginBottom: '32px',
        }}
      >
        <div style={{ fontSize: '14px', color: '#2DD4A8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Best Overall
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: '#E6D5A8', marginBottom: '8px' }}>
          {bestProvider.name}
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.6)' }}>
          {bestProvider.model}
        </div>
      </div>

      {/* Comparison Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(providers.length, 3)}, 1fr)`,
          gap: '16px',
          maxWidth: '800px',
          width: '100%',
          padding: '0 48px',
        }}
      >
        {providers.slice(0, 3).map((provider, i) => (
          <div
            key={provider.id}
            style={{
              background: provider.id === bestProvider.id ? 'rgba(45, 212, 168, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${provider.id === bestProvider.id ? '#2DD4A8' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#E6D5A8', marginBottom: '4px' }}>
              {provider.name}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(235, 213, 167, 0.5)' }}>
              {provider.model}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: '48px', fontSize: '14px', color: 'rgba(235, 213, 167, 0.5)' }}>
        Compare models on Prompt Temple
      </div>
    </div>
  );
}
```

#### OG Image Variants

```typescript
// Optimization OG Card
function OptimizationOGCard({ artifact }: { artifact: OptimizationArtifact }) {
  const { beforeScore, afterScore, wowScore, improvements } = artifact.previewPayload;
  const scoreJump = `${beforeScore.toFixed(1)} → ${afterScore.toFixed(1)}`;

  return (
    <div style={{ /* ... same container styles ... */ }}>
      <div style={{ fontSize: '14px', color: '#C5A55A', marginBottom: '24px', letterSpacing: '4px' }}>
        PROMPT TEMPLE
      </div>

      <div style={{ fontSize: '48px', fontWeight: 700, color: '#E6D5A8', marginBottom: '12px' }}>
        Prompt Optimization
      </div>

      {/* Score Comparison */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.6)', marginBottom: '8px' }}>
            Before
          </div>
          <div style={{ fontSize: '56px', fontWeight: 700, color: '#9CA3AF' }}>
            {beforeScore.toFixed(1)}
          </div>
        </div>

        <div style={{ fontSize: '48px', color: '#2DD4A8' }}>→</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.6)', marginBottom: '8px' }}>
            After
          </div>
          <div style={{ fontSize: '56px', fontWeight: 700, color: '#2DD4A8' }}>
            {afterScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Wow Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, rgba(197, 165, 90, 0.2) 0%, rgba(197, 165, 90, 0.1) 100%)',
          border: '1px solid #C5A55A',
          borderRadius: '8px',
          padding: '12px 24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '24px', color: '#C5A55A' }}>⭐</div>
        <div>
          <div style={{ fontSize: '12px', color: 'rgba(235, 213, 167, 0.6)' }}>
            Wow Score
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#E6D5A8' }}>
            {wowScore}/10
          </div>
        </div>
      </div>

      {/* Improvements */}
      <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.5)', textAlign: 'center' }}>
        {improvements.slice(0, 2).join(' · ')}
      </div>
    </div>
  );
}

// Template OG Card
function TemplateOGCard({ artifact }: { artifact: SmartTemplateArtifact }) {
  const { templateTitle, category, filledVariables } = artifact.previewPayload;

  return (
    <div style={{ /* ... same container styles ... */ }}>
      <div style={{ fontSize: '14px', color: '#C5A55A', marginBottom: '24px', letterSpacing: '4px' }}>
        PROMPT TEMPLE
      </div>

      <div style={{ fontSize: '48px', fontWeight: 700, color: '#E6D5A8', marginBottom: '12px' }}>
        Smart Template
      </div>

      {/* Category Badge */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(45, 212, 168, 0.2) 0%, rgba(45, 212, 168, 0.1) 100%)',
          border: '1px solid #2DD4A8',
          borderRadius: '20px',
          padding: '8px 20px',
          fontSize: '14px',
          color: '#2DD4A8',
          marginBottom: '32px',
        }}
      >
        {category}
      </div>

      {/* Template Title */}
      <div style={{ fontSize: '28px', fontWeight: 600, color: '#E6D5A8', marginBottom: '16px' }}>
        {templateTitle}
      </div>

      {/* Filled Variables Preview */}
      <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.6)', marginBottom: '24px' }}>
        {Object.keys(filledVariables).length} fields filled
      </div>

      {/* CTA */}
      <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.5)' }}>
        Use this template on Prompt Temple
      </div>
    </div>
  );
}

// Prompt OG Card
function PromptOGCard({ artifact }: { artifact: PromptArtifact }) {
  const { text, beforeScore, afterScore } = artifact.previewPayload;

  return (
    <div style={{ /* ... same container styles ... */ }}>
      <div style={{ fontSize: '14px', color: '#C5A55A', marginBottom: '24px', letterSpacing: '4px' }}>
        PROMPT TEMPLE
      </div>

      <div style={{ fontSize: '48px', fontWeight: 700, color: '#E6D5A8', marginBottom: '12px' }}>
        Shared Prompt
      </div>

      {/* Score Display */}
      {afterScore && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(197, 165, 90, 0.2) 0%, rgba(197, 165, 90, 0.1) 100%)',
            border: '1px solid #C5A55A',
            borderRadius: '8px',
            padding: '12px 24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.6)' }}>
            Quality Score
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#E6D5A8' }}>
            {afterScore.toFixed(1)}/10
          </div>
        </div>
      )}

      {/* Prompt Preview */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '16px 24px',
          maxWidth: '800px',
          fontSize: '16px',
          color: '#E6D5A8',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text.slice(0, 120)}...
      </div>
    </div>
  );
}
```

### Fallback OG Strategy

```typescript
// Default OG Card
function DefaultOGCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0E0E10 0%, #1A1A2E 50%, #0E0E10 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: '14px', color: '#C5A55A', marginBottom: '24px', letterSpacing: '4px' }}>
        PROMPT TEMPLE
      </div>

      <div style={{ fontSize: '48px', fontWeight: 700, color: '#E6D5A8', marginBottom: '12px' }}>
        Share Your Prompts
      </div>

      <div style={{ fontSize: '16px', color: 'rgba(235, 213, 167, 0.7)' }}>
        Transform prompts into masterpieces
      </div>
    </div>
  );
}
```

### Caching Strategy

```typescript
// Edge runtime with cache headers
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // ... image generation ...

  // Cache for 1 hour (3600 seconds)
  return new ImageResponse(jsx, {
    ...options,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

---

## 6. Database and Backend Contract Requirements

### Database Schema

```sql
-- Share Links Table
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(24) UNIQUE NOT NULL,
  artifact_id VARCHAR(255) NOT NULL,
  artifact_type VARCHAR(50) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  visit_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  is_revoked BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  reward_type VARCHAR(20),
  reward_amount INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  INDEX idx_slug (slug),
  INDEX idx_created_by (created_by),
  INDEX idx_artifact (artifact_id, artifact_type),
  INDEX idx_created_at (created_at DESC)
);

-- Share Visits Table (for abuse prevention)
CREATE TABLE share_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID REFERENCES share_links(id) ON DELETE CASCADE,
  visitor_ip VARCHAR(45), -- IPv6 can be up to 45 chars
  visitor_fingerprint VARCHAR(64), -- Hashed device fingerprint
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_unique_visitor BOOLEAN DEFAULT TRUE, -- Computed by backend
  conversion_event_id UUID, -- FK to conversions if applicable
  INDEX idx_share_link_id (share_link_id),
  INDEX idx_visitor_fingerprint (visitor_fingerprint),
  INDEX idx_visited_at (visited_at DESC)
);

-- Share Conversions Table
CREATE TABLE share_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID REFERENCES share_links(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if not signed up
  conversion_type VARCHAR(50) NOT NULL, -- 'signup', 'remix', 'try_in_app'
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visitor_ip VARCHAR(45),
  metadata JSONB DEFAULT '{}',
  INDEX idx_share_link_id (share_link_id),
  INDEX idx_visitor_id (visitor_id),
  INDEX idx_converted_at (converted_at DESC),
  INDEX idx_conversion_type (conversion_type)
);

-- Daily Reward Caps (prevent abuse)
CREATE TABLE daily_reward_caps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(20) NOT NULL, -- 'share_visit', 'share_conversion'
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  UNIQUE (user_id, reward_type, date),
  INDEX idx_user_date (user_id, date)
);
```

### Backend API Contracts

#### Create Share Link

```typescript
// POST /api/shares
interface CreateShareRequest {
  artifactId: string;
  artifactType: ShareableEntityType;
  expiresAt?: string; // ISO date string
  metadata?: Record<string, unknown>;
}

interface CreateShareResponse {
  id: string;
  slug: string;
  shareUrl: string;
  artifact: ShareableArtifact;
  createdAt: string;
  expiresAt?: string;
  rewardEligible: boolean;
}
```

#### Get Public Share Page Data

```typescript
// GET /api/shares/{slug}
interface GetPublicShareResponse {
  id: string;
  slug: string;
  artifact: ShareableArtifact;
  createdAt: string;
  viewCount: number; // Public-facing count
  isRevoked: boolean;
  isExpired: boolean;
  // NO private user data, NO reward info
}
```

#### List User Share Links

```typescript
// GET /api/shares?limit=20&offset=0
interface ListUserSharesResponse {
  results: Array<{
    id: string;
    slug: string;
    artifact: {
      type: ShareableEntityType;
      title: string;
      summary: string;
    };
    createdAt: string;
    visitCount: number;
    shareCount: number;
    conversionCount: number;
    rewardStatus: {
      claimed: boolean;
      claimedAt?: string;
      rewardType: string;
      rewardAmount: number;
    };
    isRevoked: boolean;
  }>;
  count: number;
  next?: string;
  previous?: string;
}
```

#### Revoke Share Link

```typescript
// PATCH /api/shares/{slug}
interface RevokeShareRequest {
  action: 'revoke';
}

interface RevokeShareResponse {
  id: string;
  isRevoked: boolean;
  revokedAt: string;
}
```

#### Delete Share Link

```typescript
// DELETE /api/shares/{slug}
interface DeleteShareResponse {
  success: true;
  message: string;
}
```

#### Record Share Visit

```typescript
// POST /api/shares/{slug}/visit
interface RecordVisitRequest {
  visitorFingerprint?: string; // Optional hashed device fingerprint
  utmParams?: Record<string, string>;
}

interface RecordVisitResponse {
  visitId: string;
  isFirstVisit: boolean;
  viewCount: number;
}
```

#### Record Share Conversion

```typescript
// POST /api/shares/{slug}/convert
interface RecordConversionRequest {
  conversionType: 'signup' | 'remix' | 'try_in_app';
  visitorId?: string; // User ID if authenticated
  visitorFingerprint?: string;
  metadata?: Record<string, unknown>;
}

interface RecordConversionResponse {
  conversionId: string;
  shareId: string;
  conversionCount: number;
  rewardEligible: boolean;
  reward?: {
    type: 'xp' | 'credits';
    amount: number;
  };
}
```

#### Get Reward Status

```typescript
// POST /api/shares/{slug}/reward
interface ClaimRewardRequest {
  shareId: string;
}

interface ClaimRewardResponse {
  success: boolean;
  reward?: {
    type: 'xp' | 'credits';
    amount: number;
    totalXp?: number;
    totalCredits?: number;
  };
  error?: string;
}
```

#### Get Share Analytics

```typescript
// GET /api/shares/{slug}/analytics (auth required, owner only)
interface ShareAnalyticsResponse {
  shareId: string;
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    totalShares: number;
    totalConversions: number;
    conversionRate: number;
  };
  breakdown: {
    byDay: Array<{
      date: string;
      views: number;
      shares: number;
      conversions: number;
    }>;
    bySource: Array<{
      source: string; // 'twitter', 'linkedin', 'direct', etc.
      count: number;
      percentage: number;
    }>;
    byConversionType: Array<{
      type: string;
      count: number;
    }>;
  };
  rewardStatus: {
    eligible: boolean;
    claimed: boolean;
    claimedAt?: string;
    rewardType: string;
    rewardAmount: number;
  };
}
```

---

## 7. Frontend Integration Plan

### React Query Hooks

```typescript
// src/hooks/api/useShares.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';

export const shareKeys = {
  all: ['shares'] as const,
  list: (params?: { limit?: number; offset?: number }) => [...shareKeys.all, 'list', params] as const,
  detail: (slug: string) => [...shareKeys.all, 'detail', slug] as const,
  analytics: (slug: string) => [...shareKeys.all, 'analytics', slug] as const,
};

// Create share link
export function useCreateShare() {
  const queryClient = useQueryClient();

  return useMutation<CreateShareResponse, Error, CreateShareRequest>({
    mutationFn: async (data) => apiClient.createShare(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareKeys.list() });
    },
  });
}

// List user shares
export function useUserShares(params?: { limit?: number; offset?: number }) {
  return useQuery<ListUserSharesResponse, Error>({
    queryKey: shareKeys.list(params),
    queryFn: () => apiClient.listShares(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Get public share data (no auth required)
export function usePublicShare(slug: string) {
  return useQuery<GetPublicShareResponse, Error>({
    queryKey: shareKeys.detail(slug),
    queryFn: () => apiClient.getPublicShare(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Revoke share
export function useRevokeShare() {
  const queryClient = useQueryClient();

  return useMutation<RevokeShareResponse, Error, { slug: string }>({
    mutationFn: async ({ slug }) => apiClient.revokeShare(slug),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: shareKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: shareKeys.list() });
    },
  });
}

// Delete share
export function useDeleteShare() {
  const queryClient = useQueryClient();

  return useMutation<DeleteShareResponse, Error, { slug: string }>({
    mutationFn: async ({ slug }) => apiClient.deleteShare(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareKeys.list() });
    },
  });
}

// Record visit (called from public share page)
export function useRecordVisit() {
  return useMutation<RecordVisitResponse, Error, { slug: string; fingerprint?: string }>({
    mutationFn: async ({ slug, fingerprint }) =>
      apiClient.recordVisit(slug, { visitorFingerprint: fingerprint }),
  });
}

// Record conversion (called on signup/remix)
export function useRecordConversion() {
  const queryClient = useQueryClient();

  return useMutation<RecordConversionResponse, Error, RecordConversionRequest>({
    mutationFn: async (data) => apiClient.recordConversion(data.slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// Claim reward
export function useClaimReward() {
  const queryClient = useQueryClient();

  return useMutation<ClaimRewardResponse, Error, { slug: string }>({
    mutationFn: async ({ slug }) => apiClient.claimReward(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareKeys.list() });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'level'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'usage'] });
    },
  });
}

// Get analytics (auth required, owner only)
export function useShareAnalytics(slug: string) {
  return useQuery<ShareAnalyticsResponse, Error>({
    queryKey: shareKeys.analytics(slug),
    queryFn: () => apiClient.getShareAnalytics(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Zustand Stores

```typescript
// src/store/shares.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShareModalState {
  isOpen: boolean;
  artifact?: ShareableArtifact;
  shareUrl?: string;
  openShareModal: (artifact: ShareableArtifact) => void;
  closeShareModal: () => void;
  setShareUrl: (url: string) => void;
}

export const useShareStore = create<ShareModalState>()(
  persist(
    (set) => ({
      isOpen: false,
      artifact: undefined,
      shareUrl: undefined,
      openShareModal: (artifact) => set({ isOpen: true, artifact }),
      closeShareModal: () => set({ isOpen: false, artifact: undefined, shareUrl: undefined }),
      setShareUrl: (shareUrl) => set({ shareUrl }),
    }),
    { name: 'share-modal-storage' }
  )
);

// src/store/shareAnalytics.ts
interface ShareAnalyticsState {
  currentShareSlug: string | null;
  visitRecorded: boolean;
  setVisitRecorded: (slug: string) => void;
  clearVisitRecorded: () => void;
}

export const useShareAnalyticsStore = create<ShareAnalyticsState>((set) => ({
  currentShareSlug: null,
  visitRecorded: false,
  setVisitRecorded: (slug) => set({ currentShareSlug: slug, visitRecorded: true }),
  clearVisitRecorded: () => set({ currentShareSlug: null, visitRecorded: false }),
}));
```

### Analytics Hooks

```typescript
// src/lib/analytics/sharing.ts
import { trackEvent } from '@/lib/analytics/trackEvent';

export function trackShareCreated(artifactType: ShareableEntityType, source: string) {
  trackEvent('share_created', {
    artifact_type: artifactType,
    source,
  });
}

export function trackShareViewed(slug: string, artifactType: ShareableEntityType) {
  trackEvent('share_viewed', {
    slug,
    artifact_type: artifactType,
  });
}

export function trackSocialShare(platform: string, artifactType: ShareableEntityType) {
  trackEvent('social_share', {
    platform,
    artifact_type: artifactType,
  });
}

export function shareLinkCopied(artifactType: ShareableEntityType) {
  trackEvent('share_link_copied', {
    artifact_type: artifactType,
  });
}

export function trackShareConversion(slug: string, conversionType: string) {
  trackEvent('share_conversion', {
    slug,
    conversion_type: conversionType,
  });
}

export function trackRewardClaimed(rewardType: string, amount: number) {
  trackEvent('reward_claimed', {
    reward_type: rewardType,
    amount,
  });
}
```

---

## 8. Gamification / Credit Reward Design

### Recommended Approach: Hybrid XP + Credits

**Decision:** Ship with XP rewards first (safer), add credits later after abuse patterns are understood.

### Option A: XP Rewards (Ship First)

```typescript
interface XPRewardConfig {
  shareCreated: {
    amount: 10;
    dailyCap: 5; // Max 5 shares/day = 50 XP
    description: 'Share a prompt, template, or result',
  };
  shareVisit: {
    amount: 1; // Tiny reward for first unique visitor
    dailyCap: 20; // Max 20 visitors/day = 20 XP
    description: 'Someone views your shared artifact',
  };
  shareConversion: {
    signup: { amount: 100, description: 'Visitor signs up' },
    remix: { amount: 50, description: 'Visitor remixes your prompt' },
    tryInApp: { amount: 25, description: 'Visitor tries in app' },
    dailyCap: 10, // Max 10 conversions/day
  };
}
```

### Option B: Credit Rewards (Ship Later)

```typescript
interface CreditRewardConfig {
  shareConversion: {
    signup: { amount: 50, description: 'Visitor signs up' }, // 50 credits = ~5-10 AI calls
    remix: { amount: 25, description: 'Visitor remixes your prompt' },
    dailyCap: 5, // Max 5 signup conversions/day = 250 credits
  };
}
```

### Reward Eligibility Logic

```typescript
function isRewardEligible(
  shareLink: ShareLink,
  conversion: Conversion,
  visitor: { id?: string; ip?: string; fingerprint?: string }
): boolean {
  // 1. Share must be eligible for rewards
  if (!shareLink.rewardEligible) return false;

  // 2. Reward must not be already claimed
  if (shareLink.rewardStatus.claimed) return false;

  // 3. Prevent self-referrals
  if (visitor.id === shareLink.createdBy) return false;

  // 4. Check daily cap for user
  const today = new Date().toISOString().split('T')[0];
  const dailyCount = getDailyRewardCount(shareLink.createdBy, today);
  if (dailyCount >= getMaxDailyCap(conversion.conversionType)) return false;

  // 5. Check for rapid repeated rewards from same IP/fingerprint
  const recentRewards = getRecentRewardsFromDevice(
    visitor.ip,
    visitor.fingerprint,
    '1 hour'
  );
  if (recentRewards.length >= 3) return false; // Max 3 rewards per device per hour

  // 6. Check for fake account patterns (age < 1 day, < 3 actions)
  if (visitor.id && isNewAccount(visitor.id)) return false;

  return true;
}
```

### Level Progression Based on Sharing

```typescript
interface SharingLevel {
  level: number;
  title: string;
  requiredXp: number;
  benefits: string[];
}

const sharingLevels: SharingLevel[] = [
  { level: 1, title: 'Novice Sharer', requiredXp: 0, benefits: ['Share 1 artifact'] },
  { level: 2, title: 'Influencer', requiredXp: 100, benefits: ['Share 5 artifacts', 'Analytics access'] },
  { level: 3, title: 'Trendsetter', requiredXp: 500, benefits: ['Share 25 artifacts', 'Priority support'] },
  { level: 4, title: 'Viral Star', requiredXp: 2000, benefits: ['Share 100 artifacts', 'Custom badge', 'Beta features'] },
  { level: 5, title: 'Legend', requiredXp: 10000, benefits: ['Unlimited shares', 'Premium features'] },
];
```

---

## 9. Abuse Prevention and Security Rules

### Server-Side Validation

```typescript
interface AbusePreventionRules {
  // Share Link Creation
  shareCreation: {
    maxPerDay: 20; // Max 20 new share links per user per day
    minInterval: 30; // Seconds between share creations
  };

  // Visit Tracking
  visitTracking: {
    rateLimitPerIp: 100; // Max 100 visits per IP per hour
    rateLimitPerDevice: 20; // Max 20 visits per device fingerprint per hour
    deduplicationWindow: '1 hour'; // Same IP/device counts as unique once per hour
  };

  // Conversion Tracking
  conversionTracking: {
    rateLimitPerIp: 10; // Max 10 conversions per IP per hour
    cooldownPeriod: '30 minutes'; // Same device must wait between conversions
    requireHumanActivity: true; // Require some interaction before conversion counts
  };

  // Reward Claims
  rewards: {
    maxDailyXP: 200; // Max 200 XP/day from sharing
    maxDailyCredits: 250; // Max 250 credits/day from sharing
    cooldownBetweenClaims: '5 minutes'; // Prevent rapid claim attempts
    requireAuth: true; // Must be logged in to claim
  };
}
```

### Rate Limiting Implementation

```typescript
// Backend middleware
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiterByIp = new RateLimiterMemory({
  points: 100, // 100 visits
  duration: 3600, // per hour
});

const rateLimiterByDevice = new RateLimiterMemory({
  points: 20, // 20 visits
  duration: 3600, // per hour
});

const conversionRateLimiter = new RateLimiterMemory({
  points: 10, // 10 conversions
  duration: 3600, // per hour
});

export async function checkRateLimit(ip: string, fingerprint?: string) {
  try {
    await rateLimiterByIp.consume(ip);
    if (fingerprint) {
      await rateLimiterByDevice.consume(fingerprint);
    }
  } catch (rejRes) {
    throw new Error('Rate limit exceeded');
  }
}
```

### Self-Referral Prevention

```typescript
function isSelfReferral(
  shareLinkId: string,
  visitorId?: string,
  visitorIp?: string,
  visitorFingerprint?: string
): boolean {
  const shareLink = getShareLink(shareLinkId);

  // Direct user ID match
  if (visitorId && visitorId === shareLink.createdBy) return true;

  // IP address match (within same day)
  if (visitorIp && shareLink.creatorIp === visitorIp) {
    const isSameDay = isWithinSameDay(shareLink.createdAt);
    if (isSameDay) return true;
  }

  // Device fingerprint match (more aggressive, could be false positives)
  // Only block if multiple conversions from same device
  const recentConversions = getRecentConversionsFromDevice(
    visitorFingerprint,
    shareLinkId
  );
  if (recentConversions.length >= 3) return true;

  return false;
}
```

### Link Enumeration Prevention

```typescript
// Use secure, non-sequential slugs
export function generateSecureSlug(): string {
  // Use nanoid with custom alphabet, 24 characters
  // 64^24 = 2.8e43 combinations - impossible to enumerate
  return nanoid(24);
}

// Add rate limiting to share link lookup
export async function getPublicShareWithRateLimit(slug: string) {
  const ip = getClientIp();
  const key = `share_lookup:${ip}`;

  const rateLimiter = new RateLimiterMemory({
    points: 30, // Max 30 lookups
    duration: 60, // per minute
  });

  try {
    await rateLimiter.consume(key);
    return getPublicShare(slug);
  } catch (rejRes) {
    throw new Error('Too many share link lookups');
  }
}
```

### Fake Account Detection

```typescript
function detectFakeAccount(userId: string): boolean {
  const user = getUser(userId);
  const accountAge = Date.now() - new Date(user.createdAt).getTime();

  // Account created less than 24 hours ago
  if (accountAge < 24 * 60 * 60 * 1000) return true;

  // Less than 3 meaningful actions
  const meaningfulActions = countMeaningfulActions(userId);
  if (meaningfulActions < 3) return true;

  // Suspicious signup pattern (e.g., referral from same IP)
  if (isSuspiciousSignup(userId)) return true;

  return false;
}
```

### Moderation / Revocation

```typescript
interface ModerationRules {
  autoRevokeIf: {
    spamScoreAbove: 0.8; // ML spam detection
    reportCountAbove: 10; // User reports
    flaggedByContentModeration: true;
  };
  manualRevokeReasons: [
    'spam',
    'harassment',
    'misleading_content',
    'policy_violation',
    'other'
  ];
}

async function revokeShareLink(
  shareLinkId: string,
  reason: string,
  revokedBy: string
): Promise<void> {
  await db.shareLinks.update(shareLinkId, {
    isRevoked: true,
    revokedAt: new Date(),
    revokedBy,
    revocationReason: reason,
  });

  // Log for audit
  await auditLog({
    action: 'share_revoked',
    shareLinkId,
    reason,
    revokedBy,
    timestamp: new Date(),
  });

  // Notify owner
  await sendNotification(shareLink.createdBy, {
    type: 'share_revoked',
    shareLinkId,
    reason,
  });
}
```

---

## 10. UX Flow for Authenticated Users

### Share Creation Flow

```
1. User creates artifact (prompt, optimization, template, broadcast)
   ↓
2. User clicks "Share" button in result panel
   ↓
3. Share modal opens with preview card
   ↓
4. User optionally customizes share title/description
   ↓
5. User clicks "Create Share Link"
   ↓
6. Loading state → Success toast with share link
   ↓
7. User can:
   - Copy link
   - Share on social media
   - View analytics (click through)
   - Manage existing shares
```

### Share Modal UX

```typescript
// src/components/sharing/ShareModal.tsx
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: ShareableArtifact;
}

export function ShareModal({ isOpen, onClose, artifact }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const createShare = useCreateShare();
  const trackShareCreated = trackShareCreated(artifact.type, 'share_modal');

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const result = await createShare.mutateAsync({
        artifactId: artifact.id,
        artifactType: artifact.type,
      });
      setShareUrl(result.shareUrl);
      trackShareCreated();
      // Show success toast
      toast.success('Share link created! 🎉');
    } catch (error) {
      toast.error('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your {getArtifactTypeName(artifact.type)}</DialogTitle>
          <DialogDescription>
            Create a public link to share with others
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          // Preview card
          <SharePreviewCard artifact={artifact} />
        ) : (
          // Share options
          <div className="space-y-4">
            <CopyLinkButton url={shareUrl} onCopy={() => setCopied(true)} copied={copied} />
            <SocialShareButtons
              url={shareUrl}
              artifact={artifact}
              onShare={(platform) => trackSocialShare(platform, artifact.type)}
            />
          </div>
        )}

        <DialogFooter>
          {!shareUrl ? (
            <Button onClick={handleCreateShare} disabled={loading}>
              {loading ? 'Creating...' : 'Create Share Link'}
            </Button>
          ) : (
            <Button onClick={() => window.open(shareUrl, '_blank')}>
              View Public Page
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Share Management Page

```typescript
// src/app/(app)/shares/page.tsx
export default function SharesPage() {
  const { data: shares } = useUserShares();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shares</h1>

      <div className="space-y-4">
        {shares?.results.map((share) => (
          <ShareCard key={share.id} share={share} />
        ))}
      </div>
    </div>
  );
}

function ShareCard({ share }: { share: UserShare }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{share.artifact.title}</CardTitle>
            <CardDescription>{share.artifact.type}</CardDescription>
          </div>
          <Badge variant={share.rewardStatus.claimed ? 'secondary' : 'default'}>
            {share.rewardStatus.claimed ? 'Reward Claimed' : 'Reward Available'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div>👁️ {share.visitCount} views</div>
          <div>🔄 {share.shareCount} shares</div>
          <div>✨ {share.conversionCount} conversions</div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <AnalyticsIcon className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <CopyIcon className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          {!share.rewardStatus.claimed && (
            <Button size="sm" onClick={() => claimReward(share.slug)}>
              <AwardIcon className="w-4 h-4 mr-2" />
              Claim Reward
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => revokeShare(share.slug)}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Revoke
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

---

## 11. UX Flow for Unauthenticated Visitors

### Public Share Page Flow

```
1. Visitor clicks shared link
   ↓
2. Public share page loads (no auth required)
   ↓
3. Page records visit (server-side)
   ↓
4. Visitor views artifact preview
   ↓
5. Visitor can:
   - View full artifact
   - Copy prompt text (if allowed)
   - Click "Try in Prompt Temple" CTA → Redirect to app
   - Click "Remix Prompt" CTA → Sign up flow
   - Share on social media
   - Copy link
   ↓
6. If visitor clicks CTA:
   - Redirect to app with UTM params
   - OR Open sign-up modal for remix action
   - Record conversion (signup/remix/try_in_app)
   - Award XP/credits to sharer (if eligible)
```

### Public Share Page Component

```typescript
// src/app/share/[slug]/page.tsx
export default async function PublicSharePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { utm_source?: string; utm_medium?: string; utm_campaign?: string };
}) {
  const artifact = await getPublicArtifact(params.slug);

  if (!artifact || artifact.isRevoked) {
    return <ShareNotFoundPage />;
  }

  return (
    <SharePageLayout>
      <PublicArtifactDisplay artifact={artifact} />
      <CTASection artifact={artifact} utmParams={searchParams} />
    </SharePageLayout>
  );
}

function PublicArtifactDisplay({ artifact }: { artifact: ShareableArtifact }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Artifact Type Badge */}
      <Badge className="mb-4">{getArtifactTypeLabel(artifact.type)}</Badge>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">{artifact.title}</h1>

      {/* Summary */}
      <p className="text-lg text-muted-foreground mb-8">{artifact.summary}</p>

      {/* Type-specific content */}
      <ArtifactContent artifact={artifact} />
    </div>
  );
}

function ArtifactContent({ artifact }: { artifact: ShareableArtifact }) {
  switch (artifact.type) {
    case ShareableEntityType.PROMPT:
      return <PromptDisplay artifact={artifact as PromptArtifact} />;
    case ShareableEntityType.OPTIMIZATION_RESULT:
      return <OptimizationDisplay artifact={artifact as OptimizationArtifact} />;
    case ShareableEntityType.SMART_TEMPLATE_RESULT:
      return <TemplateDisplay artifact={artifact as SmartTemplateArtifact} />;
    case ShareableEntityType.BROADCAST_RESULT:
      return <BroadcastDisplay artifact={artifact as BroadcastArtifact} />;
    default:
      return <div>Unknown artifact type</div>;
  }
}

// Broadcast Display (Flagship)
function BroadcastDisplay({ artifact }: { artifact: BroadcastArtifact }) {
  const { prompt, providers, bestProvider, comparisonSummary } = artifact.previewPayload;

  return (
    <div className="space-y-8">
      {/* Best Model Badge */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500 rounded-xl p-6">
        <div className="text-sm text-emerald-500 uppercase tracking-wider mb-2">
          Best Overall Model
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">
          {bestProvider.name}
        </div>
        <div className="text-muted-foreground">{bestProvider.model}</div>
        <p className="text-sm mt-4 text-muted-foreground">
          {bestProvider.reason}
        </p>
      </div>

      {/* Prompt */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Prompt</h3>
        <div className="bg-muted rounded-lg p-4 font-mono text-sm">
          {prompt}
        </div>
      </div>

      {/* Comparison Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Model Results</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isBest={provider.id === bestProvider.id}
            />
          ))}
        </div>
      </div>

      {/* Comparison Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Summary</h3>
        <p className="text-muted-foreground">{comparisonSummary}</p>
      </div>
    </div>
  );
}

function ProviderCard({ provider, isBest }: { provider: Provider; isBest: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${isBest ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{provider.name}</div>
        {isBest && <Badge>Best</Badge>}
      </div>
      <div className="text-sm text-muted-foreground mb-2">{provider.model}</div>
      <div className="text-sm">{provider.result}</div>
      {provider.latency && (
        <div className="text-xs text-muted-foreground mt-2">
          {provider.latency}s response time
        </div>
      )}
    </div>
  );
}
```

### CTA Section

```typescript
function CTASection({
  artifact,
  utmParams,
}: {
  artifact: ShareableArtifact;
  utmParams?: Record<string, string>;
}) {
  const buildUtmUrl = (path: string) => {
    const url = new URL(path, window.location.origin);
    Object.entries(utmParams || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4">
      <div className="max-w-4xl mx-auto flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={() => (window.location.href = buildUtmUrl('/optimizer'))}
        >
          <LightningIcon className="w-4 h-4 mr-2" />
          Try in Prompt Temple
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => openSignupModal({ action: 'remix', artifactId: artifact.id })}
        >
          <CopyIcon className="w-4 h-4 mr-2" />
          Remix Prompt
        </Button>
      </div>
    </div>
  );
}
```

---

## 12. Multi-AI Broadcast Share Experience

### Broadcast Share Page UI

```typescript
function BroadcastSharePage({ artifact }: { artifact: BroadcastArtifact }) {
  const { prompt, providers, bestProvider, comparisonSummary } = artifact.previewPayload;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">AI Model Comparison</Badge>
            <h1 className="text-5xl font-bold mb-4">
              Which AI Model Performs Best?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Compare results from {providers.length} different AI models
            </p>

            {/* Best Model Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white">
              <div className="text-sm opacity-80 uppercase tracking-wider mb-2">
                Best Overall Result
              </div>
              <div className="text-4xl font-bold mb-2">
                {bestProvider.name}
              </div>
              <div className="text-lg opacity-90">{bestProvider.model}</div>
              <p className="mt-4 text-sm opacity-80">
                {bestProvider.reason}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Prompt Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">The Prompt</h2>
          <div className="bg-muted rounded-xl p-6 font-mono text-lg leading-relaxed">
            {prompt}
          </div>
        </section>

        {/* Comparison Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Model Results</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ResultCard
                key={provider.id}
                provider={provider}
                isBest={provider.id === bestProvider.id}
              />
            ))}
          </div>
        </section>

        {/* Comparison Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Analysis Summary</h2>
          <div className="prose prose-lg max-w-none">
            {comparisonSummary.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-royal-gold-500/10 to-royal-gold-500/5 border border-royal-gold-500/20 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">
              Run Your Own AI Model Comparison
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Test your prompts across multiple AI models and find the best one for your needs
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => window.location.href = '/broadcast'}>
                <PlayIcon className="w-4 h-4 mr-2" />
                Start Comparison
              </Button>
              <Button size="lg" variant="outline">
                <CopyIcon className="w-4 h-4 mr-2" />
                Share This Result
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ResultCard({ provider, isBest }: { provider: Provider; isBest: boolean }) {
  return (
    <div
      className={`relative rounded-xl border-2 p-6 transition-all ${
        isBest
          ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {isBest && (
        <div className="absolute -top-3 right-6">
          <Badge className="bg-emerald-500 text-white">
            ⭐ Best Model
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <ModelIcon provider={provider.name} />
        <div>
          <div className="font-bold text-lg">{provider.name}</div>
          <div className="text-sm text-muted-foreground">{provider.model}</div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm leading-relaxed">
        {provider.result}
      </div>

      {provider.score && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Score:</span>
          <Badge variant={isBest ? 'default' : 'outline'}>
            {provider.score}/10
          </Badge>
        </div>
      )}

      {provider.latency && (
        <div className="flex items-center gap-2 mt-2">
          <ClockIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {provider.latency}s response time
          </span>
        </div>
      )}
    </div>
  );
}
```

---

## 13. Smart Template Share Experience

### Template Share Page UI

```typescript
function TemplateSharePage({ artifact }: { artifact: SmartTemplateArtifact }) {
  const { templateTitle, category, filledVariables, resultText, aiGenerated } = artifact.previewPayload;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">Smart Template</Badge>
            <h1 className="text-4xl font-bold mb-4">{templateTitle}</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline">{category}</Badge>
              {aiGenerated && <Badge>AI-Generated</Badge>}
            </div>
            <p className="text-lg text-muted-foreground">
              Use this smart template to generate professional results
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Variables */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Filled Variables</h2>
            <div className="space-y-3">
              {Object.entries(filledVariables).map(([key, value]) => (
                <div key={key} className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-semibold mb-1">{key}</div>
                  <div className="text-sm text-muted-foreground">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Generated Result</h2>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="prose prose-sm">
                {resultText.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 inline-block">
            <h3 className="text-2xl font-bold mb-4">Use This Template</h3>
            <p className="text-muted-foreground mb-6">
              Get professional results in seconds with our smart templates
            </p>
            <Button size="lg">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Try This Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 14. Required File / Module Impact Map

### New Files to Create

```
src/app/
├── share/
│   ├── [slug]/
│   │   ├── page.tsx                 # NEW - Public share page
│   │   ├── opengraph-image.tsx      # NEW - Dynamic OG image
│   │   └── twitter-image.tsx        # NEW - Twitter OG image
│   ├── layout.tsx                   # NEW - Share page layout
│   └── error.tsx                    # NEW - Custom error page
├── api/
│   ├── shares/
│   │   ├── route.ts                 # NEW - Create/list shares
│   │   ├── [slug]/
│   │   │   ├── route.ts             # NEW - Get/revoke/delete
│   │   │   ├── visit/route.ts       # NEW - Record visit
│   │   │   ├── convert/route.ts     # NEW - Record conversion
│   │   │   └── reward/route.ts      # NEW - Claim reward
│   │   └── analytics/[slug]/route.ts # NEW - Get analytics
│   └── og/
│       ├── share/prompt.tsx          # NEW - Prompt OG
│       ├── share/optimization.tsx    # NEW - Optimization OG
│       ├── share/template.tsx       # NEW - Template OG
│       └── share/broadcast.tsx       # NEW - Broadcast OG
src/components/
├── sharing/
│   ├── ShareModal.tsx                # NEW - Unified share modal
│   ├── ShareButton.tsx               # NEW - Share trigger button
│   ├── PublicArtifactDisplay.tsx      # NEW - Public page content
│   ├── SharePreviewCard.tsx          # NEW - Preview component
│   ├── CopyLinkButton.tsx            # NEW - Copy link with feedback
│   ├── SocialShareButtons.tsx         # NEW - Social media buttons
│   ├── ArtifactContent.tsx           # NEW - Type-specific content
│   ├── PromptDisplay.tsx             # NEW - Prompt view
│   ├── OptimizationDisplay.tsx        # NEW - Optimization view
│   ├── TemplateDisplay.tsx           # NEW - Template view
│   ├── BroadcastDisplay.tsx          # NEW - Broadcast view
│   ├── ResultCard.tsx                # NEW - Result card
│   └── index.ts                     # NEW - Barrel export
src/hooks/
└── api/
    └── useShares.ts                 # NEW - React Query hooks
src/store/
├── shares.ts                        # NEW - Share modal store
└── shareAnalytics.ts                # NEW - Visit tracking store
src/lib/
├── sharing/
│   ├── share-types.ts               # NEW - Type definitions
│   ├── share-utils.ts               # NEW - Utility functions
│   ├── generate-slug.ts             # NEW - Slug generation
│   └── index.ts                    # NEW - Barrel export
└── analytics/
    └── sharing.ts                   # NEW - Analytics events
```

### Files to Modify

```
src/lib/api/typed-client.ts          # ADD - Share API methods
src/lib/api/types.ts                # ADD - Share types
src/components/optimizer/OptimizationResultPanel.tsx  # ADD - Share button
src/components/templates/TemplateDetailModal.tsx      # ADD - Share button
src/components/prompt/PromptLibrary.tsx               # ADD - Share button
src/app/(app)/shares/page.tsx      # NEW - Share management page (optional)
```

### Backend API Types

```
lib/types/api.d.ts                  # ADD - Share API type definitions
```

---

## 15. Step-by-Step Localhost Execution Plan

### Phase 1: Foundation (Days 1-2)

**Step 1: Set up type definitions**
- Create `src/lib/sharing/share-types.ts`
- Define `ShareableEntityType`, `ShareableArtifact`, `ShareLink`
- Create type-specific extensions
- Test: TypeScript compilation

**Step 2: Create utility functions**
- Create `src/lib/sharing/generate-slug.ts` using nanoid
- Create `src/lib/sharing/share-utils.ts` with helper functions
- Test: Generate 100 slugs, verify uniqueness

**Step 3: Create Zustand stores**
- Create `src/store/shares.ts`
- Create `src/store/shareAnalytics.ts`
- Test: Store persistence, state updates

**Step 4: Create public share page layout**
- Create `src/app/share/layout.tsx` (minimal, no sidebar)
- Create `src/app/share/error.tsx`
- Test: Layout renders correctly

### Phase 2: Dynamic OG Images (Days 2-3)

**Step 5: Create default OG card**
- Create `src/app/api/og/share/route.ts`
- Test: Visit `/api/og/share`, verify image renders

**Step 6: Create type-specific OG cards**
- Create `src/app/api/og/share/prompt.tsx`
- Create `src/app/api/og/share/optimization.tsx`
- Create `src/app/api/og/share/template.tsx`
- Create `src/app/api/og/share/broadcast.tsx`
- Test: Each OG variant renders correctly

**Step 7: Implement route-level OG images**
- Create `src/app/share/[slug]/opengraph-image.tsx`
- Create `src/app/share/[slug]/twitter-image.tsx`
- Test: Use social preview debugger tools

### Phase 3: Public Share Pages (Days 3-4)

**Step 8: Create share page server component**
- Create `src/app/share/[slug]/page.tsx`
- Implement `generateMetadata`
- Test: Metadata renders correctly

**Step 9: Create artifact display components**
- Create `src/components/sharing/ArtifactContent.tsx`
- Create type-specific display components
- Test: Each artifact type renders correctly

**Step 10: Implement visit tracking**
- Create `src/app/api/shares/[slug]/visit/route.ts`
- Integrate with public share page
- Test: Visit count increments

### Phase 4: Share Creation (Days 4-5)

**Step 11: Create share API**
- Create `src/app/api/shares/route.ts` (POST create, GET list)
- Create `src/app/api/shares/[slug]/route.ts` (GET, PATCH revoke, DELETE)
- Test: Create share link, retrieve public data

**Step 12: Create React Query hooks**
- Create `src/hooks/api/useShares.ts`
- Test: All hooks work correctly

**Step 13: Create share modal**
- Create `src/components/sharing/ShareModal.tsx`
- Create `src/components/sharing/SharePreviewCard.tsx`
- Test: Modal opens/closes, creates share link

**Step 14: Integrate share buttons**
- Add share buttons to existing result panels
- Test: Share buttons trigger modal

### Phase 5: Social Sharing (Day 5)

**Step 15: Create social share components**
- Create `src/components/sharing/SocialShareButtons.tsx`
- Create `src/components/sharing/CopyLinkButton.tsx`
- Test: Social media links open, copy works

**Step 16: Implement analytics tracking**
- Create `src/lib/analytics/sharing.ts`
- Track share events
- Test: Analytics events fire

### Phase 6: Rewards & Gamification (Days 5-6)

**Step 17: Create reward API**
- Create `src/app/api/shares/[slug]/reward/route.ts`
- Implement reward eligibility logic
- Test: Claim reward, verify credit/XP updates

**Step 18: Create analytics API**
- Create `src/app/api/shares/analytics/[slug]/route.ts`
- Test: Analytics data returns correctly

**Step 19: Create share management page**
- Create `src/app/(app)/shares/page.tsx`
- Test: List shares, manage shares

### Phase 7: Testing & Polish (Days 6-7)

**Step 20: End-to-end testing**
- Test complete flow: create → share → view → convert → reward
- Test each artifact type
- Test mobile responsiveness

**Step 21: Social preview testing**
- Use Twitter Card Validator
- Use LinkedIn Post Inspector
- Use Facebook Sharing Debugger

**Step 22: Performance optimization**
- Add caching headers to OG images
- Optimize image generation
- Test page load times

**Step 23: Security review**
- Verify no private data in public pages
- Test rate limiting
- Test abuse prevention

### Phase 8: Production Deployment (Day 7)

**Step 24: Environment configuration**
- Set up environment variables
- Configure CDN for OG images
- Configure analytics

**Step 25: Deploy to production**
- Deploy code changes
- Deploy database migrations
- Test production endpoints

**Step 26: Monitor and iterate**
- Monitor error rates
- Monitor share metrics
- Gather user feedback

---

## 16. QA / Test Plan

### Unit Tests

```typescript
// src/lib/sharing/__tests__/generateSlug.test.ts
describe('generateSecureSlug', () => {
  it('should generate unique slugs', () => {
    const slugs = Array(1000).fill(null).map(() => generateSecureSlug());
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(1000);
  });

  it('should generate 24-character slugs', () => {
    const slug = generateSecureSlug();
    expect(slug).toHaveLength(24);
  });
});

// src/hooks/api/useShares.test.ts
describe('useShares', () => {
  it('should create share link', async () => {
    const createShare = useCreateShare();
    const result = await createShare.mutateAsync({
      artifactId: 'test-id',
      artifactType: ShareableEntityType.PROMPT,
    });
    expect(result.shareUrl).toMatch(/^https?:\/\/.*\/share\/[\w-]{24}$/);
  });
});
```

### Integration Tests

```typescript
// tests/integration/sharing.flow.test.ts
describe('Sharing Flow', () => {
  it('should create share, view, convert, claim reward', async () => {
    // 1. Create artifact
    const artifact = await createOptimizedPrompt('test prompt');

    // 2. Create share
    const share = await createShareLink({
      artifactId: artifact.id,
      artifactType: ShareableEntityType.OPTIMIZATION_RESULT,
    });

    // 3. View share (as public visitor)
    await fetch(`/api/shares/${share.slug}/visit`, {
      method: 'POST',
      body: JSON.stringify({ visitorFingerprint: 'test-fp-1' }),
    });

    // 4. Get public data
    const publicData = await fetch(`/api/shares/${share.slug}`).then(r => r.json());
    expect(publicData.visitCount).toBe(1);

    // 5. Convert (signup)
    const conversion = await fetch(`/api/shares/${share.slug}/convert`, {
      method: 'POST',
      body: JSON.stringify({
        conversionType: 'signup',
        visitorFingerprint: 'test-fp-1',
      }),
    }).then(r => r.json());

    // 6. Claim reward
    const reward = await fetch(`/api/shares/${share.slug}/reward`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    }).then(r => r.json());

    expect(reward.success).toBe(true);
    expect(reward.reward?.amount).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/sharing.spec.ts
test('user can share optimization result', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Optimize prompt
  await page.goto('/optimizer');
  await page.fill('textarea', 'Write a blog post');
  await page.click('button:has-text("Optimize")');

  // Wait for result
  await page.waitForSelector('[data-testid="optimization-result"]');

  // Click share button
  await page.click('[data-testid="share-button"]');

  // Wait for modal
  await page.waitForSelector('[data-testid="share-modal"]');

  // Click create share link
  await page.click('button:has-text("Create Share Link")');

  // Verify share URL appears
  await page.waitForSelector('[data-testid="share-url"]');

  // Copy link
  await page.click('[data-testid="copy-link-button"]');

  // Verify success toast
  await page.waitForSelector('text=Share link created!');
});
```

### Social Preview Testing Checklist

- [ ] Twitter Card Validator passes
- [ ] LinkedIn Post Inspector shows preview
- [ ] Facebook Sharing Debugger shows preview
- [ ] WhatsApp link preview works
- [ ] Discord rich preview works
- [ ] Slack unfurling works
- [ ] Email link preview works

### Performance Testing

```bash
# Test OG image generation latency
ab -n 1000 -c 10 https://prompttemple.vercel.app/share/abc123xyz/opengraph-image

# Test public share page load time
lighthouse https://prompttemple.vercel.app/share/abc123xyz --view

# Test API endpoint throughput
k6 run --vus 100 --duration 30s tests/k6/shares-api.js
```

### Security Testing

```bash
# Test rate limiting
for i in {1..150}; do
  curl -X POST https://api.prompttemple.com/api/shares/test-slug/visit
done
# Should return 429 after 100 requests

# Test unauthorized access
curl -X GET https://api.prompttemple.com/api/shares/test-slug/analytics
# Should return 401 without auth

# Test self-referral prevention
# Create share as user A, try to convert as user A
# Should not award reward
```

---

## 17. Production Hardening Notes

### Caching Strategy

```typescript
// OG Image Caching
export const revalidate = 3600; // 1 hour
export const dynamic = 'force-static';

// Public Share Page Caching
export const revalidate = 300; // 5 minutes for page content
```

### CDN Configuration

```typescript
// Vercel config for OG images
// vercel.json
{
  "routes": [
    {
      "src": "/api/og/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      }
    }
  ]
}
```

### Rate Limiting

```typescript
// Upstash Redis for rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
});
```

### Error Handling

```typescript
// Graceful degradation for OG images
export async function GET(request: NextRequest) {
  try {
    return new ImageResponse(/* ... */);
  } catch (error) {
    // Fallback to static image
    return new NextResponse(
      new Blob([await readFile('public/og-fallback.png')]),
      {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      }
    );
  }
}
```

### Monitoring

```typescript
// Track OG image generation failures
import { trackEvent } from '@/lib/analytics/trackEvent';

export async function GET(request: NextRequest) {
  try {
    return new ImageResponse(/* ... */);
  } catch (error) {
    trackEvent('og_image_generation_failed', {
      error: error.message,
      url: request.url,
    });
    throw error;
  }
}
```

### Database Indexes

```sql
-- Optimize share link lookups
CREATE INDEX CONCURRENTLY idx_share_links_slug_created
ON share_links (slug, created_at DESC)
WHERE NOT is_revoked;

-- Optimize visit tracking
CREATE INDEX CONCURRENTLY idx_share_visits_link_visitor
ON share_visits (share_link_id, visitor_fingerprint, visited_at DESC);

-- Optimize conversion tracking
CREATE INDEX CONCURRENTLY idx_share_conversions_link_visitor
ON share_conversions (share_link_id, visitor_id, converted_at DESC);
```

### Backup & Recovery

```sql
-- Regular backups
pg_dump -F c -U postgres prompt_temple > backup.dump

-- Point-in-time recovery
-- Configure WAL archiving in PostgreSQL
```

### A/B Testing

```typescript
// Test different OG image designs
export async function GET(request: NextRequest) {
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  return new ImageResponse(
    variant === 'A' ? <DesignA /> : <DesignB />
  );
}
```

---

## 18. Final Recommended Execution Order

### Sprint 1 (Week 1): MVP Sharing

**Priority:** Get basic sharing working with OG images

1. **Day 1-2: Foundation**
   - Create type definitions
   - Create utility functions
   - Create Zustand stores
   - Create share page layout

2. **Day 3-4: OG Images**
   - Create default OG card
   - Create prompt and optimization OG cards
   - Implement route-level OG images
   - Test social previews

3. **Day 5-6: Public Share Pages**
   - Create share page server component
   - Create artifact display components
   - Implement visit tracking
   - Test public share pages

4. **Day 7: Share Creation**
   - Create share API endpoints
   - Create React Query hooks
   - Create share modal
   - Integrate share buttons

**Deliverables:**
- ✅ Public share pages for prompts and optimizations
- ✅ Dynamic OG images
- ✅ Share creation flow
- ✅ Social media sharing

### Sprint 2 (Week 2): Advanced Features

**Priority:** Add smart templates and broadcasts

5. **Day 8-9: Smart Template Sharing**
   - Create template OG card
   - Create template display component
   - Integrate with template detail modal
   - Test template sharing

6. **Day 10-11: Multi-AI Broadcast Sharing**
   - Create broadcast OG card (flagship)
   - Create broadcast display component
   - Implement comparison grid
   - Test broadcast sharing

7. **Day 12: Share Management**
   - Create share management page
   - Implement analytics API
   - Add share analytics view
   - Test management features

**Deliverables:**
- ✅ Smart template sharing
- ✅ Multi-AI Broadcast sharing (flagship)
- ✅ Share management interface
- ✅ Analytics dashboard

### Sprint 3 (Week 3): Rewards & Gamification

**Priority:** Add XP rewards and gamification

8. **Day 13-14: XP Reward System**
   - Create reward API
   - Implement reward eligibility logic
   - Add XP tracking
   - Test reward claiming

9. **Day 15-16: Abuse Prevention**
   - Implement rate limiting
   - Add self-referral prevention
   - Create moderation tools
   - Test abuse prevention

10. **Day 17: Gamification Integration**
    - Integrate with existing XP system
    - Add sharing levels
    - Create achievement badges
    - Test gamification

**Deliverables:**
- ✅ XP reward system
- ✅ Abuse prevention measures
- ✅ Gamification integration
- ✅ Achievement badges

### Sprint 4 (Week 4): Polish & Production

**Priority:** Production hardening and launch

11. **Day 18-19: Performance Optimization**
    - Add caching
    - Optimize OG image generation
    - Improve load times
    - Performance testing

12. **Day 20: Security Hardening**
    - Security audit
    - Penetration testing
    - Fix vulnerabilities
    - Document security measures

13. **Day 21-22: Testing**
    - E2E tests
    - Integration tests
    - Social preview testing
    - Bug fixes

14. **Day 23: Deployment**
    - Deploy to production
    - Monitor performance
    - Handle issues
    - Gather feedback

**Deliverables:**
- ✅ Production-ready sharing system
- ✅ Performance optimized
- ✅ Security hardened
- ✅ Comprehensive testing

---

## Summary

This implementation plan provides a complete, production-grade sharing system for Prompt Temple that:

1. **Turns prompt artifacts into growth surfaces** through public shareable URLs
2. **Creates viral loops** with social sharing and referral tracking
3. **Leverages Multi-AI Broadcast** as a flagship shareable feature
4. **Rewards users** with XP and credits for sharing
5. **Prevents abuse** with rate limiting and anti-farming measures
6. **Provides excellent social previews** with dynamic OG images
7. **Tracks analytics** for continuous improvement

The system is designed incrementally, with each sprint building on the previous one, ensuring a smooth path from MVP to full-featured production system.

**Key Success Metrics:**
- Share link creation rate
- Public share page views
- Social media shares
- Conversion rate (signup/remix)
- Reward claims
- Viral coefficient (new users per share)

**Next Steps:** Begin Sprint 1, Day 1 by creating type definitions in `src/lib/sharing/share-types.ts`.
