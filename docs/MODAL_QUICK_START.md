# Modal System - Quick Start Guide

## 🚀 Quick Start

### 1. Simple Modal (Basic)

```tsx
import { Modal, useModal } from '@/components/ui/modal';

function MyComponent() {
  const modal = useModal();

  return (
    <>
      <button onClick={modal.open}>Open Modal</button>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Hello World"
        size="md"
      >
        <p>This is a simple modal!</p>
      </Modal>
    </>
  );
}
```

### 2. Form Modal (Edit Product Name - from screenshot)

```tsx
import { FormModal, useFormModal } from '@/components/ui/form-modal';

function EditProductNameButton() {
  const modal = useFormModal();

  const fields = [
    {
      name: 'productName',
      label: 'Product Name',
      type: 'text' as const,
      placeholder: 'Enter product name...',
      required: true,
      maxLength: 100,
      helperText: 'The product name for this template',
    },
  ];

  const handleSave = async (data: { productName: string }) => {
    // Your API call here
    await fetch('/api/products/update', {
      method: 'POST',
      body: JSON.stringify({ name: data.productName }),
    });
  };

  return (
    <>
      <button onClick={modal.open}>✏️ Edit Product Name</button>
      
      <FormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Edit Product Name"
        description="The product name for this template"
        fields={fields}
        initialValues={{ productName: 'Current Product Name' }}
        submitText="Save"
        cancelText="Cancel"
        size="sm"
        onSubmit={handleSave}
      />
    </>
  );
}
```

### 3. Delete Confirmation

```tsx
import { ConfirmModal, useModal } from '@/components/ui/modal';

function DeleteButton() {
  const modal = useModal();

  const handleDelete = async () => {
    await fetch('/api/items/delete', { method: 'DELETE' });
  };

  return (
    <>
      <button onClick={modal.open}>🗑️ Delete</button>
      
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onConfirm={handleDelete}
        title="Delete Item"
        description="Are you sure? This cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
```

## 📋 Common Patterns

### Multi-Field Form

```tsx
const fields = [
  {
    name: 'title',
    label: 'Title',
    type: 'text' as const,
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    rows: 4,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ],
  },
  {
    name: 'isPublic',
    label: 'Make this public',
    type: 'checkbox' as const,
  },
];
```

### Custom Validation

```tsx
const fields = [
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    required: true,
    validation: (value: string) => {
      if (!value.endsWith('@company.com')) {
        return 'Must use company email';
      }
      return null;
    },
  },
];
```

### Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

<Modal
  isOpen={modal.isOpen}
  onClose={modal.close}
  isLoading={isLoading}
  title="Loading..."
>
  Content will show after loading
</Modal>
```

## 🎨 Styling

### Sizes

```tsx
size="sm"    // Small (max-w-md)
size="md"    // Medium (max-w-lg) - Default
size="lg"    // Large (max-w-2xl)
size="xl"    // Extra Large (max-w-4xl)
size="full"  // Full Width (max-w-7xl)
```

### Custom Classes

```tsx
<Modal
  className="custom-modal"
  overlayClassName="custom-overlay"
  contentClassName="custom-content"
>
  ...
</Modal>
```

## ⚙️ Configuration Options

### Modal Props

```tsx
interface ModalProps {
  isOpen: boolean;              // Required
  onClose: () => void;          // Required
  title?: string;               // Optional
  description?: string;         // Optional
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;    // Default: true
  closeOnBackdropClick?: boolean; // Default: true
  closeOnEscape?: boolean;      // Default: true
  preventBodyScroll?: boolean;  // Default: true
  isLoading?: boolean;          // Default: false
  footer?: ReactNode;           // Optional
  headerActions?: ReactNode;    // Optional
}
```

### FormModal Props

```tsx
interface FormModalProps {
  isOpen: boolean;              // Required
  onClose: () => void;          // Required
  onSubmit: (data) => Promise<void>; // Required
  title: string;                // Required
  fields: FormField[];          // Required
  description?: string;
  initialValues?: object;
  submitText?: string;          // Default: "Save"
  cancelText?: string;          // Default: "Cancel"
  size?: 'sm' | 'md' | 'lg' | 'xl';
  validateOnChange?: boolean;   // Default: true
  showSuccessMessage?: boolean; // Default: true
  closeOnSuccess?: boolean;     // Default: true
}
```

## 🎯 Field Types

### Text
```tsx
{ name: 'field', label: 'Label', type: 'text' }
```

### Textarea
```tsx
{ name: 'field', label: 'Label', type: 'textarea', rows: 4 }
```

### Number
```tsx
{ name: 'field', label: 'Label', type: 'number', min: 0, max: 100 }
```

### Email
```tsx
{ name: 'field', label: 'Label', type: 'email' }
```

### Select
```tsx
{
  name: 'field',
  label: 'Label',
  type: 'select',
  options: [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]
}
```

### Checkbox
```tsx
{ name: 'field', label: 'Accept terms', type: 'checkbox' }
```

### Date
```tsx
{ name: 'field', label: 'Date', type: 'date' }
```

## 🔥 Tips & Tricks

### 1. Prevent Close on Backdrop Click
```tsx
<Modal closeOnBackdropClick={false}>
```

### 2. Disable ESC Key
```tsx
<Modal closeOnEscape={false}>
```

### 3. Custom Footer Buttons
```tsx
<Modal
  footer={
    <>
      <button onClick={handleAction1}>Action 1</button>
      <button onClick={handleAction2}>Action 2</button>
      <button onClick={modal.close}>Close</button>
    </>
  }
>
```

### 4. Header Actions
```tsx
<Modal
  headerActions={
    <button onClick={handleHelp}>
      <HelpCircle className="w-4 h-4" />
    </button>
  }
>
```

### 5. Multiple Modals
```tsx
const modal1 = useModal();
const modal2 = useModal();

<>
  <Modal isOpen={modal1.isOpen} onClose={modal1.close}>
    Modal 1
  </Modal>
  
  <Modal isOpen={modal2.isOpen} onClose={modal2.close}>
    Modal 2
  </Modal>
</>
```

## 🐛 Troubleshooting

### Modal not closing
- Check if `onClose` is properly connected
- Verify `isOpen` state is updating

### Validation not working
- Ensure `required` is set on fields
- Check custom validation function returns `string | null`

### Scroll issues
- Ensure only one modal is open at a time
- Check `preventBodyScroll` prop

### Form not submitting
- Verify `onSubmit` is async function
- Check console for errors
- Ensure all required fields are filled

## 📚 Full Examples

See `src/components/examples/modal-examples.tsx` for complete working examples including:
- Edit Product Name (like screenshot)
- Complex Template Editor
- Delete Confirmations
- Custom Multi-Step Modals
- Conditional Fields
- Dynamic Validation

## 🚨 Important Notes

1. **Always use `useModal()` hook** for state management
2. **FormModal handles validation automatically** - just define fields
3. **Modal renders in portal** - won't affect parent layout
4. **Body scroll is locked** when modal is open
5. **Focus is trapped** inside modal for accessibility
6. **ESC key closes modal** by default
7. **Unsaved changes** are detected automatically in FormModal

---

**Need help?** Check the full documentation in `docs/MODAL_SYSTEM.md`
