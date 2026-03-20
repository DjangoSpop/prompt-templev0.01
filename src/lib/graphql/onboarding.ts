/**
 * GraphQL query strings for onboarding slider (authenticated users).
 * Used with graphqlFetch() from @/lib/api/graphql.
 */

export const ONBOARDING_QUERIES = {
  /** User's recent prompt activity for personalization */
  USER_ACTIVITY: `
    query GetUserActivity($limit: Int!) {
      allPromptHistories(limit: $limit) {
        id
        originalPrompt
        optimizedPrompt
        modelUsed
        intentCategory
        tags
        creditsSpent
        createdAt
      }
    }
  `,

  /** Latest iterations — "continue where you left off" */
  RECENT_ITERATIONS: `
    query GetRecentIterations($limit: Int!) {
      allPromptHistories(limit: $limit) {
        id
        originalPrompt
        intentCategory
        tags
        iterations {
          id
          iterationNumber
          promptText
          interactionType
          changesSummary
          isActive
          isBookmarked
          createdAt
        }
      }
    }
  `,

  /** Bookmarked iterations — user's curated best */
  BOOKMARKED: `
    query GetBookmarked($limit: Int!) {
      bookmarkedIterations(limit: $limit) {
        id
        iterationNumber
        promptText
        aiResponse
        userRating
        tags
        createdAt
      }
    }
  `,

  /** Saved prompts from user's library */
  SAVED_PROMPTS: `
    query GetSavedPrompts($limit: Int!) {
      allSavedPrompts(limit: $limit) {
        id
        title
        content
        category
        tags
        useCount
        isFavorite
        updatedAt
      }
    }
  `,

  /** Active conversation threads */
  ACTIVE_THREADS: `
    query GetActiveThreads {
      allConversationThreads(status: "active", limit: 5) {
        id
        title
        totalIterations
        totalTokens
        lastActivityAt
        messages {
          messageOrder
          iteration {
            promptText
            interactionType
          }
        }
      }
    }
  `,
};
