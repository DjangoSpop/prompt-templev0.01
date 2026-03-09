'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowRight } from 'lucide-react';

interface ROICardProps {
  directApiCost: number;
  templeCost: number;
  savingsPercentage: number;
}

export function ROICard({ directApiCost, templeCost, savingsPercentage }: ROICardProps) {
  return (
    <Card className="border border-[hsl(var(--royal-gold))]/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[hsl(var(--royal-gold))]" />
          Cost Savings (ROI)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Direct API cost */}
          <div className="text-center flex-1 min-w-[100px]">
            <p className="text-xs text-muted-foreground mb-1">Direct API Cost</p>
            <p className="text-xl sm:text-2xl font-bold text-red-500 line-through decoration-red-400/50">
              ${directApiCost.toFixed(2)}
            </p>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

          {/* Temple cost */}
          <div className="text-center flex-1 min-w-[100px]">
            <p className="text-xs text-muted-foreground mb-1">Prompt Temple Cost</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              ${templeCost.toFixed(2)}
            </p>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

          {/* Savings */}
          <div className="text-center flex-1 min-w-[100px]">
            <p className="text-xs text-muted-foreground mb-1">You Saved</p>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 12 }}
            >
              <Badge className="text-lg px-3 py-1 bg-green-600 hover:bg-green-700 text-white">
                {savingsPercentage}%
              </Badge>
            </motion.div>
          </div>
        </div>

        {savingsPercentage > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4 border-t border-border pt-3">
            You saved <span className="font-semibold text-green-600">${(directApiCost - templeCost).toFixed(2)}</span> compared to using OpenAI directly this month.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
