'use client';

import React from 'react';
import { 
  useAuth, 
  useTemplates, 
  useTemplate, 
  useTemplateActions,
  useFeaturedTemplates,
  useCategories,
  useAIGeneration,
  useTrackEvent 
} from '../hooks';
import { LoadingSpinner, ErrorDisplay } from '../components';

/**
 * Example: Authentication Component
 * Shows how to handle login, registration, and user profile
 */
export const AuthExample: React.FC = () => {
  const {
    user,
    isLoadingUser,
    isAuthenticated,
    login,
    logout,
    register,
    isLoggingIn,
    loginError,
    checkUsername,
    checkUsernameResult,
  } = useAuth();

  const [credentials, setCredentials] = React.useState({
    username: '',
    password: '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(credentials);
  };

  const handleUsernameCheck = (username: string) => {
    if (username.length > 2) {
      checkUsername(username);
    }
  };

  if (isLoadingUser) {
    return <LoadingSpinner text="Loading user..." />;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Authentication Example</h2>
      
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <p>Email: {user?.email}</p>
          <button 
            onClick={() => logout()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => {
                setCredentials({ ...credentials, username: e.target.value });
                handleUsernameCheck(e.target.value);
              }}
              className="block w-full px-3 py-2 border rounded"
            />
            {checkUsernameResult && (
              <p className={`text-sm mt-1 ${checkUsernameResult.available ? 'text-green-600' : 'text-red-600'}`}>
                {checkUsernameResult.available ? 'Username available' : 'Username taken'}
              </p>
            )}
          </div>
          
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="block w-full px-3 py-2 border rounded"
          />
          
          <button
            type="submit"
            disabled={isLoggingIn}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
          
          <ErrorDisplay error={loginError} />
        </form>
      )}
    </div>
  );
};

/**
 * Example: Template List Component
 * Shows how to fetch and display templates with pagination
 */
export const TemplateListExample: React.FC = () => {
  const [filters, setFilters] = React.useState({
    search: '',
    category: undefined as number | undefined,
    is_featured: false,
  });

  const {
    templates,
    totalCount,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTemplates(filters);

  const { categories } = useCategories();
  const { trackEvent } = useTrackEvent();

  const handleTemplateClick = (template: any) => {
    trackEvent({
      event_type: 'template_viewed',
      data: {
        template_id: template.id,
        template_title: template.title,
      },
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Templates ({totalCount})</h2>
      
      {/* Filters */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search templates..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="block w-full px-3 py-2 border rounded"
        />
        
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ 
            ...filters, 
            category: e.target.value ? Number(e.target.value) : undefined 
          })}
          className="block w-full px-3 py-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories?.results?.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.is_featured}
            onChange={(e) => setFilters({ ...filters, is_featured: e.target.checked })}
            className="mr-2"
          />
          Featured only
        </label>
      </div>

      {/* Error state */}
      <ErrorDisplay error={error} onRetry={() => refetch()} />

      {/* Loading state */}
      {isLoading && <LoadingSpinner text="Loading templates..." />}

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold">{template.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              <span>⭐ {template.average_rating?.toFixed(1) || 'N/A'}</span>
              <span className="ml-2">👁️ {template.usage_count || 0}</span>
              {template.is_featured && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  Featured
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

/**
 * Example: Template Detail Component
 * Shows how to fetch and display a single template with actions
 */
export const TemplateDetailExample: React.FC<{ templateId: string }> = ({ templateId }) => {
  const { data: template, isLoading, error } = useTemplate(templateId);
  const { 
    updateTemplate, 
    deleteTemplate, 
    rateTemplate, 
    duplicateTemplate,
    isUpdating,
    isDeleting,
    isRating,
    updateError,
  } = useTemplateActions();

  const [isEditing, setIsEditing] = React.useState(false);
  const [rating, setRating] = React.useState(5);

  const handleUpdate = (updatedData: any) => {
    updateTemplate(
      { id: templateId, data: updatedData },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleRate = () => {
    rateTemplate({
      id: templateId,
      rating: { rating },
    });
  };

  if (isLoading) return <LoadingSpinner text="Loading template..." />;
  if (error) return <ErrorDisplay error={error} />;
  if (!template) return <div>Template not found</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{template.title}</h1>
        <p className="text-gray-600 mt-2">{template.description}</p>
        
        <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
          <span>By {template.author.username}</span>
          <span>⭐ {template.average_rating?.toFixed(1) || 'N/A'}</span>
          <span>👁️ {template.usage_count || 0} uses</span>
          <span>📁 {template.category.name}</span>
        </div>
      </div>

      {/* Template content */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Template Content:</h3>
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {template.template_content}
        </pre>
      </div>

      {/* Template fields */}
      {template.fields && template.fields.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Fields:</h3>
          <div className="space-y-2">
            {template.fields.map((field) => (
              <div key={field.id} className="border rounded p-2">
                <div className="font-medium">{field.label}</div>
                <div className="text-sm text-gray-600">
                  Type: {field.field_type} | Required: {field.is_required ? 'Yes' : 'No'}
                </div>
                {field.help_text && (
                  <div className="text-xs text-gray-500 mt-1">{field.help_text}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isEditing ? 'Cancel Edit' : 'Edit'}
        </button>
        
        <button
          onClick={() => duplicateTemplate(templateId)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Duplicate
        </button>
        
        <button
          onClick={() => deleteTemplate(templateId)}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Rate this template:</h3>
        <div className="flex items-center space-x-2">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num} star{num > 1 ? 's' : ''}</option>
            ))}
          </select>
          <button
            onClick={handleRate}
            disabled={isRating}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {isRating ? 'Rating...' : 'Rate'}
          </button>
        </div>
      </div>

      {/* Update error */}
      <ErrorDisplay error={updateError} />

      {/* Edit form */}
      {isEditing && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Edit Template:</h3>
          {/* Add your edit form here */}
          <p className="text-gray-500">Edit form would go here...</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: AI Generation Component
 * Shows how to use AI services for content generation
 */
export const AIGenerationExample: React.FC = () => {
  const { generate, isGenerating, error, result } = useAIGeneration();
  const [prompt, setPrompt] = React.useState('');
  const [model, setModel] = React.useState('gpt-3.5-turbo');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      generate({
        model,
        prompt: prompt.trim(),
        max_tokens: 150,
        temperature: 0.7,
      });
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">AI Content Generation</h2>
      
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Model:</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="block w-full px-3 py-2 border rounded"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-2">Claude-2</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Prompt:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={4}
            className="block w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </form>

      <ErrorDisplay error={error} />

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Generated Content:</h3>
          <div className="space-y-2">
            {result.choices.map((choice, index) => (
              <div key={index} className="p-3 bg-white rounded border">
                {choice.text}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Tokens used: {result.usage.total_tokens} 
            (prompt: {result.usage.prompt_tokens}, completion: {result.usage.completion_tokens})
          </div>
        </div>
      )}
    </div>
  );
};