/**
 * Performance Optimization Examples
 *
 * This file demonstrates performance optimizations for Sprint 7:
 * - Dynamic imports
 * - Code splitting
 * - React.memo
 * - Lazy loading
 */

import dynamic from 'next/dynamic';
import { lazy, Suspense } from 'react';
import { memo } from 'react';
import { PapyrusSkeletonCard, PapyrusSkeletonOptimizer, PapyrusSkeletonBroadcast } from '@/components/ui/PapyrusSkeleton';

// ============================================
// 1. DYNAMIC IMPORTS FOR HEAVY PAGES
// ============================================

// Broadcast Page - Heavy component with multiple AI models
const BroadcastPage = dynamic(
  () => import('@/app/(shell)/broadcast/page').then(mod => mod.default),
  {
    loading: () => (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <PapyrusSkeletonBroadcast />
        <PapyrusSkeletonBroadcast />
        <PapyrusSkeletonBroadcast />
      </div>
    ),
    ssr: false, // Client-side only if it uses browser APIs
  }
);

// AskMe Modal - Interactive wizard component
const AskMeModal = dynamic(
  () => import('@/components/ai/AskMeModal'),
  {
    loading: () => (
      <div className="max-w-4xl mx-auto">
        <PapyrusSkeletonOptimizer />
      </div>
    ),
  }
);

// Optimizer Page - Complex optimization interface
const OptimizerPage = dynamic(
  () => import('@/app/(shell)/optimizer/page'),
  {
    loading: () => (
      <div className="max-w-6xl mx-auto p-6">
        <PapyrusSkeletonOptimizer />
      </div>
    ),
  }
);

// Template Manager - Library view with many items
const TemplateLibrary = dynamic(
  () => import('@/components/prompt/PromptLibrary'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PapyrusSkeletonCard />
        <PapyrusSkeletonCard />
        <PapyrusSkeletonCard />
      </div>
    ),
  }
);

// ============================================
// 2. DYNAMIC IMPORTS WITH CONDITIONAL LOADING
// ============================================

interface ConditionalLoadProps {
  showBroadcast?: boolean;
  showOptimizer?: boolean;
}

export function ConditionalLoadExample({
  showBroadcast = false,
  showOptimizer = false,
}: ConditionalLoadProps) {
  return (
    <div>
      {/* Only loads BroadcastPage when needed */}
      {showBroadcast && <BroadcastPage />}

      {/* Only loads OptimizerPage when needed */}
      {showOptimizer && <OptimizerPage />}
    </div>
  );
}

// ============================================
// 3. REACT.MEMO FOR PERFORMANCE-CRITICAL COMPONENTS
// ============================================

// Example: Template Card that appears in lists
const TemplateCardBase = ({ template, onClick, onCopy }: any) => {
  return (
    <div onClick={onClick} className="template-card">
      {/* Card content */}
      <h3>{template.title}</h3>
      <p>{template.description}</p>
      <button onClick={(e) => onCopy(template.content, e)}>Copy</button>
    </div>
  );
};

// Memoize to prevent re-renders during scroll
export const TemplateCard = memo(TemplateCardBase);

// Comparison function for fine-grained control
export const OptimizedTemplateCard = memo(
  TemplateCardBase,
  (prevProps, nextProps) => {
    // Only re-render if template ID or essential props change
    return (
      prevProps.template.id === nextProps.template.id &&
      prevProps.template.updatedAt === nextProps.template.updatedAt
    );
  }
);

// ============================================
// 4. LAZY LOADING WITH SUSPENSE
// ============================================

// Lazy load heavy chart component
const AnalyticsChart = lazy(() =>
  import('@/components/dashboard/DailyTrendChart')
);

// Lazy load rich text editor
const RichTextEditor = lazy(() =>
  import('@/components/editor/RichTextEditor')
);

export function LazyLoadExample() {
  return (
    <div>
      {/* Suspense boundary with loading state */}
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center">
            <PapyrusSkeletonBase className="h-full w-full" />
          </div>
        }
      >
        <AnalyticsChart data={[]} />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-96">
            <PapyrusSkeletonText lines={10} />
          </div>
        }
      >
        <RichTextEditor />
      </Suspense>
    </div>
  );
}

// ============================================
// 5. CODE SPLITTING BY FEATURE
// ============================================

// Feature bundles
export const BroadcastBundle = dynamic(() =>
  import('@/features/broadcast/BroadcastBundle')
);

export const OptimizerBundle = dynamic(() =>
  import('@/features/optimizer/OptimizerBundle')
);

export const AskMeBundle = dynamic(() =>
  import('@/features/askme/AskMeBundle')
);

// ============================================
// 6. COMPONENT COMPOSITION WITH DYNAMIC IMPORTS
// ============================================

export function OptimizedDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'optimizer' | 'broadcast'>('overview');

  return (
    <div className="dashboard">
      <nav>
        <button onClick={() => setActiveView('overview')}>Overview</button>
        <button onClick={() => setActiveView('optimizer')}>Optimizer</button>
        <button onClick={() => setActiveView('broadcast')}>Broadcast</button>
      </nav>

      <main>
        {activeView === 'overview' && <DashboardOverview />}
        {activeView === 'optimizer' && <OptimizerPage />}
        {activeView === 'broadcast' && <BroadcastPage />}
      </main>
    </div>
  );
}

// ============================================
// 7. IMAGE OPTIMIZATION EXAMPLES
// ============================================

import Image from 'next/image';

export function OptimizedImageExample({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="rounded-lg shadow-lg"
      loading="lazy" // Lazy load off-screen images
      quality={85} // Balance quality and size
      placeholder="blur" // Show blur placeholder
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Base64 blur
    />
  );
}

export function HeroImageExample({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={600}
      className="w-full h-auto"
      priority // Load immediately for above-fold content
      quality={90}
    />
  );
}

// ============================================
// 8. PREFETCHING NAVIGATION LINKS
// ============================================

import Link from 'next/link';

export function OptimizedNavigation() {
  return (
    <nav className="navigation">
      {/* Prefetch on hover (default) */}
      <Link href="/broadcast" prefetch={true}>
        Broadcast
      </Link>

      {/* Prefetch immediately for important routes */}
      <Link href="/optimizer" prefetch={true} className="font-bold">
        Optimizer
      </Link>

      {/* No prefetch for less used routes */}
      <Link href="/settings" prefetch={false}>
        Settings
      </Link>

      {/* Prefetch on intent (iOS Safari style) */}
      <Link href="/templates" prefetch="intent">
        Templates
      </Link>
    </nav>
  );
}

// ============================================
// 9. BUNDLE ANALYSIS OPTIMIZATION
// ============================================

// In next.config.js:
/*
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Framework bundle
        framework: {
          name: 'framework',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          priority: 40,
          enforce: true,
        },
        // AI libraries bundle
        ai: {
          name: 'ai',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](openai|anthropic|langchain)[\\/]/,
          priority: 30,
        },
        // UI library bundle
        ui: {
          name: 'ui',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](framer-motion|lucide-react|radix-ui)[\\/]/,
          priority: 20,
        },
        // Other vendors
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    };
    return config;
  },
};
*/

// ============================================
// 10. PERFORMANCE MONITORING
// ============================================

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`${entry.name}:`, entry.duration);

          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: entry.name,
              value: Math.round(entry.startTime + entry.duration),
              event_category: 'Web Vitals',
            });
          }
        });
      });

      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });

      return () => observer.disconnect();
    }
  }, []);

  return null; // Invisible component
}

// ============================================
// 11. VIRTUAL SCROLLING FOR LISTS
// ============================================

// For very long lists (1000+ items), use virtual scrolling
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualScrollList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Render 5 extra items above/below
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TemplateCard template={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 12. DEBOUNCE AND THROTTLE OPTIMIZATIONS
// ============================================

import { useCallback } from 'react';

// Debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage in components
export function SearchComponent() {
  const handleSearch = useCallback(
    debounce((query: string) => {
      // Perform search
      console.log('Searching:', query);
    }, 300),
    []
  );

  const handleScroll = useCallback(
    throttle((event: Event) => {
      // Handle scroll
      console.log('Scrolling');
    }, 100),
    []
  );

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}

// ============================================
// EXPORTS
// ============================================

export {
  BroadcastPage,
  AskMeModal,
  OptimizerPage,
  TemplateLibrary,
  ConditionalLoadExample,
  LazyLoadExample,
  OptimizedDashboard,
  OptimizedImageExample,
  HeroImageExample,
  OptimizedNavigation,
  PerformanceMonitor,
  VirtualScrollList,
  SearchComponent,
};
