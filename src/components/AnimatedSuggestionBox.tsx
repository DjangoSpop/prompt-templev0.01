'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, Zap, Brain } from 'lucide-react';
import { wsService, IntentAnalysisResult, SearchResult } from '@/lib/services/websocket';
import { promptService } from '@/lib/services/prompt-service';
import { useDebounce } from '@/hooks/useDebounce';

interface AnimatedSuggestionProps {
  onPromptSelect: (prompt: string) => void;
  onIntentDetected: (intent: IntentAnalysisResult) => void;
  placeholder?: string;
  className?: string;
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  speed = 50, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="inline-block">
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="border-r-2 border-blue-500 ml-1"
      />
    </span>
  );
};

const AnimatedSuggestionBox: React.FC<AnimatedSuggestionProps> = ({
  onPromptSelect,
  onIntentDetected,
  placeholder = "Describe your intent and I'll optimize it...",
  className = "",
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizedPrompts, setOptimizedPrompts] = useState<string[]>([]);
  const [intent, setIntent] = useState<IntentAnalysisResult | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(`session_${Date.now()}`);
  
  // Debounce input for performance
  const debouncedInput = useDebounce(input, 300);

  // Handle real-time typing suggestions
  useEffect(() => {
    const handleSuggestions = async () => {
      if (debouncedInput.length >= 3) {
        setIsLoading(true);
        try {
          const startTime = Date.now();
          const newSuggestions = await promptService.getTypingSuggestions(debouncedInput);
          setSuggestions(newSuggestions);
          setProcessingTime(Date.now() - startTime);
        } catch (error) {
          console.error('Failed to get suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    handleSuggestions();
  }, [debouncedInput]);

  // Handle intent analysis and optimization
  const analyzeIntent = useCallback(async (text: string) => {
    if (text.length < 10) return;

    setIsAnalyzing(true);
    try {
      const startTime = Date.now();
      const result = await promptService.analyzeAndOptimizeIntent(text);
      
      setIntent(result.intent);
      setOptimizedPrompts(result.optimizedPrompts);
      setSearchResults(result.relatedTemplates);
      setShowResults(true);
      setProcessingTime(Date.now() - startTime);
      
      onIntentDetected(result.intent);
    } catch (error) {
      console.error('Intent analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onIntentDetected]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setIsTyping(true);
    
    // Send typing indicator
    wsService.sendTypingIndicator(true, sessionId.current);
    
    // Clear typing indicator after 1 second
    setTimeout(() => {
      setIsTyping(false);
      wsService.sendTypingIndicator(false, sessionId.current);
    }, 1000);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      analyzeIntent(input.trim());
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    analyzeIntent(suggestion);
  };

  // Handle optimized prompt selection
  const selectOptimizedPrompt = (prompt: string) => {
    onPromptSelect(prompt);
    setInput(prompt);
    setShowResults(false);
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Input */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white shadow-lg"
          />
          
          {/* Loading/Processing Indicators */}
          <div className="absolute right-4 top-4 flex items-center space-x-2">
            {isAnalyzing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="w-5 h-5 text-blue-500" />
              </motion.div>
            )}
            {isLoading && (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            {processingTime > 0 && processingTime < 50 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-xs text-green-500"
              >
                <Zap className="w-3 h-3 mr-1" />
                {processingTime}ms
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 text-xs text-blue-500 flex items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 mr-1" />
              </motion.div>
              Analyzing your intent...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real-time Suggestions Dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => selectSuggestion(suggestion)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center">
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <TypewriterText text={suggestion} speed={30} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Panel */}
      <AnimatePresence>
        {showResults && (intent || optimizedPrompts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mt-6 bg-white border border-gray-200 rounded-xl shadow-xl p-6"
          >
            {/* Intent Detection */}
            {intent && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  Detected Intent
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">
                      <TypewriterText text={intent.detectedIntent} />
                    </span>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {Math.round(intent.confidence * 100)}% confident
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    Category: {intent.category}
                  </div>
                  {intent.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {intent.keywords.map((keyword, index) => (
                        <motion.span
                          key={keyword}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {keyword}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optimized Prompts */}
            {optimizedPrompts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-green-500" />
                  Optimized Prompts
                </h3>
                <div className="space-y-3">
                  {optimizedPrompts.map((prompt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      onClick={() => selectOptimizedPrompt(prompt)}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <TypewriterText 
                            text={prompt} 
                            speed={20}
                            onComplete={() => {}}
                          />
                        </div>
                        {index === 0 && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full ml-2">
                            Recommended
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Templates */}
            {searchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-purple-500" />
                  Related Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.slice(0, 4).map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => selectOptimizedPrompt(result.content)}
                      className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-purple-800 text-sm">
                          {result.title}
                        </h4>
                        <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                          {Math.round(result.relevanceScore * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 mb-2">
                        {result.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-purple-100 text-purple-600 px-1 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedSuggestionBox;
