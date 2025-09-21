import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nState {
  // Current language settings
  locale: Locale;
  direction: Direction;
  isRTL: boolean;
  
  // Translation data
  translations: Record<Locale, Translation>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Preferences
  autoDetect: boolean;
  fallbackLocale: Locale;
}

export interface I18nActions {
  // Language switching
  setLocale: (locale: Locale) => void;
  toggleDirection: () => void;
  autoDetectLocale: () => void;
  
  // Translation management
  loadTranslations: (locale: Locale) => Promise<void>;
  setTranslations: (locale: Locale, translations: Translation) => void;
  addTranslation: (locale: Locale, key: string, value: string) => void;
  
  // Translation helpers
  t: (key: string, params?: Record<string, string | number>) => string;
  tExists: (key: string) => boolean;
  
  // Preferences
  setAutoDetect: (autoDetect: boolean) => void;
  setFallbackLocale: (locale: Locale) => void;
  
  // Utility
  reset: () => void;
}

// English translations
const enTranslations: Translation = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    clear: 'Clear',
    reset: 'Reset',
    close: 'Close',
    open: 'Open',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    back: 'Back',
    continue: 'Continue',
    settings: 'Settings',
    preferences: 'Preferences',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    library: 'Library',
    builder: 'Builder',
    orchestrator: 'Orchestrator',
    workspace: 'Workspace',
    analytics: 'Analytics',
    settings: 'Settings',
    help: 'Help',
    docs: 'Documentation',
    pricing: 'Pricing',
    extension: 'Extension',
  },
  library: {
    title: 'Template Library',
    subtitle: 'Discover and use powerful AI templates to boost your productivity',
    searchPlaceholder: 'Search templates, tags, or authors...',
    filterByCategory: 'Category',
    filterByDifficulty: 'Difficulty',
    filterByRarity: 'Rarity',
    sortBy: 'Sort by',
    sortOptions: {
      popular: 'Most Popular',
      rating: 'Highest Rated',
      newest: 'Newest',
      xp: 'Most XP',
      alphabetical: 'Alphabetical',
    },
    viewMode: 'View',
    viewModes: {
      grid: 'Grid',
      list: 'List',
    },
    filters: 'Filters',
    clearFilters: 'Clear all filters',
    noResults: 'No templates found',
    noResultsDescription: 'Try adjusting your search criteria or filters to find the templates you\'re looking for.',
    templateCount: '{count} templates',
    useTemplate: 'Use Template',
    bookmark: 'Bookmark',
    share: 'Share',
    premium: 'Premium',
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    },
    rarity: {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    },
  },
  builder: {
    title: 'Prompt Builder',
    subtitle: 'Create and customize prompts with ease',
    templatePicker: 'Template Picker',
    variables: 'Variables',
    preview: 'Preview & Export',
    selectTemplate: 'Select a template to get started',
    fillVariables: 'Fill in the required variables',
    requiredField: 'This field is required',
    tokenCount: '{count} tokens',
    estimatedCost: '~${cost}',
    export: 'Export',
    exportFormats: {
      json: 'JSON',
      md: 'Markdown',
      txt: 'Text',
    },
    includeMetadata: 'Include metadata',
    copyPrompt: 'Copy Prompt',
    copySuccess: 'Copied to clipboard!',
    runOptimizer: 'Run Optimizer',
    resetBuilder: 'Reset Builder',
  },
  orchestrator: {
    title: 'AI Orchestrator',
    subtitle: 'Optimize your prompts through multi-stage processing',
    pipeline: 'Pipeline',
    stages: {
      expand: 'Expand',
      constrain: 'Constrain',
      evaluate: 'Evaluate',
      compare: 'Compare',
    },
    stageDescriptions: {
      expand: 'Expand and elaborate on the initial prompt',
      constrain: 'Add constraints and specific requirements',
      evaluate: 'Evaluate and score the generated content',
      compare: 'Compare different variations and select the best',
    },
    settings: 'Settings',
    globalSettings: 'Global Settings',
    stageSettings: 'Stage Settings',
    budgetLimit: 'Budget Limit',
    totalSpent: 'Total Spent',
    maxRetries: 'Max Retries',
    timeout: 'Timeout (minutes)',
    enableParallel: 'Enable Parallel Processing',
    saveIntermediateResults: 'Save Intermediate Results',
    run: 'Run Pipeline',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    reset: 'Reset',
    outputs: 'Outputs',
    outputTabs: {
      best: 'Best',
      variants: 'Variants',
      critiques: 'Critiques',
      comparisons: 'Comparisons',
    },
    pickBest: 'Pick Best',
    saveToWorkspace: 'Save to Workspace',
    exportResults: 'Export Results',
    progress: 'Progress: {progress}%',
    budgetExceeded: 'Budget limit exceeded',
  },
  workspace: {
    title: 'Workspace',
    subtitle: 'Manage your saved templates and results',
    tabs: {
      saved: 'Saved',
      history: 'History',
      teams: 'Teams',
    },
    empty: 'No items in workspace',
    emptyDescription: 'Start building and save your favorite results here.',
    lastUsed: 'Last used: {date}',
    bulkActions: 'Bulk Actions',
    selectAll: 'Select All',
    export: 'Export Selected',
    delete: 'Delete Selected',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Customize your experience',
    sections: {
      appearance: 'Appearance',
      language: 'Language & Region',
      accessibility: 'Accessibility',
      notifications: 'Notifications',
      privacy: 'Privacy',
      integrations: 'Integrations',
    },
    theme: 'Theme',
    themes: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    language: 'Language',
    direction: 'Text Direction',
    directions: {
      ltr: 'Left to Right',
      rtl: 'Right to Left',
    },
    autoDetect: 'Auto-detect language',
    reduceMotion: 'Reduce motion',
    highContrast: 'High contrast',
    fontSize: 'Font size',
    fontSizes: {
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
    },
    screenReader: 'Screen reader optimizations',
  },
  extension: {
    title: 'Browser Extension',
    subtitle: 'Install the Prompt Temple extension for seamless integration',
    install: 'Install Extension',
    browsers: {
      chrome: 'Chrome',
      firefox: 'Firefox',
      edge: 'Edge',
      safari: 'Safari',
    },
    features: {
      quickAccess: 'Quick access to templates',
      contextMenu: 'Right-click context menu',
      syncData: 'Sync with your account',
      offlineMode: 'Offline mode support',
    },
    steps: {
      install: 'Install the extension',
      login: 'Log in with your account',
      start: 'Start using templates anywhere',
    },
    testFlow: 'Test the flow',
  },
  accessibility: {
    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    openDialog: 'Open dialog',
    closeDialog: 'Close dialog',
    nextPage: 'Go to next page',
    previousPage: 'Go to previous page',
    currentPage: 'Current page',
    of: 'of',
    searchResults: '{count} search results',
    loading: 'Content is loading',
    error: 'An error occurred',
    required: 'Required field',
    optional: 'Optional field',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section',
    dragToReorder: 'Drag to reorder',
    sortableList: 'Sortable list',
    listItem: 'List item {position} of {total}',
  },
  errors: {
    general: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    authentication: 'Authentication failed. Please log in again.',
    authorization: 'You don\'t have permission to access this resource.',
    validation: 'Please check your input and try again.',
    templateNotFound: 'Template not found.',
    quota: 'You\'ve reached your usage quota.',
    maintenance: 'The service is temporarily unavailable for maintenance.',
  },
  success: {
    saved: 'Successfully saved',
    deleted: 'Successfully deleted',
    copied: 'Copied to clipboard',
    exported: 'Successfully exported',
    uploaded: 'Successfully uploaded',
    shared: 'Successfully shared',
  },
};

// Arabic translations (subset for demo)
const arTranslations: Translation = {
  common: {
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تحرير',
    add: 'إضافة',
    remove: 'إزالة',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    clear: 'مسح',
    reset: 'إعادة تعيين',
    close: 'إغلاق',
    open: 'فتح',
    copy: 'نسخ',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
  },
  navigation: {
    home: 'الرئيسية',
    dashboard: 'لوحة التحكم',
    library: 'المكتبة',
    builder: 'البناء',
    orchestrator: 'المنسق',
    workspace: 'مساحة العمل',
    analytics: 'التحليلات',
    settings: 'الإعدادات',
    help: 'المساعدة',
    docs: 'التوثيق',
    pricing: 'التسعير',
    extension: 'الامتداد',
  },
  library: {
    title: 'مكتبة القوالب',
    subtitle: 'اكتشف واستخدم قوالب الذكاء الاصطناعي القوية لتعزيز إنتاجيتك',
    searchPlaceholder: 'البحث في القوالب والعلامات والمؤلفين...',
    filterByCategory: 'الفئة',
    filterByDifficulty: 'الصعوبة',
    filterByRarity: 'الندرة',
    sortBy: 'ترتيب حسب',
    difficulty: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
      expert: 'خبير',
    },
    rarity: {
      common: 'شائع',
      rare: 'نادر',
      epic: 'ملحمي',
      legendary: 'أسطوري',
    },
  },
  // ... other Arabic translations would continue here
};

const getSystemLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const language = navigator.language.toLowerCase();
    if (language.startsWith('ar')) return 'ar';
  }
  return 'en';
};

const getDirection = (locale: Locale): Direction => {
  return locale === 'ar' ? 'rtl' : 'ltr';
};

const initialState: I18nState = {
  locale: 'en',
  direction: 'ltr',
  isRTL: false,
  translations: {
    en: enTranslations,
    ar: arTranslations,
  },
  isLoading: false,
  error: null,
  autoDetect: true,
  fallbackLocale: 'en',
};

export const useI18nStore = create<I18nState & I18nActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocale: (locale) => {
        const direction = getDirection(locale);
        set({ 
          locale, 
          direction, 
          isRTL: direction === 'rtl' 
        });
        
        // Update document attributes for CSS and accessibility
        if (typeof document !== 'undefined') {
          document.documentElement.lang = locale;
          document.documentElement.dir = direction;
          document.documentElement.setAttribute('data-locale', locale);
        }
      },

      toggleDirection: () => {
        const { direction } = get();
        const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
        const newLocale = newDirection === 'rtl' ? 'ar' : 'en';
        get().setLocale(newLocale);
      },

      autoDetectLocale: () => {
        if (get().autoDetect) {
          const systemLocale = getSystemLocale();
          get().setLocale(systemLocale);
        }
      },

      loadTranslations: async (locale) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real implementation, this would fetch translations from an API
          // For now, we already have them loaded
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load translations' 
          });
        }
      },

      setTranslations: (locale, translations) => {
        set((state) => ({
          translations: {
            ...state.translations,
            [locale]: translations,
          },
        }));
      },

      addTranslation: (locale, key, value) => {
        set((state) => {
          const currentTranslations = state.translations[locale] || {};
          const keys = key.split('.');
          const newTranslations = { ...currentTranslations };
          
          let current: any = newTranslations;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
          
          return {
            translations: {
              ...state.translations,
              [locale]: newTranslations,
            },
          };
        });
      },

      t: (key, params) => {
        const { locale, translations, fallbackLocale } = get();
        
        const getTranslation = (translations: Translation, key: string): string | undefined => {
          const keys = key.split('.');
          let current: any = translations;
          
          for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
              current = current[k];
            } else {
              return undefined;
            }
          }
          
          return typeof current === 'string' ? current : undefined;
        };
        
        // Try current locale
        let translation = getTranslation(translations[locale] || {}, key);
        
        // Fallback to fallback locale
        if (!translation && locale !== fallbackLocale) {
          translation = getTranslation(translations[fallbackLocale] || {}, key);
        }
        
        // Ultimate fallback to the key itself
        if (!translation) {
          translation = key;
        }
        
        // Replace parameters
        if (params && typeof translation === 'string') {
          return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
            return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
          }, translation);
        }
        
        return translation;
      },

      tExists: (key) => {
        const { locale, translations, fallbackLocale } = get();
        
        const checkTranslation = (translations: Translation, key: string): boolean => {
          const keys = key.split('.');
          let current: any = translations;
          
          for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
              current = current[k];
            } else {
              return false;
            }
          }
          
          return typeof current === 'string';
        };
        
        return checkTranslation(translations[locale] || {}, key) ||
               checkTranslation(translations[fallbackLocale] || {}, key);
      },

      setAutoDetect: (autoDetect) => {
        set({ autoDetect });
        if (autoDetect) {
          get().autoDetectLocale();
        }
      },

      setFallbackLocale: (fallbackLocale) => set({ fallbackLocale }),

      reset: () => {
        set(initialState);
        get().autoDetectLocale();
      },
    }),
    {
      name: 'promptcraft-i18n-store',
      partialize: (state) => ({
        locale: state.locale,
        direction: state.direction,
        isRTL: state.isRTL,
        autoDetect: state.autoDetect,
        fallbackLocale: state.fallbackLocale,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply locale settings to document after rehydration
          if (typeof document !== 'undefined') {
            document.documentElement.lang = state.locale;
            document.documentElement.dir = state.direction;
            document.documentElement.setAttribute('data-locale', state.locale);
          }
        }
      },
    }
  )
);