'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, HelpCircle } from 'lucide-react';

interface Props {
  question: {
    qid: string;
    title: string;
    help_text: string;
    kind: string;
    options: string[];
    variable: string;
    required: boolean;
    suggested: string;
  };
  value: string;
  onAnswer: (value: string) => void;
  disabled?: boolean;
}

export function AskMeQuestion({ question, value, onAnswer, disabled = false }: Props) {
  const [localValue, setLocalValue] = useState(value || question.suggested || '');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (localValue.trim() && !disabled) {
      setSubmitted(true);
      onAnswer(localValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && question.kind !== 'long_text') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="p-4 rounded-xl bg-[#C9A227]/5 border border-[#C9A227]/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm font-medium text-muted-foreground">{question.title}</p>
        <p className="text-foreground mt-1">{localValue}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-4 rounded-xl border border-border bg-card hover:border-[#C9A227]/30 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <label className="font-medium text-foreground flex items-center gap-2">
          {question.title}
          {question.required && <span className="text-red-500 text-sm">*</span>}
        </label>
        {question.help_text && (
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            <div className="absolute right-0 top-6 w-64 p-3 rounded-lg bg-popover border border-border text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
              {question.help_text}
            </div>
          </div>
        )}
      </div>

      {question.kind === 'choice' && question.options.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => { setLocalValue(opt); }}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                localValue === opt
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md'
                  : 'bg-muted/50 text-foreground border-border hover:border-[#C9A227]/50 hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : question.kind === 'boolean' ? (
        <div className="flex gap-2 mb-3">
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              onClick={() => { setLocalValue(opt); }}
              disabled={disabled}
              className={`flex-1 px-4 py-2 rounded-lg text-sm border transition-all ${
                localValue === opt
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md'
                  : 'bg-muted/50 text-foreground border-border hover:border-[#C9A227]/50 hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : question.kind === 'long_text' ? (
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.suggested || 'Type your answer...'}
          disabled={disabled}
          className="w-full min-h-[80px] p-3 rounded-lg border bg-background text-foreground resize-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ) : (
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.suggested || 'Type your answer...'}
          disabled={disabled}
          className="w-full p-3 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={!localValue.trim() || disabled}
        className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1E3A8A]/90 transition-all shadow-sm hover:shadow-md"
      >
        <Send className="w-3.5 h-3.5" />
        Submit Answer
      </button>
    </motion.div>
  );
}
