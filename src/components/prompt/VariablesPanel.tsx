'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle, 
  Check, 
  RefreshCw,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { usePromptStore } from '@/store/usePromptStore';
import { cn } from '@/lib/utils';

interface VariablesPanelProps {
  className?: string;
  compact?: boolean;
}

export function VariablesPanel({ className, compact = false }: VariablesPanelProps) {
  const {
    templates,
    selectedTemplateId,
    variables,
    setVariable,
    setVariables,
  } = usePromptStore();

  const selectedTemplate = selectedTemplateId 
    ? templates.find(t => t.id === selectedTemplateId) 
    : null;

  if (!selectedTemplate) {
    return (
      <Card className={cn("pharaoh-card", className)}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Wand2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No Template Selected</p>
            <p className="text-sm">Choose a template to configure variables</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const templateVariables = selectedTemplate.variables || [];
  const hasRequiredMissing = templateVariables.some(
    variable => variable.required && (!variables[variable.name] || variables[variable.name] === '')
  );

  const resetToDefaults = () => {
    const defaultVars: Record<string, string | number | boolean> = {};
    templateVariables.forEach(variable => {
      if (variable.default !== undefined) {
        defaultVars[variable.name] = variable.default;
      }
    });
    setVariables(defaultVars);
  };

  const clearAllVariables = () => {
    setVariables({});
  };

  const renderVariableInput = (variable: typeof templateVariables[0]) => {
    const value = variables[variable.name] ?? '';
    const hasError = variable.required && (!value || value === '');

    const handleChange = (newValue: string | number | boolean) => {
      setVariable(variable.name, newValue);
    };

    const inputClassName = cn(
      "transition-all duration-200",
      hasError && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
    );

    switch (variable.type) {
      case 'textarea':
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={variable.placeholder}
            className={inputClassName}
            rows={compact ? 3 : 4}
          />
        );

      case 'select':
        return (
          <Select
            value={String(value)}
            onValueChange={(newValue) => handleChange(newValue)}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={variable.placeholder || `Select ${variable.label}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={String(value)}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder={variable.placeholder}
            className={inputClassName}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleChange(checked)}
            />
            <label className="text-sm">
              {Boolean(value) ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        );

      default: // text
        return (
          <Input
            type="text"
            value={String(value)}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={variable.placeholder}
            className={inputClassName}
          />
        );
    }
  };

  return (
    <Card className={cn("pharaoh-card", className)}>
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display font-semibold text-hieroglyph">
            Template Variables
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasRequiredMissing && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Missing Required
              </Badge>
            )}
            {!hasRequiredMissing && templateVariables.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </div>
        
        {!compact && (
          <p className="text-sm text-muted-foreground">
            Configure the variables for &quot;{selectedTemplate.title}&quot;
          </p>
        )}
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "space-y-3")}>
        {templateVariables.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">This template has no configurable variables</p>
          </div>
        ) : (
          <>
            {/* Variable Inputs */}
            {templateVariables.map((variable) => {
              const hasError = variable.required && (!variables[variable.name] || variables[variable.name] === '');
              
              return (
                <div key={variable.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor={variable.name}
                      className={cn(
                        "text-sm font-medium flex items-center gap-2",
                        hasError && "text-red-600"
                      )}
                    >
                      {variable.label}
                      {variable.required && (
                        <span className="text-red-500">*</span>
                      )}
                      {variable.description && (
                        <div className="group relative">
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                            {variable.description}
                          </div>
                        </div>
                      )}
                    </label>
                    <div className="flex items-center gap-1">
                      {variable.type !== 'text' && (
                        <Badge variant="outline" className="text-xs">
                          {variable.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {renderVariableInput(variable)}
                  
                  {hasError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      This field is required
                    </p>
                  )}
                </div>
              );
            })}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllVariables}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Validation Summary */}
            {templateVariables.length > 0 && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span>
                    {templateVariables.filter(v => variables[v.name] && variables[v.name] !== '').length} of {templateVariables.length} completed
                  </span>
                  <span>
                    {templateVariables.filter(v => v.required).length} required
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-pharaoh h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(templateVariables.filter(v => variables[v.name] && variables[v.name] !== '').length / templateVariables.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
