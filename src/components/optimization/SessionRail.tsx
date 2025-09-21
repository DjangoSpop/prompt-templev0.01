'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  MoreVertical,
  MessageSquare
} from 'lucide-react';

// Import utilities
import { getTextDir } from '@/lib/rtl';
import { useOptimizerSessionsStore } from '@/store/optimizerSessionsStore';
import { OptimSession } from '@/store/optimizerSessionsStore';

interface SessionRailProps {
  activeSessionId?: string;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
}

const SessionItem: React.FC<{
  session: OptimSession;
  isActive: boolean;
  onSelect: () => void;
}> = ({ session, isActive, onSelect }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);

  const { renameSession, pinSession, deleteSession } = useOptimizerSessionsStore();

  const handleRename = useCallback(() => {
    if (editTitle.trim() && editTitle !== session.title) {
      renameSession(session.id, editTitle.trim());
    }
    setIsEditing(false);
  }, [editTitle, session.id, session.title, renameSession]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const textDir = getTextDir(session.title);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      dir={textDir}
    >
      {/* Pin indicator */}
      {session.pinned && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
          <Pin className="w-2 h-2 text-white" />
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 className={`text-sm font-medium truncate ${
              isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
            }`}>
              {session.title}
            </h3>
          )}

          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{session.messages.length}</span>
            </div>

            <span className="text-xs text-slate-400">•</span>

            <span className="text-xs text-slate-500">
              {formatTime(session.updatedAt)}
            </span>
          </div>

          {/* Best prompt preview */}
          {session.bestPrompt && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
              {session.bestPrompt.substring(0, 60)}...
            </p>
          )}
        </div>

        {/* Actions menu */}
        <AnimatePresence>
          {showActions && !isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle actions menu - simplified for now
                  }}
                >
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </button>

                {/* Quick actions */}
                <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-10 min-w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Rename</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pinSession(session.id, !session.pinned);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                  >
                    <Pin className="w-4 h-4" />
                    <span>{session.pinned ? 'Unpin' : 'Pin'}</span>
                  </button>

                  <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this session?')) {
                        deleteSession(session.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SessionRail: React.FC<SessionRailProps> = ({
  activeSessionId,
  onCreateSession,
  onSelectSession
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    getSortedSessions,
    setSearchQuery: setStoreSearchQuery
  } = useOptimizerSessionsStore();

  const sortedSessions = getSortedSessions('updated');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setStoreSearchQuery(query);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sessions
          </h2>
          <button
            onClick={onCreateSession}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="New Session"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {sortedSessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onSelect={() => onSelectSession(session.id)}
            />
          ))}
        </AnimatePresence>

        {sortedSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              No sessions yet
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create your first optimization session to get started
            </p>
            <button
              onClick={onCreateSession}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              Create Session
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SessionRail;
