import { useState, useCallback, useEffect } from 'react';
import { StreamingMessage } from './useStreamingChat';

export interface ChatAnalytics {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  averageResponseTime: number;
  averageSessionLength: number;
  modelUsage: Record<string, number>;
  slashCommandUsage: Record<string, number>;
  errorRate: number;
  satisfactionScore: number;
  dailyUsage: DailyUsage[];
  topPrompts: PromptUsage[];
}

export interface DailyUsage {
  date: string;
  messages: number;
  tokens: number;
  sessions: number;
  avgResponseTime: number;
}

export interface PromptUsage {
  prompt: string;
  count: number;
  avgResponseTime: number;
  successRate: number;
}

export interface SessionData {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  tokenCount: number;
  model?: string;
  errors: number;
  satisfactionRating?: number;
}

export interface MessageAnalytics {
  messageId: string;
  timestamp: Date;
  role: 'user' | 'assistant' | 'system';
  tokenCount: number;
  responseTime?: number;
  model?: string;
  slashCommand?: string;
  hasError: boolean;
  userRating?: number;
}

interface UseChatAnalyticsOptions {
  storageKey?: string;
  enableRealTimeTracking?: boolean;
  maxDataPoints?: number;
}

export function useChatAnalytics(options: UseChatAnalyticsOptions = {}) {
  const {
    storageKey = 'promptcord_analytics',
    enableRealTimeTracking = true,
    maxDataPoints = 10000
  } = options;

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [messageAnalytics, setMessageAnalytics] = useState<MessageAnalytics[]>([]);
  // Track slash command usage separately to avoid circular analytics state updates
  const [slashCommandUsage, setSlashCommandUsage] = useState<Record<string, number>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load analytics from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.sessions) {
          setSessions(data.sessions.map((s: Omit<SessionData, 'startTime' | 'endTime'> & { 
            startTime: string; 
            endTime?: string; 
          }) => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : undefined,
          })));
        }
        if (data.messageAnalytics) {
          setMessageAnalytics(data.messageAnalytics.map((m: Omit<MessageAnalytics, 'timestamp'> & { 
            timestamp: string; 
          }) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [storageKey]);

  // Auto-save analytics with debounce to prevent infinite loops
  useEffect(() => {
    if (enableRealTimeTracking && (sessions.length > 0 || messageAnalytics.length > 0)) {
      const timeoutId = setTimeout(() => {
        try {
          // Calculate analytics inline to avoid dependency issues
          const totalSessions = sessions.length;
          const totalMessages = messageAnalytics.length;
          const totalTokens = messageAnalytics.reduce((acc, m) => acc + m.tokenCount, 0);
          
          const responseTimes = messageAnalytics
            .filter(m => m.responseTime && m.role === 'assistant')
            .map(m => m.responseTime!);
          const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((acc, rt) => acc + rt, 0) / responseTimes.length
            : 0;

          const sessionLengths = sessions
            .filter(s => s.endTime)
            .map(s => s.endTime!.getTime() - s.startTime.getTime());
          const averageSessionLength = sessionLengths.length > 0
            ? sessionLengths.reduce((acc, len) => acc + len, 0) / sessionLengths.length
            : 0;

          const modelUsage: Record<string, number> = {};
          messageAnalytics.forEach(m => {
            if (m.model) {
              modelUsage[m.model] = (modelUsage[m.model] || 0) + m.tokenCount;
            }
          });

          const slashCommandUsage: Record<string, number> = {};
          messageAnalytics.forEach(m => {
            if (m.slashCommand) {
              slashCommandUsage[m.slashCommand] = (slashCommandUsage[m.slashCommand] || 0) + 1;
            }
          });

          const totalErrors = sessions.reduce((acc, s) => acc + s.errors, 0);
          const errorRate = totalMessages > 0 ? totalErrors / totalMessages : 0;

          const ratedMessages = messageAnalytics.filter(m => m.userRating !== undefined);
          const satisfactionScore = ratedMessages.length > 0
            ? ratedMessages.reduce((acc, m) => acc + (m.userRating || 0), 0) / ratedMessages.length
            : 0;

          const currentAnalytics = {
            totalSessions,
            totalMessages,
            totalTokens,
            averageResponseTime,
            averageSessionLength,
            modelUsage,
            slashCommandUsage,
            errorRate,
            satisfactionScore,
            dailyUsage: [],
            topPrompts: [],
          };

          localStorage.setItem(storageKey, JSON.stringify({
            analytics: currentAnalytics,
            sessions,
            messageAnalytics,
          }));
        } catch (error) {
          console.error('Failed to save analytics:', error);
        }
      }, 500); // Debounce by 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [sessions, messageAnalytics, enableRealTimeTracking, storageKey]);

  // Start new session
  const startSession = useCallback((sessionId: string, model?: string): void => {
    const newSession: SessionData = {
      sessionId,
      startTime: new Date(),
      messageCount: 0,
      tokenCount: 0,
      model,
      errors: 0,
    };

    setSessions(prev => {
      const updated = [newSession, ...prev];
      return updated.slice(0, maxDataPoints);
    });
    setCurrentSessionId(sessionId);
  }, [maxDataPoints]);

  // End current session
  const endSession = useCallback((rating?: number): void => {
    if (!currentSessionId) return;

    setSessions(prev => prev.map(session => 
      session.sessionId === currentSessionId
        ? { 
            ...session, 
            endTime: new Date(),
            satisfactionRating: rating,
          }
        : session
    ));
    setCurrentSessionId(null);
  }, [currentSessionId]);

  // Track message
  const trackMessage = useCallback((message: StreamingMessage, sessionId?: string): void => {
    const messageData: MessageAnalytics = {
      messageId: message.id,
      timestamp: message.timestamp,
      role: message.role,
      tokenCount: message.metadata?.tokens || 0,
      responseTime: message.metadata?.processingTime,
      model: message.metadata?.model,
      hasError: false,
    };

    setMessageAnalytics(prev => {
      const updated = [messageData, ...prev];
      return updated.slice(0, maxDataPoints);
    });

    // Update session stats
    const activeSessionId = sessionId || currentSessionId;
    if (activeSessionId) {
      setSessions(prev => prev.map(session => 
        session.sessionId === activeSessionId
          ? {
              ...session,
              messageCount: session.messageCount + 1,
              tokenCount: session.tokenCount + (message.metadata?.tokens || 0),
            }
          : session
      ));
    }
  }, [currentSessionId, maxDataPoints]);

  // Track slash command usage
  const trackSlashCommand = useCallback((command: string): void => {
    setSlashCommandUsage(prev => ({
      ...prev,
      [command]: (prev[command] || 0) + 1,
    }));
  }, []);

  // Track model usage
  const trackModelUsage = useCallback((_model: string, _tokens: number): void => {
    // No-op: model usage is derived from messageAnalytics
  }, []);

  // Track response time
  const trackResponseTime = useCallback((_duration: number): void => {
    // No-op: average response time is derived from messageAnalytics
  }, []);

  // Track errors
  const trackError = useCallback((error: Error, sessionId?: string): void => {
    const activeSessionId = sessionId || currentSessionId;
    if (activeSessionId) {
      setSessions(prev => prev.map(session => 
        session.sessionId === activeSessionId
          ? { ...session, errors: session.errors + 1 }
          : session
      ));
    }

    // Update global error rate
  // Error rate is derived in calculateAnalytics
  }, [currentSessionId]);

  // Rate message
  const rateMessage = useCallback((messageId: string, rating: number): void => {
    setMessageAnalytics(prev => prev.map(msg => 
      msg.messageId === messageId
        ? { ...msg, userRating: rating }
        : msg
    ));

    // Update satisfaction score
  // Satisfaction score is derived in calculateAnalytics
  }, []);

  // Calculate analytics
  const calculateAnalytics = useCallback((): ChatAnalytics => {
    const totalSessions = sessions.length;
    const totalMessages = messageAnalytics.length;
    const totalTokens = messageAnalytics.reduce((acc, m) => acc + m.tokenCount, 0);
    
    const responseTimes = messageAnalytics
      .filter(m => m.responseTime && m.role === 'assistant')
      .map(m => m.responseTime!);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((acc, rt) => acc + rt, 0) / responseTimes.length
      : 0;

    const sessionLengths = sessions
      .filter(s => s.endTime)
      .map(s => s.endTime!.getTime() - s.startTime.getTime());
    const averageSessionLength = sessionLengths.length > 0
      ? sessionLengths.reduce((acc, len) => acc + len, 0) / sessionLengths.length
      : 0;

    // Model usage
    const modelUsage: Record<string, number> = {};
    messageAnalytics.forEach(m => {
      if (m.model) {
        modelUsage[m.model] = (modelUsage[m.model] || 0) + m.tokenCount;
      }
    });

    // Daily usage calculation
    const dailyUsageMap = new Map<string, DailyUsage>();
    messageAnalytics.forEach(m => {
      const date = m.timestamp.toISOString().split('T')[0];
      const existing = dailyUsageMap.get(date) || {
        date,
        messages: 0,
        tokens: 0,
        sessions: 0,
        avgResponseTime: 0,
      };
      
      existing.messages += 1;
      existing.tokens += m.tokenCount;
      if (m.responseTime) {
        existing.avgResponseTime = (existing.avgResponseTime + m.responseTime) / 2;
      }
      
      dailyUsageMap.set(date, existing);
    });

    const dailyUsage = Array.from(dailyUsageMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // Last 30 days

    // Top prompts (simplified - would need more sophisticated analysis)
    const promptMap = new Map<string, PromptUsage>();
    messageAnalytics
      .filter(m => m.role === 'user')
      .forEach(m => {
        // Simple prompt extraction (first 50 chars)
        const promptKey = messageAnalytics.find(ma => ma.messageId === m.messageId)?.messageId || '';
        const existing = promptMap.get(promptKey) || {
          prompt: promptKey,
          count: 0,
          avgResponseTime: 0,
          successRate: 1,
        };
        
        existing.count += 1;
        promptMap.set(promptKey, existing);
      });

    const topPrompts = Array.from(promptMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalErrors = sessions.reduce((acc, s) => acc + s.errors, 0);
    const errorRate = totalMessages > 0 ? totalErrors / totalMessages : 0;

    const ratedMessages = messageAnalytics.filter(m => m.userRating !== undefined);
    const satisfactionScore = ratedMessages.length > 0
      ? ratedMessages.reduce((acc, m) => acc + (m.userRating || 0), 0) / ratedMessages.length
      : 0;

  // Use tracked slash command usage (kept separate to avoid circular updates)

    return {
      totalSessions,
      totalMessages,
      totalTokens,
      averageResponseTime,
      averageSessionLength,
      modelUsage,
      slashCommandUsage,
      errorRate,
      satisfactionScore,
      dailyUsage,
      topPrompts,
    };
  }, [sessions, messageAnalytics, slashCommandUsage]); // Include slashCommandUsage

  // Generate report
  const generateReport = useCallback((): string => {
    const current = calculateAnalytics();
    
    return `# Chat Analytics Report
Generated: ${new Date().toISOString()}

## Overview
- Total Sessions: ${current.totalSessions}
- Total Messages: ${current.totalMessages}
- Total Tokens: ${current.totalTokens.toLocaleString()}
- Average Response Time: ${Math.round(current.averageResponseTime)}ms
- Average Session Length: ${Math.round(current.averageSessionLength / 1000 / 60)}min
- Error Rate: ${(current.errorRate * 100).toFixed(2)}%
- Satisfaction Score: ${current.satisfactionScore.toFixed(1)}/5

## Model Usage
${Object.entries(current.modelUsage)
  .map(([model, tokens]) => `- ${model}: ${tokens.toLocaleString()} tokens`)
  .join('\n')}

## Slash Command Usage
${Object.entries(current.slashCommandUsage)
  .map(([cmd, count]) => `- /${cmd}: ${count} times`)
  .join('\n')}

## Daily Usage (Last 7 Days)
${current.dailyUsage.slice(0, 7)
  .map(day => `- ${day.date}: ${day.messages} messages, ${day.tokens} tokens`)
  .join('\n')}
`;
  }, [calculateAnalytics]);

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    setSessions([]);
    setMessageAnalytics([]);
  setSlashCommandUsage({});
    setCurrentSessionId(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Real-time analytics
  const realTimeAnalytics = calculateAnalytics();

  return {
    // Current analytics data
    analytics: realTimeAnalytics,
    sessions,
    messageAnalytics,
    currentSessionId,

    // Session management
    startSession,
    endSession,

    // Tracking functions
    trackMessage,
    trackSlashCommand,
    trackModelUsage,
    trackResponseTime,
    trackError,
    rateMessage,

    // Utilities
    generateReport,
    clearAnalytics,
  };
}
