import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Edit3, 
  Filter,
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { ChatSession } from '../../types/chat';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: () => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newTitle: string) => void;
  onSessionToggleStar: (sessionId: string) => void;
  className?: string;
}

type FilterType = 'all' | 'active' | 'starred';

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onSessionRename,
  onSessionToggleStar,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Apply filter
    switch (filter) {
      case 'starred':
        filtered = filtered.filter(session => session.starred);
        break;
      case 'active':
        filtered = filtered.filter(session => session.messageCount > 0);
        break;
      default:
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(query)
      );
    }

    // Sort by most recent
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [sessions, filter, searchQuery]);

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleRenameSubmit = () => {
    if (editingSessionId && editingTitle.trim()) {
      onSessionRename(editingSessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'starred':
        return sessions.filter(s => s.starred).length;
      case 'active':
        return sessions.filter(s => s.messageCount > 0).length;
      default:
        return sessions.length;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <Button
            onClick={onSessionCreate}
            size="sm"
            className="rounded-full w-8 h-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="pl-10 h-9"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-1">
          {(['all', 'active', 'starred'] as FilterType[]).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'ghost'}
              size="sm"
              className="text-xs px-3 h-7"
              onClick={() => setFilter(filterType)}
            >
              {filterType === 'starred' && <Star className="w-3 h-3 mr-1" />}
              {filterType === 'active' && <Filter className="w-3 h-3 mr-1" />}
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              <span className="ml-1 text-xs opacity-60">
                ({getFilterCount(filterType)})
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {searchQuery.trim() ? 'No matching chats found' : 'No chats yet'}
              </p>
              {!searchQuery.trim() && (
                <Button
                  onClick={onSessionCreate}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start a chat
                </Button>
              )}
            </motion.div>
          ) : (
            filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`group relative border-b border-gray-100 hover:bg-white transition-colors ${
                  session.id === currentSessionId ? 'bg-white border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onSessionSelect(session.id)}
                    >
                      {editingSessionId === session.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={handleRenameSubmit}
                          onKeyDown={handleRenameKeyDown}
                          className="h-7 text-sm font-medium"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {session.title}
                        </h3>
                      )}
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{session.messageCount} messages</span>
                        <span>•</span>
                        <span>{formatRelativeTime(session.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionToggleStar(session.id);
                        }}
                      >
                        <Star 
                          className={`w-3 h-3 ${
                            session.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(session.id, session.title);
                        }}
                      >
                        <Edit3 className="w-3 h-3 text-gray-400" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this chat?')) {
                            onSessionDelete(session.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-500 text-center">
        {sessions.length} total chats
      </div>
    </div>
  );
};
