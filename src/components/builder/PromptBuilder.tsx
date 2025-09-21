'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PyramidGrid } from '@/components/pharaonic/PyramidGrid';
import { 
  Library, 
  Sparkles, 
  Copy, 
  Download, 
  Save, 
  Zap,
  Eye,
  EyeOff,
  Settings,
  FileText,
  Calculator,
  Hash,
  Type,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Search,
  Star,
  Clock
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  rating: number;
  usage_count: number;
  variables: Variable[];
  template: string;
  tags: string[];
  is_featured: boolean;
}

interface Variable {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean';
  required: boolean;
  description?: string;
  options?: string[];
  default_value?: any;
  placeholder?: string;
}

interface PromptBuilderProps {
  className?: string;
}

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Technical Documentation',
    description: 'Generate comprehensive technical documentation',
    category: 'Engineering',
    author: 'TechWriter',
    rating: 4.8,
    usage_count: 1250,
    is_featured: true,
    tags: ['documentation', 'technical', 'engineering'],
    template: `You are an expert technical writer. Create comprehensive documentation for {{product_name}}.

**Requirements:**
- Target audience: {{audience}}
- Documentation type: {{doc_type}}
- Technical depth: {{complexity_level}}

**Focus areas:**
{{focus_areas}}

Please ensure the documentation is:
- Clear and well-structured
- Includes practical examples
- Uses {{tone}} tone throughout
- Follows {{style_guide}} guidelines

{{additional_requirements}}`,
    variables: [
      { key: 'product_name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., API Gateway' },
      { key: 'audience', label: 'Target Audience', type: 'select', required: true, options: ['Developers', 'End Users', 'System Administrators', 'Business Users'] },
      { key: 'doc_type', label: 'Documentation Type', type: 'select', required: true, options: ['API Reference', 'User Guide', 'Installation Guide', 'Troubleshooting'] },
      { key: 'complexity_level', label: 'Technical Complexity', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { key: 'focus_areas', label: 'Key Focus Areas', type: 'textarea', required: false, placeholder: 'List the main topics to cover...' },
      { key: 'tone', label: 'Writing Tone', type: 'select', required: false, options: ['Professional', 'Conversational', 'Academic', 'Friendly'], default_value: 'Professional' },
      { key: 'style_guide', label: 'Style Guide', type: 'text', required: false, placeholder: 'e.g., Google Style Guide' },
      { key: 'additional_requirements', label: 'Additional Requirements', type: 'textarea', required: false },
    ]
  },
  {
    id: '2',
    title: 'Marketing Copy Generator',
    description: 'Create compelling marketing copy for products',
    category: 'Marketing',
    author: 'CopyMaster',
    rating: 4.9,
    usage_count: 2100,
    is_featured: true,
    tags: ['marketing', 'copywriting', 'sales'],
    template: `Create compelling {{copy_type}} for {{product_name}}.

**Product Details:**
- Target audience: {{target_audience}}
- Key benefits: {{key_benefits}}
- Unique selling proposition: {{usp}}
- Brand voice: {{brand_voice}}

**Requirements:**
- Length: {{content_length}}
- Include call-to-action: {{include_cta}}
- Tone: {{tone}}

{{additional_context}}`,
    variables: [
      { key: 'copy_type', label: 'Copy Type', type: 'select', required: true, options: ['Product Description', 'Email Subject Line', 'Social Media Post', 'Landing Page Copy', 'Ad Copy'] },
      { key: 'product_name', label: 'Product/Service Name', type: 'text', required: true },
      { key: 'target_audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'e.g., Small business owners aged 25-45' },
      { key: 'key_benefits', label: 'Key Benefits', type: 'textarea', required: true, placeholder: 'List 3-5 main benefits...' },
      { key: 'usp', label: 'Unique Selling Proposition', type: 'text', required: true },
      { key: 'brand_voice', label: 'Brand Voice', type: 'select', required: true, options: ['Professional', 'Casual', 'Playful', 'Authoritative', 'Empathetic'] },
      { key: 'content_length', label: 'Content Length', type: 'select', required: true, options: ['Short (1-2 sentences)', 'Medium (1 paragraph)', 'Long (multiple paragraphs)'] },
      { key: 'include_cta', label: 'Include Call-to-Action', type: 'boolean', required: false, default_value: true },
      { key: 'tone', label: 'Tone', type: 'select', required: false, options: ['Urgent', 'Informative', 'Persuasive', 'Educational'], default_value: 'Persuasive' },
      { key: 'additional_context', label: 'Additional Context', type: 'textarea', required: false },
    ]
  }
];

export function PromptBuilder({ className = '' }: PromptBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isLeftPaneCollapsed, setIsLeftPaneCollapsed] = useState(false);
  const [isRightPaneCollapsed, setIsRightPaneCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'recent' | 'favorites'>('templates');

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    return SAMPLE_TEMPLATES.filter(template => 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  // Generate preview text
  const previewText = useMemo(() => {
    if (!selectedTemplate) return '';
    
    let text = selectedTemplate.template;
    
    // Replace variables in template
    selectedTemplate.variables.forEach(variable => {
      const value = variables[variable.key] || variable.default_value || `{{${variable.key}}}`;
      const regex = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
      text = text.replace(regex, String(value));
    });
    
    return text;
  }, [selectedTemplate, variables]);

  // Token count estimation
  const tokenCount = useMemo(() => {
    if (!previewText) return 0;
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(previewText.length / 4);
  }, [previewText]);

  // Validation
  const validation = useMemo(() => {
    if (!selectedTemplate) return { isValid: false, errors: [] };
    
    const errors: string[] = [];
    const requiredFields = selectedTemplate.variables.filter(v => v.required);
    
    requiredFields.forEach(field => {
      if (!variables[field.key] || variables[field.key] === '') {
        errors.push(`${field.label} is required`);
      }
    });
    
    return { isValid: errors.length === 0, errors };
  }, [selectedTemplate, variables]);

  const handleVariableChange = (key: string, value: any) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // Initialize variables with defaults
    const initialVariables: Record<string, any> = {};
    template.variables.forEach(variable => {
      initialVariables[variable.key] = variable.default_value || '';
    });
    setVariables(initialVariables);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      // Show success toast
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSave = () => {
    // Save to workspace
    console.log('Saving prompt:', { template: selectedTemplate, variables, preview: previewText });
  };

  const handleExportJson = () => {
    const exportData = {
      template: selectedTemplate,
      variables,
      generated_prompt: previewText,
      metadata: {
        created_at: new Date().toISOString(),
        token_count: tokenCount,
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${selectedTemplate?.id || 'custom'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const markdown = `# ${selectedTemplate?.title || 'Custom Prompt'}

## Description
${selectedTemplate?.description || 'Generated prompt'}

## Variables
${selectedTemplate?.variables.map(v => `- **${v.label}**: ${variables[v.key] || 'Not set'}`).join('\n') || 'None'}

## Generated Prompt

\`\`\`
${previewText}
\`\`\`

---
*Generated by Prompt Temple - ${new Date().toISOString()}*
*Token count: ~${tokenCount}*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${selectedTemplate?.id || 'custom'}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen bg-background relative ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <PyramidGrid animate={false} />
      </div>

      <div className="relative z-10 h-screen flex">
        {/* Left Pane - Template Selector */}
        <motion.div
          className={`bg-card/50 backdrop-blur-sm border-r border-border transition-all duration-300 ${
            isLeftPaneCollapsed ? 'w-12' : 'w-80'
          }`}
          layout
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-lapis-blue/5 to-pharaoh-gold/5">
              <div className="flex items-center justify-between">
                {!isLeftPaneCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-lg font-semibold text-foreground">Templates</h2>
                    <p className="text-sm text-muted-foreground">Choose a starting point</p>
                  </motion.div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLeftPaneCollapsed(!isLeftPaneCollapsed)}
                  className="p-2 hover:bg-pharaoh-gold/10"
                >
                  {isLeftPaneCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {/* Search & Tabs */}
              {!isLeftPaneCollapsed && (
                <motion.div 
                  className="mt-4 space-y-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9 text-sm border-border/50 focus:border-pharaoh-gold/50"
                    />
                  </div>

                  <div className="flex space-x-1">
                    {[
                      { id: 'templates', label: 'All', icon: Library },
                      { id: 'recent', label: 'Recent', icon: Clock },
                      { id: 'favorites', label: 'Saved', icon: Star },
                    ].map((tab) => (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(tab.id as any)}
                        className="flex-1 text-xs"
                      >
                        <tab.icon className="w-3 h-3 mr-1" />
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Templates List */}
            {!isLeftPaneCollapsed && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card 
                        className={`p-4 cursor-pointer transition-all hover:shadow-pyramid border ${
                          selectedTemplate?.id === template.id 
                            ? 'border-pharaoh-gold bg-pharaoh-gold/5' 
                            : 'border-border hover:border-pharaoh-gold/30'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-foreground text-sm line-clamp-1">
                              {template.title}
                            </h3>
                            {template.is_featured && (
                              <Badge variant="outline" className="text-xs border-pharaoh-gold text-pharaoh-gold">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{template.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-current text-pharaoh-gold" />
                                {template.rating}
                              </span>
                              <span>{template.usage_count.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No templates found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Center Pane - Variables Form */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-pharaoh-gold/5 to-nile-teal/5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-lapis-blue to-pharaoh-gold bg-clip-text text-transparent">
                  Prompt Builder
                </h1>
                <p className="text-muted-foreground">
                  {selectedTemplate ? `Customize "${selectedTemplate.title}"` : 'Select a template to get started'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-muted-foreground hover:text-pharaoh-gold"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRightPaneCollapsed(!isRightPaneCollapsed)}
                  className="p-2 hover:bg-pharaoh-gold/10"
                >
                  {isRightPaneCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Variables Form */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTemplate ? (
              <motion.div
                className="max-w-2xl space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Template Info */}
                <Card className="p-4 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{selectedTemplate.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{selectedTemplate.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>By {selectedTemplate.author}</span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-current text-pharaoh-gold" />
                          {selectedTemplate.rating}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {selectedTemplate.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Variables Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-foreground">Configure Variables</h4>
                    {validation.errors.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {selectedTemplate.variables.map((variable, index) => (
                    <motion.div
                      key={variable.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground flex items-center">
                            {variable.required && (
                              <span className="text-destructive mr-1">*</span>
                            )}
                            {variable.label}
                          </label>
                          <div className="flex items-center space-x-1">
                            {variable.type === 'text' && <Type className="w-3 h-3 text-muted-foreground" />}
                            {variable.type === 'textarea' && <FileText className="w-3 h-3 text-muted-foreground" />}
                            {variable.type === 'select' && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                            {variable.type === 'number' && <Calculator className="w-3 h-3 text-muted-foreground" />}
                            {variable.type === 'boolean' && <ToggleLeft className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </div>
                        
                        {variable.description && (
                          <p className="text-xs text-muted-foreground">{variable.description}</p>
                        )}

                        {/* Input Fields */}
                        {variable.type === 'text' && (
                          <Input
                            value={variables[variable.key] || ''}
                            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                            placeholder={variable.placeholder}
                            className="focus:border-pharaoh-gold/50 focus:ring-pharaoh-gold/20"
                          />
                        )}

                        {variable.type === 'textarea' && (
                          <Textarea
                            value={variables[variable.key] || ''}
                            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                            placeholder={variable.placeholder}
                            rows={3}
                            className="focus:border-pharaoh-gold/50 focus:ring-pharaoh-gold/20"
                          />
                        )}

                        {variable.type === 'select' && (
                          <select
                            value={variables[variable.key] || ''}
                            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-pharaoh-gold/50 focus:ring-pharaoh-gold/20"
                          >
                            <option value="">Select an option...</option>
                            {variable.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}

                        {variable.type === 'boolean' && (
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => handleVariableChange(variable.key, !variables[variable.key])}
                              className="flex items-center text-sm"
                            >
                              {variables[variable.key] ? (
                                <ToggleRight className="w-5 h-5 text-pharaoh-gold mr-2" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-muted-foreground mr-2" />
                              )}
                              {variables[variable.key] ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        )}

                        {variable.type === 'number' && (
                          <Input
                            type="number"
                            value={variables[variable.key] || ''}
                            onChange={(e) => handleVariableChange(variable.key, parseInt(e.target.value) || 0)}
                            placeholder={variable.placeholder}
                            className="focus:border-pharaoh-gold/50 focus:ring-pharaoh-gold/20"
                          />
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Validation Errors */}
                {validation.errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-4 border-destructive/50 bg-destructive/5">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</h4>
                          <ul className="text-sm text-destructive space-y-1">
                            {validation.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                    <Library className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Select a Template</h3>
                    <p className="text-muted-foreground max-w-md">
                      Choose from our curated collection of prompt templates to get started building your perfect prompt.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Preview & Export */}
        {showPreview && !isRightPaneCollapsed && (
          <motion.div
            className="w-96 bg-card/50 backdrop-blur-sm border-l border-border"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border bg-gradient-to-r from-nile-teal/5 to-royal-gold/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Preview & Export</h3>
                    <p className="text-sm text-muted-foreground">~{tokenCount} tokens</p>
                  </div>
                  {validation.isValid && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedTemplate && previewText ? (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-4 bg-gradient-to-br from-pharaoh-gold/5 to-nile-teal/5 border-pharaoh-gold/20">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                        {previewText}
                      </pre>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <Eye className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Preview will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-border space-y-3">
                <div className="space-y-2">
                  <Button
                    onClick={handleCopy}
                    disabled={!validation.isValid || !previewText}
                    className="w-full bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Prompt
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={!validation.isValid || !previewText}
                    variant="outline"
                    className="w-full border-nile-teal text-nile-teal hover:bg-nile-teal hover:text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Workspace
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Export Options</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleExportJson}
                      disabled={!validation.isValid || !previewText}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      JSON
                    </Button>
                    <Button
                      onClick={handleExportMarkdown}
                      disabled={!validation.isValid || !previewText}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Markdown
                    </Button>
                  </div>
                </div>

                <Separator />

                <Button
                  disabled={!validation.isValid || !previewText}
                  variant="outline"
                  className="w-full border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white"
                  asChild
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Run in Orchestrator
                  </motion.div>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}