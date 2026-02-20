# Prompt-Temple Frontend Development Prompt

## Comprehensive AI Agent Instruction Document for Professional Frontend Implementation

---

## 1. PROJECT OVERVIEW

### 1.1 Application Purpose
**Prompt-Temple** is a professional prompt engineering platform that enables users to:
- Create, store, and manage reusable AI prompts
- Track prompt iterations with full version control
- Monitor AI interaction metrics (tokens, credits, response times)
- Organize prompts into conversation threads for multi-turn interactions
- Share and discover public prompts from the community

### 1.2 Target Users
- AI practitioners and prompt engineers
- Content creators using AI tools
- Developers building AI-powered applications
- Teams managing shared prompt libraries

### 1.3 Tech Stack Requirements
- **Frontend Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui (Radix-based)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **API Communication**: REST API (primary) with optional GraphQL support
- **Icons**: Lucide React

---

## 2. API INTEGRATION SPECIFICATION

### 2.1 Base Configuration
```typescript
// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Authentication: Bearer token in headers
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 2.2 TypeScript Interfaces

```typescript
// ==================== Core Types ====================

interface PromptHistory {
  id: string;
  user: string;
  source: string;
  original_prompt: string;
  optimized_prompt: string;
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  credits_spent: number;
  intent_category: string;
  tags: string[];
  meta: Record<string, unknown>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  iterations?: PromptIteration[];
}

interface PromptIteration {
  id: string;
  user: string;
  parent_prompt: string;
  previous_iteration: string | null;
  iteration_number: number;
  version_tag: string;
  prompt_text: string;
  system_message: string;
  ai_response: string;
  response_model: string;
  interaction_type: 'manual' | 'optimization' | 'refinement' | 'extension' | 'correction' | 'experiment';
  tokens_input: number;
  tokens_output: number;
  response_time_ms: number;
  credits_spent: number;
  user_rating: number | null;
  feedback_notes: string;
  changes_summary: string;
  diff_size: number;
  parameters: Record<string, unknown>;
  tags: string[];
  metadata: Record<string, unknown>;
  is_active: boolean;
  is_bookmarked: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  iteration_chain_length?: number;
  has_next_iteration?: boolean;
}

interface ConversationThread {
  id: string;
  user: string;
  title: string;
  description: string;
  total_iterations: number;
  total_tokens: number;
  total_credits: number;
  status: 'active' | 'archived' | 'completed';
  is_shared: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  messages?: ThreadMessage[];
}

interface ThreadMessage {
  id: string;
  thread: string;
  iteration: string;
  message_order: number;
  created_at: string;
}

interface SavedPrompt {
  id: string;
  user: string;
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
  use_count: number;
  last_used_at: string | null;
  is_favorite: boolean;
  is_public: boolean;
  metadata: Record<string, unknown>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== API Response Types ====================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== Input Types ====================

interface CreatePromptHistoryInput {
  source?: string;
  original_prompt: string;
  intent_category?: string;
  tags?: string[];
  meta?: Record<string, unknown>;
}

interface CreateSavedPromptInput {
  title: string;
  content: string;
  description?: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_public?: boolean;
  metadata?: Record<string, unknown>;
}

interface UpdateSavedPromptInput {
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_public?: boolean;
  metadata?: Record<string, unknown>;
}

interface CreatePromptIterationInput {
  parent_prompt_id: string;
  previous_iteration_id?: string;
  prompt_text: string;
  system_message?: string;
  ai_response?: string;
  response_model?: string;
  interaction_type?: string;
  tokens_input?: number;
  tokens_output?: number;
  response_time_ms?: number;
  credits_spent?: number;
  user_rating?: number;
  feedback_notes?: string;
  changes_summary?: string;
  parameters?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
  version_tag?: string;
}

interface CreateConversationThreadInput {
  title?: string;
  description?: string;
  status?: 'active' | 'archived' | 'completed';
}
```

### 2.3 API Service Layer

```typescript
// lib/api/prompt-history.ts
export const promptHistoryApi = {
  list: (params?: { limit?: number; offset?: number }) => 
    fetch(`${API_BASE_URL}/history/?${new URLSearchParams(params as Record<string, string>)}`).then(r => r.json()),
  
  get: (id: string) => 
    fetch(`${API_BASE_URL}/history/${id}/`).then(r => r.json()),
  
  create: (data: CreatePromptHistoryInput) => 
    fetch(`${API_BASE_URL}/history/`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  
  enhance: (id: string, data: { model?: string; style?: string }) => 
    fetch(`${API_BASE_URL}/history/${id}/enhance/`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  
  delete: (id: string) => 
    fetch(`${API_BASE_URL}/history/${id}/`, { method: 'DELETE' }),
};

// lib/api/saved-prompts.ts
export const savedPromptsApi = {
  list: (params?: { category?: string; is_favorite?: boolean; search?: string }) => 
    fetch(`${API_BASE_URL}/saved-prompts/?${new URLSearchParams(params as Record<string, string>)}`).then(r => r.json()),
  
  get: (id: string) => 
    fetch(`${API_BASE_URL}/saved-prompts/${id}/`).then(r => r.json()),
  
  create: (data: CreateSavedPromptInput) => 
    fetch(`${API_BASE_URL}/saved-prompts/`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  
  update: (id: string, data: UpdateSavedPromptInput) => 
    fetch(`${API_BASE_URL}/saved-prompts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
  
  delete: (id: string) => 
    fetch(`${API_BASE_URL}/saved-prompts/${id}/`, { method: 'DELETE' }),
  
  toggleFavorite: (id: string) => 
    fetch(`${API_BASE_URL}/saved-prompts/${id}/toggle-favorite/`, { method: 'POST' }).then(r => r.json()),
  
  usePrompt: (id: string) => 
    fetch(`${API_BASE_URL}/saved-prompts/${id}/use/`, { method: 'POST' }).then(r => r.json()),
  
  duplicate: (id: string, newTitle?: string) => 
    fetch(`${API_BASE_URL}/saved-prompts/${id}/duplicate/`, { method: 'POST', body: JSON.stringify({ new_title: newTitle }) }).then(r => r.json()),
  
  favorites: () => 
    fetch(`${API_BASE_URL}/saved-prompts/favorites/`).then(r => r.json()),
  
  public: (category?: string) => 
    fetch(`${API_BASE_URL}/saved-prompts/public/?${category ? `category=${category}` : ''}`).then(r => r.json()),
};

// lib/api/iterations.ts
export const iterationsApi = {
  list: (params?: { parent_prompt?: string; is_bookmarked?: boolean }) => 
    fetch(`${API_BASE_URL}/iterations/?${new URLSearchParams(params as Record<string, string>)}`).then(r => r.json()),
  
  get: (id: string) => 
    fetch(`${API_BASE_URL}/iterations/${id}/`).then(r => r.json()),
  
  create: (data: CreatePromptIterationInput) => 
    fetch(`${API_BASE_URL}/iterations/`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  
  setActive: (id: string) => 
    fetch(`${API_BASE_URL}/iterations/${id}/set-active/`, { method: 'POST' }).then(r => r.json()),
  
  toggleBookmark: (id: string) => 
    fetch(`${API_BASE_URL}/iterations/${id}/toggle-bookmark/`, { method: 'POST' }).then(r => r.json()),
  
  bookmarked: () => 
    fetch(`${API_BASE_URL}/iterations/bookmarked/`).then(r => r.json()),
};

// lib/api/threads.ts
export const threadsApi = {
  list: (params?: { status?: string }) => 
    fetch(`${API_BASE_URL}/threads/?${new URLSearchParams(params as Record<string, string>)}`).then(r => r.json()),
  
  get: (id: string) => 
    fetch(`${API_BASE_URL}/threads/${id}/`).then(r => r.json()),
  
  create: (data: CreateConversationThreadInput) => 
    fetch(`${API_BASE_URL}/threads/`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  
  addIteration: (threadId: string, iterationId: string) => 
    fetch(`${API_BASE_URL}/threads/${threadId}/add-iteration/`, { method: 'POST', body: JSON.stringify({ iteration_id: iterationId }) }).then(r => r.json()),
};
```

---

## 3. UI/UX DESIGN SPECIFICATION

### 3.1 Page Structure

#### **Main Pages (Routes)**

| Route | Page Name | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Overview with quick stats, recent activity, quick actions |
| `/prompts` | Saved Prompts Library | Grid/list view of saved prompts with search/filter |
| `/prompts/new` | Create Prompt | Form to create new saved prompt |
| `/prompts/[id]` | Prompt Detail | View/edit single prompt with full details |
| `/prompts/[id]/iterate` | Iterate Prompt | Create new iteration from a prompt |
| `/history` | Prompt History | List of all prompt optimization history |
| `/history/[id]` | History Detail | View history with iterations timeline |
| `/threads` | Conversation Threads | List of conversation threads |
| `/threads/[id]` | Thread Detail | Conversation thread with all iterations |
| `/discover` | Discover Prompts | Browse public prompts from community |

### 3.2 Component Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Dashboard
│   ├── prompts/
│   │   ├── page.tsx            # Saved prompts list
│   │   ├── new/page.tsx        # Create prompt
│   │   └── [id]/
│   │       ├── page.tsx        # Prompt detail
│   │       └── iterate/page.tsx # Create iteration
│   ├── history/
│   │   ├── page.tsx            # History list
│   │   └── [id]/page.tsx       # History detail
│   ├── threads/
│   │   ├── page.tsx            # Threads list
│   │   └── [id]/page.tsx       # Thread detail
│   └── discover/
│       └── page.tsx            # Public prompts
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Top header with search
│   │   └── PageHeader.tsx      # Page-specific headers
│   ├── prompts/
│   │   ├── PromptCard.tsx      # Individual prompt card
│   │   ├── PromptList.tsx      # List/grid of prompts
│   │   ├── PromptForm.tsx      # Create/edit prompt form
│   │   ├── PromptEditor.tsx    # Rich text editor for prompts
│   │   └── CategoryBadge.tsx   # Category indicator
│   ├── iterations/
│   │   ├── IterationTimeline.tsx  # Visual iteration timeline
│   │   ├── IterationCard.tsx      # Single iteration display
│   │   ├── IterationDiff.tsx      # Show changes between iterations
│   │   └── RatingStars.tsx        # Star rating component
│   ├── threads/
│   │   ├── ThreadList.tsx      # List of threads
│   │   ├── ThreadView.tsx      # Conversation view
│   │   └── MessageBubble.tsx   # Chat-style message display
│   ├── history/
│   │   ├── HistoryList.tsx     # List of history items
│   │   └── OptimizeButton.tsx  # Trigger optimization
│   └── common/
│       ├── StatsCard.tsx       # Dashboard stat cards
│       ├── SearchBar.tsx       # Global search component
│       ├── TagInput.tsx        # Multi-tag input
│       ├── FilterDropdown.tsx  # Filter controls
│       ├── EmptyState.tsx      # Empty state illustrations
│       └── LoadingSkeleton.tsx # Loading placeholders
├── lib/
│   ├── api/                    # API service functions
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Utility functions
└── types/
    └── index.ts                # TypeScript definitions
```

### 3.3 Design System

#### **Color Palette (Tailwind + CSS Variables)**
```css
:root {
  /* Primary - Indigo */
  --primary: 239 84% 67%;
  --primary-foreground: 0 0% 100%;
  
  /* Secondary - Slate */
  --secondary: 215 16% 47%;
  --secondary-foreground: 0 0% 100%;
  
  /* Accent - Emerald */
  --accent: 160 84% 39%;
  --accent-foreground: 0 0% 100%;
  
  /* Warning - Amber */
  --warning: 38 92% 50%;
  
  /* Success - Green */
  --success: 142 76% 36%;
  
  /* Destructive - Red */
  --destructive: 0 84% 60%;
  
  /* Background layers */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
}
```

#### **Typography**
- Headings: Inter (font-semibold)
- Body: Inter (font-normal)
- Code/Monospace: JetBrains Mono

#### **Spacing Scale**
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

---

## 4. PAGE-BY-PAGE SPECIFICATIONS

### 4.1 Dashboard (`/`)

**Purpose**: Central hub showing user's prompt activity and quick actions.

**Components**:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: "Welcome back, [User]"        [+ New Prompt] btn   │
├─────────────────────────────────────────────────────────────┤
│  STATS ROW                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Total    │ │ Credits  │ │ Active   │ │ Bookmarks│       │
│  │ Prompts  │ │ Spent    │ │ Threads  │ │          │       │
│  │   142    │ │  2,340   │ │    8     │ │    23    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  TWO COLUMN LAYOUT                                          │
│  ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  │ Recent Activity         │ │ Favorite Prompts        │   │
│  │ ─────────────────────── │ │ ─────────────────────── │   │
│  │ • Prompt edited 2h ago  │ │ [Card] [Card] [Card]    │   │
│  │ • New iteration...      │ │ [View All →]            │   │
│  │ • Thread completed      │ │                         │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                              │
│  [📊 View History] [🔍 Discover] [💬 Active Threads]        │
└─────────────────────────────────────────────────────────────┘
```

**Data Requirements**:
- Total prompts count: `GET /saved-prompts/`
- Total credits: Sum from history or user profile
- Active threads: `GET /threads/?status=active`
- Bookmarks: `GET /iterations/bookmarked/` + `GET /saved-prompts/favorites/`
- Recent activity: Combine latest from all endpoints

### 4.2 Saved Prompts Library (`/prompts`)

**Purpose**: Manage and browse user's saved prompts with search/filter capabilities.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "My Prompts"                              [+ Create New]   │
├─────────────────────────────────────────────────────────────┤
│  SEARCH & FILTER BAR                                        │
│  [🔍 Search prompts...    ] [Category ▼] [Favorites □] [Grid/List] │
├─────────────────────────────────────────────────────────────┤
│  PROMPT GRID (Responsive)                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ ⭐ Coding   │ │ Marketing   │ │ ⭐ Writing  │           │
│  │ ─────────── │ │ ─────────── │ │ ─────────── │           │
│  │ API Helper  │ │ Email Seq   │ │ Blog Post   │           │
│  │ Used 12x    │ │ Used 5x     │ │ Used 28x    │           │
│  │ #api #rest  │ │ #email      │ │ #blog       │           │
│  │ [Use] [Edit]│ │ [Use] [Edit]│ │ [Use] [Edit]│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Analysis    │ │ Creative    │ │ Technical   │           │
│  │ ...         │ │ ...         │ │ ...         │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Search by title, content, description
- Filter by category
- Filter by favorite status
- Toggle grid/list view
- Sort by: recently updated, most used, alphabetically
- Quick actions: Use, Edit, Duplicate, Delete

### 4.3 Prompt Detail Page (`/prompts/[id]`)

**Purpose**: Full view of a single prompt with editing capabilities and iteration history.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Prompts > [Prompt Title]                       │
├─────────────────────────────────────────────────────────────┤
│  HEADER ROW                                                 │
│  ⭐ [Prompt Title]                          [Edit] [Delete] │
│  Category: Coding | Created: Jan 15, 2024 | Used: 12 times │
├─────────────────────────────────────────────────────────────┤
│  TABS: [Content] [Iterations] [Settings]                    │
├─────────────────────────────────────────────────────────────┤
│  CONTENT TAB                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PROMPT CONTENT (Markdown rendered)                  │   │
│  │                                                     │   │
│  │ "You are an expert API developer. Help me create    │   │
│  │  RESTful endpoints for a user management system..." │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  METADATA                                                   │
│  Tags: #api #rest #backend                                 │
│  Description: Perfect for scaffolding API endpoints...      │
│                                                             │
│  ACTIONS                                                    │
│  [📤 Copy Prompt] [🚀 Use & Iterate] [🔄 Duplicate]        │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Iteration Timeline (`/history/[id]` or within Prompt Detail)

**Purpose**: Visualize the evolution of a prompt through iterations.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  ITERATION TIMELINE                                         │
│  Original Prompt → Optimized → Refined → Final             │
├─────────────────────────────────────────────────────────────┤
│  TIMELINE (Vertical)                                        │
│                                                             │
│  ●── v1 (Original) ────────────────────────────────────    │
│  │   Jan 15, 2024 | Manual | ⭐⭐⭐⭐☆                       │
│  │   "Initial prompt text..."                               │
│  │   Tokens: 150 in / 320 out | Credits: 5                 │
│  │   [View Full] [SetActive]                                │
│  │                                                          │
│  ●── v2 (Optimized) ───────────────────────────────────    │
│  │   Jan 15, 2024 | AI Optimization | ⭐⭐⭐⭐⭐              │
│  │   "Improved prompt with better context..."              │
│  │   Tokens: 180 in / 450 out | Credits: 8                 │
│  │   ✓ Active Version                                       │
│  │                                                          │
│  ●── v3 (Refinement) ──────────────────────────────────    │
│      Jan 16, 2024 | Manual Edit | Not rated               │
│      "Added specific constraints for output..."            │
│      Tokens: 200 in / 380 out | Credits: 6                │
│      [View Full] [SetActive]                                │
│                                                             │
│  [+ Add New Iteration]                                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 Conversation Thread View (`/threads/[id]`)

**Purpose**: Display multi-turn AI conversations with full context.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  THREAD HEADER                                              │
│  "Building a REST API"                     [Archive] [Share]│
│  Status: Active | 8 messages | 2,450 tokens | 15 credits   │
├─────────────────────────────────────────────────────────────┤
│  CONVERSATION VIEW (Chat-style)                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 User (v1)                                          │  │
│  │ "Help me design a REST API for user management..."    │  │
│  │ Rating: ⭐⭐⭐⭐☆ | 10:30 AM                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🤖 AI Response                                        │  │
│  │ "I'll help you design a comprehensive REST API..."    │  │
│  │ Model: GPT-4 | Tokens: 450 | Response: 1.2s          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 User (v2)                                          │  │
│  │ "Can you add authentication endpoints?"               │  │
│  │ Rating: ⭐⭐⭐⭐⭐ | 10:35 AM                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🤖 AI Response                                        │  │
│  │ "Here are the authentication endpoints..."            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Add to Thread]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 Discover Page (`/discover`)

**Purpose**: Browse and explore public prompts shared by the community.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  DISCOVER PROMPTS                                           │
│  "Explore prompts shared by the community"                  │
├─────────────────────────────────────────────────────────────┤
│  CATEGORY FILTER                                            │
│  [All] [Coding] [Writing] [Marketing] [Analysis] [Creative] │
├─────────────────────────────────────────────────────────────┤
│  TRENDING PROMPTS                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 🔥 Hot      │ │ 🔥 Hot      │ │ 🔥 Hot      │           │
│  │ ─────────── │ │ ─────────── │ │ ─────────── │           │
│  │ SQL Expert  │ │ Email Pro   │ │ Code Review │           │
│  │ Used 1.2k   │ │ Used 890    │ │ Used 756    │           │
│  │ by @user1   │ │ by @user2   │ │ by @user3   │           │
│  │ [Copy]      │ │ [Copy]      │ │ [Copy]      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  MORE PROMPTS (Paginated)                                   │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 PromptCard Component

```tsx
interface PromptCardProps {
  prompt: SavedPrompt;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onUse: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  variant?: 'grid' | 'list';
}

// Features:
// - Display title, category badge, truncated content preview
// - Show use count and last used date
// - Tags display (max 3 visible, "+N more")
// - Favorite star toggle
// - Hover actions (Use, Edit, Duplicate, Delete)
// - Responsive sizing
```

### 5.2 IterationTimeline Component

```tsx
interface IterationTimelineProps {
  iterations: PromptIteration[];
  activeIterationId?: string;
  onSelect: (iteration: PromptIteration) => void;
  onSetActive: (id: string) => void;
  onAddIteration: () => void;
}

// Features:
// - Vertical timeline with connected nodes
// - Color-coded by interaction_type
// - Show rating stars if available
// - Display token/credit summary
// - Active iteration highlighted
// - Expandable to show full prompt/response
// - Diff view between iterations
```

### 5.3 PromptEditor Component

```tsx
interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showToolbar?: boolean;
}

// Features:
// - Monaco Editor or textarea with syntax highlighting
// - Variable placeholder support ({{variable}})
// - Character/token counter
// - Markdown preview toggle
// - Template insertion
// - Auto-save draft
```

### 5.4 StatsCard Component

```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  description?: string;
}

// Features:
// - Clean card with icon
// - Optional trend indicator (up/down arrow with percentage)
// - Subtle description text
// - Hover effect
```

---

## 6. STATE MANAGEMENT

### 6.1 React Query Setup

```typescript
// lib/hooks/useSavedPrompts.ts
export function useSavedPrompts(params?: { category?: string; is_favorite?: boolean }) {
  return useQuery({
    queryKey: ['saved-prompts', params],
    queryFn: () => savedPromptsApi.list(params),
  });
}

export function useSavedPrompt(id: string) {
  return useQuery({
    queryKey: ['saved-prompts', id],
    queryFn: () => savedPromptsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSavedPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savedPromptsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-prompts'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savedPromptsApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['saved-prompts', 'favorites'] });
    },
  });
}

// Similar hooks for iterations, threads, history...
```

### 6.2 Global State (Zustand - if needed)

```typescript
// stores/ui-store.ts
interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}
```

---

## 7. IMPLEMENTATION PRIORITY

### Phase 1: Core Structure (Day 1)
1. ✅ Project setup with Next.js 15, shadcn/ui, Tailwind
2. ✅ Layout components (Sidebar, Header, PageHeader)
3. ✅ Dashboard page with stats cards
4. ✅ API service layer setup
5. ✅ TypeScript interfaces

### Phase 2: Saved Prompts (Day 2)
1. ✅ Saved prompts list page with grid/list view
2. ✅ PromptCard component
3. ✅ Search and filter functionality
4. ✅ Create/Edit prompt form
5. ✅ Prompt detail page

### Phase 3: Iterations & History (Day 3)
1. ✅ Iteration timeline component
2. ✅ History list page
3. ✅ History detail with iterations
4. ✅ Create iteration flow
5. ✅ Rating and feedback components

### Phase 4: Threads & Discovery (Day 4)
1. ✅ Conversation threads list
2. ✅ Thread detail view (chat-style)
3. ✅ Add iteration to thread
4. ✅ Discover public prompts page
5. ✅ Copy/Use functionality

### Phase 5: Polish & Optimization (Day 5)
1. ✅ Loading states and skeletons
2. ✅ Error handling and empty states
3. ✅ Responsive design refinement
4. ✅ Performance optimization
5. ✅ Accessibility improvements

---

## 8. KEY UX REQUIREMENTS

### 8.1 Interactions
- **Copy to clipboard**: Single-click copy with toast notification
- **Favorite toggle**: Immediate visual feedback
- **Delete**: Confirmation dialog with undo option
- **Form submission**: Loading state + success/error toast
- **Pagination**: Infinite scroll or "Load More" button

### 8.2 Feedback
- Loading skeletons for all data-fetching components
- Toast notifications for all mutations (create, update, delete)
- Error boundaries with fallback UI
- Empty states with illustrations and CTAs

### 8.3 Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance (WCAG AA)

---

## 9. DESIGN INSPIRATION

The design should feel:
- **Clean & Modern**: Similar to Linear, Notion, or Vercel's dashboard
- **Professional**: Suitable for enterprise users
- **Efficient**: Quick actions, minimal clicks
- **Delightful**: Subtle animations, smooth transitions

---

## 10. SUCCESS CRITERIA

The frontend implementation will be considered complete when:

1. ✅ All pages render correctly with real API data
2. ✅ CRUD operations work for all entities (prompts, iterations, threads)
3. ✅ Search and filter functionality is responsive and accurate
4. ✅ Iteration timeline displays version history clearly
5. ✅ Thread view shows conversation flow logically
6. ✅ Responsive design works on mobile, tablet, and desktop
7. ✅ Loading and error states provide clear feedback
8. ✅ Accessibility standards are met

---

**END OF DOCUMENT**

*This comprehensive guide provides all necessary information for implementing a professional frontend for the Prompt-Temple API. Follow the specifications carefully to ensure consistency and quality.*
