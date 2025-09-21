'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Info } from 'lucide-react';
import { extractTemplateVariables, prepareRenderVariables } from '@/lib/api/orchestrator';
import type { Template, Variable } from '@/lib/types';

interface VariableFormProps {
  template: Template;
  onSubmit: (variables: Record<string, string>) => void;
  isLoading?: boolean;
  initialValues?: Record<string, string>;
}

export default function VariableForm({ 
  template, 
  onSubmit, 
  isLoading = false,
  initialValues = {} 
}: VariableFormProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract variables from template content and combine with defined variables
  const allVariables = React.useMemo(() => {
    const contentVars = extractTemplateVariables(template.content);
    const definedVars = template.variables || [];
    
    // Create a map of defined variables for quick lookup
    const definedVarMap = new Map(definedVars.map((v: Variable) => [v.name, v]));
    
    // Combine content variables with defined variables
    const combined = contentVars.map(varName => {
      const defined = definedVarMap.get(varName);
      return defined || {
        id: varName,
        name: varName,
        type: 'text' as const,
        required: true,
        description: `Variable: ${varName}`,
      };
    });
    
    // Add any defined variables not found in content
    definedVars.forEach((defined: Variable) => {
      if (!contentVars.includes(defined.name)) {
        combined.push(defined);
      }
    });
    
    return combined;
  }, [template]);

  useEffect(() => {
    // Initialize variables with default values
    const initialVars: Record<string, string> = {};
    
    allVariables.forEach((variable: Variable) => {
      initialVars[variable.name] = 
        initialValues[variable.name] || 
        variable.default_value || 
        '';
    });
    
    setVariables(initialVars);
    setErrors({});
  }, [template, initialValues, allVariables]);

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    allVariables.forEach((variable: Variable) => {
      const value = variables[variable.name]?.trim();
      
      if (variable.required && !value) {
        newErrors[variable.name] = 'This field is required';
      }
      
      if (variable.type === 'number' && value && isNaN(Number(value))) {
        newErrors[variable.name] = 'Please enter a valid number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const preparedVariables = prepareRenderVariables(template, variables);
    onSubmit(preparedVariables);
  };

  const handleReset = () => {
    const resetVars: Record<string, string> = {};
    allVariables.forEach((variable: Variable) => {
      resetVars[variable.name] = variable.default_value || '';
    });
    setVariables(resetVars);
    setErrors({});
  };

  const renderField = (variable: Variable) => {
    const value = variables[variable.name] || '';
    const error = errors[variable.name];
    const hasError = !!error;

    const baseClasses = `w-full p-3 bg-bg-tertiary border rounded-lg text-text-primary placeholder-text-muted transition-colors focus:outline-none focus:ring-1 ${
      hasError 
        ? 'border-red focus:border-red focus:ring-red' 
        : 'border-border focus:border-brand focus:ring-brand'
    }`;

    switch (variable.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description || `Enter ${variable.name}...`}
            rows={4}
            className={`${baseClasses} resize-none`}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className={baseClasses}
          >
            <option value="">Select an option...</option>
            {variable.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description || `Enter ${variable.name}...`}
            className={baseClasses}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description || `Enter ${variable.name}...`}
            className={baseClasses}
          />
        );
    }
  };

  if (allVariables.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-lg p-6 border border-border">
        <div className="text-center">
          <Info className="w-8 h-8 text-interactive-muted mx-auto mb-3" />
          <h3 className="text-text-primary font-medium mb-2">No Variables Required</h3>
          <p className="text-text-secondary text-sm mb-4">
            This template doesn&apos;t require any customization.
          </p>
          <button
            onClick={() => onSubmit({})}
            disabled={isLoading}
            className="px-6 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-text-primary font-medium">Template Variables</h3>
        <p className="text-text-secondary text-sm mt-1">
          Fill in the variables to customize your template
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {allVariables.map((variable: Variable) => (
            <div key={variable.name}>
              <label className="block text-text-primary font-medium mb-2">
                {variable.name}
                {variable.required && (
                  <span className="text-red ml-1">*</span>
                )}
              </label>
              
              {variable.description && (
                <p className="text-text-muted text-sm mb-2">
                  {variable.description}
                </p>
              )}
              
              {renderField(variable)}
              
              {errors[variable.name] && (
                <p className="text-red text-sm mt-1">
                  {errors[variable.name]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-interactive-hover/10 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}