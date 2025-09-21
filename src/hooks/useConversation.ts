import { useState, useCallback, useEffect } from 'react';
import { StreamingMessage, ConversationMetrics } from './useStreamingChat';

export interface Conversation {
  id: string;
  title: string;
  messages: StreamingMessage[];
  createdAt: Date;
  updatedAt: Date;
  metrics: ConversationMetrics;
  tags: string[];
  isArchived: boolean;
  isStarred: boolean;
  modelUsed?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  lastMessage: Date;
  tags: string[];
  isStarred: boolean;
}

interface UseConversationOptions {
  autoSave?: boolean;
  maxConversations?: number;
  storageKey?: string;
}

export function useConversation(options: UseConversationOptions = {}) {
  const {
    autoSave = true,
    maxConversations = 100,
    storageKey = 'promptcord_conversations'
  } = options;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const loadConversations = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const conversations = parsed.map((conv: Omit<Conversation, 'createdAt' | 'updatedAt' | 'messages'> & {
            createdAt: string;
            updatedAt: string;
            messages: (Omit<StreamingMessage, 'timestamp'> & { timestamp: string })[];
          }) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setConversations(conversations);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };

    loadConversations();
  }, [storageKey]);

  // Auto-save conversations
  useEffect(() => {
    if (autoSave && conversations.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(conversations));
      } catch (error) {
        console.error('Failed to save conversations:', error);
      }
    }
  }, [conversations, autoSave, storageKey]);

  // Create new conversation
  const createConversation = useCallback((title?: string): string => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: title || `Conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        totalMessages: 0,
        totalTokens: 0,
        averageResponseTime: 0,
        lastActive: new Date(),
      },
      tags: [],
      isArchived: false,
      isStarred: false,
    };

    setConversations(prev => {
      const updated = [newConversation, ...prev];
      // Limit number of conversations
      if (updated.length > maxConversations) {
        return updated.slice(0, maxConversations);
      }
      return updated;
    });

    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  }, [conversations.length, maxConversations]);

  // Get conversation by ID
  const getConversation = useCallback((id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id);
  }, [conversations]);

  // Get current conversation
  const getCurrentConversation = useCallback((): Conversation | undefined => {
    if (!currentConversationId) return undefined;
    return getConversation(currentConversationId);
  }, [currentConversationId, getConversation]);

  // Update conversation
  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id 
        ? { ...conv, ...updates, updatedAt: new Date() }
        : conv
    ));
  }, []);

  // Add message to conversation
  const addMessage = useCallback((conversationId: string, message: StreamingMessage) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, message];
        const updatedMetrics = {
          ...conv.metrics,
          totalMessages: updatedMessages.length,
          totalTokens: conv.metrics.totalTokens + (message.metadata?.tokens || 0),
          lastActive: new Date(),
        };

        return {
          ...conv,
          messages: updatedMessages,
          metrics: updatedMetrics,
          updatedAt: new Date(),
        };
      }
      return conv;
    }));
  }, []);

  // Update message in conversation
  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<StreamingMessage>) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
          updatedAt: new Date(),
        };
      }
      return conv;
    }));
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  // Archive/unarchive conversation
  const toggleArchive = useCallback((id: string) => {
    updateConversation(id, { 
      isArchived: !getConversation(id)?.isArchived 
    });
  }, [updateConversation, getConversation]);

  // Star/unstar conversation
  const toggleStar = useCallback((id: string) => {
    updateConversation(id, { 
      isStarred: !getConversation(id)?.isStarred 
    });
  }, [updateConversation, getConversation]);

  // Add tag to conversation
  const addTag = useCallback((id: string, tag: string) => {
    const conversation = getConversation(id);
    if (conversation && !conversation.tags.includes(tag)) {
      updateConversation(id, {
        tags: [...conversation.tags, tag]
      });
    }
  }, [getConversation, updateConversation]);

  // Remove tag from conversation
  const removeTag = useCallback((id: string, tag: string) => {
    const conversation = getConversation(id);
    if (conversation) {
      updateConversation(id, {
        tags: conversation.tags.filter(t => t !== tag)
      });
    }
  }, [getConversation, updateConversation]);

  // Update conversation title
  const updateTitle = useCallback((id: string, title: string) => {
    updateConversation(id, { title });
  }, [updateConversation]);

  // Generate conversation title from messages
  const generateTitle = useCallback((id: string): string => {
    const conversation = getConversation(id);
    if (!conversation || conversation.messages.length === 0) {
      return 'New Conversation';
    }

    const firstUserMessage = conversation.messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const preview = firstUserMessage.content.slice(0, 50);
      return preview + (firstUserMessage.content.length > 50 ? '...' : '');
    }

    return 'New Conversation';
  }, [getConversation]);

  // Auto-generate title when first message is added
  const autoGenerateTitle = useCallback((id: string) => {
    const conversation = getConversation(id);
    if (conversation && conversation.messages.length === 1 && conversation.title.startsWith('Conversation')) {
      const newTitle = generateTitle(id);
      updateTitle(id, newTitle);
    }
  }, [getConversation, generateTitle, updateTitle]);

  // Search and filter conversations
  const getFilteredConversations = useCallback((): ConversationSummary[] => {
    return conversations
      .filter(conv => {
        // Archive filter
        if (conv.isArchived) return false;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = conv.title.toLowerCase().includes(query);
          const matchesContent = conv.messages.some(msg => 
            msg.content.toLowerCase().includes(query)
          );
          if (!matchesTitle && !matchesContent) return false;
        }

        // Tag filter
        if (selectedTags.length > 0) {
          const hasSelectedTag = selectedTags.some(tag => conv.tags.includes(tag));
          if (!hasSelectedTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Starred conversations first
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        
        // Then by last updated
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
      .map(conv => ({
        id: conv.id,
        title: conv.title,
        preview: conv.messages.length > 0 
          ? conv.messages[conv.messages.length - 1].content.slice(0, 100) + '...'
          : 'No messages yet',
        messageCount: conv.messages.length,
        lastMessage: conv.updatedAt,
        tags: conv.tags,
        isStarred: conv.isStarred,
      }));
  }, [conversations, searchQuery, selectedTags]);

  // Export conversation
  const exportConversation = useCallback((id: string, format: 'json' | 'markdown' | 'txt' = 'json') => {
    const conversation = getConversation(id);
    if (!conversation) return null;

    switch (format) {
      case 'markdown':
        const markdown = conversation.messages
          .map(msg => `## ${msg.role === 'user' ? 'You' : 'Assistant'}\n\n${msg.content}\n`)
          .join('\n---\n\n');
        return `# ${conversation.title}\n\n${markdown}`;

      case 'txt':
        const text = conversation.messages
          .map(msg => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`)
          .join('\n\n');
        return `${conversation.title}\n\n${text}`;

      case 'json':
      default:
        return JSON.stringify(conversation, null, 2);
    }
  }, [getConversation]);

  // Import conversation
  const importConversation = useCallback((data: string, format: 'json' = 'json'): string | null => {
    try {
      if (format === 'json') {
        const conversation = JSON.parse(data);
        const imported: Conversation = {
          ...conversation,
          id: crypto.randomUUID(), // New ID to avoid conflicts
          createdAt: new Date(conversation.createdAt),
          updatedAt: new Date(),
          messages: conversation.messages.map((msg: Omit<StreamingMessage, 'timestamp'> & { timestamp: string }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        };

        setConversations(prev => [imported, ...prev]);
        return imported.id;
      }
    } catch (error) {
      console.error('Failed to import conversation:', error);
    }
    return null;
  }, []);

  // Get all unique tags
  const getAllTags = useCallback((): string[] => {
    const allTags = conversations.flatMap(conv => conv.tags);
    return Array.from(new Set(allTags)).sort();
  }, [conversations]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setCurrentConversationId(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    // State
    conversations: getFilteredConversations(),
    currentConversation: getCurrentConversation(),
    currentConversationId,
    isLoading,
    searchQuery,
    selectedTags,
    allTags: getAllTags(),

    // Actions
    createConversation,
    getConversation,
    updateConversation,
    deleteConversation,
    setCurrentConversationId,
    
    // Message management
    addMessage,
    updateMessage,
    autoGenerateTitle,

    // Organization
    toggleArchive,
    toggleStar,
    addTag,
    removeTag,
    updateTitle,
    generateTitle,

    // Search and filtering
    setSearchQuery,
    setSelectedTags,

    // Import/Export
    exportConversation,
    importConversation,
    clearAllConversations,
  };
}
