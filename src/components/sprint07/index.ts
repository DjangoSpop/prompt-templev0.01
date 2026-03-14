/**
 * Sprint 7: Polish & Pharaonic Micro-Interactions
 * Central exports for all new components
 */

// Error Boundary
export { PharaonicErrorBoundary, withPharaonicErrorBoundary } from '../errors/PharaonicErrorBoundary';

// Skeletons
export {
  PapyrusSkeletonBase,
  PapyrusSkeletonText,
  PapyrusSkeletonCard,
  PapyrusSkeletonStat,
  PapyrusSkeletonOptimizer,
  PapyrusSkeletonBroadcast,
  PapyrusSkeletonAskMe,
  PapyrusSkeleton,
} from '../ui/PapyrusSkeleton';

// Confetti
export {
  triggerGoldConfetti,
  triggerPharaonicCelebration,
  triggerFocusedGoldBurst,
  triggerGoldShower,
  copyWithConfetti,
  triggerConfettiFromEvent,
  triggerGoldCascade,
  resetConfetti,
  PHARAONIC_CONFETTI_COLORS,
  useConfettiStore,
} from '../../lib/utils/confetti';

// Empty States
export {
  EmptyState,
  NoResultsFound,
  NoUsageData,
  NoBroadcastsYet,
  NoCreditsLeft,
  NoTemplates,
} from '../ui/EmptyState';

// Offline Indicator
export {
  OfflineIndicator,
  useConnectionStatus,
  useIsOnline,
} from '../system/OfflineIndicator';

// Types for re-export
export type { ConfettiState } from '../../lib/utils/confetti';
