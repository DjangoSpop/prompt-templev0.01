/**
 * Centralized API hooks exports
 */

// Template hooks
export {
  useTemplates,
  useTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useBookmarkTemplate,
  useRateTemplate,
} from "./useTemplates";

// Library hooks
export {
  useLibrary,
  useLibraryItem,
  useFeaturedLibrary,
} from "./useLibrary";

// Optimize hooks
export { useOptimizeTry } from "./useOptimizeTry";
export { useOptimizeAuth } from "./useOptimizeAuth";

// Search hooks
export { useSearch, useRelatedTemplates } from "./useSearch";
