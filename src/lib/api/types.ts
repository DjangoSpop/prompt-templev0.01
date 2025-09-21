// API Types for Template Management

export interface TemplateQueryParams {
  search?: string;
  category?: number;
  author?: string;
  is_public?: boolean;
  is_featured?: boolean;
  ordering?: string;
  page?: number;
}

export interface TemplateCreateUpdateRequest {
  title: string;
  description: string;
  category: number;
  template_content: string;
  version?: string;
  tags?: any;
  is_public?: boolean;
  fields_data?: any[];
}

export interface TemplateCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  order?: number;
  template_count: string;
}

export interface TemplateList {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  author: string;
  version?: string;
  tags?: any;
  usage_count?: number;
  completion_rate?: number;
  average_rating?: number;
  popularity_score?: number;
  is_featured?: boolean;
  field_count: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateDetail extends TemplateList {
  template_content: string;
  fields: any[];
  is_ai_generated?: boolean;
  ai_confidence?: number;
  extracted_keywords?: any;
  smart_suggestions?: any;
  is_public?: boolean;
  localizations?: any;
}
