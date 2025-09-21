'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Zap, Eye, RotateCcw, FileText, Code, Crown, Paperclip, Mic, MicOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChatInputProps {
  onSend: (message: string, options?: { type?: 'chat' | 'slash_command'; command?: string }) => void;
  isLoading?: boolean;
  isConnected?: boolean;
  templateId?: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  showSlashCommands?: boolean;
  enableVoiceInput?: boolean;
  enableFileUpload?: boolean;
}

// Slash commands configuration
const SLASH_COMMANDS = [
  { 
    command: 'intent', 
    icon: Eye, 
    description: 'Analyze user intent and context', 
    color: 'text-nile',
    example: '/intent What does the user really want here?'
  },
  { 
    command: 'optimize', 
    icon: Zap, 
    description: 'Optimize prompt for better results', 
    color: 'text-sun',
    example: '/optimize Write a compelling product description'
  },
  { 
    command: 'rewrite', 
    icon: RotateCcw, 
    description: 'Rewrite content with improvements', 
    color: 'text-stone-600',
    example: '/rewrite This email sounds too formal'
  },
  { 
    command: 'summarize', 
    icon: FileText, 
    description: 'Summarize long text or content', 
    color: 'text-umber-700',
    example: '/summarize Extract key points from this article'
  },
  { 
    command: 'code', 
    icon: Code, 
    description: 'Programming and code assistance', 
    color: 'text-basalt-900',
    example: '/code Create a React component for user login'
  }
];

// Pharaonic UI Components
const SunDisk = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <div 
    className={`inline-flex items-center justify-center rounded-full bg-sun text-white ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="text-xs">☀</div>
  </div>
);

export const EnhancedChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading = false,
  isConnected = true,
  templateId,
  maxLength = 4000,
  placeholder = "Ask the oracle... (or use slash commands)",
  disabled = false,
  showSlashCommands = true,
  enableVoiceInput = false,
  enableFileUpload = false,
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(SLASH_COMMANDS);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(-1);
  const [charCount, setCharCount] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandsRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Filter commands based on input
  useEffect(() => {
    if (message.startsWith('/')) {
      const query = message.slice(1).toLowerCase();
      const filtered = SLASH_COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(query) || 
        cmd.description.toLowerCase().includes(query)
      );
      setFilteredCommands(filtered);
      setShowCommands(filtered.length > 0);
      setSelectedCommandIndex(-1);
    } else {
      setShowCommands(false);
      setSelectedCommandIndex(-1);
    }
  }, [message]);

  // Update character count
  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  const insertCommand = useCallback((cmd: typeof SLASH_COMMANDS[0]) => {
    setMessage(`/${cmd.command} `);
    setShowCommands(false);
    setSelectedCommandIndex(-1);
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    if (!message.trim() || !isConnected || isLoading || disabled) {
      return;
    }

    // Check for slash commands
    if (message.startsWith('/')) {
      const [cmdPart, ...contentParts] = message.slice(1).split(' ');
      const command = SLASH_COMMANDS.find(cmd => cmd.command === cmdPart);
      
      if (command) {
        const content = contentParts.join(' ').trim();
        if (content) {
          onSend(content, { type: 'slash_command', command: command.command });
          setMessage('');
          toast.success(`Running ${command.command} command...`);
        } else {
          toast.error(`Please provide content for /${command.command} command`);
        }
        return;
      }
    }

    // Regular message
    onSend(message);
    setMessage('');
  }, [message, isConnected, isLoading, disabled, onSend]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Navigate slash commands
    if (showCommands) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedCommandIndex >= 0) {
          insertCommand(filteredCommands[selectedCommandIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowCommands(false);
        setSelectedCommandIndex(-1);
      }
    }

    // Quick slash command shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          insertCommand(SLASH_COMMANDS[0]); // intent
          break;
        case '2':
          e.preventDefault();
          insertCommand(SLASH_COMMANDS[1]); // optimize
          break;
        case '3':
          e.preventDefault();
          insertCommand(SLASH_COMMANDS[2]); // rewrite
          break;
        case '4':
          e.preventDefault();
          insertCommand(SLASH_COMMANDS[3]); // summarize
          break;
        case '5':
          e.preventDefault();
          insertCommand(SLASH_COMMANDS[4]); // code
          break;
      }
    }
  }, [showCommands, filteredCommands, selectedCommandIndex, handleSend, insertCommand]);

  const handleVoiceInput = useCallback(async () => {
    if (!enableVoiceInput) return;

    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const audioChunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          // TODO: Implement speech-to-text conversion
          toast.success('Voice recording complete (Speech-to-text coming soon)');
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.success('Recording started...');
      } catch {
        toast.error('Could not access microphone');
      }
    }
  }, [enableVoiceInput, isRecording]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: Implement file upload and processing
    toast.success(`File uploaded: ${file.name} (Processing coming soon)`);
    event.target.value = '';
  }, []);

  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="relative">
      {/* Slash commands dropdown */}
      {showCommands && (
        <div 
          ref={commandsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-sand-200 rounded-cartouche shadow-xl z-50 max-h-64 overflow-y-auto"
        >
          <div className="p-2 border-b border-sand-200 bg-sand-50">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <Crown className="h-4 w-4 text-sun" />
              <span>Slash Commands</span>
            </div>
          </div>
          <div className="p-1">
            {filteredCommands.map((cmd, index) => (
              <button
                key={cmd.command}
                onClick={() => insertCommand(cmd)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === selectedCommandIndex 
                    ? 'bg-sun/10 border border-sun/30' 
                    : 'hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <cmd.icon className={`h-4 w-4 ${cmd.color}`} />
                  <div className="flex-1">
                    <div className="font-semibold text-stone-800">/{cmd.command}</div>
                    <div className="text-xs text-stone-600">{cmd.description}</div>
                    <div className="text-xs text-stone-400 mt-1 font-mono">{cmd.example}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main input container */}
      <div className="border-2 border-sand-200 rounded-cartouche bg-sand-50/30 p-3">
        {/* Character count and status */}
        <div className="flex items-center justify-between mb-2 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            {!isConnected && (
              <span className="text-red-500 font-semibold">Disconnected</span>
            )}
            {isLoading && (
              <div className="flex items-center gap-1">
                <SunDisk size={12} className="animate-pulse" />
                <span>AI is thinking...</span>
              </div>
            )}
            {templateId && (
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-sun" />
                <span>Template: {templateId}</span>
              </div>
            )}
          </div>
          <div className={`font-mono ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-stone-500'}`}>
            {charCount}/{maxLength}
          </div>
        </div>

        {/* Input area */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || !isConnected}
              className="w-full min-h-[44px] max-h-[120px] px-4 py-3 rounded-cartouche border border-sand-300 bg-white/90 backdrop-blur-sm outline-none text-sm font-ui focus:border-sun focus:ring-2 focus:ring-sun/20 disabled:bg-stone-100 disabled:text-stone-400 transition-all resize-none"
              style={{ scrollbarWidth: 'thin' }}
            />
            
            {/* Voice input indicator */}
            {isRecording && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {/* Voice input button */}
            {enableVoiceInput && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={disabled || !isConnected}
                className={`p-3 rounded-cartouche transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                } disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed`}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}

            {/* File upload button */}
            {enableFileUpload && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={disabled || !isConnected}
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.md"
                />
                <div className="p-3 rounded-cartouche bg-stone-200 text-stone-600 hover:bg-stone-300 transition-all duration-200 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed">
                  <Paperclip className="h-4 w-4" />
                </div>
              </label>
            )}

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || !isConnected || !message.trim() || isLoading || isOverLimit}
              className="p-3 rounded-cartouche bg-sun-gradient text-white hover:shadow-lg disabled:bg-stone-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slash command hints */}
        {showSlashCommands && !showCommands && !message.startsWith('/') && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SLASH_COMMANDS.map((cmd) => (
              <button
                key={cmd.command}
                type="button"
                onClick={() => insertCommand(cmd)}
                className="px-2 py-1 text-xs bg-white/60 hover:bg-white/80 border border-sand-200 rounded-full transition-colors flex items-center gap-1"
                title={cmd.description}
              >
                <cmd.icon className={`h-3 w-3 ${cmd.color}`} />
                <span>/{cmd.command}</span>
              </button>
            ))}
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="mt-2 text-xs text-stone-400 text-center">
          <span>Press Enter to send • Shift+Enter for new line • Ctrl+1-5 for quick commands</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInput;
