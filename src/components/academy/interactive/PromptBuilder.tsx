/**
 * PromptBuilder Interactive Component (Placeholder - Phase 2)
 *
 * TODO: Implement drag-and-drop CCCEFI framework builder
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

interface PromptBuilderProps {
  scenario?: string;
  onStateChange?: (state: any) => void;
}

export default function PromptBuilder({ scenario, onStateChange }: PromptBuilderProps) {
  return (
    <Card className="p-8 bg-obsidian-800/50 border-royal-gold-500/30">
      <div className="text-center">
        <Construction className="w-12 h-12 text-royal-gold-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-royal-gold-400 mb-2">
          Interactive Prompt Builder
        </h3>
        <p className="text-desert-sand-300 mb-4">
          This interactive component will be available in Phase 2
        </p>
        {scenario && (
          <div className="mt-4 p-4 bg-obsidian-900 rounded-lg border border-royal-gold-500/20">
            <p className="text-sm text-desert-sand-200">
              <span className="font-semibold text-royal-gold-400">Scenario:</span> {scenario}
            </p>
          </div>
        )}
        <Button className="mt-6" variant="outline">
          Coming Soon
        </Button>
      </div>
    </Card>
  );
}
