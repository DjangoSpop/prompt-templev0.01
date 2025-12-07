/**
 * Example implementations of Modal and FormModal components
 * Demonstrates real-world usage patterns
 */

'use client';

import React from 'react';
import { FormModal, useFormModal, type FormField } from '@/components/ui/form-modal';
import { Modal, useModal, ConfirmModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

// ============================================
// Edit Product Name Modal Example
// ============================================

interface ProductData {
  name: string;
  description?: string;
}

export function EditProductNameModal({
  isOpen,
  onClose,
  currentName,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  onSave: (name: string) => Promise<void>;
}) {
  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      placeholder: 'Enter product name...',
      required: true,
      maxLength: 100,
      helperText: 'The product name for this template',
      validation: (value) => {
        if (value && value.length < 3) {
          return 'Name must be at least 3 characters';
        }
        return null;
      },
    },
  ];

  return (
    <FormModal<{ name: string }>
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Product Name"
      description="The product name for this template"
      fields={fields}
      initialValues={{ name: currentName || '' }}
      submitText="Save"
      cancelText="Cancel"
      size="sm"
      onSubmit={async (data) => {
        await onSave(data.name);
      }}
    />
  );
}

// ============================================
// Edit Template Modal Example (Complex Form)
// ============================================

interface TemplateData {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  tags: string;
  enableNotifications: boolean;
}

export function EditTemplateModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<TemplateData>;
  onSave: (data: TemplateData) => Promise<void>;
}) {
  const fields: FormField[] = [
    {
      name: 'title',
      label: 'Template Title',
      type: 'text',
      placeholder: 'Enter template title...',
      required: true,
      maxLength: 100,
      helperText: 'A descriptive title for your template',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe your template...',
      required: true,
      rows: 4,
      maxLength: 500,
      helperText: 'Explain what this template does and when to use it',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Marketing', value: 'marketing' },
        { label: 'Sales', value: 'sales' },
        { label: 'Support', value: 'support' },
        { label: 'Development', value: 'development' },
        { label: 'Design', value: 'design' },
      ],
      helperText: 'Select the most relevant category',
    },
    {
      name: 'visibility',
      label: 'Visibility',
      type: 'select',
      required: true,
      defaultValue: 'private',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
      ],
      helperText: 'Control who can see this template',
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'text',
      placeholder: 'marketing, email, automation',
      helperText: 'Comma-separated tags for better organization',
    },
    {
      name: 'enableNotifications',
      label: 'Enable email notifications for updates',
      type: 'checkbox',
      defaultValue: false,
      helperText: 'Get notified when someone uses your template',
    },
  ];

  return (
    <FormModal<TemplateData>
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Template"
      description="Update your template details and settings"
      fields={fields}
      initialValues={initialData}
      submitText="Save Changes"
      size="lg"
      onSubmit={onSave}
    />
  );
}

// ============================================
// Delete Confirmation Modal Example
// ============================================

export function DeleteTemplateModal({
  isOpen,
  onClose,
  templateName,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Template"
      description={`Are you sure you want to delete "${templateName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  );
}

// ============================================
// Custom Modal Example (Advanced)
// ============================================

export function CustomContentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Step ${step} of ${totalSteps}`}
      description="Complete all steps to finish setup"
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep((prev) => Math.min(totalSteps, prev + 1))}>
              Next
            </Button>
          ) : (
            <Button
              onClick={() => {
                toast.success('Setup completed!');
                onClose();
              }}
            >
              Finish
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Step progress */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="py-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Welcome!</h3>
              <p className="text-muted-foreground">
                Let's get you started with your first template.
              </p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Your Category</h3>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {['Marketing', 'Sales', 'Support', 'Development'].map((cat) => (
                  <button
                    key={cat}
                    className="p-4 border border-border rounded-lg hover:border-primary hover:bg-muted transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">All Set!</h3>
              <p className="text-muted-foreground">
                You're ready to start creating amazing templates.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Demo Component (Shows all examples)
// ============================================

export function ModalExamples() {
  const editProductModal = useFormModal();
  const editTemplateModal = useFormModal();
  const deleteModal = useModal();
  const customModal = useModal();

  const handleSaveProductName = async (name: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Product name saved:', name);
    toast.success(`Product name updated to "${name}"`);
  };

  const handleSaveTemplate = async (data: TemplateData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Template saved:', data);
  };

  const handleDelete = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Template deleted successfully');
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Modal Examples</h2>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={editProductModal.open} variant="outline">
          <Pencil className="w-4 h-4 mr-2" />
          Edit Product Name
        </Button>

        <Button onClick={editTemplateModal.open} variant="outline">
          <Pencil className="w-4 h-4 mr-2" />
          Edit Template (Complex)
        </Button>

        <Button onClick={deleteModal.open} variant="outline">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Confirmation
        </Button>

        <Button onClick={customModal.open} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Custom Modal
        </Button>
      </div>

      {/* Modals */}
      <EditProductNameModal
        isOpen={editProductModal.isOpen}
        onClose={editProductModal.close}
        currentName="My Awesome Product"
        onSave={handleSaveProductName}
      />

      <EditTemplateModal
        isOpen={editTemplateModal.isOpen}
        onClose={editTemplateModal.close}
        initialData={{
          title: 'Email Template',
          description: 'A professional email template',
          category: 'marketing',
          visibility: 'public',
        }}
        onSave={handleSaveTemplate}
      />

      <DeleteTemplateModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        templateName="Email Template"
        onConfirm={handleDelete}
      />

      <CustomContentModal isOpen={customModal.isOpen} onClose={customModal.close} />
    </div>
  );
}
