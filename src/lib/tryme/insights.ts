export interface DemoTemplate {
  id: string;
  title: string;
  keywords: string[];
  category: string;
}

export interface ConversationContext {
  recentPrompts: string[];
  currentPrompt: string;
}

export class RAGAwareInsights {
  private demoTemplates: DemoTemplate[] = [];
  private readonly MAX_RECENT_PROMPTS = 5;

  constructor() {
    this.initializeDemoTemplates();
  }

  private initializeDemoTemplates() {
    this.demoTemplates = [
      {
        id: 'email-marketing',
        title: 'Email Marketing Campaign',
        keywords: ['email', 'marketing', 'campaign', 'newsletter', 'promotion'],
        category: 'marketing',
      },
      {
        id: 'code-review',
        title: 'Code Review Assistant',
        keywords: ['code', 'review', 'programming', 'development', 'bug'],
        category: 'development',
      },
      {
        id: 'content-creation',
        title: 'Content Creation',
        keywords: ['content', 'writing', 'blog', 'article', 'copy'],
        category: 'writing',
      },
      {
        id: 'data-analysis',
        title: 'Data Analysis Helper',
        keywords: ['data', 'analysis', 'statistics', 'insights', 'metrics'],
        category: 'analytics',
      },
      {
        id: 'customer-support',
        title: 'Customer Support Response',
        keywords: ['support', 'customer', 'service', 'help', 'assistance'],
        category: 'support',
      },
    ];
  }

  generateSuggestions(context: ConversationContext): string[] {
    const { currentPrompt, recentPrompts } = context;
    const allText = [currentPrompt, ...recentPrompts].join(' ').toLowerCase();

    const suggestions: string[] = [];

    // Content-based suggestions
    if (this.containsKeywords(allText, ['vague', 'unclear', 'general'])) {
      suggestions.push('Clarify your specific goal');
      suggestions.push('Add concrete examples');
    }

    if (this.containsKeywords(allText, ['write', 'create', 'generate'])) {
      suggestions.push('Specify target audience');
      suggestions.push('Define tone and style');
      suggestions.push('Set word count limits');
    }

    if (this.containsKeywords(allText, ['analyze', 'review', 'evaluate'])) {
      suggestions.push('Add evaluation criteria');
      suggestions.push('Specify output format');
    }

    if (this.containsKeywords(allText, ['help', 'assist', 'support'])) {
      suggestions.push('Define success metrics');
      suggestions.push('Add context constraints');
    }

    // Template-based suggestions
    const relevantTemplates = this.findRelevantTemplates(allText);
    relevantTemplates.slice(0, 2).forEach(template => {
      suggestions.push(`Use ${template.title} template`);
    });

    // General improvement suggestions
    if (currentPrompt.length < 50) {
      suggestions.push('Add more details');
    }

    if (!currentPrompt.includes('?') && !currentPrompt.includes('please')) {
      suggestions.push('Make it more conversational');
    }

    // Return top suggestions
    return Array.from(new Set(suggestions)).slice(0, 5);
  }

  generateRelevantContext(context: ConversationContext): string {
    const { currentPrompt, recentPrompts } = context;
    const allText = [currentPrompt, ...recentPrompts].join(' ').toLowerCase();

    const relevantTemplates = this.findRelevantTemplates(allText);
    const topTemplate = relevantTemplates[0];

    if (!topTemplate) {
      return 'Focus on clarity, specificity, and actionable outcomes.';
    }

    const contextParts = [
      `This appears to be a ${topTemplate.category} request.`,
      `Consider the ${topTemplate.title} approach.`,
    ];

    // Add category-specific guidance
    switch (topTemplate.category) {
      case 'marketing':
        contextParts.push('Include target audience, key message, and call-to-action.');
        break;
      case 'development':
        contextParts.push('Specify programming language, framework, and requirements.');
        break;
      case 'writing':
        contextParts.push('Define audience, tone, format, and key points to cover.');
        break;
      case 'analytics':
        contextParts.push('Clarify data sources, metrics, and desired insights.');
        break;
      case 'support':
        contextParts.push('Include context, urgency level, and preferred resolution.');
        break;
    }

    return contextParts.join(' ');
  }

  private findRelevantTemplates(text: string): DemoTemplate[] {
    return this.demoTemplates
      .map(template => ({
        template,
        score: this.calculateRelevanceScore(text, template.keywords),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.template);
  }

  private calculateRelevanceScore(text: string, keywords: string[]): number {
    const words = text.toLowerCase().split(/\s+/);
    const matchCount = keywords.filter(keyword =>
      words.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;

    return matchCount / keywords.length;
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  addToRecentPrompts(prompts: string[], newPrompt: string): string[] {
    const updated = [newPrompt, ...prompts];
    return updated.slice(0, this.MAX_RECENT_PROMPTS);
  }
}

export const ragInsights = new RAGAwareInsights();