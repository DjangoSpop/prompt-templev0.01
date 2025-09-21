'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Zap, Clock, Crown, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StreamingMessage, OptimizationResult } from '@/hooks/useStreamingChat';

interface StreamingMessageProps {
  message: StreamingMessage;
  isStreaming?: boolean;
  onComplete?: () => void;
  showMetadata?: boolean;
  enableMarkdown?: boolean;
}

// Pharaonic UI Components
const SunDisk = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <div 
    className={`inline-flex items-center justify-center rounded-full bg-sun text-white ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="text-xs">☀</div>
  </div>
);

// Markdown-like text renderer with syntax highlighting
const MessageRenderer = ({ content, isStreaming }: { content: string; isStreaming: boolean }) => {
  const [displayContent, setDisplayContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayContent(content);
      return;
    }

    // Simulate typewriter effect for streaming
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [content, isStreaming, currentIndex]);

  // Simple markdown-like parsing
  const parseContent = (text: string) => {
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="code-block bg-basalt-900 text-white p-4 rounded-lg my-2 font-mono text-sm overflow-x-auto">
        ${lang ? `<div class="text-sun text-xs mb-2">${lang}</div>` : ''}
        <pre>${code.trim()}</pre>
      </div>`;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-sand-100 px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-nile hover:underline" target="_blank" rel="noopener">$1</a>');

    return text;
  };

  const processedContent = parseContent(displayContent);

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

// Optimization result display
const OptimizationDisplay = ({ optimization }: { optimization: OptimizationResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3 p-3 bg-sand-50 border border-sand-200 rounded-cartouche">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Zap className="h-4 w-4 text-sun" />
          <span>Optimization Result ({Math.round(optimization.confidence * 100)}%)</span>
        </div>
        <span className="text-stone-400">
          {isExpanded ? '−' : '+'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm text-stone-600">
          <div>
            <strong className="text-stone-800">Original:</strong>
            <div className="bg-white p-2 rounded border mt-1 font-mono text-xs">
              {optimization.original_prompt}
            </div>
          </div>
          <div>
            <strong className="text-stone-800">Optimized:</strong>
            <div className="bg-nile/5 p-2 rounded border mt-1 font-mono text-xs">
              {optimization.optimized_prompt}
            </div>
          </div>
          {optimization.improvements.length > 0 && (
            <div>
              <strong className="text-stone-800">Improvements:</strong>
              <ul className="mt-1 space-y-1">
                {optimization.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-sun mt-1">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 border-t">
            <span>Processing: {optimization.processing_time_ms}ms</span>
            <span>Confidence: {Math.round(optimization.confidence * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Template suggestions display
const TemplateSuggestions = ({ suggestions }: { suggestions: string[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-sun/5 border border-sun/20 rounded-cartouche">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Crown className="h-4 w-4 text-sun" />
          <span>Template Suggestions ({suggestions.length})</span>
        </div>
        <span className="text-stone-400">
          {isExpanded ? '−' : '+'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
              <FileText className="h-4 w-4 text-nile" />
              <span className="text-sm text-stone-700">{suggestion}</span>
              <button 
                className="ml-auto px-2 py-1 bg-sun text-white text-xs rounded hover:bg-sun/90"
                onClick={() => {
                  // TODO: Implement template creation
                  toast.success(`Creating template: ${suggestion}`);
                }}
              >
                Create
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EnhancedStreamingMessage: React.FC<StreamingMessageProps> = ({
  message,
  isStreaming = false,
  onComplete,
  showMetadata = true,
  enableMarkdown = true,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && message.content && onComplete) {
      onComplete();
    }
  }, [isStreaming, message.content, onComplete]);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [message.content, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy message');
    }
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      ref={messageRef}
      className={`group max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'} mb-4`}
    >
      {/* Message bubble */}
      <div
        className={`relative rounded-cartouche px-5 py-4 text-sm shadow-sm transition-all hover:shadow-md ${
          isUser
            ? 'bg-sun-gradient text-white border border-sun/20 shadow-sun/20'
            : 'bg-white border border-sand-200 text-stone-800 shadow-sand-200'
        }`}
      >
        {/* Streaming indicator */}
        {isStreaming && (
          <div className="absolute -top-2 -right-2">
            <div className="flex items-center gap-1 bg-nile text-white px-2 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Streaming</span>
            </div>
          </div>
        )}

        {/* Copy button */}
        {!isStreaming && message.content && (
          <button
            onClick={handleCopy}
            className={`absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full border shadow-sm ${
              isUser 
                ? 'bg-white text-sun hover:bg-sand-50' 
                : 'bg-sand-50 text-stone-600 hover:bg-sand-100'
            }`}
            title="Copy message"
          >
            {isCopied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}

        {/* Message content */}
        <div className="leading-relaxed font-ui">
          {enableMarkdown ? (
            <MessageRenderer content={message.content} isStreaming={isStreaming} />
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* Optimization result */}
        {message.metadata?.optimization && (
          <OptimizationDisplay optimization={message.metadata.optimization} />
        )}

        {/* Template suggestions */}
        {message.metadata?.templateSuggestions && (
          <TemplateSuggestions suggestions={message.metadata.templateSuggestions} />
        )}

        {/* Message metadata */}
        {showMetadata && (
          <div className={`mt-3 flex items-center gap-3 text-xs ${
            isUser ? 'text-white/80' : 'text-stone-500'
          }`}>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{message.timestamp.toLocaleTimeString()}</span>
            </div>

            {message.metadata?.processingTime && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                isUser 
                  ? 'bg-white/20 text-white' 
                  : 'bg-nile/10 text-nile'
              }`}>
                <Zap className="h-3 w-3" />
                <span>{message.metadata.processingTime}ms</span>
              </div>
            )}

            {message.metadata?.tokens && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                isUser 
                  ? 'bg-white/20 text-white' 
                  : 'bg-stone-100 text-stone-600'
              }`}>
                <span>{message.metadata.tokens} tokens</span>
              </div>
            )}

            {message.metadata?.model && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                isUser 
                  ? 'bg-white/20 text-white' 
                  : 'bg-basalt-100 text-basalt-700'
              }`}>
                <SunDisk size={12} />
                <span>{message.metadata.model}</span>
              </div>
            )}

            {isAssistant && message.metadata?.templateSuggestions && message.metadata.templateSuggestions.length > 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                isUser 
                  ? 'bg-white/20 text-white' 
                  : 'bg-sun/10 text-sun'
              }`}>
                <Crown className="h-3 w-3" />
                <span>{message.metadata.templateSuggestions.length} suggestions</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Streaming cursor */}
      {isStreaming && (
        <div className="flex items-center gap-2 mt-2 ml-4">
          <div className="flex items-center gap-1">
            <span className="w-1 h-4 bg-sun animate-pulse rounded"></span>
          </div>
          <span className="text-xs text-stone-500">AI is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedStreamingMessage;
