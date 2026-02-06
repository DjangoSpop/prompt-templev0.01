/**
 * ROICalculator Interactive Component (Placeholder - Phase 2)
 */

'use client';

import { Card } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function ROICalculator({ onStateChange }: { onStateChange?: (state: any) => void }) {
  return (
    <Card className="p-8 bg-obsidian-800/50 border-royal-gold-500/30 text-center">
      <Construction className="w-12 h-12 text-royal-gold-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-royal-gold-400 mb-2">
        ROI Calculator
      </h3>
      <p className="text-desert-sand-300">Coming in Phase 2</p>
    </Card>
  );
}
