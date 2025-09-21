import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Zap, Command } from 'lucide-react';
import { Button } from '../ui/button';
import { SLASH_COMMANDS, type SlashCommand } from '../../types/chat';

interface ChatComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  credits?: number;
  className?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type your message... (Cmd/Ctrl+Enter to send)",
  maxLength = 4000,
  credits,
  className = ''
}) => {
  const [content, setContent] = useState('');
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // max height in pixels
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, []);

  // Handle slash commands
  useEffect(() => {
    const lines = content.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.startsWith('/')) {
      const query = currentLine.slice(1).toLowerCase();
      const filtered = SLASH_COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
      );
      setFilteredCommands(filtered);
      setShowSlashCommands(filtered.length > 0);
      setSelectedCommandIndex(0);
    } else {
      setShowSlashCommands(false);
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      adjustTextareaHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle slash command navigation
    if (showSlashCommands) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        insertSlashCommand(filteredCommands[selectedCommandIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSlashCommands(false);
        return;
      }
    }

    // Handle send shortcut
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const insertSlashCommand = (command: SlashCommand) => {
    const lines = content.split('\n');
    lines[lines.length - 1] = command.template || command.command;
    setContent(lines.join('\n') + ' ');
    setShowSlashCommands(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || disabled) return;

    onSend(trimmedContent);
    setContent('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const remainingChars = maxLength - content.length;
  const isNearLimit = remainingChars < 100;

  return (
    <div className={`relative ${className}`}>
      {/* Slash Commands Dropdown */}
      <AnimatePresence>
        {showSlashCommands && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
          >
            <div className="p-2">
              <div className="flex items-center space-x-2 px-2 py-1 text-xs text-gray-500 border-b mb-2">
                <Command className="w-3 h-3" />
                <span>Slash Commands</span>
              </div>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.command}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors ${
                    index === selectedCommandIndex ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => insertSlashCommand(command)}
                >
                  <div className="font-medium text-gray-900">{command.command}</div>
                  <div className="text-xs text-gray-500">{command.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composer */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none border-none outline-none text-sm placeholder-gray-400 min-h-[60px]"
            style={{ height: '60px' }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {/* Credits indicator */}
            {typeof credits === 'number' && (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{credits} credits</span>
              </div>
            )}

            {/* Character count */}
            <span className={isNearLimit ? 'text-orange-500 font-medium' : ''}>
              {content.length}/{maxLength}
            </span>

            {/* Keyboard shortcut hint */}
            <span className="hidden sm:inline">
              ⌘+Enter to send
            </span>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={disabled || !content.trim()}
            size="sm"
            className="rounded-full px-4"
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Rate limit notice */}
      {disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-orange-600 text-center"
        >
          Please wait before sending another message...
        </motion.div>
      )}
    </div>
  );
};
