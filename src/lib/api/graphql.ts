/**
 * GraphQL Client for Saved Prompts & Iterations
 * Uses raw fetch for lightweight GraphQL queries without heavy Apollo dependency.
 */

import { useAuthStore } from '@/store/user';

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  (process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql/`
    : 'http://localhost:8000/graphql/');

// ============================================
// Lightweight GraphQL Fetch Client
// ============================================

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; locations?: any[]; path?: string[] }>;
}

export async function graphqlFetch<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }

  if (!json.data) {
    throw new Error('No data returned from GraphQL');
  }

  return json.data;
}

// ============================================
// Saved Prompts Queries
// ============================================

export const SAVED_PROMPTS_QUERIES = {
  /** List saved prompts with filters */
  LIST: `
    query SavedPrompts(
      $search: String
      $category: String
      $isFavorite: Boolean
      $isPublic: Boolean
      $sortBy: String
      $sortOrder: String
      $page: Int
      $limit: Int
    ) {
      savedPrompts(
        search: $search
        category: $category
        isFavorite: $isFavorite
        isPublic: $isPublic
        sortBy: $sortBy
        sortOrder: $sortOrder
        page: $page
        limit: $limit
      ) {
        count
        results {
          id
          title
          content
          description
          category
          tags
          isFavorite
          isPublic
          useCount
          lastUsedAt
          source
          sourceTemplateId
          sourceTemplateName
          currentVersion
          createdAt
          updatedAt
          metadata {
            modelUsed
            tokensEstimated
            qualityScore
            effectivenessRating
            notes
          }
        }
      }
    }
  `,

  /** Get single saved prompt */
  GET: `
    query SavedPrompt($id: ID!) {
      savedPrompt(id: $id) {
        id
        title
        content
        description
        category
        tags
        isFavorite
        isPublic
        useCount
        lastUsedAt
        source
        sourceTemplateId
        sourceTemplateName
        variablesSnapshot
        currentVersion
        createdAt
        updatedAt
        metadata {
          modelUsed
          tokensEstimated
          qualityScore
          effectivenessRating
          optimizationCount
          originalPrompt
          notes
        }
      }
    }
  `,

  /** Get prompt stats */
  STATS: `
    query SavedPromptStats {
      savedPromptStats {
        totalPrompts
        totalFavorites
        totalIterations
        totalUses
        categories {
          name
          count
        }
        mostUsed {
          id
          title
          useCount
        }
        recentlyUsed {
          id
          title
          lastUsedAt
        }
      }
    }
  `,

  /** Search saved prompts */
  SEARCH: `
    query SearchSavedPrompts($query: String!) {
      searchSavedPrompts(query: $query) {
        id
        title
        content
        category
        tags
        useCount
        isFavorite
      }
    }
  `,
};

// ============================================
// Saved Prompts Mutations
// ============================================

export const SAVED_PROMPTS_MUTATIONS = {
  /** Create a saved prompt */
  CREATE: `
    mutation CreateSavedPrompt($input: SavedPromptInput!) {
      createSavedPrompt(input: $input) {
        savedPrompt {
          id
          title
          content
          description
          category
          tags
          isFavorite
          isPublic
          source
          currentVersion
          createdAt
          updatedAt
        }
        success
        errors
      }
    }
  `,

  /** Update a saved prompt */
  UPDATE: `
    mutation UpdateSavedPrompt($id: ID!, $input: SavedPromptUpdateInput!) {
      updateSavedPrompt(id: $id, input: $input) {
        savedPrompt {
          id
          title
          content
          description
          category
          tags
          isFavorite
          isPublic
          currentVersion
          updatedAt
        }
        success
        errors
      }
    }
  `,

  /** Delete a saved prompt */
  DELETE: `
    mutation DeleteSavedPrompt($id: ID!) {
      deleteSavedPrompt(id: $id) {
        success
        errors
      }
    }
  `,

  /** Toggle favorite */
  TOGGLE_FAVORITE: `
    mutation ToggleFavorite($id: ID!) {
      toggleFavoritePrompt(id: $id) {
        savedPrompt {
          id
          isFavorite
        }
        success
      }
    }
  `,

  /** Record usage */
  RECORD_USAGE: `
    mutation RecordPromptUsage($id: ID!, $input: PromptUsageInput) {
      recordPromptUsage(id: $id, input: $input) {
        success
        useCount
      }
    }
  `,

  /** Duplicate */
  DUPLICATE: `
    mutation DuplicateSavedPrompt($id: ID!) {
      duplicateSavedPrompt(id: $id) {
        savedPrompt {
          id
          title
          content
          category
          createdAt
        }
        success
        errors
      }
    }
  `,
};

// ============================================
// Iteration Queries & Mutations
// ============================================

export const ITERATION_QUERIES = {
  /** List iterations for a prompt */
  LIST: `
    query PromptIterations($promptId: ID!) {
      promptIterations(promptId: $promptId) {
        id
        promptId
        version
        content
        changeDescription
        changeType
        diffSummary
        performanceMetrics {
          tokensBefore
          tokensAfter
          qualityScoreBefore
          qualityScoreAfter
          userRating
        }
        createdBy
        createdAt
      }
    }
  `,

  /** Get single iteration */
  GET: `
    query PromptIteration($promptId: ID!, $iterationId: ID!) {
      promptIteration(promptId: $promptId, iterationId: $iterationId) {
        id
        promptId
        version
        content
        changeDescription
        changeType
        diffSummary
        performanceMetrics {
          tokensBefore
          tokensAfter
          qualityScoreBefore
          qualityScoreAfter
          userRating
        }
        createdBy
        createdAt
      }
    }
  `,

  /** Compare two iterations */
  COMPARE: `
    query CompareIterations($promptId: ID!, $versionA: Int!, $versionB: Int!) {
      compareIterations(promptId: $promptId, versionA: $versionA, versionB: $versionB) {
        versionA {
          version
          content
          changeType
          createdAt
        }
        versionB {
          version
          content
          changeType
          createdAt
        }
        diff
        tokenDelta
      }
    }
  `,
};

export const ITERATION_MUTATIONS = {
  /** Create a new iteration */
  CREATE: `
    mutation CreatePromptIteration($promptId: ID!, $input: PromptIterationInput!) {
      createPromptIteration(promptId: $promptId, input: $input) {
        iteration {
          id
          promptId
          version
          content
          changeDescription
          changeType
          performanceMetrics {
            tokensBefore
            tokensAfter
          }
          createdAt
        }
        success
        errors
      }
    }
  `,

  /** Revert to a previous iteration */
  REVERT: `
    mutation RevertToIteration($promptId: ID!, $iterationId: ID!) {
      revertToIteration(promptId: $promptId, iterationId: $iterationId) {
        savedPrompt {
          id
          content
          currentVersion
          updatedAt
        }
        success
        errors
      }
    }
  `,
};

// ============================================
// High-Level GraphQL Helper Functions
// ============================================

export async function gqlGetSavedPrompts(filters?: Record<string, any>) {
  const data = await graphqlFetch(SAVED_PROMPTS_QUERIES.LIST, filters);
  return data.savedPrompts;
}

export async function gqlGetSavedPrompt(id: string) {
  const data = await graphqlFetch(SAVED_PROMPTS_QUERIES.GET, { id });
  return data.savedPrompt;
}

export async function gqlCreateSavedPrompt(input: any) {
  const data = await graphqlFetch(SAVED_PROMPTS_MUTATIONS.CREATE, { input });
  return data.createSavedPrompt;
}

export async function gqlUpdateSavedPrompt(id: string, input: any) {
  const data = await graphqlFetch(SAVED_PROMPTS_MUTATIONS.UPDATE, { id, input });
  return data.updateSavedPrompt;
}

export async function gqlDeleteSavedPrompt(id: string) {
  const data = await graphqlFetch(SAVED_PROMPTS_MUTATIONS.DELETE, { id });
  return data.deleteSavedPrompt;
}

export async function gqlToggleFavorite(id: string) {
  const data = await graphqlFetch(SAVED_PROMPTS_MUTATIONS.TOGGLE_FAVORITE, { id });
  return data.toggleFavoritePrompt;
}

export async function gqlGetPromptIterations(promptId: string) {
  const data = await graphqlFetch(ITERATION_QUERIES.LIST, { promptId });
  return data.promptIterations;
}

export async function gqlCreateIteration(promptId: string, input: any) {
  const data = await graphqlFetch(ITERATION_MUTATIONS.CREATE, { promptId, input });
  return data.createPromptIteration;
}

export async function gqlRevertToIteration(promptId: string, iterationId: string) {
  const data = await graphqlFetch(ITERATION_MUTATIONS.REVERT, { promptId, iterationId });
  return data.revertToIteration;
}

export async function gqlGetSavedPromptStats() {
  const data = await graphqlFetch(SAVED_PROMPTS_QUERIES.STATS);
  return data.savedPromptStats;
}
