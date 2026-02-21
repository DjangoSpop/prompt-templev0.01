'use client';

import dynamic from 'next/dynamic';
import type { UserOnboardingProps } from '../onboarding/UserOnboarding';

/* Lazy-load the actual component (no SSR) */
const UserOnboarding = dynamic<UserOnboardingProps>(
  () => import('../onboarding/UserOnboarding').then((mod) => mod.UserOnboarding),
  { ssr: false, loading: () => null }
);

/* Re-export the props type for consumers */
export type { UserOnboardingProps } from '../onboarding/UserOnboarding';

export default UserOnboarding;
