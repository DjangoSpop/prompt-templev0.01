/**
 * LessonContent Renderer
 *
 * Dynamically renders lesson content blocks (text, headings, code, callouts, interactive components)
 */

'use client';

import { LessonContent as LessonContentType } from '@/lib/academy/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle, CheckCircle, Lightbulb, AlertCircle } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { useAcademyStore } from '@/lib/stores/academyStore';

// Lazy load interactive components (Phase 2)
const PromptBuilder = lazy(() => import('./interactive/PromptBuilder'));
const BeforeAfterTransformer = lazy(() => import('./interactive/BeforeAfterTransformer'));
const ROICalculator = lazy(() => import('./interactive/ROICalculator'));
const PromptQualitySlider = lazy(() => import('./interactive/PromptQualitySlider'));
const SpotTheProblemGame = lazy(() => import('./interactive/SpotTheProblemGame'));

interface LessonContentRendererProps {
  content: LessonContentType[];
  lessonId: string;
}

export function LessonContent({ content, lessonId }: LessonContentRendererProps) {
  return (
    <div className="space-y-6">
      {content.map((block, index) => (
        <ContentBlock key={`${lessonId}-${index}`} block={block} blockIndex={index} />
      ))}
    </div>
  );
}

// Individual content block renderer
function ContentBlock({ block, blockIndex }: { block: LessonContentType; blockIndex: number }) {
  switch (block.type) {
    case 'text':
      return <TextBlock value={block.value} />;

    case 'heading':
      return <HeadingBlock level={block.level} value={block.value} />;

    case 'list':
      return <ListBlock items={block.items} ordered={block.ordered} />;

    case 'code':
      return <CodeBlock language={block.language} code={block.code} caption={block.caption} />;

    case 'callout':
      return <CalloutBlock variant={block.variant} text={block.text} title={block.title} />;

    case 'image':
      return <ImageBlock src={block.src} alt={block.alt} caption={block.caption} />;

    case 'interactive':
      return <InteractiveBlock component={block.component} props={block.props} />;

    case 'video':
      return <VideoBlock url={block.url} thumbnail={block.thumbnail} />;

    default:
      return null;
  }
}

// ============================================================================
// TEXT BLOCKS
// ============================================================================

function TextBlock({ value }: { value: string }) {
  return (
    <p className="text-desert-sand-100 leading-relaxed text-base lg:text-lg">
      {value}
    </p>
  );
}

// ============================================================================
// HEADING BLOCKS
// ============================================================================

function HeadingBlock({ level, value }: { level: 2 | 3 | 4; value: string }) {
  const baseClasses = "font-bold text-royal-gold-400 mb-3";

  switch (level) {
    case 2:
      return <h2 className={`${baseClasses} text-2xl lg:text-3xl mt-8`}>{value}</h2>;
    case 3:
      return <h3 className={`${baseClasses} text-xl lg:text-2xl mt-6`}>{value}</h3>;
    case 4:
      return <h4 className={`${baseClasses} text-lg lg:text-xl mt-4`}>{value}</h4>;
  }
}

// ============================================================================
// LIST BLOCKS
// ============================================================================

function ListBlock({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? 'ol' : 'ul';
  const listClasses = ordered
    ? "list-decimal list-inside space-y-2 text-desert-sand-100 ml-4"
    : "list-disc list-inside space-y-2 text-desert-sand-100 ml-4";

  return (
    <ListTag className={listClasses}>
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ListTag>
  );
}

// ============================================================================
// CODE BLOCKS
// ============================================================================

function CodeBlock({ language, code, caption }: { language: string; code: string; caption?: string }) {
  return (
    <div className="my-6">
      <div className="rounded-lg overflow-hidden border border-royal-gold-500/20 bg-obsidian-900">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.9rem',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'JetBrains Mono, monospace',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {caption && (
        <p className="text-sm text-desert-sand-400 mt-2 text-center italic">
          {caption}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// CALLOUT BLOCKS
// ============================================================================

function CalloutBlock({ variant, text, title }: { variant: string; text: string; title?: string }) {
  const variantConfig = {
    info: {
      icon: Info,
      className: 'border-lapis-blue-500/50 bg-lapis-blue-900/20',
      iconColor: 'text-lapis-blue-400',
      titleColor: 'text-lapis-blue-300',
    },
    warning: {
      icon: AlertTriangle,
      className: 'border-yellow-500/50 bg-yellow-900/20',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
    },
    success: {
      icon: CheckCircle,
      className: 'border-nile-teal-500/50 bg-nile-teal-900/20',
      iconColor: 'text-nile-teal-400',
      titleColor: 'text-nile-teal-300',
    },
    tip: {
      icon: Lightbulb,
      className: 'border-royal-gold-500/50 bg-royal-gold-900/20',
      iconColor: 'text-royal-gold-400',
      titleColor: 'text-royal-gold-300',
    },
    danger: {
      icon: AlertCircle,
      className: 'border-red-500/50 bg-red-900/20',
      iconColor: 'text-red-400',
      titleColor: 'text-red-300',
    },
  };

  const config = variantConfig[variant as keyof typeof variantConfig] || variantConfig.info;
  const Icon = config.icon;

  return (
    <Alert className={`${config.className} my-6`}>
      <Icon className={`h-5 w-5 ${config.iconColor}`} />
      {title && (
        <AlertTitle className={`${config.titleColor} font-semibold mb-2`}>
          {title}
        </AlertTitle>
      )}
      <AlertDescription className="text-desert-sand-100 leading-relaxed">
        {text}
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// IMAGE BLOCKS
// ============================================================================

function ImageBlock({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-8">
      <div className="rounded-lg overflow-hidden border border-royal-gold-500/20">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-desert-sand-400 mt-3 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ============================================================================
// INTERACTIVE BLOCKS (Lazy Loaded)
// ============================================================================

function InteractiveBlock({ component, props }: { component: string; props?: Record<string, any> }) {
  const { saveInteractiveState } = useAcademyStore();

  const handleStateChange = (componentId: string, state: any) => {
    saveInteractiveState(componentId, state);
  };

  return (
    <div className="my-8 p-6 bg-obsidian-900/50 rounded-lg border border-royal-gold-500/30">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold-500"></div>
          </div>
        }
      >
        {component === 'PromptBuilder' && (
          <PromptBuilder {...props} onStateChange={(state) => handleStateChange('prompt-builder', state)} />
        )}
        {component === 'BeforeAfterTransformer' && (
          <BeforeAfterTransformer {...props} onStateChange={(state) => handleStateChange('before-after', state)} />
        )}
        {component === 'ROICalculator' && (
          <ROICalculator {...props} onStateChange={(state) => handleStateChange('roi-calculator', state)} />
        )}
        {component === 'PromptQualitySlider' && (
          <PromptQualitySlider {...props} onStateChange={(state) => handleStateChange('quality-slider', state)} />
        )}
        {component === 'SpotTheProblemGame' && (
          <SpotTheProblemGame {...props} onStateChange={(state) => handleStateChange('spot-problem', state)} />
        )}
      </Suspense>
    </div>
  );
}

// ============================================================================
// VIDEO BLOCKS
// ============================================================================

function VideoBlock({ url, thumbnail }: { url: string; thumbnail?: string }) {
  // Simple video embed (YouTube, Vimeo, etc.)
  // This is a placeholder - would need to parse URL and create proper embed
  return (
    <div className="my-8 aspect-video rounded-lg overflow-hidden border border-royal-gold-500/20">
      <iframe
        src={url}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
