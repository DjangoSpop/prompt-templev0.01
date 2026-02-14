'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  Bug,
  BookOpen,
  Accessibility,
  Zap,
  X,
  ChevronRight,
  Search,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuidedTour } from './GuidedTour';
import { useRouter } from 'next/navigation';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  category: 'getting-started' | 'features' | 'troubleshooting' | 'accessibility';
}

const helpTopics: HelpTopic[] = [
  {
    id: 'welcome',
    title: 'Welcome to Prompt Temple',
    description: 'Learn about our AI prompt engineering platform',
    icon: BookOpen,
    category: 'getting-started',
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h3 className="text-xl font-bold mb-2">Your AI Prompt Engineering Sanctuary</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Prompt Temple is your comprehensive platform for mastering AI prompt engineering.
            We provide tools, templates, and guidance to help you create better AI interactions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Prompt Library</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Curated collection of professional prompts
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">AI Optimizer</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enhance your prompts with AI assistance
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">My Temple</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personal dashboard and saved prompts
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'navigation',
    title: 'Navigation Guide',
    description: 'How to move around the application',
    icon: ChevronRight,
    category: 'getting-started',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Navigation Overview</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Top Navigation Bar</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access main features like Dashboard, Templates, Optimizer, and Help
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium">Fast Navigation Widget</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the floating button (⚡) for quick access to all pages
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium">Breadcrumb Navigation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Shows your current location and path back to home
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'accessibility',
    title: 'Accessibility Features',
    description: 'Making the platform accessible to everyone',
    icon: Accessibility,
    category: 'accessibility',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Accessibility Support</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900 dark:text-green-100">Keyboard Navigation</span>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200">
              Use Tab to navigate, Enter/Space to activate, Escape to close modals
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">Screen Reader Support</span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              All interactive elements have proper ARIA labels and descriptions
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900 dark:text-purple-100">High Contrast Mode</span>
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Toggle dark/light theme for better visibility
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-900 dark:text-orange-100">Reduced Motion</span>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Animations respect your motion preferences
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues & Solutions',
    description: 'Fix common problems and get help',
    icon: Bug,
    category: 'troubleshooting',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Troubleshooting Guide</h3>
        <div className="space-y-4">
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Chat Not Responding
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                  If the AI chat isn't responding, try these solutions:
                </p>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                  <li>• Check your internet connection</li>
                  <li>• Refresh the page (Ctrl+F5)</li>
                  <li>• Clear browser cache and cookies</li>
                  <li>• Try a different browser</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Templates Not Loading
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  If templates aren't appearing, try:
                </p>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                  <li>• Wait a moment and try again</li>
                  <li>• Check the filter settings</li>
                  <li>• Clear search and try different categories</li>
                  <li>• Contact support if issue persists</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Need More Help?
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  If you're still having issues, use the feedback form below or contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

interface HelpAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpAgent: React.FC<HelpAgentProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTour, setShowTour] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartTour = () => {
    setShowTour(true);
    onClose();
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you'd send this to your backend
      console.log('Feedback submitted:', {
        type: feedbackType,
        message: feedbackText,
        timestamp: new Date().toISOString(),
      });

      setFeedbackText('');
      alert('Thank you for your feedback! We\'ll review it shortly.');
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTopicsByCategory = (category: string) => {
    return filteredTopics.filter(topic => topic.category === category);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <HelpCircle className="h-6 w-6 text-blue-500" />
                Help & Support Center
                <Badge variant="secondary" className="ml-auto">
                  Accessibility Enabled
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="troubleshoot" className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Troubleshoot
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="overview" className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        Quick Start
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          onClick={handleStartTour}
                          className="h-auto p-4 flex flex-col items-center gap-2"
                          variant="outline"
                        >
                          <BookOpen className="h-6 w-6 text-blue-500" />
                          <span className="font-medium">Take Guided Tour</span>
                          <span className="text-sm text-gray-500">Learn all features step-by-step</span>
                        </Button>
                        <Button
                          onClick={() => router.push('/templates')}
                          className="h-auto p-4 flex flex-col items-center gap-2"
                          variant="outline"
                        >
                          <Search className="h-6 w-6 text-green-500" />
                          <span className="font-medium">Browse Templates</span>
                          <span className="text-sm text-gray-500">Explore prompt library</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Help Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search for help..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Getting Started */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Getting Started
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getTopicsByCategory('getting-started').map((topic) => (
                          <Button
                            key={topic.id}
                            variant="ghost"
                            className="h-auto p-4 flex items-start gap-3 text-left"
                            onClick={() => setActiveTab('features')}
                          >
                            <topic.icon className="h-5 w-5 text-blue-500 mt-1" />
                            <div>
                              <div className="font-medium">{topic.title}</div>
                              <div className="text-sm text-gray-500">{topic.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredTopics.map((topic) => (
                      <Card key={topic.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <topic.icon className="h-5 w-5 text-blue-500" />
                            {topic.title}
                            <Badge variant="outline" className="ml-auto">
                              {topic.category}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {topic.description}
                          </p>
                        </CardHeader>
                        <CardContent>
                          {topic.content}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="troubleshoot" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-500" />
                        Troubleshooting
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getTopicsByCategory('troubleshooting').map((topic) => (
                        <div key={topic.id} className="mb-6 last:mb-0">
                          {topic.content}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-blue-500" />
                        Additional Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="link" className="p-0 h-auto">
                        📚 Documentation
                      </Button>
                      <Button variant="link" className="p-0 h-auto">
                        💬 Community Forum
                      </Button>
                      <Button variant="link" className="p-0 h-auto">
                        📧 Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        Share Your Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Feedback Type</label>
                        <div className="flex gap-2">
                          {(['bug', 'feature', 'general'] as const).map((type) => (
                            <Button
                              key={type}
                              variant={feedbackType === type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setFeedbackType(type)}
                            >
                              {type === 'bug' && '🐛 Bug Report'}
                              {type === 'feature' && '💡 Feature Request'}
                              {type === 'general' && '💬 General'}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Your Message</label>
                        <Textarea
                          placeholder="Describe your issue, suggestion, or question..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={!feedbackText.trim() || isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      </AnimatePresence>

      {/* Guided Tour */}
      <GuidedTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={handleTourComplete}
      />
    </>
  );
};

export default HelpAgent;