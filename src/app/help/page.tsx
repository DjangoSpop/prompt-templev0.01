'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepTracker } from '@/components/onboarding/StepTracker';
import { HelpCircle, Book, MessageSquare, Keyboard } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Track onboarding step completion */}
      <StepTracker stepId="academy" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Help & Documentation</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and learn how to use Prompt Temple effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive guides and tutorials for using Prompt Temple.
              </p>
              <Button variant="outline" className="w-full">
                View Docs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Learn keyboard shortcuts to speed up your workflow.
              </p>
              <Button variant="outline" className="w-full">
                View Shortcuts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get help from our support team.
              </p>
              <Button variant="outline" className="w-full">
                Contact Us
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Frequently asked questions and answers.
              </p>
              <Button variant="outline" className="w-full">
                View FAQ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
