'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Clock, DollarSign, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countTokensEstimate, estimateCost, formatLatency } from '@/lib/tryme/sanitize';

interface PromptEditorLiteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  latency?: number;
}

export function PromptEditorLite({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Enter your prompt to optimize...",
  className = '',
  latency,
}: PromptEditorLiteProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const inputTokens = countTokensEstimate(value);
  const estimatedOutputTokens = Math.min(512, inputTokens * 2); // Rough estimate
  const estimatedCost = estimateCost(inputTokens, estimatedOutputTokens);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className={`rounded-xl border border-amber-500/15 ${className}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={`
            w-full px-4 py-3 bg-transparent resize-none border-0 outline-none
            text-stone-100 placeholder-stone-500
            min-h-[80px] max-h-[200px] text-sm leading-relaxed
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ minHeight: '80px' }}
        />

        {/* Submit Button */}
        <div className="absolute bottom-2 right-2">
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading || disabled}
            size="sm"
            className="h-8 w-8 p-0 rounded-lg text-[#0E0F12] font-bold disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #ffe066 0%, #d4af37 100%)' }}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Meta Line */}
      <div className={`
        flex items-center justify-between px-4 py-2 border-t border-amber-500/10
        text-xs text-stone-500
        transition-colors duration-200
        ${isFocused ? 'border-amber-500/20' : ''}
      `}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span>{inputTokens} tokens</span>
          </div>

          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>~{estimatedCost}</span>
          </div>

          {latency && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatLatency(latency)}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-stone-500">
          {isLoading ? (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-400/70">Forging...</span>
            </span>
          ) : (
            <span>Enter to send • Shift+Enter for new line</span>
          )}
        </div>
      </div>
    </div>
  );
}