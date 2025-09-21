"use client";

import React, { useEffect, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card-unified';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { authService } from '@/lib/api/auth';

type Preferences = any;

export const PreferencesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const profile = queryClient.getQueryData(['profile']);

  const [theme, setTheme] = useState(profile?.preferences?.theme || 'pharaonic');
  const [language, setLanguage] = useState(profile?.preferences?.language || 'en');
  const [emailNotif, setEmailNotif] = useState(profile?.preferences?.emailNotifications ?? true);

  useEffect(() => {
    setTheme(profile?.preferences?.theme || 'pharaonic');
    setLanguage(profile?.preferences?.language || 'en');
    setEmailNotif(profile?.preferences?.emailNotifications ?? true);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (changes: Partial<Preferences>) => {
      // Prefer a dedicated endpoint if available
      if ((authService as any).updatePreferences) {
        return (authService as any).updatePreferences(changes);
      }
      return authService.updateProfile({ preferences: changes });
    },
    onSuccess(data) {
      queryClient.setQueryData(['profile'], data);
      toast.success('Preferences saved');
    },
    onError(err: any) {
      toast.error(err?.message || 'Failed to save preferences');
    },
  });

  const handleSave = () => {
    mutation.mutate({ theme, language, emailNotifications: emailNotif });
  };

  return (
    <Card variant="temple" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Preferences</h3>

      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col">
          <span className="text-fg/80 text-sm mb-1">Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="input">
            <option value="pharaonic">Pharaonic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-fg/80 text-sm mb-1">Language</span>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
          <span className="text-fg/80 text-sm">Email notifications</span>
        </label>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleSave} disabled={mutation.isPending}>
            Save Preferences
          </Button>
          {mutation.isPending && <span className="text-sm text-fg/60">Saving...</span>}
        </div>
      </div>
    </Card>
  );
};

export default PreferencesTab;
