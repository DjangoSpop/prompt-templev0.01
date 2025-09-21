
// File: src/components/profile/
import React from 'react';
import { Card } from '@/components/ui/card-unified';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  Download, 
  Trash2,
  Bell
} from 'lucide-react';
import { PasswordChangeModal } from './PasswordChangeModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { ExportDataButton } from './ExportDataButton';

interface ProfileSidebarProps {
  profile: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileSidebar = ({ profile, activeTab, onTabChange }: ProfileSidebarProps) => {
  const menuItems = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: User,
      description: 'Basic information and avatar'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Settings,
      description: 'Theme, language, and AI settings'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      description: 'Plan and billing information'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Shield,
      description: 'Data and privacy settings'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Email and push preferences'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-fg mb-4">Settings</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-accent/10 text-accent' 
                    : 'hover:bg-card/50 text-fg/70'
                }`}
              >
                <Icon className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-fg/50">{item.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </Card>

      {/* Account Actions */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-fg mb-4">Account Actions</h3>
        <div className="space-y-3">
          <PasswordChangeModal />
          <ExportDataButton />
          <DeleteAccountModal username={profile?.username || ''} />
        </div>
      </Card>

      {/* Account Status */}
      <Card variant="temple" padding="lg">
        <h3 className="text-lg font-semibold text-fg mb-4">Account Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-fg/60">Status</span>
            <Badge variant={profile?.is_premium ? "default" : "secondary"}>
              {profile?.is_premium ? 'Premium' : 'Free'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-fg/60">Level</span>
            <span className="font-medium">{profile?.level || 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg/60">Credits</span>
            <span className="font-medium text-accent">{profile?.credits || 0}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};