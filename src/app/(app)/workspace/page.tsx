// 🏛️ Workspace & History Implementation - Sprint 3
// File: src/app/workspace/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Card } from '@/components/ui/card-unified';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input-unified';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search,
  Filter,
  Archive,
  Download,
  Share,
  Star,
  Trash2,
  FolderOpen,
  MessageSquare,
  Clock,
  Tag,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Eye,
  Edit,
  Copy,
  MoreVertical,
  Plus,
  History,
  Bookmark,
  Zap,
  Brain
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

// 🏺 Workspace Store
interface WorkspaceState {
  // Data
  conversations: Conversation[];
  folders: WorkspaceFolder[];
  selectedItems: string[];
  
  // UI State
  searchQuery: string;
  selectedFolder: string | null;
  sortBy: 'created_at' | 'updated_at' | 'title';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  showFilters: boolean;
  
  // Filters
  dateRange: [Date | null, Date | null];
  tags: string[];
  selectedTags: string[];
  conversationType: 'all' | 'chat' | 'optimization' | 'templates';
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folderId: string | null) => void;
  setSortBy: (field: WorkspaceState['sortBy']) => void;
  toggleSortOrder: () => void;
  setViewMode: (mode: WorkspaceState['viewMode']) => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
  setConversations: (conversations: Conversation[]) => void;
  setFolders: (folders: WorkspaceFolder[]) => void;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  type: 'chat' | 'optimization' | 'template_creation';
  created_at: string;
  updated_at: string;
  message_count: number;
  word_count: number;
  folder_id?: string;
  tags: string[];
  is_starred: boolean;
  is_archived: boolean;
  metadata: {
    model_used?: string;
    optimization_score?: number;
    template_id?: string;
    credits_used?: number;
  };
}

interface WorkspaceFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  conversation_count: number;
  created_at: string;
  updated_at: string;
}

const useWorkspaceStore = create<WorkspaceState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    conversations: [],
    folders: [],
    selectedItems: [],
    searchQuery: '',
    selectedFolder: null,
    sortBy: 'updated_at',
    sortOrder: 'desc',
    viewMode: 'grid',
    showFilters: false,
    dateRange: [null, null],
    tags: [],
    selectedTags: [],
    conversationType: 'all',
    
    // Actions
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
    setSortBy: (field) => set({ sortBy: field }),
    toggleSortOrder: () => set(state => ({ 
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' 
    })),
    setViewMode: (mode) => set({ viewMode: mode }),
    
    toggleItemSelection: (id) => set(state => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter(item => item !== id)
        : [...state.selectedItems, id]
    })),
    
    selectAllItems: () => {
      const { conversations } = get();
      set({ selectedItems: conversations.map(conv => conv.id) });
    },
    
    clearSelection: () => set({ selectedItems: [] }),
    setConversations: (conversations) => {
      // Extract unique tags
      const allTags = Array.from(new Set(
        conversations.flatMap(conv => conv.tags)
      )).sort();
      set({ conversations, tags: allTags });
    },
    setFolders: (folders) => set({ folders }),
  }))
);

// 🔍 Search and Filter Component
const SearchAndFilters = () => {
  const {
    searchQuery,
    setSearchQuery,
    showFilters,
    conversationType,
    selectedTags,
    tags,
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,
    viewMode,
    setViewMode
  } = useWorkspaceStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const sortOptions = [
    { value: 'updated_at', label: 'Last Modified' },
    { value: 'created_at', label: 'Created Date' },
    { value: 'title', label: 'Title' }
  ];

  return (
    <Card variant="default" className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg/50" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search conversations, templates, and optimizations..."
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => useWorkspaceStore.setState(state => ({ showFilters: !state.showFilters }))}
        >
          <Filter className="h-4 w-4" />
        </Button>
        
        <div className="flex border border-border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none border-l"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
          {/* Sort Options */}
          <div>
            <label className="text-sm font-medium text-fg/70 block mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as WorkspaceState['sortBy'])}
                className="flex-1 p-2 border border-border rounded-lg bg-card text-fg text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-fg/70 block mb-2">Type</label>
            <select
              value={conversationType}
              onChange={(e) => useWorkspaceStore.setState({ conversationType: e.target.value as any })}
              className="w-full p-2 border border-border rounded-lg bg-card text-fg text-sm"
            >
              <option value="all">All Types</option>
              <option value="chat">Chat Sessions</option>
              <option value="optimization">Optimizations</option>
              <option value="templates">Template Creation</option>
            </select>
          </div>
          
          {/* Tags Filter */}
          <div>
            <label className="text-sm font-medium text-fg/70 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {tags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    useWorkspaceStore.setState(state => ({
                      selectedTags: state.selectedTags.includes(tag)
                        ? state.selectedTags.filter(t => t !== tag)
                        : [...state.selectedTags, tag]
                    }));
                  }}
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// 📁 Folder Sidebar
const FolderSidebar = () => {
  const { folders, selectedFolder, setSelectedFolder, conversations } = useWorkspaceStore();
  
  const conversationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    conversations.forEach(conv => {
      if (conv.folder_id) {
        counts[conv.folder_id] = (counts[conv.folder_id] || 0) + 1;
      }
    });
    return counts;
  }, [conversations]);

  const unorganizedCount = conversations.filter(conv => !conv.folder_id).length;
  const starredCount = conversations.filter(conv => conv.is_starred).length;
  const archivedCount = conversations.filter(conv => conv.is_archived).length;

  const specialFolders = [
    {
      id: 'all',
      name: 'All Conversations',
      icon: MessageSquare,
      count: conversations.length,
      color: 'text-fg/60'
    },
    {
      id: 'starred',
      name: 'Starred',
      icon: Star,
      count: starredCount,
      color: 'text-yellow-500'
    },
    {
      id: 'unorganized',
      name: 'Unorganized',
      icon: FolderOpen,
      count: unorganizedCount,
      color: 'text-fg/60'
    },
    {
      id: 'archived',
      name: 'Archived',
      icon: Archive,
      count: archivedCount,
      color: 'text-fg/60'
    }
  ];

  return (
    <Card variant="default" className="h-fit sticky top-6">
      <div className="p-4">
        <h3 className="font-semibold text-fg mb-4">Workspace</h3>
        
        {/* Special Folders */}
        <div className="space-y-1">
          {specialFolders.map(folder => {
            const Icon = folder.icon;
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id === 'all' ? null : folder.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                  selectedFolder === (folder.id === 'all' ? null : folder.id)
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-card/50 text-fg/70'
                }`}
              >
                <Icon className={`h-4 w-4 ${folder.color}`} />
                <span className="flex-1 text-sm">{folder.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {folder.count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Custom Folders */}
        {folders.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-fg/70">Folders</h4>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-accent/10 text-accent'
                      : 'hover:bg-card/50 text-fg/70'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="flex-1 text-sm">{folder.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {conversationCounts[folder.id] || 0}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// 💬 Conversation Card Component
const ConversationCard = ({ conversation, isSelected, onToggleSelect }: {
  conversation: Conversation;
  isSelected: boolean;
  onToggleSelect: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeIcon = () => {
    switch (conversation.type) {
      case 'chat': return MessageSquare;
      case 'optimization': return Zap;
      case 'template_creation': return Brain;
      default: return MessageSquare;
    }
  };

  const getTypeColor = () => {
    switch (conversation.type) {
      case 'chat': return 'text-blue-500';
      case 'optimization': return 'text-yellow-500';
      case 'template_creation': return 'text-purple-500';
      default: return 'text-fg/60';
    }
  };

  const Icon = getTypeIcon();
  const iconColor = getTypeColor();

  return (
    <Card 
      variant={isSelected ? "temple" : "default"}
      className={`group cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-accent' : ''
      }`}
      onClick={() => onToggleSelect()}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
            />
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {conversation.is_starred && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-medium text-fg line-clamp-2">
            {conversation.title}
          </h3>
          <p className="text-sm text-fg/60 line-clamp-2">
            {conversation.preview}
          </p>
        </div>

        {/* Tags */}
        {conversation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {conversation.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {conversation.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{conversation.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-fg/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
            </span>
            <span>{conversation.message_count} msgs</span>
            {conversation.metadata.credits_used && (
              <span>{conversation.metadata.credits_used} credits</span>
            )}
          </div>
          
          {conversation.metadata.optimization_score && (
            <Badge variant="outline" className="text-xs">
              {Math.round(conversation.metadata.optimization_score * 100)}% optimized
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

// 📋 Bulk Actions Toolbar
const BulkActionsToolbar = () => {
  const { selectedItems, clearSelection } = useWorkspaceStore();

  if (selectedItems.length === 0) return null;

  return (
    <Card variant="temple" className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-fg">
          {selectedItems.length} selected
        </span>
        <Button variant="ghost" size="sm" onClick={clearSelection}>
          Clear
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Star
        </Button>
        <Button variant="outline" size="sm">
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  );
};

// 🏛️ Main Workspace Page
export default function WorkspacePage() {
  const {
    conversations,
    selectedItems,
    searchQuery,
    selectedFolder,
    sortBy,
    sortOrder,
    viewMode,
    conversationType,
    selectedTags,
    setConversations,
    setFolders,
    toggleItemSelection,
  } = useWorkspaceStore();

  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['workspace', 'conversations'],
    queryFn: async () => {
      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/v2/workspace/conversations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      setConversations(data.results || []);
    },
  });

  // Fetch folders
  const { data: foldersData } = useQuery({
    queryKey: ['workspace', 'folders'],
    queryFn: async () => {
      const response = await fetch('/api/v2/workspace/folders/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFolders(data.results || []);
    },
  });

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Folder filter
    if (selectedFolder) {
      switch (selectedFolder) {
        case 'starred':
          filtered = filtered.filter(conv => conv.is_starred);
          break;
        case 'unorganized':
          filtered = filtered.filter(conv => !conv.folder_id);
          break;
        case 'archived':
          filtered = filtered.filter(conv => conv.is_archived);
          break;
        default:
          filtered = filtered.filter(conv => conv.folder_id === selectedFolder);
      }
    } else {
      // Show non-archived by default
      filtered = filtered.filter(conv => !conv.is_archived);
    }

    // Type filter
    if (conversationType !== 'all') {
      filtered = filtered.filter(conv => conv.type === conversationType);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(conv =>
        selectedTags.some(tag => conv.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    return filtered;
  }, [conversations, searchQuery, selectedFolder, conversationType, selectedTags, sortBy, sortOrder]);

  if (conversationsLoading) {
    return (
      <div className="temple-background min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <History className="h-8 w-8 animate-pulse text-accent mx-auto mb-2" />
              <div className="text-lg font-medium text-fg">Loading workspace...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="temple-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-fg flex items-center justify-center gap-3">
            <History className="h-8 w-8 text-accent" />
            Workspace
          </h1>
          <p className="text-fg/70">
            Manage your conversations, templates, and optimization history
          </p>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters />

        {/* Bulk Actions */}
        <BulkActionsToolbar />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FolderSidebar />
          </div>

          {/* Conversations Grid/List */}
          <div className="lg:col-span-3">
            {filteredConversations.length === 0 ? (
              <Card variant="default" className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-fg/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-fg mb-2">No conversations found</h3>
                <p className="text-fg/60">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Start a new conversation to see it here'
                  }
                </p>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-3'
              }>
                {filteredConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedItems.includes(conversation.id)}
                    onToggleSelect={() => toggleItemSelection(conversation.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}