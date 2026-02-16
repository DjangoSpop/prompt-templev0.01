'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Download,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import CreditsWidget from '@/components/CreditsWidget';
import type { Quota } from '@/lib/types';

interface SettingsState {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    analytics: boolean;
    cookies: boolean;
    dataSharing: boolean;
  };
  appearance: {
    theme: 'dark' | 'light' | 'auto';
    compactMode: boolean;
    animations: boolean;
  };
  ai: {
    autoSave: boolean;
    suggestions: boolean;
    qualityCheck: boolean;
  };
}

export default function SettingsView() {
  const [quotas, setQuotas] = useState<Quota | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      push: false,
      marketing: false,
    },
    privacy: {
      analytics: true,
      cookies: true,
      dataSharing: false,
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      animations: true,
    },
    ai: {
      autoSave: true,
      suggestions: true,
      qualityCheck: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'quotas' | 'privacy' | 'advanced'>('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('Settings page viewed');
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockQuotas = {
        daily_limit: 100,
        daily_used: 23,
        monthly_limit: 2000,
        monthly_used: 456,
        reset_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      };
      
      const mockConfig = {
        features: {
          analytics: true,
          premium_templates: true,
          api_access: false
        }
      };
      
      setQuotas(mockQuotas);
      setConfig(mockConfig);
      
      // Load settings from localStorage or config
      const savedSettings = localStorage.getItem('promptcord-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      localStorage.setItem('promptcord-settings', JSON.stringify(settings));
      // In a real app, you'd also send to your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    const data = {
      settings,
      quotas,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcord-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteAllData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }
    
    try {
      localStorage.removeItem('promptcord-settings');
      // In a real app, you'd call an API to delete user data
      setSettings({
        notifications: { email: true, push: false, marketing: false },
        privacy: { analytics: true, cookies: true, dataSharing: false },
        appearance: { theme: 'dark', compactMode: false, animations: true },
        ai: { autoSave: true, suggestions: true, qualityCheck: true },
      });
    } catch (error) {
      console.error('Failed to delete data:', error);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Notifications */}
      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-text-primary font-medium flex items-center space-x-2">
            <Bell className="w-5 h-5 flex-shrink-0" />
            <span>Notifications</span>
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium capitalize text-sm sm:text-base">{key} Notifications</p>
                <p className="text-text-muted text-xs sm:text-sm mt-1 leading-relaxed">
                  {key === 'email' && 'Receive updates via email'}
                  {key === 'push' && 'Browser push notifications'}
                  {key === 'marketing' && 'Product updates and promotions'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-interactive-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand touch-target"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-text-primary font-medium flex items-center space-x-2">
            <Palette className="w-5 h-5 flex-shrink-0" />
            <span>Appearance</span>
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium text-sm sm:text-base">Theme</p>
              <p className="text-text-muted text-xs sm:text-sm mt-1">Choose your preferred theme</p>
            </div>
            <select
              value={settings.appearance.theme}
              onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
              className="px-3 py-2 bg-bg-tertiary border border-border rounded text-text-primary text-sm sm:text-base flex-shrink-0 touch-target"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          {Object.entries(settings.appearance).filter(([key]) => key !== 'theme').map(([key, value]) => (
            <div key={key} className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium capitalize text-sm sm:text-base">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-text-muted text-xs sm:text-sm mt-1 leading-relaxed">
                  {key === 'compactMode' && 'Reduce spacing and padding'}
                  {key === 'animations' && 'Enable smooth transitions and animations'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handleSettingChange('appearance', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-interactive-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand touch-target"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-text-primary font-medium flex items-center space-x-2">
            <Database className="w-5 h-5 flex-shrink-0" />
            <span>AI Features</span>
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {Object.entries(settings.ai).map(([key, value]) => (
            <div key={key} className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium capitalize text-sm sm:text-base">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-text-muted text-xs sm:text-sm mt-1 leading-relaxed">
                  {key === 'autoSave' && 'Automatically save your work as you type'}
                  {key === 'suggestions' && 'Show AI-powered suggestions and improvements'}
                  {key === 'qualityCheck' && 'Analyze generated content for quality and tone'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('ai', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-interactive-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand touch-target"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuotasSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      {quotas && <CreditsWidget quotas={quotas} />}

      {/* Usage Guidelines */}
      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-text-primary font-medium text-sm sm:text-base">Usage Guidelines</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-text-secondary">
            <p className="leading-relaxed">• Template usage counts towards your daily and monthly limits</p>
            <p className="leading-relaxed">• Premium templates may consume more credits per use</p>
            <p className="leading-relaxed">• Limits reset at midnight UTC for daily quotas</p>
            <p className="leading-relaxed">• Monthly limits reset on the first day of each month</p>
            <p className="leading-relaxed">• Unused credits do not roll over to the next period</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Privacy Controls */}
      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-text-primary font-medium flex items-center space-x-2">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span>Privacy Controls</span>
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {Object.entries(settings.privacy).map(([key, value]) => (
            <div key={key} className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium capitalize text-sm sm:text-base">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-text-muted text-xs sm:text-sm mt-1 leading-relaxed">
                  {key === 'analytics' && 'Help improve the service by sharing usage analytics'}
                  {key === 'cookies' && 'Allow cookies for enhanced functionality'}
                  {key === 'dataSharing' && 'Share anonymized data with research partners'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-interactive-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand touch-target"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* API Configuration */}
      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-text-primary font-medium flex items-center space-x-2">
            <Key className="w-5 h-5 flex-shrink-0" />
            <span>API Configuration</span>
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-text-primary font-medium mb-2 text-sm sm:text-base">API Base URL</label>
            <input
              type="text"
              value={process.env.NEXT_PUBLIC_API_BASE || 'https://api.prompt-temple.com'}
              readOnly
              className="w-full p-3 bg-bg-tertiary border border-border rounded text-text-muted text-sm sm:text-base"
            />
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              This is configured via environment variables
            </p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-text-primary font-medium text-sm sm:text-base">Data Management</h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium text-sm sm:text-base">Export Data</p>
              <p className="text-text-muted text-xs sm:text-sm mt-1 leading-relaxed">Download all your data in JSON format</p>
            </div>
            <button
              onClick={exportData}
              className="px-4 py-3 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors flex items-center justify-center space-x-2 touch-target text-sm sm:text-base w-full sm:w-auto flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium text-red text-sm sm:text-base">Delete All Data</p>
              <p className="text-text-muted text-xs sm:text-sm mt-1 leading-relaxed">Permanently delete all your data and settings</p>
            </div>
            <button
              onClick={deleteAllData}
              className="px-4 py-3 bg-red hover:bg-red/80 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 touch-target text-sm sm:text-base w-full sm:w-auto flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red/5 border border-red/20 rounded-lg">
        <div className="p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-red font-medium text-sm sm:text-base">Danger Zone</h3>
              <p className="text-text-muted text-xs sm:text-sm mt-1 leading-relaxed">
                Actions in this section are irreversible. Please proceed with caution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-bg-primary min-h-screen min-h-[100dvh]">
      {/* Header */}
      <div className="h-14 sm:h-12 bg-bg-primary border-b border-border px-3 sm:px-4 flex items-center justify-between z-50 relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-interactive-muted hover:text-text-primary touch-target"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Settings className="w-5 h-5 text-interactive-muted" />
          <h1 className="text-text-primary font-semibold text-base sm:text-lg">Settings</h1>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-3 sm:px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 touch-target text-sm sm:text-base"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          w-72 sm:w-64 bg-bg-secondary border-r border-border
          md:relative md:translate-x-0
          fixed inset-y-0 left-0 z-50 transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:block
        `}>
          <div className="p-3 sm:p-4 pt-safe-top">
            <div className="flex items-center justify-between mb-4 md:hidden">
              <h2 className="text-text-primary font-semibold text-lg">Settings</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-interactive-muted hover:text-text-primary touch-target"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {[
                { id: 'general', label: 'General', icon: Settings },
                { id: 'quotas', label: 'Quotas & Usage', icon: CreditCard },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'advanced', label: 'Advanced', icon: Database },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-left transition-colors min-h-[48px] touch-target ${
                      activeTab === item.id
                        ? 'bg-brand/10 text-brand'
                        : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-base">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 max-w-full pb-safe-bottom pt-20 sm:pt-16 overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="space-y-4 sm:space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 sm:h-32 bg-interactive-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {activeTab === 'general' && renderGeneralSettings()}
                {activeTab === 'quotas' && renderQuotasSettings()}
                {activeTab === 'privacy' && renderPrivacySettings()}
                {activeTab === 'advanced' && renderAdvancedSettings()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}