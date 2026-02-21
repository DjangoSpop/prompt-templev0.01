import React from 'react';
import { motion } from 'framer-motion';
import { Book, Lightbulb, Star, TrendingUp, Users, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingTrigger } from './OnboardingTrigger';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/providers/AuthProvider';

interface WelcomeFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  isNew?: boolean;
}

const features: WelcomeFeature[] = [
  {
    id: 'library',
    title: 'Prompt Library',
    description: 'Explore the "Bible of Prompts" with curated best practices',
    icon: <Book className="h-6 w-6" />,
    href: '/templates',
    color: 'blue',
  },
  {
    id: 'optimizer',
    title: 'Prompt Optimizer',
    description: 'Transform your raw prompts into professional versions',
    icon: <Lightbulb className="h-6 w-6" />,
    href: '/optimization',
    color: 'purple',
  },
  {
    id: 'my-temple',
    title: 'My Temple',
    description: 'Save and organize your favorite prompts',
    icon: <Star className="h-6 w-6" />,
    href: '/dashboard',
    color: 'green',
  },
  {
    id: 'academy',
    title: 'Prompt Academy',
    description: 'Learn with interactive courses and challenges',
    icon: <TrendingUp className="h-6 w-6" />,
    href: '/academy',
    color: 'orange',
    isNew: true,
  },
  {
    id: 'template-library',
    title: 'Template Library',
    description: 'Browse 750+ professional templates with advanced filters',
    icon: <Book className="h-6 w-6" />,
    href: '/template-library',
    color: 'teal',
    isNew: true,
  },
  {
    id: 'prompt-library',
    title: 'Prompt Library',
    description: 'Save, iterate, and version-control your own prompts',
    icon: <Star className="h-6 w-6" />,
    href: '/prompt-library',
    color: 'indigo',
    isNew: true,
  },
  {
    id: 'upgrade-scribe',
    title: 'Temple Scribe — $3.99/mo',
    description: 'Unlimited enhancement credits, AI walkthrough assistance, and 20 custom templates',
    icon: <Settings className="h-6 w-6" />,
    href: '/billing',
    color: 'amber',
    isNew: true,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track your progress and performance',
    icon: <TrendingUp className="h-6 w-6" />,
    href: '/status',
    color: 'indigo',
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Share and collaborate with your team',
    icon: <Users className="h-6 w-6" />,
    href: '/chat',
    color: 'pink',
    isNew: true,
  },
];

interface WelcomeDashboardProps {
  className?: string;
}

export const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { progress, isOnboardingActive } = useOnboarding();
  
  const isNewUser = progress < 50;
  const greeting = user?.first_name 
    ? `Welcome back, ${user.first_name}!` 
    : user?.username 
    ? `Welcome back, ${user.username}!`
    : 'Welcome to Prompt Temple!';

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg blur-xl"></div>
          <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 rounded-lg">
            <div className="text-6xl mb-4">🏛️</div>
            <h1 className="text-3xl font-bold mb-2">{greeting}</h1>
            <p className="text-amber-100">
              {isNewUser 
                ? 'Your journey to prompt mastery begins here'
                : 'Continue your path to prompt mastery'
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Onboarding Progress */}
      {(isOnboardingActive || progress < 100) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <OnboardingProgress variant="detailed" />
        </motion.div>
      )}

      {/* Quick Actions */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                🚀 Quick Start Guide
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Follow these steps to get the most out of Prompt Temple
              </p>
            </div>
            <OnboardingTrigger variant="help" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">1️⃣</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">Explore Library</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Browse curated prompts to see what&apos;s possible
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">2️⃣</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">Try Optimizer</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Improve your first prompt with AI assistance
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">3️⃣</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">Build Temple</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Save and organize your favorite prompts
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Explore Temple Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20 text-${feature.color}-600 group-hover:scale-110 transition-transform duration-200`}>
                    {feature.icon}
                  </div>
                  {feature.isNew && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                      New
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"
                  onClick={() => window.location.href = feature.href}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Explore
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Take our guided tour or explore our help resources to master prompt engineering
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/help'}>
              <Settings className="h-4 w-4 mr-2" />
              Help Center
            </Button>
            <OnboardingTrigger />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeDashboard;
