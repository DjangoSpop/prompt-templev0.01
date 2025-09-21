'use client';

import { useState, useRef } from 'react';
import { Send, Zap, Clock, Copy, ThumbsUp, ThumbsDown, RotateCcw, CheckCircle } from 'lucide-react';
import TemplateCard from '@/components/TemplateCard';
import VariableForm from '@/components/VariableForm';
import PromptViewer from '@/components/PromptViewer';
import { mockGetIntentCandidates, mockRenderTemplate, mockAssessResponse } from '@/lib/mock-data';
import type { Template as MockTemplate, TemplateList, TemplateDetail, IntentResponse, RenderResponse, AssessmentResponse } from '@/lib/types';

interface Session {
  id: string;
  intent: string;
  userInput: string;
  templates: MockTemplate[];
  selectedTemplate?: MockTemplate;
  variables?: Record<string, string>;
  renderResult?: RenderResponse;
  timestamp: Date;
}
export default function OrchestrateView() {
  const [userInput, setUserInput] = useState('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [assessmentInput, setAssessmentInput] = useState('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleIntentSubmit = async () => {
    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const { intent, templates } = await mockGetIntentCandidates(userInput.trim());
      
      const session: Session = {
        id: `session_${Date.now()}`,
        intent: intent.intent,
        userInput: userInput.trim(),
        templates: templates.slice(0, 10), // Limit to 10 templates
        timestamp: new Date(),
      };

      setCurrentSession(session);
      setSessions(prev => [session, ...prev.slice(0, 9)]); // Keep last 10 sessions
      setUserInput('');
      
      // Mock analytics tracking
      console.log('Intent processed:', intent);
    } catch (error) {
      console.error('Failed to process intent:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTemplateSelect = (
    template: MockTemplate | TemplateList | TemplateDetail
  ) => {
    if (!currentSession) return;
    
    setCurrentSession(prev => prev ? {
      ...prev,
      selectedTemplate: template as MockTemplate,
      variables: {},
      renderResult: undefined,
    } : null);
  };
  const handleVariablesSubmit = async (variables: Record<string, string>) => {
    if (!currentSession?.selectedTemplate) return;

    setIsRendering(true);
    const startTime = Date.now();
    
    try {
      const renderResult = await mockRenderTemplate(currentSession.selectedTemplate.id, variables);

      const renderTime = Date.now() - startTime;
      
      setCurrentSession(prev => prev ? {
        ...prev,
        variables,
        renderResult,
      } : null);

      // Mock analytics tracking
      console.log('Template rendered:', { 
        templateId: currentSession.selectedTemplate.id, 
        renderTime, 
        variableCount: Object.keys(variables).length 
      });
    } catch (error) {
      console.error('Failed to render template:', error);
    } finally {
      setIsRendering(false);
    }
  };

  const handleCopyResult = (content: string) => {
    navigator.clipboard.writeText(content);
    if (currentSession?.selectedTemplate) {
      // Mock analytics tracking
      console.log('Template copied:', { 
        templateId: currentSession.selectedTemplate.id, 
        contentLength: content.length 
      });
    }
  };

  const handleAssessment = async () => {
    if (!assessmentInput.trim() || !currentSession?.renderResult) return;

    try {
      const assessmentResult = await mockAssessResponse(
        currentSession.renderResult.primary_result,
        assessmentInput.trim()
      );

      setAssessment(assessmentResult);
      
      if (currentSession.selectedTemplate) {
        // Mock analytics tracking
        console.log('Assessment completed:', {
          templateId: currentSession.selectedTemplate.id,
          score: assessmentResult.score
        });
      }
    } catch (error) {
      console.error('Failed to assess response:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleIntentSubmit();
    }
  };

  return (
    <div className="flex-1 bg-bg-primary">
      {/* Header */}
      <div className="h-12 bg-bg-primary border-b border-border px-4 flex items-center">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-brand" />
          <h1 className="text-text-primary font-semibold">AI Orchestrator</h1>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Intent Input */}
          <div className="p-6 border-b border-border bg-bg-secondary">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-text-primary font-medium mb-3">
                What would you like to create?
              </h2>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe what you want to create... (e.g., 'Create a professional email to follow up with a client', 'Write marketing copy for a new product launch')"
                  className="w-full h-24 p-4 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-muted resize-none focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                />
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <span className="text-xs text-text-muted">
                    Ctrl+Enter to submit
                  </span>
                  <button
                    onClick={handleIntentSubmit}
                    disabled={!userInput.trim() || isProcessing}
                    className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Find Templates</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {currentSession && (
                <>
                  {/* Intent Result */}
                  <div className="bg-bg-secondary rounded-lg p-4 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-brand" />
                      <span className="text-text-primary font-medium">
                        Detected Intent: {currentSession.intent}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm">
                      Found {currentSession.templates.length} matching templates
                    </p>
                  </div>

                  {/* Template Candidates */}
                  {currentSession.templates.length > 0 && (
                    <div>
                      <h3 className="text-text-primary font-medium mb-4">
                        Choose a Template
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSession.templates.map((template) => (
                      <div
                        key={template.id}
                        className={`${
                          currentSession.selectedTemplate?.id === template.id
                            ? 'ring-2 ring-brand'
                            : ''
                        }`}
                      >
                        <TemplateCard
                          template={template}
                          viewMode="grid"
                          onSelect={handleTemplateSelect}
                        />
                      </div>
                    ))}
                      </div>
                    </div>
                  )}
                  {/* Variable Form */}
                  {currentSession.selectedTemplate && (
                    <div>
                      <h3 className="text-text-primary font-medium mb-4">
                        Customize Your Template
                      </h3>
                      <VariableForm
                        template={currentSession.selectedTemplate}
                        onSubmit={handleVariablesSubmit}
                        isLoading={isRendering}
                      />
                    </div>
                  )}

                  {/* Render Results */}
                  {currentSession.renderResult && (
                    <div>
                      <h3 className="text-text-primary font-medium mb-4">
                        Generated Content
                      </h3>
                      <PromptViewer
                        result={currentSession.renderResult}
                        onCopy={handleCopyResult}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Assessment Section */}
              {currentSession?.renderResult && (
                <div className="bg-bg-secondary rounded-lg p-4 border border-border">
                  <h3 className="text-text-primary font-medium mb-3">
                    Assess AI Response
                  </h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Paste an AI-generated response to get feedback and suggestions for improvement.
                  </p>
                  
                  <div className="space-y-4">
                    <textarea
                      value={assessmentInput}
                      onChange={(e) => setAssessmentInput(e.target.value)}
                      placeholder="Paste the AI response you want to assess..."
                      className="w-full h-32 p-3 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-muted resize-none focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    
                    <button
                      onClick={handleAssessment}
                      disabled={!assessmentInput.trim()}
                      className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Assess Response
                    </button>

                    {assessment && (
                      <div className="mt-4 p-4 bg-bg-tertiary rounded-lg border border-border">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`w-2 h-2 rounded-full ${
                            assessment.score >= 80 ? 'bg-green' :
                            assessment.score >= 60 ? 'bg-yellow' : 'bg-red'
                          }`} />
                          <span className="text-text-primary font-medium">
                            Assessment Score: {assessment.score}/100
                          </span>
                        </div>
                        
                        <p className="text-text-secondary mb-4">{assessment.critique}</p>
                        
                        {assessment.suggestions.length > 0 && (
                          <div>
                            <h4 className="text-text-primary font-medium mb-2">Suggestions:</h4>
                            <div className="flex flex-wrap gap-2">
                              {assessment.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => setUserInput(suggestion.text)}
                                  className="px-3 py-1 bg-bg-primary border border-border rounded-full text-sm text-text-secondary hover:text-text-primary hover:border-interactive-hover transition-colors"
                                >
                                  {suggestion.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Recent Sessions */}
        <div className="w-80 bg-bg-secondary border-l border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-text-primary font-medium flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Recent Sessions</span>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setCurrentSession(session)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  currentSession?.id === session.id
                    ? 'bg-brand/10 border-brand text-text-primary'
                    : 'bg-bg-tertiary border-border text-text-secondary hover:border-interactive-hover hover:text-text-primary'
                }`}
              >
                <div className="font-medium text-sm mb-1 truncate">
                  {session.intent}
                </div>
                <div className="text-xs opacity-80 line-clamp-2 mb-2">
                  {session.userInput}
                </div>
                <div className="text-xs opacity-60">
                  {session.timestamp.toLocaleTimeString()}
                </div>
              </button>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center text-text-muted py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
