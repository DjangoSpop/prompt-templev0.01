'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Home, BarChart3, MessageSquare, Settings, HelpCircle, History, Wrench, Code, TestTube, FileText, Layers, Zap as ZapIcon, Activity, Star, BookOpen } from 'lucide-react';
import HelpAgent from '../onboarding/HelpAgent';


interface PageItem {
  name: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  action?: 'help-agent';
}

const pages: PageItem[] = [
  { name: 'Home', path: '/', icon: Home, description: 'Main landing page' },
  { name: 'Dashboard', path: '/dashboard', icon: BarChart3, description: 'Analytics and overview' },
  { name: 'Chat', path: '/chat', icon: MessageSquare, description: 'AI chat interface' },
  { name: 'Builder', path: '/builder', icon: Wrench, description: 'Prompt builder' },
  { name: 'Templates', path: '/templates', icon: FileText, description: 'Template templates' },
  { name: 'Library', path: '/prompt-library', icon: ZapIcon, description: 'Template library' },
  { name: 'History', path: '/history', icon: History, description: 'Chat history' },
  { name: 'Analysis', path: '/analysis', icon: Activity, description: 'Prompt analysis' },
  { name: 'Optimization', path: '/optimization', icon: ZapIcon, description: 'Prompt optimization' },
  { name: 'Integration', path: '/integration', icon: Code, description: 'API integrations' },
  { name: 'Help', path: '/help', icon: HelpCircle, description: 'Help and documentation' },
  { name: 'Status', path: '/status', icon: Activity, description: 'System status' },
  { name: 'Test', path: '/test', icon: TestTube, description: 'Testing tools' },
  { name: 'SSE Migration', path: '/sse-migration', icon: Zap, description: 'SSE migration demo' },
  { name: 'Shell', path: '/shell', icon: Code, description: 'Command shell' },
  { name: 'Auth', path: '/auth', icon: Star, description: 'Authentication' },
  { name: 'API Test', path: '/api-test', icon: Code, description: 'API testing' },
  { name: 'RAG', path: '/rag', icon: BookOpen, description: 'RAG system' },
  { name: 'Optimize', path: '/optimize', icon: ZapIcon, description: 'Optimization tools' },
  { name: 'Template', path: '/template', icon: FileText, description: 'Template editor' },
  { name: 'Learning', path: '/academy', icon: BookOpen, description: 'Learning resources' },
  { name: 'Help & Support', icon: HelpCircle, description: 'Get help and support', action: 'help-agent' },
];

export function FastNavWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelpAgent, setShowHelpAgent] = useState(false);
  const router = useRouter();

  const handleNavigate = (page: PageItem) => {
    if (page.action === 'help-agent') {
      setShowHelpAgent(true);
    } else if (page.path) {
      router.push(page.path);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          aria-label="Fast Navigation"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Zap className="h-6 w-6 text-white" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Navigation Dialog */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Fast Navigation
                </DialogTitle>
              </DialogHeader>

              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {pages.map((page, index) => (
                  <motion.div
                    key={page.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200 w-full"
                      onClick={() => handleNavigate(page)}
                    >
                      <page.icon className="h-6 w-6 text-blue-500" />
                      <span className="text-sm font-medium text-center">{page.name}</span>
                      <span className="text-xs text-gray-500 text-center leading-tight">{page.description}</span>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Help Agent */}
      <HelpAgent
        isOpen={showHelpAgent}
        onClose={() => setShowHelpAgent(false)}
      />
    </>
  );
}