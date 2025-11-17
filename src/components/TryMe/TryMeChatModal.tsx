/**
 * Try Me Chat Modal - SSE streaming demo for unauthenticated users
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useOptimizeTry } from "@/hooks/api/useOptimizeTry";
import { EgyptianLoading, TypingIndicator } from "./EgyptianLoading";
import { AlertCircle, Sparkles, StopCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TryMeChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
}

export const TryMeChatModal: React.FC<TryMeChatModalProps> = ({
  open,
  onOpenChange,
  initialPrompt = "",
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const { output, loading, error, suggestions, run, stop } = useOptimizeTry();
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Set initial prompt when modal opens
  useEffect(() => {
    if (open && initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [open, initialPrompt]);

  const handleOptimize = () => {
    if (!prompt.trim()) return;
    run({ prompt: prompt.trim() });
  };

  const handleStop = () => {
    stop();
  };

  const handleReset = () => {
    setPrompt("");
    stop();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Try Prompt Optimization
          </DialogTitle>
          <DialogDescription>
            Experience AI-powered prompt optimization in real-time. No sign-up
            required!
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Prompt</label>
            <Textarea
              placeholder="Enter a prompt to optimize... (e.g., 'Write a marketing email')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleOptimize}
                disabled={loading || !prompt.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Optimize
                  </>
                )}
              </Button>
              {loading && (
                <Button onClick={handleStop} variant="outline">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
              {output && (
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* Output Section */}
          {(output || loading) && (
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <label className="text-sm font-medium">Optimized Result</label>
              <div
                ref={outputRef}
                className="flex-1 p-4 bg-muted rounded-md overflow-y-auto border"
              >
                {output ? (
                  <p className="whitespace-pre-wrap text-sm">{output}</p>
                ) : loading ? (
                  <TypingIndicator />
                ) : null}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-2">
                    Suggestions:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {suggestions.map((suggestion, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && !output && (
            <div className="flex-1 flex items-center justify-center">
              <EgyptianLoading />
            </div>
          )}

          {/* Call to Action */}
          {!loading && output && (
            <div className="p-4 bg-primary/10 rounded-md text-center">
              <p className="text-sm font-medium mb-2">
                Like what you see? Sign up for full access!
              </p>
              <Button size="sm" onClick={() => (window.location.href = "/signup")}>
                Create Free Account
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
