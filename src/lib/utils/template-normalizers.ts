import type { components } from '@/types/api';
import type { TemplateDetail, TemplateList, TemplateCategory, PromptField } from '@/lib/types';

type ApiTemplateDetail = components['schemas']['TemplateDetail'];
type ApiTemplateList = components['schemas']['TemplateList'];
type ApiTemplateCategory = components['schemas']['TemplateCategory'];
type ApiPromptField = components['schemas']['PromptField'];

const normalizeField = (field: ApiPromptField): PromptField => ({
  id: field.id,
  label: field.label,
  placeholder: field.placeholder,
  field_type: (field.field_type as PromptField['field_type']) ?? 'text',
  is_required: field.is_required ?? false,
  default_value: field.default_value,
  validation_pattern: field.validation_pattern,
  help_text: field.help_text,
  options: field.options,
  order: field.order ?? 0,
});

const normalizeCategory = (category: ApiTemplateCategory): TemplateCategory => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  icon: category.icon,
  color: category.color,
  is_active: category.is_active ?? true,
  order: category.order ?? 0,
  template_count: category.template_count,
});

export const normalizeTemplateDetail = (template: ApiTemplateDetail): TemplateDetail => ({
  id: template.id,
  title: template.title,
  description: template.description,
  category: normalizeCategory(template.category),
  template_content: template.template_content,
  author: template.author,
  fields: (template.fields ?? []).map(normalizeField),
  version: template.version,
  tags: template.tags,
  is_ai_generated: template.is_ai_generated ?? false,
  ai_confidence: template.ai_confidence ?? undefined,
  extracted_keywords: template.extracted_keywords,
  smart_suggestions: template.smart_suggestions,
  usage_count: template.usage_count ?? 0,
  completion_rate: template.completion_rate ?? 0,
  average_rating: template.average_rating ?? 0,
  popularity_score: template.popularity_score ?? 0,
  is_public: template.is_public ?? true,
  is_featured: template.is_featured ?? false,
  field_count: template.field_count ?? '0',
  localizations: template.localizations,
  created_at: template.created_at,
  updated_at: template.updated_at,
});

export const normalizeTemplateList = (template: ApiTemplateList): TemplateList => ({
  id: template.id,
  title: template.title,
  description: template.description,
  category: normalizeCategory(template.category),
  author: template.author,
  version: template.version,
  tags: template.tags,
  usage_count: template.usage_count ?? 0,
  completion_rate: template.completion_rate ?? 0,
  average_rating: template.average_rating ?? 0,
  popularity_score: template.popularity_score ?? 0,
  is_featured: template.is_featured ?? false,
  field_count: template.field_count ?? '0',
  created_at: template.created_at,
  updated_at: template.updated_at,
});

export const normalizeTemplateLists = (templates?: ApiTemplateList[] | null): TemplateList[] =>
  (templates ?? []).map(normalizeTemplateList);

export const normalizeTemplateCategories = (
  categories?: ApiTemplateCategory[] | null,
): TemplateCategory[] => (categories ?? []).map(normalizeCategory);
