'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { PromptHistoryItem, TemplateCreateUpdate } from '@/lib/types';
import { 
  Clock, 
  Copy, 
  RefreshCw, 
  Save, 
  Star, 
  Trash2, 
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<PromptHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'template' | 'custom'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Mock data - replace with actual API call once backend endpoint is ready
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const history = await apiClient.getPromptHistory();
      
      // Mock data for now
      const mockHistory: PromptHistoryItem[] = [
        {
          id: '1',
          content: 'Write a professional email to request a meeting with the marketing team to discuss the upcoming product launch.',
          variables: {
            'recipient': 'Marketing Team',
            'purpose': 'Product Launch Discussion',
            'urgency': 'High'
          },
          template_id: 'temp-1',
          template_title: 'Professional Email Template',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          usage_count: 3,
          rating: 4,
        },
        {
          id: '2',
          content: 'Create a comprehensive project plan for developing a mobile app with timeline, milestones, and resource allocation.',
          variables: {
            'project_type': 'Mobile App',
            'duration': '6 months',
            'team_size': '5 developers'
          },
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          usage_count: 1,
        },
        {
          id: '3',
          content: 'Analyze the performance metrics of our Q3 marketing campaigns and provide insights for Q4 planning.',
          variables: {},
          template_id: 'temp-2',
          template_title: 'Marketing Analysis Template',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
          usage_count: 2,
          rating: 5,
        },
      ];
      
      setHistoryItems(mockHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const filteredHistory = historyItems.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.template_title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'template' && item.template_id) ||
                         (filterType === 'custom' && !item.template_id);
    
    return matchesSearch && matchesFilter;
  });

  const handleUseAgain = async (item: PromptHistoryItem) => {
    try {
      // Copy to clipboard or navigate to template/editor
      await navigator.clipboard.writeText(item.content);
      
      // Track usage event
        await apiClient.trackEvent({
          event_type: 'prompt_copied_from_history',
          data: {
            prompt_id: item.id,
          },
        });      // Show success message (implement toast/notification)
      console.log('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSaveAsTemplate = async (item: PromptHistoryItem) => {
    try {
      // Extract variables from the prompt content (simple implementation)
      const variableMatches = item.content.match(/\{\{(\w+)\}\}/g) || [];
      const extractedVariables = variableMatches.map((match, index) => ({
        label: match.replace(/[{}]/g, ''),
        field_type: 'text' as const,
        is_required: true,
        order: index,
        placeholder: `Enter ${match.replace(/[{}]/g, '')}`,
      }));

      const templateData: TemplateCreateUpdate = {
        title: `Custom Template - ${new Date().toLocaleDateString()}`,
        description: `Template created from prompt history`,
        category: 1, // Default category - adjust based on your categories
        template_content: item.content,
        version: '1.0',
        is_public: false,
        fields_data: extractedVariables,
      };

      const newTemplate = await apiClient.createTemplate(templateData);
      
      // Track template creation event
      await apiClient.trackEvent({
        event_type: 'template_created_from_history',
        data: {
          template_id: newTemplate.id,
          source_prompt_id: item.id,
        },
      });

      console.log('Template created successfully!');
      // TODO: Show success notification and optionally redirect to template editor
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this prompt from your history?')) {
      try {
        // TODO: Implement API call to delete prompt history item
        // await apiClient.deletePromptHistoryItem(itemId);
        
        setHistoryItems(prev => prev.filter(item => item.id !== itemId));
        
        await apiClient.trackEvent({
          event_type: 'prompt_history_deleted',
          data: {
            prompt_id: itemId,
          },
        });
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.size} prompt(s) from your history?`)) {
      try {
        // TODO: Implement bulk delete API call
        setHistoryItems(prev => prev.filter(item => !selectedItems.has(item.id)));
        setSelectedItems(new Set());
        
        await apiClient.trackEvent({
          event_type: 'prompt_history_bulk_deleted',
          data: {
            count: selectedItems.size,
          },
        });
      } catch (error) {
        console.error('Failed to delete prompts:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen temple-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section with Egyptian Elements */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 pharaoh-badge rounded-full flex items-center justify-center pyramid-elevation-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-hieroglyph text-glow-lg">
                The Sacred Chronicle
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Your journey through the temple halls • Sacred prompt inscriptions
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-hieroglyph text-glow">Sacred Prompt Chronicle</h2>
            <p className="text-muted-foreground mt-2">
              View and manage your prompt history. Transform prompts into temple treasures.
            </p>
          </div>
          
          {selectedItems.size > 0 && (
            <div className="mt-4 md:mt-0">
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 pharaoh-glow"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove {selectedItems.size} scrolls</span>
              </Button>
            </div>
          )}
        </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search prompts and templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Prompts</option>
            <option value="template">From Templates</option>
            <option value="custom">Custom Prompts</option>
          </select>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'No prompts match your search criteria.' : 'Start using prompts to see your history here.'}
            </p>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {item.template_title ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FileText className="h-3 w-3 mr-1" />
                          {item.template_title}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Custom Prompt
                        </span>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      
                      {item.usage_count && item.usage_count > 1 && (
                        <span className="text-xs text-gray-500">
                          Used {item.usage_count} times
                        </span>
                      )}
                      
                      {item.rating && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">{item.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-900 mb-3 leading-relaxed">
                      {item.content}
                    </p>
                    
                    {Object.keys(item.variables).length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Variables:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.variables).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                            >
                              <strong>{key}:</strong>&nbsp;{value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseAgain(item)}
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Use Again</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(item.content)}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveAsTemplate(item)}
                    className="flex items-center space-x-1"
                  >
                    <Save className="h-3 w-3" />
                    <span>Save as Template</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  </div>
  );
}