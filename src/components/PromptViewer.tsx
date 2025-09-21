'use client';

import { useState } from 'react';
import { Copy, Check, Eye, EyeOff, RotateCcw, Download } from 'lucide-react';
import type { RenderResponse } from '@/lib/types';

interface PromptViewerProps {
  result: RenderResponse;
  onCopy?: (content: string) => void;
  className?: string;
}

export default function PromptViewer({ result, onCopy, className = "" }: PromptViewerProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [showVariants, setShowVariants] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'primary' | number>('primary');

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      onCopy?.(content);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const allResults = [
    { id: 'primary', label: 'Primary Result', content: result.primary_result },
    ...(result.variants || []).map((variant, index) => ({
      id: index,
      label: `Variant ${index + 1}`,
      content: variant,
    }))
  ];

  const currentResult = selectedTab === 'primary' 
    ? allResults[0] 
    : allResults.find(r => r.id === selectedTab) || allResults[0];

  return (
    <div className={`bg-bg-secondary rounded-lg border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-tertiary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-text-primary font-medium">Generated Content</h3>
            
            {result.variants && result.variants.length > 0 && (
              <button
                onClick={() => setShowVariants(!showVariants)}
                className="flex items-center space-x-2 px-3 py-1 bg-bg-secondary hover:bg-interactive-hover/10 text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm"
              >
                {showVariants ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showVariants ? 'Hide' : 'Show'} Variants ({result.variants.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownload(currentResult.content, `prompt-${Date.now()}.txt`)}
              className="p-2 text-interactive-normal hover:text-interactive-hover hover:bg-interactive-hover/10 rounded-lg transition-colors"
              title="Download as file"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleCopy(currentResult.content, currentResult.id.toString())}
              className="flex items-center space-x-2 px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors"
            >
              {copiedStates[currentResult.id.toString()] ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {showVariants && allResults.length > 1 && (
        <div className="px-4 py-2 bg-bg-tertiary border-b border-border">
          <div className="flex space-x-1 overflow-x-auto">
            {allResults.map((result) => (
              <button
                key={result.id}
                onClick={() => setSelectedTab(result.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedTab === result.id
                    ? 'bg-brand text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover/10'
                }`}
              >
                {result.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="relative">
          <div className="bg-bg-primary rounded-lg p-4 border border-border">
            <div className="relative">
              <pre className="text-text-primary whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">
                {currentResult.content}
              </pre>
              
              {/* Quick copy button overlay */}
              <button
                onClick={() => handleCopy(currentResult.content, `quick-${currentResult.id}`)}
                className="absolute top-2 right-2 p-1.5 bg-bg-secondary/80 hover:bg-bg-secondary text-interactive-normal hover:text-interactive-hover rounded border border-border transition-all opacity-0 group-hover:opacity-100"
                title="Quick copy"
              >
                {copiedStates[`quick-${currentResult.id}`] ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Metadata */}
        {result.metadata && Object.keys(result.metadata).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <details className="group">
              <summary className="cursor-pointer text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
                Generation Metadata
              </summary>
              <div className="mt-2 p-3 bg-bg-tertiary rounded-lg border border-border">
                <pre className="text-text-muted text-xs overflow-x-auto">
                  {JSON.stringify(result.metadata, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center space-x-4">
              <span>Characters: {currentResult.content.length}</span>
              <span>Words: {currentResult.content.trim().split(/\s+/).length}</span>
              <span>Lines: {currentResult.content.split('\n').length}</span>
            </div>
            
            {result.variants && result.variants.length > 0 && (
              <span>{result.variants.length + 1} variations generated</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}