export interface SafeMarkdownOptions {
  allowBold?: boolean;
  allowItalic?: boolean;
  allowCode?: boolean;
  allowCodeBlocks?: boolean;
  maxLength?: number;
}

const DEFAULT_OPTIONS: Required<SafeMarkdownOptions> = {
  allowBold: true,
  allowItalic: true,
  allowCode: true,
  allowCodeBlocks: true,
  maxLength: 10000,
};

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (typeof text !== 'string') return '';

  // Truncate if too long
  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + '...';
  }

  // Escape HTML
  return escapeHtml(text);
}

export function renderSafeMarkdown(text: string, options: SafeMarkdownOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (typeof text !== 'string') return '';

  // Sanitize first
  let sanitized = sanitizeText(text, opts.maxLength);

  // Apply markdown-lite transformations
  if (opts.allowBold) {
    // **bold** or __bold__
    sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    sanitized = sanitized.replace(/__(.*?)__/g, '<strong>$1</strong>');
  }

  if (opts.allowItalic) {
    // *italic* or _italic_ (but not if it's part of bold)
    sanitized = sanitized.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
    sanitized = sanitized.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');
  }

  if (opts.allowCode) {
    // `inline code`
    sanitized = sanitized.replace(/`([^`]+?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>');
  }

  if (opts.allowCodeBlocks) {
    // ```code blocks```
    sanitized = sanitized.replace(
      /```(\w+)?\n?([\s\S]*?)```/g,
      '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto"><code>$2</code></pre>'
    );
  }

  // Convert newlines to line breaks
  sanitized = sanitized.replace(/\n/g, '<br>');

  return sanitized;
}

export function extractPlainText(html: string): string {
  // Remove HTML tags and convert entities back
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/<br>/g, '\n');
}

export function countTokensEstimate(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  // This is a very approximate calculation for display purposes only
  if (typeof text !== 'string') return 0;

  const cleanText = extractPlainText(text);
  return Math.ceil(cleanText.length / 4);
}

export function estimateCost(inputTokens: number, outputTokens: number): string {
  // Rough estimate for deepseek-chat pricing (as of 2024)
  // Input: ~$0.14 per 1M tokens
  // Output: ~$0.28 per 1M tokens
  const inputCost = (inputTokens / 1000000) * 0.14;
  const outputCost = (outputTokens / 1000000) * 0.28;
  const total = inputCost + outputCost;

  if (total < 0.001) {
    return '<$0.001';
  }

  return `$${total.toFixed(3)}`;
}

export function formatLatency(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }

  return `${(milliseconds / 1000).toFixed(1)}s`;
}