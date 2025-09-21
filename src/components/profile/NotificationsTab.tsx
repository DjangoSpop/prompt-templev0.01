
// File: src/components/profile/
import React from 'react';
import { Card } from '@/components/ui/card-unified';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Trophy, 
  CreditCard,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useProfileStore } from '../ProfilePage';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  template_updates: boolean;
  achievement_alerts: boolean;
  credit_alerts: boolean;
  security_alerts: boolean;
  digest_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export const NotificationsTab = () => {
  const [settings, setSettings] = React.useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    marketing_emails: false,
    template_updates: true,
    achievement_alerts: true,
    credit_alerts: true,
    security_alerts: true,
    digest_frequency: 'weekly',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const notificationTypes = [
    {
      id: 'template_updates',
      title: 'Template Updates',
      description: 'New templates and updates to your favorites',
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      id: 'achievement_alerts',
      title: 'Achievements',
      description: 'Level ups, badges, and milestone rewards',
      icon: Trophy,
      color: 'text-yellow-500'
    },
    {
      id: 'credit_alerts',
      title: 'Credit Alerts',
      description: 'Low balance and usage notifications',
      icon: CreditCard,
      color: 'text-green-500'
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Login attempts and account security',
      icon: Settings,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          General Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-fg/60" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-fg/60">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-fg/60" />
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-fg/60">Browser and mobile push notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.push_notifications}
              onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-fg/60" />
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-fg/60">Product updates and promotional content</p>
              </div>
            </div>
            <Switch
              checked={settings.marketing_emails}
              onCheckedChange={(checked) => updateSetting('marketing_emails', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Notification Types */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-fg mb-4">Notification Types</h3>
        
        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <div>
                    <Label>{type.title}</Label>
                    <p className="text-sm text-fg/60">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[type.id as keyof NotificationSettings] as boolean}
                  onCheckedChange={(checked) => updateSetting(type.id as keyof NotificationSettings, checked)}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Digest Frequency */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-fg mb-4">Email Digest</h3>
        
        <div className="space-y-3">
          <Label>Frequency</Label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'never', label: 'Never' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={settings.digest_frequency === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('digest_frequency', option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
          <VolumeX className="h-5 w-5" />
          Quiet Hours
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Quiet Hours</Label>
              <p className="text-sm text-fg/60">Pause non-urgent notifications during specified hours</p>
            </div>
            <Switch
              checked={settings.quiet_hours_enabled}
              onCheckedChange={(checked) => updateSetting('quiet_hours_enabled', checked)}
            />
          </div>
          
          {settings.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet_start">Start Time</Label>
                <input
                  id="quiet_start"
                  type="time"
                  value={settings.quiet_hours_start}
                  onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                  className="w-full mt-1 p-2 border border-border rounded-lg bg-card text-fg"
                />
              </div>
              <div>
                <Label htmlFor="quiet_end">End Time</Label>
                <input
                  id="quiet_end"
                  type="time"
                  value={settings.quiet_hours_end}
                  onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                  className="w-full mt-1 p-2 border border-border rounded-lg bg-card text-fg"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};