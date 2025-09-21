'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  ArrowRight, 
  Wifi, 
  Zap,
  Shield,
  BarChart3,
  Clock,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SSEHealthCheck from './SSEHealthCheck';

interface MigrationStepProps {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

const MigrationStep: React.FC<MigrationStepProps> = ({
  step,
  title,
  description,
  completed,
  onComplete,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
      className={`border rounded-lg p-4 ${completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${
          completed ? 'bg-green-500' : 'bg-gray-400'
        }`}>
          {completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{step}</span>}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-semibold ${completed ? 'text-green-800' : 'text-gray-800'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${completed ? 'text-green-600' : 'text-gray-600'}`}>
            {description}
          </p>
          
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
          
          {!completed && onComplete && (
            <Button
              size="sm"
              onClick={onComplete}
              className="mt-3"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface SSEMigrationGuideProps {
  onMigrationComplete?: () => void;
  onClose?: () => void;
  className?: string;
}

export const SSEMigrationGuide: React.FC<SSEMigrationGuideProps> = ({
  onMigrationComplete,
  onClose,
  className = ''
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showGuide, setShowGuide] = useState(true);
  const [migrationStarted, setMigrationStarted] = useState(false);

  const migrationSteps = [
    {
      title: "Backend Verification",
      description: "Verify SSE endpoint is working and health check passes",
      requirement: "Health check returns 'healthy' status"
    },
    {
      title: "Import SSE Components",
      description: "Import the new SSE chat service and components",
      requirement: "Components imported and ready to use"
    },
    {
      title: "Update Chat Interface",
      description: "Replace WebSocket components with SSE equivalents",
      requirement: "Chat interface using SSE service"
    },
    {
      title: "Test Streaming",
      description: "Verify real-time message streaming works correctly",
      requirement: "Messages stream without errors"
    },
    {
      title: "Remove WebSocket Code",
      description: "Clean up old WebSocket dependencies and imports",
      requirement: "WebSocket code removed from components"
    }
  ];

  const completeStep = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const allStepsCompleted = completedSteps.size === migrationSteps.length;

  useEffect(() => {
    if (allStepsCompleted && onMigrationComplete) {
      onMigrationComplete();
    }
  }, [allStepsCompleted, onMigrationComplete]);

  const handleStartMigration = () => {
    setMigrationStarted(true);
  };

  const handleClose = () => {
    setShowGuide(false);
    if (onClose) {
      onClose();
    }
  };

  if (!showGuide) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <Zap className="w-6 h-6 text-blue-500" />
                <span>SSE Migration Guide</span>
              </h2>
              <p className="text-gray-600 mt-1">
                WebSocket → HTTP Server-Sent Events Migration
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Benefits Section */}
          {!migrationStarted && (
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">🚀 Migration Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Wifi className="w-5 h-5" />
                      <span className="font-semibold">Simpler</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Standard HTTP requests vs complex WebSocket management
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-green-700">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Reliable</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Auto-reconnection and standard browser caching
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-purple-700">
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-semibold">Scalable</span>
                    </div>
                    <p className="text-sm text-purple-600 mt-1">
                      Works with load balancers and CDNs
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onClick={handleStartMigration} size="lg" className="px-8">
                  Start Migration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Migration Steps */}
          {migrationStarted && (
            <div className="p-6">
              {/* Health Check Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Step 1: Backend Health Check</h3>
                <SSEHealthCheck 
                  onHealthChange={(health) => {
                    if (health.status === 'healthy') {
                      completeStep(0);
                    }
                  }}
                />
              </div>

              {/* Migration Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Migration Steps</h3>
                
                {migrationSteps.map((step, index) => (
                  <MigrationStep
                    key={index}
                    step={index + 1}
                    title={step.title}
                    description={step.description}
                    completed={completedSteps.has(index)}
                    onComplete={() => completeStep(index)}
                  >
                    {/* Step-specific content */}
                    {index === 1 && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div className="font-medium mb-2">Import these components:</div>
                        <code className="block bg-white p-2 rounded text-xs">
                          {`import { useSSEChat, SSEChatService } from '@/lib/services/sse-chat';
import SSEChatInterface from '@/components/SSEChatInterface';`}
                        </code>
                      </div>
                    )}
                    
                    {index === 2 && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div className="font-medium mb-2">Replace WebSocket usage:</div>
                        <code className="block bg-white p-2 rounded text-xs">
                          {`// Old: useWebSocketChat()
// New: useSSEChat()

// Old: <EnhancedChatInterface />
// New: <SSEChatInterface />`}
                        </code>
                      </div>
                    )}
                  </MigrationStep>
                ))}
              </div>

              {/* Success Message */}
              {allStepsCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Migration Complete! 🎉</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your chat interface is now using HTTP Server-Sent Events for improved 
                      performance and reliability. You can now remove the old WebSocket dependencies.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Progress Bar */}
              <div className="mt-6 bg-gray-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSteps.size / migrationSteps.length) * 100}%` }}
                  className="bg-blue-500 h-2 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>{completedSteps.size} of {migrationSteps.length} steps completed</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>~{Math.max(0, (migrationSteps.length - completedSteps.size) * 2)} min remaining</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              Backend Team ✅ Ready • Frontend Team 🚀 Migration
            </Badge>
            
            <div className="flex space-x-2">
              {allStepsCompleted && (
                <Button onClick={handleClose} variant="outline">
                  Close Guide
                </Button>
              )}
              <Button onClick={handleClose} variant="ghost" size="sm">
                Skip for now
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SSEMigrationGuide;
