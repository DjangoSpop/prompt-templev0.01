'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '@/hooks/api';
import { TSearchResult } from '@/schemas/search';
import {
  Search as SearchIcon,
  Filter,
  Star,
  BookOpen,
  FileText,
  TrendingUp,
  Award,
  Users,
  Clock,
  Sparkles,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { data, loading, error, search, clear } = useSearch();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState<'all' | 'templates' | 'library'>('all');
  const [category, setCategory] = useState('');

  // Search on mount if query param exists
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = (query?: string) => {
    const q = query || searchQuery;
    if (!q.trim()) return;

    search({
      q: q.trim(),
      type: typeFilter === 'all' ? undefined : typeFilter,
      category: category || undefined,
      limit: 50,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const ResultCard = ({ result }: { result: TSearchResult }) => {
    const isTemplate = result.type === 'template';
    const item = result.item;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="temple-card pyramid-elevation hover:pharaoh-glow transition-all duration-300 group">
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {isTemplate ? (
                      <>
                        <FileText className="h-3 w-3 mr-1" />
                        Template
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-3 w-3 mr-1" />
                        Library
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-primary/30">
                    Match: {Math.round(result.score * 100)}%
                  </Badge>
                </div>

                <Link
                  href={
                    isTemplate
                      ? `/templates/${item.id}`
                      : `/library/${item.id}`
                  }
                  className="text-lg font-semibold text-hieroglyph hover:text-primary transition-colors group-hover:text-glow"
                >
                  {item.title}
                </Link>

                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {'description' in item ? item.description : 'content' in item ? item.content : ''}
                </p>
              </div>

              {'is_featured' in item && item.is_featured && (
                <div className="pharaoh-badge rounded-full p-1 flex-shrink-0 ml-2">
                  <Award className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-pharaoh fill-current" />
                <span>{item.average_rating.toFixed(1)}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-oasis" />
                <span>{item.usage_count.toLocaleString()}</span>
              </div>

              <Badge variant="outline" className="text-xs border-oasis/30 text-oasis">
                {'category' in item && typeof item.category === 'object'
                  ? item.category.name
                  : 'category' in item
                  ? item.category
                  : 'Unknown'}
              </Badge>

              {'ai_enhanced' in item && item.ai_enhanced && (
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                className="bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white"
                asChild
              >
                <Link
                  href={
                    isTemplate
                      ? `/templates/${item.id}`
                      : `/library/${item.id}`
                  }
                >
                  View {isTemplate ? 'Template' : 'Prompt'}
                </Link>
              </Button>
            </div>

            {'tags' in item && item.tags && item.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 5 && (
                  <span className="text-xs px-2 py-0.5 text-muted-foreground">
                    +{item.tags.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-full flex items-center justify-center shadow-pyramid"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SearchIcon className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-lapis-blue via-pharaoh-gold to-nile-teal bg-clip-text text-transparent">
              Search the Temple
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Find templates and prompts across the entire collection
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search Input */}
      <Card className="temple-card p-6 mb-8 pyramid-elevation">
        <div className="flex flex-col space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
              <input
                type="text"
                placeholder="Search for templates, prompts, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-secondary/50 text-lg"
                autoFocus
              />
            </div>
            <Button
              size="lg"
              onClick={() => handleSearch()}
              className="bg-pharaoh-gold hover:bg-pharaoh-gold/90"
            >
              <SearchIcon className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="library">Library</TabsTrigger>
              </TabsList>
            </Tabs>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary bg-secondary/50"
            >
              <option value="">All Categories</option>
              <option value="Marketing">Marketing</option>
              <option value="Writing">Writing</option>
              <option value="Coding">Coding</option>
              <option value="Analysis">Analysis</option>
              <option value="Creative">Creative</option>
              <option value="Business">Business</option>
            </select>

            {data && (
              <Button variant="outline" size="sm" onClick={clear}>
                Clear Results
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="temple-card p-8 text-center">
          <p className="text-destructive">Search failed. Please try again.</p>
        </Card>
      ) : data ? (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found <span className="font-semibold text-hieroglyph">{data.total_results}</span> results
              for "<span className="text-primary">{data.query}</span>"
              {data.took_ms && <span className="text-xs ml-2">({data.took_ms}ms)</span>}
            </p>
          </div>

          {data.results.length === 0 ? (
            <Card className="temple-card p-8 text-center pyramid-elevation">
              <SearchIcon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-hieroglyph mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try different keywords or browse our{' '}
                <Link href="/templates" className="text-primary hover:underline">
                  templates
                </Link>{' '}
                and{' '}
                <Link href="/library" className="text-primary hover:underline">
                  library
                </Link>
                .
              </p>
            </Card>
          ) : (
            <>
              <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" layout>
                <AnimatePresence mode="popLayout">
                  {data.results.map((result) => (
                    <ResultCard key={`${result.type}-${result.item.id}`} result={result} />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {(data.next || data.previous) && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={!data.previous}
                    onClick={() => {
                      // Handle pagination
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!data.next}
                    onClick={() => {
                      // Handle pagination
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <Card className="temple-card p-12 text-center pyramid-elevation">
          <SearchIcon className="h-16 w-16 text-primary mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-hieroglyph mb-4">Search the Temple</h3>
          <p className="text-muted-foreground text-lg mb-6">
            Enter a search query above to find templates and prompts
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('marketing email')}>
              marketing email
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('code review')}>
              code review
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('blog post')}>
              blog post
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('data analysis')}>
              data analysis
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
