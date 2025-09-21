/**
 * Type adapters to bridge generated OpenAPI types with custom application types
 * This file converts readonly/optional properties to mutable/required as needed by the app
 */

import type { components } from '../../types/api';

// Generated API types (readonly/optional)
export type GeneratedTemplate = components['schemas']['TemplateDetail'];
export type GeneratedTemplateList = components['schemas']['TemplateList'];
export type GeneratedCategory = components['schemas']['TemplateCategory'];
export type GeneratedUser = components['schemas']['UserProfile'];

// Application types (mutable/required)
export interface AppTemplate {
  id: string;
  title: string;
  name?: string; // backward compatibility
  description: string;
  content?: string;
  template_content?: string; // backward compatibility
  category: AppCategory;
  rating?: number;
  is_premium?: boolean;
  tags?: any[];
  fields?: PromptField[];
  variables?: any;
  author?: any;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  usage_count?: number;
  completion_rate?: string;
  average_rating?: string;
  total_ratings?: number;
  is_featured?: boolean;
  difficulty_level?: string;
  version?: string;
  localizations?: any;
}

export interface AppCategory {
  id: number;
  name: string;
  slug: string;
  order: number; // required, not optional
  is_active: boolean;
  template_count: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface PromptField {
  id: string;
  label: string;
  field_type: "text" | "textarea" | "number" | "checkbox" | "radio" | "dropdown";
  is_required: boolean;
  order: number; // required, not optional
  options?: any;
  placeholder?: string;
  default_value?: string;
  validation_pattern?: string;
  help_text?: string;
}

export interface AppUser {
  id: string;
  username: string;
  email?: string;
  first_name: string; // required, not optional
  last_name: string; // required, not optional
  avatar?: string;
  avatar_url?: string; // optional to match API
  bio?: string;
  date_joined?: string;
  last_login?: string;
  credits?: number;
  level?: number;
  experience_points?: number;
  daily_streak?: number;
  user_rank?: string;
  rank_info?: string;
  next_level_xp?: string;
  is_premium?: boolean;
  premium_expires_at?: string | null;
  theme_preference: "light" | "dark" | "system";
  language_preference: string;
  ai_assistance_enabled: boolean;
  analytics_enabled: boolean;
  templates_created?: number;
  templates_completed?: number;
  total_prompts_generated?: number;
  completion_rate?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number; // required, not optional
  next?: string | null;
  previous?: string | null;
  results: T[];
}

// Type conversion utilities
export class TypeAdapters {
  static convertTemplate(generated: GeneratedTemplate): AppTemplate {
    return {
      id: generated.id,
      title: generated.title,
      name: generated.title, // map title to name for backward compatibility
      description: generated.description,
      content: generated.template_content,
      template_content: generated.template_content,
      category: this.convertCategory(generated.category),
      rating: generated.average_rating || undefined,
      is_premium: false, // default value since this field doesn't exist in generated type
      tags: Array.isArray(generated.tags) ? generated.tags : [],
      fields: generated.fields?.map(field => this.convertField(field)) || [],
      variables: {}, // default value since this field doesn't exist in generated type
      author: generated.author,
      created_at: generated.created_at,
      updated_at: generated.updated_at,
      is_public: generated.is_public,
      usage_count: generated.usage_count,
      completion_rate: generated.completion_rate?.toString(),
      average_rating: generated.average_rating?.toString(),
      total_ratings: 0, // default value since this field doesn't exist in generated type
      is_featured: generated.is_featured,
      difficulty_level: 'medium', // default value since this field doesn't exist in generated type
      version: generated.version,
      localizations: generated.localizations,
    };
  }

  static convertTemplateList(generated: GeneratedTemplateList[]): AppTemplate[] {
    return generated.map(template => ({
      id: template.id,
      title: template.title,
      name: template.title,
      description: template.description,
      content: '', // TemplateList doesn't have template_content
      template_content: '',
      category: this.convertCategory(template.category),
      rating: template.average_rating || undefined,
      is_premium: false,
      tags: Array.isArray(template.tags) ? template.tags : [],
      fields: [],
      variables: {},
      author: template.author,
      created_at: template.created_at,
      updated_at: template.updated_at,
      is_public: true, // default since not in TemplateList
      usage_count: template.usage_count,
      completion_rate: template.completion_rate?.toString(),
      average_rating: template.average_rating?.toString(),
      total_ratings: 0,
      is_featured: template.is_featured,
      difficulty_level: 'medium',
      version: template.version,
      localizations: {},
    }));
  }

  static convertCategory(generated: GeneratedCategory): AppCategory {
    return {
      id: generated.id,
      name: generated.name,
      slug: generated.slug,
      order: generated.order ?? 0, // provide default if undefined
      is_active: generated.is_active ?? true, // provide default if undefined
      template_count: generated.template_count,
      description: generated.description,
      icon: generated.icon,
      color: generated.color,
    };
  }

  static convertField(generated: components['schemas']['PromptField']): PromptField {
    return {
      id: generated.id,
      label: generated.label,
      field_type: (generated.field_type as PromptField['field_type']) || 'text',
      is_required: generated.is_required ?? false,
      order: generated.order ?? 0,
      options: generated.options,
      placeholder: generated.placeholder,
      default_value: generated.default_value,
      validation_pattern: generated.validation_pattern,
      help_text: generated.help_text,
    };
  }

  static convertUser(generated: GeneratedUser): AppUser {
    return {
      id: generated.id,
      username: generated.username,
      email: generated.email,
      first_name: generated.first_name || '', // provide default if undefined
      last_name: generated.last_name || '', // provide default if undefined
      avatar: generated.avatar || undefined,
      avatar_url: generated.avatar_url || '/api/default-avatar.png', // provide default
      bio: generated.bio,
      date_joined: generated.date_joined,
      last_login: generated.last_login || undefined,
      credits: generated.credits,
      level: generated.level,
      experience_points: generated.experience_points,
      daily_streak: generated.daily_streak,
      user_rank: generated.user_rank,
      rank_info: generated.rank_info,
      next_level_xp: generated.next_level_xp,
      is_premium: generated.is_premium,
      premium_expires_at: generated.premium_expires_at,
      theme_preference: generated.theme_preference || 'light',
      language_preference: generated.language_preference || 'en',
      ai_assistance_enabled: generated.ai_assistance_enabled ?? true,
      analytics_enabled: generated.analytics_enabled ?? true,
      templates_created: generated.templates_created,
      templates_completed: generated.templates_completed,
      total_prompts_generated: generated.total_prompts_generated,
      completion_rate: generated.completion_rate,
      created_at: generated.created_at,
      updated_at: generated.updated_at,
    };
  }

  static convertPaginatedResponse<TGenerated, TApp>(
    generated: { count?: number; next?: string | null; previous?: string | null; results?: TGenerated[] },
    converter: (item: TGenerated) => TApp
  ): PaginatedResponse<TApp> {
    return {
      count: generated.count ?? 0,
      next: generated.next,
      previous: generated.previous,
      results: generated.results?.map(converter) || [],
    };
  }
}