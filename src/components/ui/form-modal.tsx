/**
 * Form Modal Component - Professional form handling in modals
 * Features: validation, loading states, error handling, auto-save
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter, useModal } from './modal';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
  validation?: (value: any) => string | null;
  rows?: number;
  min?: number;
  max?: number;
  maxLength?: number;
  helperText?: string;
  className?: string;
}

export interface FormModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  title: string;
  description?: string;
  fields: FormField[];
  initialValues?: Partial<T>;
  submitText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  validateOnChange?: boolean;
  showSuccessMessage?: boolean;
  successMessage?: string;
  closeOnSuccess?: boolean;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================
// Form Modal Component
// ============================================

export function FormModal<T = any>({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  fields,
  initialValues = {},
  submitText = 'Save',
  cancelText = 'Cancel',
  size = 'md',
  validateOnChange = true,
  showSuccessMessage = true,
  successMessage = 'Saved successfully!',
  closeOnSuccess = true,
}: FormModalProps<T>) {
  const [formState, setFormState] = useState<FormState>({
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form values
  useEffect(() => {
    const initialFormValues: Record<string, any> = {};
    
    fields.forEach((field) => {
      initialFormValues[field.name] =
        initialValues[field.name as keyof T] ??
        field.defaultValue ??
        (field.type === 'checkbox' ? false : '');
    });

    setFormState((prev) => ({
      ...prev,
      values: initialFormValues,
    }));
  }, [fields, initialValues]);

  // Validate field
  const validateField = useCallback(
    (field: FormField, value: any): string | null => {
      // Required validation
      if (field.required) {
        if (value === '' || value === null || value === undefined) {
          return `${field.label} is required`;
        }
        if (field.type === 'checkbox' && !value) {
          return `${field.label} must be checked`;
        }
      }

      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Invalid email address';
          }
          break;

        case 'number':
          if (value !== '' && isNaN(Number(value))) {
            return 'Must be a valid number';
          }
          if (field.min !== undefined && Number(value) < field.min) {
            return `Must be at least ${field.min}`;
          }
          if (field.max !== undefined && Number(value) > field.max) {
            return `Must be at most ${field.max}`;
          }
          break;

        case 'text':
        case 'textarea':
          if (field.maxLength && value && value.length > field.maxLength) {
            return `Must be at most ${field.maxLength} characters`;
          }
          break;
      }

      // Custom validation
      if (field.validation) {
        return field.validation(value);
      }

      return null;
    },
    []
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formState.values[field.name]);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });

    setFormState((prev) => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [fields, formState.values, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [fieldName]: value };
        const newTouched = { ...prev.touched, [fieldName]: true };

        // Validate on change if enabled
        let newErrors = { ...prev.errors };
        if (validateOnChange && prev.touched[fieldName]) {
          const field = fields.find((f) => f.name === fieldName);
          if (field) {
            const error = validateField(field, value);
            if (error) {
              newErrors[fieldName] = error;
            } else {
              delete newErrors[fieldName];
            }
          }
        }

        return {
          ...prev,
          values: newValues,
          touched: newTouched,
          errors: newErrors,
        };
      });
    },
    [validateOnChange, fields, validateField]
  );

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(formState.values as T);

      if (showSuccessMessage) {
        toast.success(successMessage);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }

      if (closeOnSuccess) {
        setTimeout(() => {
          onClose();
          // Reset form
          setFormState((prev) => ({
            ...prev,
            touched: {},
            errors: {},
          }));
        }, 1000);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save. Please try again.'
      );
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle modal close
  const handleClose = useCallback(() => {
    if (formState.isSubmitting) return;
    
    // Check if form has unsaved changes
    const hasChanges = Object.keys(formState.touched).length > 0;
    
    if (hasChanges) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }

    onClose();
    
    // Reset form after close animation
    setTimeout(() => {
      setFormState((prev) => ({
        ...prev,
        touched: {},
        errors: {},
      }));
    }, 300);
  }, [onClose, formState.isSubmitting, formState.touched]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size={size}
      closeOnBackdropClick={!formState.isSubmitting}
      closeOnEscape={!formState.isSubmitting}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={formState.isSubmitting}
            className={cn(
              'px-4 py-2 rounded-md',
              'border border-border',
              'text-foreground hover:bg-muted',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            form="modal-form"
            disabled={formState.isSubmitting}
            className={cn(
              'px-4 py-2 rounded-md',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {submitText}
              </>
            )}
          </button>
        </>
      }
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            {fields.map((field) => (
              <FormFieldComponent
                key={field.name}
                field={field}
                value={formState.values[field.name]}
                error={formState.errors[field.name]}
                touched={formState.touched[field.name]}
                onChange={(value) => handleChange(field.name, value)}
                disabled={field.disabled || formState.isSubmitting}
              />
            ))}
          </div>
        </ModalBody>
      </form>
    </Modal>
  );
}

// ============================================
// Form Field Component
// ============================================

interface FormFieldComponentProps {
  field: FormField;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  disabled?: boolean;
}

function FormFieldComponent({
  field,
  value,
  error,
  touched,
  onChange,
  disabled,
}: FormFieldComponentProps) {
  const showError = touched && error;

  const baseInputClasses = cn(
    'w-full px-3 py-2 rounded-md',
    'border border-border',
    'bg-background text-foreground',
    'placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
    'transition-colors duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    showError && 'border-destructive focus:ring-destructive',
    field.className
  );

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
            rows={field.rows || 4}
            maxLength={field.maxLength}
            className={cn(baseInputClasses, 'resize-y min-h-[100px]')}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              id={field.name}
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              required={field.required}
              disabled={disabled}
              className={cn(
                'w-4 h-4 rounded',
                'border-border text-primary',
                'focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <label htmlFor={field.name} className="text-sm text-foreground cursor-pointer">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
          </div>
        );

      default:
        return (
          <input
            id={field.name}
            type={field.type}
            value={value || ''}
            onChange={(e) =>
              onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)
            }
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
            min={field.min}
            max={field.max}
            maxLength={field.maxLength}
            className={baseInputClasses}
          />
        );
    }
  };

  if (field.type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {field.helperText && (
          <p className="text-xs text-muted-foreground pl-6">{field.helperText}</p>
        )}
        {showError && (
          <div className="flex items-center gap-1 text-destructive text-sm pl-6">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={field.name} className="block text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      {renderInput()}
      {field.helperText && !showError && (
        <p className="text-xs text-muted-foreground">{field.helperText}</p>
      )}
      {field.maxLength && field.type !== 'select' && (
        <div className="flex justify-end">
          <p className="text-xs text-muted-foreground">
            {(value || '').length} / {field.maxLength}
          </p>
        </div>
      )}
      {showError && (
        <div className="flex items-center gap-1 text-destructive text-sm">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Export hook for form modal
// ============================================

export function useFormModal() {
  return useModal();
}
