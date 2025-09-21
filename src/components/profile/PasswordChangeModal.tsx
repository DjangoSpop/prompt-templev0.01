
// File: src/components/profile/
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input-unified';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const PasswordChangeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const { changePassword, isChangingPassword } = useProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
      },
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const isValid = formData.old_password.length >= 8 && 
                  formData.new_password.length >= 8 && 
                  formData.new_password === formData.confirm_password;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="old_password">Current Password</Label>
            <div className="relative">
              <Input
                id="old_password"
                type={showPasswords.old ? 'text' : 'password'}
                value={formData.old_password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  old_password: e.target.value,
                }))}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fg/50"
              >
                {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  new_password: e.target.value,
                }))}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fg/50"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-fg/60 mt-1">
              Must be at least 8 characters long
            </p>
          </div>
          
          <div>
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  confirm_password: e.target.value,
                }))}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fg/50"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.confirm_password && formData.new_password !== formData.confirm_password && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isChangingPassword}
              className="flex-1"
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
