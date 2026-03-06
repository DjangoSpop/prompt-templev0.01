'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  Copy,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Globe,
  Target,
  Zap,
  BarChart3,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProjectInput {
  productName: string;
  productType: string;
  targetAudience: string;
  targetMarket: string;
  primaryLanguage: string;
  mainFeatures: string;
  primaryBusinessGoal: string;
  primaryKeywords: string;
  secondaryKeywords: string;
  competitors: string;
  contentStrategy: string;
  techStack: string;
  specialConstraints: string;
}

const PRODUCT_TYPES = [
  'SaaS',
  'Web App',
  'Marketplace',
  'Platform',
  'CMS',
  'Mobile Web App',
  'E-commerce',
  'Developer Tool',
  'API / Developer Platform',
  'Other',
];

const BUSINESS_GOALS = [
  'Lead generation',
  'SaaS subscriptions',
  'Downloads',
  'Marketplace transactions',
  'Ad revenue',
  'Freemium conversion',
  'Enterprise sales',
  'Other',
];

const CONTENT_STRATEGIES = [
  'Blog',
  'Knowledge Base',
  'Documentation',
  'Tutorials',
  'Case Studies',
  'Community',
  'Video',
  'Multiple (Blog + Docs + KB)',
  'None',
];

const DEFAULT_INPUT: ProjectInput = {
  productName: '',
  productType: '',
  targetAudience: '',
  targetMarket: '',
  primaryLanguage: 'English',
  mainFeatures: '',
  primaryBusinessGoal: '',
  primaryKeywords: '',
  secondaryKeywords: '',
  competitors: '',
  contentStrategy: '',
  techStack: '',
  specialConstraints: '',
};

// ─── Markdown renderer (lightweight, no external deps) ───────────────────────

function renderMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="seo-code-block" data-lang="${lang || 'text'}"><code>${escapeHtml(code.trim())}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="seo-inline-code">$1</code>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="seo-h1">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="seo-h2">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="seo-h3">$1</h3>')
    // H4
    .replace(/^#### (.+)$/gm, '<h4 class="seo-h4">$1</h4>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Checkbox list items
    .replace(/^- \[x\] (.+)$/gm, '<li class="seo-check checked">✅ $1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="seo-check">☐ $1</li>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="seo-li">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="seo-li-ordered">$1</li>')
    // Tables — wrap rows
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.slice(1, -1).split('|').map(c => c.trim());
      const isDivider = cells.every(c => /^[-:]+$/.test(c));
      if (isDivider) return '';
      const tag = 'td';
      return `<tr>${cells.map(c => `<${tag} class="seo-td">${c}</${tag}>`).join('')}</tr>`;
    })
    // Horizontal rules
    .replace(/^---+$/gm, '<hr class="seo-hr" />')
    // Paragraphs — double newlines
    .replace(/\n\n(?!<)/g, '</p><p class="seo-p">')
    // Wrap in paragraph start
    .replace(/^(?!<)/, '<p class="seo-p">')
    // Close last paragraph
    .replace(/(?<!\>)$/, '</p>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Field component ──────────────────────────────────────────────────────────

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
        {label}
        {required && <span className="text-amber-400 text-xs">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeoSpecGeneratorPage() {
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState<ProjectInput>(DEFAULT_INPUT);
  const [generatedSpec, setGeneratedSpec] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((field: keyof ProjectInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort();
    setInput(DEFAULT_INPUT);
    setGeneratedSpec('');
    setIsComplete(false);
    setError(null);
    setShowForm(true);
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!input.productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    setError(null);
    setGeneratedSpec('');
    setIsComplete(false);
    setIsGenerating(true);
    setShowForm(false);

    // Scroll to output
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    abortRef.current = new AbortController();

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

      const response = await fetch('/api/seo-spec/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(input),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Generation failed');
        throw new Error(errText || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (line === 'data: [DONE]') {
            setIsComplete(true);
            setIsGenerating(false);
            return;
          }
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            try {
              const parsed = JSON.parse(raw);
              // OpenAI-compatible streaming token
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                setGeneratedSpec(accumulated);
              }
              // Stream complete signal
              if (parsed?.stream_complete || parsed?.done) {
                setIsComplete(true);
                setIsGenerating(false);
                return;
              }
              // Error from backend
              if (parsed?.error) {
                throw new Error(String(parsed.error));
              }
            } catch (parseErr) {
              // Non-JSON line — ignore
            }
          }
        }
      }

      setIsComplete(true);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Failed to generate specification. Please try again.');
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSpec).then(() => {
      toast.success('Specification copied to clipboard!');
    });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSpec], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-spec-${input.productName.toLowerCase().replace(/\s+/g, '-') || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Specification downloaded!');
  };

  const wordCount = generatedSpec.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #0A0A18 50%, #0D0D0D 100%)' }}>
      {/* Header */}
      <div className="border-b border-amber-500/20 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f4d03f, #b8941f)' }}
            >
              <Search className="h-4 w-4 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                SEO Spec Generator
              </h1>
              <p className="text-xs text-gray-400">Technical SEO Requirements Document — by SpectraRank</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className="text-xs px-2 py-0.5"
              style={{ background: 'rgba(245,197,24,0.15)', color: '#f4d03f', border: '1px solid rgba(245,197,24,0.3)' }}
            >
              Professional
            </Badge>
            <Badge
              className="text-xs px-2 py-0.5"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              Technical SEO
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Hero Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.08), rgba(139,92,246,0.08))', borderColor: 'rgba(245,197,24,0.2)', border: '1px solid rgba(245,197,24,0.2)' }}
          >
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: <FileText className="h-4 w-4" />, label: '10 Sections', desc: 'Complete spec doc', color: 'text-amber-400' },
                  { icon: <Target className="h-4 w-4" />, label: 'Dev-Ready', desc: 'Implementation specs', color: 'text-emerald-400' },
                  { icon: <Globe className="h-4 w-4" />, label: 'AI Search', desc: 'LLM & SGE optimized', color: 'text-sky-400' },
                  { icon: <Zap className="h-4 w-4" />, label: 'CWV Focus', desc: 'Core Web Vitals', color: 'text-purple-400' },
                ].map(({ icon, label, desc, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`${color} shrink-0`}>{icon}</div>
                    <div>
                      <p className={`text-sm font-semibold ${color}`}>{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Input Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className="border overflow-hidden"
                style={{ background: 'rgba(10,10,24,0.8)', borderColor: 'rgba(245,197,24,0.15)' }}
              >
                <CardHeader className="pb-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Brain className="h-5 w-5 text-amber-400" />
                        Project Input
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        Fill in your project details. Richer input = more precise specification.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Row 1: Product Name + Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Product Name" required hint="The official name of your product or platform">
                      <Input
                        value={input.productName}
                        onChange={e => handleChange('productName', e.target.value)}
                        placeholder="e.g., PromptTemple"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50"
                      />
                    </FormField>

                    <FormField label="Product Type" required hint="What category best describes your product">
                      <Select value={input.productType} onValueChange={v => handleChange('productType', v)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  {/* Row 2: Audience + Market */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Target Audience" hint="Who are your primary users?">
                      <Input
                        value={input.targetAudience}
                        onChange={e => handleChange('targetAudience', e.target.value)}
                        placeholder="e.g., Developers, SMBs, Marketers"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50"
                      />
                    </FormField>

                    <FormField label="Target Market" hint="Geographic or demographic focus">
                      <Input
                        value={input.targetMarket}
                        onChange={e => handleChange('targetMarket', e.target.value)}
                        placeholder="e.g., Global, USA, MENA, EU"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50"
                      />
                    </FormField>
                  </div>

                  {/* Row 3: Language + Business Goal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Primary Language" hint="Main language for content and UI">
                      <Input
                        value={input.primaryLanguage}
                        onChange={e => handleChange('primaryLanguage', e.target.value)}
                        placeholder="e.g., English / Arabic / Multilingual"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50"
                      />
                    </FormField>

                    <FormField label="Primary Business Goal" hint="What is the main conversion action?">
                      <Select value={input.primaryBusinessGoal} onValueChange={v => handleChange('primaryBusinessGoal', v)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select goal..." />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_GOALS.map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  {/* Main Features */}
                  <FormField
                    label="Main Features"
                    hint="List 4–8 core features, one per line or comma-separated"
                  >
                    <Textarea
                      value={input.mainFeatures}
                      onChange={e => handleChange('mainFeatures', e.target.value)}
                      placeholder={"e.g.:\n- AI prompt optimization\n- Template library with 100+ prompts\n- Real-time streaming responses\n- Gamification system"}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50 min-h-[100px] resize-y"
                    />
                  </FormField>

                  {/* Keywords Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Primary Keywords"
                      required
                      hint="5–10 core SEO keywords or themes"
                    >
                      <Textarea
                        value={input.primaryKeywords}
                        onChange={e => handleChange('primaryKeywords', e.target.value)}
                        placeholder={"e.g.:\nprompt optimizer\nAI prompt engineering\nChatGPT prompt tool"}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50 min-h-[90px] resize-y"
                      />
                    </FormField>

                    <FormField
                      label="Secondary Keywords"
                      hint="Long-tail or niche supporting keywords"
                    >
                      <Textarea
                        value={input.secondaryKeywords}
                        onChange={e => handleChange('secondaryKeywords', e.target.value)}
                        placeholder={"e.g.:\nhow to write better ChatGPT prompts\nbest prompt templates for marketers\nfree AI prompt builder"}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50 min-h-[90px] resize-y"
                      />
                    </FormField>
                  </div>

                  {/* Competitors */}
                  <FormField label="Competitors" hint="3–5 known competitors or similar platforms">
                    <Input
                      value={input.competitors}
                      onChange={e => handleChange('competitors', e.target.value)}
                      placeholder="e.g., PromptBase, FlowGPT, Snack Prompt, PromptHero"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50"
                    />
                  </FormField>

                  {/* Row: Content Strategy + Tech Stack */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Content Strategy" hint="What content types will you publish?">
                      <Select value={input.contentStrategy} onValueChange={v => handleChange('contentStrategy', v)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select strategy..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_STRATEGIES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Tech Stack" hint="Frontend + backend framework, hosting">
                      <Input
                        value={input.techStack}
                        onChange={e => handleChange('techStack', e.target.value)}
                        placeholder="e.g., Next.js + Django + Vercel + PostgreSQL"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50"
                      />
                    </FormField>
                  </div>

                  {/* Special Constraints */}
                  <FormField
                    label="Special Constraints"
                    hint="RTL support, multilingual requirements, heavy JS, PWA, accessibility needs, etc."
                  >
                    <Input
                      value={input.specialConstraints}
                      onChange={e => handleChange('specialConstraints', e.target.value)}
                      placeholder="e.g., Arabic RTL support required, heavy JS SPA, multilingual (EN + AR + FR)"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-400/50"
                    />
                  </FormField>

                  {/* Generate Button */}
                  <div className="pt-2 flex gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !input.productName.trim()}
                      className="flex-1 h-11 font-semibold text-black"
                      style={{
                        background: 'linear-gradient(135deg, #f4d03f, #b8941f)',
                        boxShadow: '0 0 20px rgba(212,175,55,0.4)',
                        opacity: (!input.productName.trim() || isGenerating) ? 0.6 : 1,
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Specification...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate SEO Specification
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show form toggle when output is visible */}
        {!showForm && (generatedSpec || isGenerating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(s => !s)}
              className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
            >
              {showForm ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
              {showForm ? 'Hide Form' : 'Edit Project Input'}
            </Button>
          </motion.div>
        )}

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border border-red-500/30 bg-red-900/10">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300">Generation Failed</p>
                    <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={() => { setError(null); setShowForm(true); }}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Section */}
        <AnimatePresence>
          {(generatedSpec || isGenerating) && (
            <motion.div
              ref={outputRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className="border overflow-hidden"
                style={{ background: 'rgba(8,8,20,0.9)', borderColor: isComplete ? 'rgba(16,185,129,0.3)' : 'rgba(245,197,24,0.2)' }}
              >
                {/* Output Header */}
                <CardHeader className="py-3 px-6 border-b border-white/5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 rounded-full border-2 border-amber-400/30" />
                            <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 animate-spin" />
                          </div>
                          <span className="text-sm text-amber-300 font-medium">SpectraRank is generating your SEO specification…</span>
                        </div>
                      ) : isComplete ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-emerald-300 font-medium">Specification complete</span>
                        </div>
                      ) : null}

                      {generatedSpec && (
                        <Badge className="text-xs bg-white/5 text-gray-400 border-white/10">
                          <BarChart3 className="mr-1 h-3 w-3" />
                          {wordCount.toLocaleString()} words
                        </Badge>
                      )}
                    </div>

                    {isComplete && generatedSpec && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-white/10 text-gray-300 hover:bg-white/5"
                          onClick={handleCopy}
                        >
                          <Copy className="mr-1.5 h-3 w-3" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-white/10 text-gray-300 hover:bg-white/5"
                          onClick={handleDownload}
                        >
                          <Download className="mr-1.5 h-3 w-3" />
                          Download .md
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                          onClick={handleReset}
                        >
                          <RotateCcw className="mr-1.5 h-3 w-3" />
                          New Spec
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                {/* Specification Output */}
                <CardContent className="p-0">
                  <div
                    className="seo-spec-output p-6 md:p-8 overflow-auto max-h-[80vh]"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedSpec || '') }}
                  />

                  {/* Streaming cursor */}
                  {isGenerating && (
                    <div className="px-6 pb-4">
                      <span
                        className="inline-block w-0.5 h-4 bg-amber-400 animate-pulse"
                        style={{ verticalAlign: 'text-bottom' }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inline styles for the rendered markdown */}
      <style jsx global>{`
        .seo-spec-output {
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.7;
        }
        .seo-h1 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #f4d03f;
          margin: 2rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(244,208,63,0.3);
          font-family: 'Playfair Display', serif;
        }
        .seo-h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #a78bfa;
          margin: 1.75rem 0 0.75rem;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid rgba(167,139,250,0.2);
        }
        .seo-h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #34d399;
          margin: 1.25rem 0 0.5rem;
        }
        .seo-h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #60a5fa;
          margin: 1rem 0 0.4rem;
        }
        .seo-p {
          margin: 0.6rem 0;
          color: #cbd5e1;
        }
        .seo-code-block {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-size: 12.5px;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          color: #e2e8f0;
          position: relative;
        }
        .seo-code-block::before {
          content: attr(data-lang);
          position: absolute;
          top: 0.5rem;
          right: 0.75rem;
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .seo-inline-code {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 1px 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #fbbf24;
        }
        .seo-li, .seo-li-ordered {
          margin: 0.3rem 0 0.3rem 1.2rem;
          color: #cbd5e1;
          list-style: disc;
          display: list-item;
        }
        .seo-li-ordered {
          list-style: decimal;
        }
        .seo-check {
          margin: 0.3rem 0 0.3rem 0.2rem;
          color: #9ca3af;
          display: list-item;
          list-style: none;
        }
        .seo-check.checked {
          color: #34d399;
        }
        .seo-td {
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          vertical-align: top;
          font-size: 13px;
        }
        tr:first-child .seo-td {
          background: rgba(167,139,250,0.1);
          font-weight: 600;
          color: #a78bfa;
        }
        tr:nth-child(even) .seo-td {
          background: rgba(255,255,255,0.02);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .seo-hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}
