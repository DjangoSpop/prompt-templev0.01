'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy,
  Download,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Target,
  Shield,
  FileText,
  CheckCircle,
} from 'lucide-react'

import { useDirectionAwareContent } from '@/lib/hooks/useDirectionAwareContent'
import { OptimSession } from '@/store/optimizerSessionsStore'

interface ContextPaneProps {
  session: OptimSession | null
}

const BestPromptCard: React.FC<{
  prompt: string
  rubric?: OptimSession['rubric']
  onCopy: () => void
  onExport: (format: 'json' | 'md') => void
  onOpenBuilder: () => void
}> = ({ prompt, _rubric, onCopy, onExport, onOpenBuilder }) => {
  const [copied, setCopied] = useState(false)
  const { dir } = useDirectionAwareContent(prompt)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    onCopy()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4" dir={dir}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Best Prompt
        </h3>
        <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
          <button
            onClick={handleCopy}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            title="Copy prompt"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onExport('md')}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            title="Export as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenBuilder}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            title="Open in Builder"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-3">
        <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
          {prompt || 'No optimized prompt yet. Start a conversation to generate one.'}
        </pre>
      </div>
    </div>
  )
}

const RubricPanel: React.FC<{
  rubric?: OptimSession['rubric']
}> = ({ rubric }) => {
  if (!rubric) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Quality Metrics
        </h3>
        <div className="text-center py-4">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No metrics available yet</p>
        </div>
      </div>
    )
  }

  const metrics = [
    { label: 'Clarity', value: rubric.clarity, color: 'bg-blue-500', icon: Target },
    { label: 'Specificity', value: rubric.specificity, color: 'bg-green-500', icon: Shield },
    { label: 'Safety', value: rubric.faithfulness, color: 'bg-purple-500', icon: FileText }
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Quality Metrics
        </h3>
        <TrendingUp className="w-4 h-4 text-slate-500" />
      </div>

      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <metric.icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {metric.label}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                {Math.round(metric.value)}/10
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${metric.color} transition-all duration-500 ease-out`}
                style={{ width: `${(metric.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ContextPane: React.FC<ContextPaneProps> = ({ session }) => {
  const { dir } = useDirectionAwareContent(session?.title)

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">No active session</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6" dir={dir}>
      <BestPromptCard
        prompt={session.bestPrompt || ''}
        rubric={session.rubric}
        onCopy={() => {}}
        onExport={(_format) => {
          // Export logic here
        }}
        onOpenBuilder={() => {
          // Open builder logic here
        }}
      />
      <RubricPanel rubric={session.rubric} />
    </div>
  )
}
