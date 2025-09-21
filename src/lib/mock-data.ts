import type { Template, Category, IntentResponse, RenderResponse } from './types';

// Mock Templates
export const mockTemplates: Template[] = [
  {
    id: 'email-follow-up',
    name: 'Professional Follow-up Email',
    description: 'Create professional follow-up emails for business communications',
    content: `Subject: Following up on {subject}

Dear {recipient_name},

I hope this email finds you well. I wanted to follow up on our {interaction_type} regarding {topic}.

{main_message}

I would appreciate the opportunity to {desired_action}. Please let me know if you have any questions or if there's anything I can clarify.

Thank you for your time and consideration.

Best regards,
{sender_name}
{sender_title}
{company_name}`,
    category: 'Business Communication',
    is_premium: false,
    usage_cost: 1,
    rating: 4.8,
    usage_count: 1250,
    variables: [
      {
        id: 'subject',
        name: 'subject',
        type: 'text',
        required: true,
        description: 'The subject you are following up on'
      },
      {
        id: 'recipient_name',
        name: 'recipient_name',
        type: 'text',
        required: true,
        description: 'Name of the person you are emailing'
      },
      {
        id: 'interaction_type',
        name: 'interaction_type',
        type: 'select',
        required: true,
        description: 'Type of previous interaction',
        options: ['meeting', 'phone call', 'presentation', 'discussion', 'proposal']
      },
      {
        id: 'topic',
        name: 'topic',
        type: 'text',
        required: true,
        description: 'The main topic discussed'
      },
      {
        id: 'main_message',
        name: 'main_message',
        type: 'textarea',
        required: true,
        description: 'Your main follow-up message'
      },
      {
        id: 'desired_action',
        name: 'desired_action',
        type: 'text',
        required: true,
        description: 'What you want them to do next'
      },
      {
        id: 'sender_name',
        name: 'sender_name',
        type: 'text',
        required: true,
        description: 'Your full name'
      },
      {
        id: 'sender_title',
        name: 'sender_title',
        type: 'text',
        required: false,
        description: 'Your job title'
      },
      {
        id: 'company_name',
        name: 'company_name',
        type: 'text',
        required: false,
        description: 'Your company name'
      }
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-08-15T15:30:00Z'
  },
  {
    id: 'marketing-copy',
    name: 'Product Launch Marketing Copy',
    description: 'Generate compelling marketing copy for new product launches',
    content: `🚀 Introducing {product_name} - {tagline}

{hook_statement}

✨ Key Benefits:
{benefits}

🎯 Perfect for: {target_audience}

{call_to_action}

{offer_details}

Ready to {desired_outcome}? Get started today!

{contact_info}`,
    category: 'Marketing',
    is_premium: true,
    usage_cost: 3,
    rating: 4.9,
    usage_count: 850,
    variables: [
      {
        id: 'product_name',
        name: 'product_name',
        type: 'text',
        required: true,
        description: 'Name of your product'
      },
      {
        id: 'tagline',
        name: 'tagline',
        type: 'text',
        required: true,
        description: 'Compelling tagline for your product'
      },
      {
        id: 'hook_statement',
        name: 'hook_statement',
        type: 'textarea',
        required: true,
        description: 'Opening hook to grab attention'
      },
      {
        id: 'benefits',
        name: 'benefits',
        type: 'textarea',
        required: true,
        description: 'List of key benefits (bullet points)'
      },
      {
        id: 'target_audience',
        name: 'target_audience',
        type: 'text',
        required: true,
        description: 'Who this product is for'
      },
      {
        id: 'call_to_action',
        name: 'call_to_action',
        type: 'text',
        required: true,
        description: 'What you want people to do'
      },
      {
        id: 'offer_details',
        name: 'offer_details',
        type: 'textarea',
        required: false,
        description: 'Special offers or pricing details'
      },
      {
        id: 'desired_outcome',
        name: 'desired_outcome',
        type: 'text',
        required: true,
        description: 'The outcome customers will achieve'
      },
      {
        id: 'contact_info',
        name: 'contact_info',
        type: 'text',
        required: false,
        description: 'Contact information or website'
      }
    ],
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-08-10T11:20:00Z'
  },
  {
    id: 'code-documentation',
    name: 'API Documentation Template',
    description: 'Create comprehensive API documentation for developers',
    content: `# {api_name} API Documentation

## Overview
{api_description}

## Base URL
\`{base_url}\`

## Authentication
{auth_method}

## Endpoints

### {endpoint_name}
**Method:** \`{http_method}\`  
**URL:** \`{endpoint_url}\`

#### Description
{endpoint_description}

#### Parameters
{parameters}

#### Request Example
\`\`\`{request_language}
{request_example}
\`\`\`

#### Response Example
\`\`\`json
{response_example}
\`\`\`

#### Error Codes
{error_codes}

## Rate Limiting
{rate_limit_info}

## Support
{support_info}`,
    category: 'Technical',
    is_premium: false,
    usage_cost: 2,
    rating: 4.6,
    usage_count: 450,
    variables: [
      {
        id: 'api_name',
        name: 'api_name',
        type: 'text',
        required: true,
        description: 'Name of your API'
      },
      {
        id: 'api_description',
        name: 'api_description',
        type: 'textarea',
        required: true,
        description: 'Brief description of what the API does'
      },
      {
        id: 'base_url',
        name: 'base_url',
        type: 'text',
        required: true,
        description: 'Base URL for the API'
      },
      {
        id: 'auth_method',
        name: 'auth_method',
        type: 'select',
        required: true,
        description: 'Authentication method',
        options: ['API Key', 'Bearer Token', 'OAuth 2.0', 'Basic Auth']
      },
      {
        id: 'endpoint_name',
        name: 'endpoint_name',
        type: 'text',
        required: true,
        description: 'Name of the main endpoint'
      },
      {
        id: 'http_method',
        name: 'http_method',
        type: 'select',
        required: true,
        description: 'HTTP method',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      },
      {
        id: 'endpoint_url',
        name: 'endpoint_url',
        type: 'text',
        required: true,
        description: 'Endpoint URL path'
      },
      {
        id: 'endpoint_description',
        name: 'endpoint_description',
        type: 'textarea',
        required: true,
        description: 'What this endpoint does'
      },
      {
        id: 'parameters',
        name: 'parameters',
        type: 'textarea',
        required: true,
        description: 'List of parameters with descriptions'
      },
      {
        id: 'request_language',
        name: 'request_language',
        type: 'select',
        required: true,
        description: 'Programming language for example',
        options: ['curl', 'javascript', 'python', 'php', 'java']
      },
      {
        id: 'request_example',
        name: 'request_example',
        type: 'textarea',
        required: true,
        description: 'Example request code'
      },
      {
        id: 'response_example',
        name: 'response_example',
        type: 'textarea',
        required: true,
        description: 'Example JSON response'
      },
      {
        id: 'error_codes',
        name: 'error_codes',
        type: 'textarea',
        required: true,
        description: 'List of possible error codes and meanings'
      },
      {
        id: 'rate_limit_info',
        name: 'rate_limit_info',
        type: 'text',
        required: false,
        description: 'Rate limiting information'
      },
      {
        id: 'support_info',
        name: 'support_info',
        type: 'text',
        required: false,
        description: 'Support contact information'
      }
    ],
    created_at: '2024-03-10T14:25:00Z',
    updated_at: '2024-08-05T16:45:00Z'
  }
];

export const mockCategories: Category[] = [
  {
    id: 'business-communication',
    name: 'Business Communication',
    description: 'Professional emails, proposals, and business correspondence',
    template_count: 25
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Marketing copy, social media posts, and promotional content',
    template_count: 18
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Documentation, code comments, and technical writing',
    template_count: 12
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Creative writing, storytelling, and content creation',
    template_count: 15
  },
  {
    id: 'legal',
    name: 'Legal',
    description: 'Contracts, legal documents, and formal agreements',
    template_count: 8
  }
];

// Mock functions to simulate API calls
export const mockGetIntentCandidates = async (userInput: string): Promise<{
  intent: IntentResponse;
  templates: Template[];
}> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple intent detection based on keywords
  let intent: string;
  let templates: Template[];
  
  if (userInput.toLowerCase().includes('email') || userInput.toLowerCase().includes('follow')) {
    intent = 'business_communication';
    templates = mockTemplates.filter(t => t.category === 'Business Communication');
  } else if (userInput.toLowerCase().includes('marketing') || userInput.toLowerCase().includes('launch')) {
    intent = 'marketing_content';
    templates = mockTemplates.filter(t => t.category === 'Marketing');
  } else if (userInput.toLowerCase().includes('api') || userInput.toLowerCase().includes('documentation')) {
    intent = 'technical_writing';
    templates = mockTemplates.filter(t => t.category === 'Technical');
  } else {
    intent = 'general_content';
    templates = mockTemplates.slice(0, 2); // Return first 2 templates
  }
  
  return {
    intent: {
      intent,
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
      suggested_templates: templates.map(t => t.id),
      parameters: {}
    },
    templates
  };
};

export const mockRenderTemplate = async (templateId: string, variables: Record<string, string>): Promise<RenderResponse> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const template = mockTemplates.find(t => t.id === templateId);
  if (!template) {
    throw new Error('Template not found');
  }
  
  // Simple template rendering - replace variables in content
  let rendered = template.content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    rendered = rendered.replace(regex, value || `[${key}]`);
  });
  
  // Generate some variants
  const variants = [
    rendered.replace(/\n\n/g, '\n\n🔹 '),
    rendered.replace(/Best regards,/g, 'Kind regards,'),
    rendered.replace(/Thank you/g, 'Many thanks')
  ].slice(0, 2);
  
  return {
    primary_result: rendered,
    variants,
    metadata: {
      template_id: templateId,
      render_time_ms: 1500,
      variables_used: Object.keys(variables).length,
      generated_at: new Date().toISOString()
    }
  };
};

export const mockAssessResponse = async (originalPrompt: string, llmResponse: string) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const score = Math.floor(Math.random() * 30) + 70; // Score between 70-100
  
  return {
    critique: "The response demonstrates good structure and professional tone. Consider adding more specific examples and ensuring the call-to-action is more prominent.",
    suggestions: [
      { text: "Add specific examples", action: "enhance" },
      { text: "Strengthen call-to-action", action: "improve" },
      { text: "Include social proof", action: "add" }
    ],
    score
  };
};