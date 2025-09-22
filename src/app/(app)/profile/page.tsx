'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card-unified';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input-unified';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Settings,
  Crown,
  Trophy,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Globe,
  Eye,
  Camera,
  Save,
  Loader2,
  Star,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useUpdateProfile, useUserStats } from '@/hooks/api/useAuth';
import type { UserProfile } from '@/lib/api/typed-client';

// Profile form data interface
interface ProfileFormData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: File | null;
  theme_preference?: string;
  language_preference?: string;
  ai_assistance_enabled?: boolean;
  analytics_enabled?: boolean;
}

// User Stats Component
const UserStatsComponent = ({ stats }: { stats: any }) => {
  if (!stats) return null;

  const nextLevelProgress = stats.gamification?.level_progress || 0;

  const statItems = [
    {
      label: 'Templates Used',
      value: stats.total_templates_used || 0,
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      label: 'Total Renders',
      value: stats.total_renders || 0,
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      label: 'Current Level',
      value: stats.gamification?.level || 1,
      icon: Trophy,
      color: 'text-purple-500'
    },
    {
      label: 'Experience Points',
      value: stats.gamification?.experience_points || 0,
      icon: Star,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <div className="bg-card/50 rounded-lg p-6 border border-accent/20">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-fg">
            Level {stats.gamification?.level || 1} - {stats.gamification?.rank || 'Novice'}
          </h3>
        </div>
        <Progress value={nextLevelProgress} className="h-3 mb-2" />
        <p className="text-sm text-fg/70">
          {stats.gamification?.experience_points || 0} / {stats.gamification?.next_level_xp || 100} XP
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat, index) => (
          <Card key={index} className="p-4 text-center border-accent/20">
            <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold text-fg">{stat.value}</div>
            <div className="text-sm text-fg/70">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      {stats.recent_activity && stats.recent_activity.length > 0 && (
        <div className="bg-card/50 rounded-lg p-6 border border-accent/20">
          <h3 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recent_activity.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div>
                  <div className="font-medium text-fg">{activity.template_name}</div>
                  <div className="text-sm text-fg/70">{activity.category}</div>
                </div>
                <div className="text-sm text-fg/50">
                  {activity.used_at && new Date(activity.used_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Personal Info Form Component
const PersonalInfoForm = ({ formData, onUpdate }: {
  formData: ProfileFormData;
  onUpdate: (field: keyof ProfileFormData, value: any) => void;
}) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={formData.avatar ? URL.createObjectURL(formData.avatar) : undefined} />
        <AvatarFallback className="text-lg">
          {formData.first_name?.[0]}{formData.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div>
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Change Avatar
        </Button>
        <p className="text-sm text-fg/70 mt-1">JPG, PNG or GIF (max 2MB)</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          value={formData.first_name || ''}
          onChange={(e) => onUpdate('first_name', e.target.value)}
          placeholder="Enter your first name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          value={formData.last_name || ''}
          onChange={(e) => onUpdate('last_name', e.target.value)}
          placeholder="Enter your last name"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea
        id="bio"
        value={formData.bio || ''}
        onChange={(e) => onUpdate('bio', e.target.value)}
        placeholder="Tell us about yourself..."
        rows={4}
      />
    </div>
  </div>
);

// Preferences Form Component
const PreferencesForm = ({ formData, onUpdate }: {
  formData: ProfileFormData;
  onUpdate: (field: keyof ProfileFormData, value: any) => void;
}) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-fg flex items-center gap-2">
        <Palette className="h-5 w-5" />
        Appearance
      </h3>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="theme">Theme Preference</Label>
          <p className="text-sm text-fg/70">Choose your preferred theme</p>
        </div>
        <select
          id="theme"
          value={formData.theme_preference || 'system'}
          onChange={(e) => onUpdate('theme_preference', e.target.value)}
          className="px-3 py-2 bg-input border border-border rounded-md text-fg"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="language">Language</Label>
          <p className="text-sm text-fg/70">Select your preferred language</p>
        </div>
        <select
          id="language"
          value={formData.language_preference || 'en'}
          onChange={(e) => onUpdate('language_preference', e.target.value)}
          className="px-3 py-2 bg-input border border-border rounded-md text-fg"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-fg flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Features
      </h3>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="ai_assistance">AI Assistance</Label>
          <p className="text-sm text-fg/70">Enable AI-powered suggestions and help</p>
        </div>
        <Switch
          id="ai_assistance"
          checked={formData.ai_assistance_enabled || false}
          onCheckedChange={(checked) => onUpdate('ai_assistance_enabled', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="analytics">Analytics</Label>
          <p className="text-sm text-fg/70">Help improve our service with usage analytics</p>
        </div>
        <Switch
          id="analytics"
          checked={formData.analytics_enabled || false}
          onCheckedChange={(checked) => onUpdate('analytics_enabled', checked)}
        />
      </div>
    </div>
  </div>
);

// Main Profile Page Component
export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState<ProfileFormData>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        avatar: null,
        theme_preference: (profile as any).theme_preference || 'system',
        language_preference: (profile as any).language_preference || 'en',
        ai_assistance_enabled: (profile as any).ai_assistance_enabled || true,
        analytics_enabled: (profile as any).analytics_enabled || true,
      });
    }
  }, [profile]);

  const handleUpdateField = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!hasChanges) return;

    const { avatar, ...updateData } = formData;
    updateProfileMutation.mutate(updateData as Partial<UserProfile>);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        avatar: null,
        theme_preference: (profile as any).theme_preference || 'system',
        language_preference: (profile as any).language_preference || 'en',
        ai_assistance_enabled: (profile as any).ai_assistance_enabled || true,
        analytics_enabled: (profile as any).analytics_enabled || true,
      });
    }
    setHasChanges(false);
    toast.success('Changes discarded');
  };

  if (profileLoading) {
    return (
      <div className="temple-background min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="temple-background min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-fg">Profile Not Found</h1>
            <p className="text-fg/60">Unable to load your profile information.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="temple-background min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-fg flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3">
            <User className="h-8 w-8 text-accent" />
            Profile Settings
          </h1>
          <p className="text-fg/70">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="p-6 border-accent/20">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-xl">
                {profile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-fg">{profile.username}</h2>
              <p className="text-fg/70">{profile.email}</p>
              <div className="flex items-center gap-3 mt-2">
                {(profile as any).is_premium && (
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <Badge variant="outline">
                  Level {(userStats as any)?.gamification?.level || 1}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">{(userStats as any)?.total_renders || 0}</div>
              <div className="text-sm text-fg/70">Total Renders</div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-accent/20">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                  <PersonalInfoForm formData={formData} onUpdate={handleUpdateField} />
                </TabsContent>

                <TabsContent value="preferences" className="mt-6">
                  <PreferencesForm formData={formData} onUpdate={handleUpdateField} />
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border/20">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div>
            <Card className="p-6 border-accent/20">
              <h3 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Stats
              </h3>
              {statsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : (
                <UserStatsComponent stats={userStats} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}