"use client";

import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-unified';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { authService } from '@/lib/api/auth';

type Profile = any;

export const PersonalInfoTab: React.FC = () => {
  const queryClient = useQueryClient();
  const profile: Profile | undefined = queryClient.getQueryData(['profile']);

  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(profile?.name || '');
    setEmail(profile?.email || '');
  }, [profile?.name, profile?.email]);

  const mutation = useMutation({
    mutationFn: (changes: Partial<Profile>) => authService.updateProfile(changes),
    onSuccess(data) {
      queryClient.setQueryData(['profile'], data);
      toast.success('Profile updated');
    },
    onError(err: any) {
      toast.error(err?.message || 'Failed to update profile');
    },
  });

  const handleSave = async () => {
    setLoading(true);
    mutation.mutate({ name, email });
    setLoading(false);
  };

  return (
    <Card variant="temple" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col">
          <span className="text-fg/80 text-sm mb-1">Full name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-fg/80 text-sm mb-1">Email</span>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleSave} disabled={mutation.isPending || loading}>
            Save
          </Button>
          {mutation.isPending && <span className="text-sm text-fg/60">Saving...</span>}
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoTab;
