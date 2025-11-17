/**
 * Strategy Breakdown Component
 * Shows expandable cards for each optimization strategy
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TStrategyImprovement,
  STRATEGY_METADATA,
  OptimizationStrategy,
} from "@/schemas/optimization";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface StrategyBreakdownProps {
  improvements: TStrategyImprovement[];
  className?: string;
}

export const StrategyBreakdown: React.FC<StrategyBreakdownProps> = ({
  improvements,
  className = "",
}) => {
  const [expandedStrategies, setExpandedStrategies] = useState<Set<OptimizationStrategy>>(
    new Set()
  );

  const toggleStrategy = (strategy: OptimizationStrategy) => {
    setExpandedStrategies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(strategy)) {
        newSet.delete(strategy);
      } else {
        newSet.add(strategy);
      }
      return newSet;
    });
  };

  const getStrategyColor = (strategy: OptimizationStrategy) => {
    const metadata = STRATEGY_METADATA[strategy];
    const colorMap: Record<string, string> = {
      blue: "border-blue-500 bg-blue-50",
      green: "border-green-500 bg-green-50",
      purple: "border-purple-500 bg-purple-50",
      orange: "border-orange-500 bg-orange-50",
      teal: "border-teal-500 bg-teal-50",
    };
    return colorMap[metadata.color] || "border-gray-500 bg-gray-50";
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.9) return { label: "Excellent", variant: "default" as const, color: "text-green-600" };
    if (score >= 0.75) return { label: "Good", variant: "secondary" as const, color: "text-blue-600" };
    if (score >= 0.6) return { label: "Fair", variant: "outline" as const, color: "text-yellow-600" };
    return { label: "Low", variant: "destructive" as const, color: "text-red-600" };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-hieroglyph flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-primary" />
          Strategy Breakdown
        </h2>
        <Badge variant="outline" className="text-sm">
          {improvements.length} Strategies Applied
        </Badge>
      </div>

      <div className="space-y-3">
        {improvements.map((improvement, index) => {
          const metadata = STRATEGY_METADATA[improvement.strategy];
          const isExpanded = expandedStrategies.has(improvement.strategy);
          const confidence = getConfidenceBadge(improvement.confidence_score);

          return (
            <motion.div
              key={improvement.strategy}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`temple-card overflow-hidden border-l-4 ${getStrategyColor(
                  improvement.strategy
                )}`}
              >
                <button
                  onClick={() => toggleStrategy(improvement.strategy)}
                  className="w-full p-6 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-hieroglyph">
                          {metadata.name}
                        </h3>
                        <Badge variant={confidence.variant} className="text-xs">
                          {confidence.label} Confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          +{improvement.improvement_percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {metadata.description}
                      </p>
                      <p className="text-sm text-foreground italic">
                        {improvement.explanation}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                          {improvement.improvement_percentage.toFixed(0)}%
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-primary/20"
                    >
                      <div className="p-6 space-y-4 bg-secondary/30">
                        {/* Changes List */}
                        <div>
                          <h4 className="font-semibold text-sm text-hieroglyph mb-3 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Improvements Made ({improvement.changes.length})
                          </h4>
                          <div className="space-y-2">
                            {improvement.changes.map((change, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-background rounded-lg border border-primary/10"
                              >
                                <div className="flex items-start space-x-2">
                                  <Badge
                                    variant={
                                      change.type === "addition"
                                        ? "default"
                                        : change.type === "removal"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs mt-0.5"
                                  >
                                    {change.type}
                                  </Badge>
                                  <div className="flex-1">
                                    {change.original && (
                                      <p className="text-sm text-muted-foreground line-through mb-1">
                                        {change.original}
                                      </p>
                                    )}
                                    <p className="text-sm font-medium text-foreground mb-1">
                                      {change.improved}
                                    </p>
                                    <p className="text-xs text-muted-foreground italic">
                                      {change.reasoning}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Metrics */}
                        {improvement.metrics && (
                          <div>
                            <h4 className="font-semibold text-sm text-hieroglyph mb-3">
                              Impact Metrics
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                              {improvement.metrics.clarity_gain !== undefined && (
                                <div className="p-3 bg-background rounded-lg text-center">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Clarity
                                  </p>
                                  <p className="text-lg font-bold text-primary">
                                    +{(improvement.metrics.clarity_gain * 100).toFixed(0)}%
                                  </p>
                                </div>
                              )}
                              {improvement.metrics.specificity_gain !== undefined && (
                                <div className="p-3 bg-background rounded-lg text-center">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Specificity
                                  </p>
                                  <p className="text-lg font-bold text-primary">
                                    +{(improvement.metrics.specificity_gain * 100).toFixed(0)}%
                                  </p>
                                </div>
                              )}
                              {improvement.metrics.effectiveness_score !== undefined && (
                                <div className="p-3 bg-background rounded-lg text-center">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Effectiveness
                                  </p>
                                  <p className="text-lg font-bold text-primary">
                                    {(improvement.metrics.effectiveness_score * 100).toFixed(0)}%
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="temple-card pyramid-elevation bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-hieroglyph mb-2">
                Combined Impact
              </h3>
              <p className="text-sm text-muted-foreground">
                Cumulative improvement from all strategies
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">
                +
                {improvements
                  .reduce((sum, imp) => sum + imp.improvement_percentage, 0)
                  .toFixed(0)}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average Confidence:{" "}
                {(
                  improvements.reduce((sum, imp) => sum + imp.confidence_score, 0) /
                  improvements.length *
                  100
                ).toFixed(0)}
                %
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
