'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Zap,
  Target,
  Shield,
  FileText,
  X
} from 'lucide-react';

// Import the store
import { useOptimizerSessionsStore } from '@/store/optimizerSessionsStore';

interface ChatComposerProps {
  sessionId: string;
  disabled?: boolean;
}

const SuggestionChips: React.FC<{
  onSelect: (suggestion: string) => void;
}> = ({ onSelect }) => {
  const suggestions = [
    { icon: Zap, text: 'Make it faster', color: 'bg-yellow-100 text-yellow-800' },
    { icon: Target, text: 'More specific', color: 'bg-blue-100 text-blue-800' },
    { icon: Shield, text: 'Add safety', color: 'bg-red-100 text-red-800' },
    { icon: FileText, text: 'Better structure', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(suggestion.text)}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${suggestion.color} hover:shadow-md transition-shadow`}
        >
          <suggestion.icon className="w-3 h-3" />
          <span>{suggestion.text}</span>
        </motion.button>
      ))}
    </div>
  );
};

const ChatComposer: React.FC<ChatComposerProps> = ({ sessionId, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { addMessage } = useOptimizerSessionsStore();

  const handleSend = useCallback(async () => {
    if (!message.trim() || disabled) return;

    const messageContent = message.trim();

    // Add user message
    addMessage(sessionId, {
      role: 'user',
      content: messageContent,
      meta: {
        clientRequestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

    setMessage('');
    // setIsComposing(false);

    // Here you would integrate with the existing optimizer API
    // For now, we'll simulate a response
    setTimeout(() => {
      addMessage(sessionId, {
        role: 'model',
        content: `I've analyzed your request: "${messageContent}". Here are some optimization suggestions...`,
        meta: {
          variant: 'A',
          tokens: 150,
          latencyMs: 1200
        }
      });
    }, 1000);

  }, [message, sessionId, disabled, addMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    const newMessage = message ? `${message} ${suggestion}` : suggestion;
    setMessage(newMessage);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      {/* Suggestion Chips */}
      {!message && (
        <SuggestionChips onSelect={handleSuggestionSelect} />
      )}

      {/* Attachments */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-slate-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <div className="flex items-end space-x-3">
        {/* File attachment button */}
        <div className="flex-shrink-0">
          <input
            type="file"
            multiple
            accept=".txt,.md,.json,.pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors"
          >
            <Paperclip className="w-4 h-4 text-slate-500" />
          </label>
        </div>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe how to optimize your prompt... (e.g., 'Make it more specific and add safety guardrails')"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px] max-h-32"
            rows={1}
            disabled={disabled}
          />

          {/* Character count */}
          <div className="absolute bottom-2 right-3 text-xs text-slate-400">
            {message.length}/2000
          </div>
        </div>

        {/* Send button */}
        <motion.button
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            canSend
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Help text */}
      <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

export default ChatComposer;
