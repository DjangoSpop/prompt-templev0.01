"use client";

import React from 'react';
import { Card } from '@/components/ui/card-unified';

type Profile = any;

export const UserStats: React.FC<{ profile: Profile }> = ({ profile }) => {
  const stats = profile?.stats || { prompts: 0, tokens: 0, sessions: 0 };

  return (
    <Card variant="temple" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.prompts}</div>
          <div className="text-fg/70 text-sm">Prompts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.tokens}</div>
          <div className="text-fg/70 text-sm">Tokens used</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.sessions}</div>
          <div className="text-fg/70 text-sm">Sessions</div>
        </div>
      </div>
    </Card>
  );
};

export const LevelRankDisplay: React.FC<{ profile: Profile }> = ({ profile }) => {
  const level = profile?.level || 1;
  const rank = profile?.rank || 'Novice';

  return (
    <Card variant="temple" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Level & Rank</h3>
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl font-extrabold">{level}</div>
        <div className="text-fg/70">{rank}</div>
      </div>
    </Card>
  );
};

export default UserStats;
