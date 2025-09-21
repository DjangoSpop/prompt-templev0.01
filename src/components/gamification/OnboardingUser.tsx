'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/* ------------------------------------------------------------------ */
/* 1.  Import the *type* only (zero runtime)                          */
/* 2.  Lazy-load the actual component (no SSR)                        */
/* ------------------------------------------------------------------ */
const UserOnboarding = dynamic<ComponentType<UserOnboardingProps>>(
  () => import('../onboarding/UserOnboarding').then((mod) => mod.UserOnboarding),
  { ssr: false, loading: () => null } // optional: skeleton here
);

/* Re-export the props type for consumers */
export type { UserOnboardingProps } from './UserOnboarding';

export default UserOnboarding;