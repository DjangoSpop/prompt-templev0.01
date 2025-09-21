// File: src/components/profile/ExportDataButton.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ExportDataButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/v2/auth/export-data/?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptcraft-data.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('json')}
        disabled={isExporting}
      >
        <FileText className="h-4 w-4 mr-2" />
        Export JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('csv')}
        disabled={isExporting}
      >
        <Database className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
};
