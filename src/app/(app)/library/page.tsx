"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Code,
  Palette,
  Target,
  Lightbulb,
  TrendingUp,
  SlidersHorizontal,
  Search,
  ChevronDown,
  Crown,
  Bookmark,
  Star,
  Download,
  Eye,
  Zap,
  Play,
  Share2,
  Wand2,
  Layers,
} from "lucide-react";
import { AISearchBar } from "@/components/templates/AISearchBar";
import { SmartFillPanel } from "@/components/templates/SmartFillPanel";
import { VariationsDrawer } from "@/components/templates/VariationsDrawer";
import { EnhancedTemplateCard } from "@/components/EnhancedTemplateCard";
import type { TemplateList, TemplateDetail } from "@/lib/types";
import type { TemplateRecommendation } from "@/lib/api/typed-client";
import { apiClient } from "@/lib/api/typed-client";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  rating: number;
  downloads: number;
  views: number;
  author: {
    name: string;
    avatar: string;
    level: number;
  };
  tags: string[];
  xpReward: number;
  isPremium: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  lastUsed?: Date;
  content: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const mockTemplates: Template[] = [
  {
    id: "1",
    title: "Creative Writing Prompt Generator",
    description: "Generate unique and engaging creative writing prompts for any genre or theme.",
    category: "Creative Writing",
    difficulty: "Beginner",
    rating: 4.8,
    downloads: 12500,
    views: 45000,
    author: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
      level: 42
    },
    tags: ["writing", "creativity", "storytelling", "fiction"],
    xpReward: 50,
    isPremium: false,
    isBookmarked: true,
    createdAt: new Date("2024-01-15"),
    lastUsed: new Date("2024-01-20"),
    content: "Create a compelling story prompt about {theme} that includes {character_type}...",
    rarity: "rare"
  },
  {
    id: "2",
    title: "Advanced Code Review Assistant",
    description: "Comprehensive code review with security, performance, and best practices analysis.",
    category: "Development",
    difficulty: "Expert",
    rating: 4.9,
    downloads: 8900,
    views: 28000,
    author: {
      name: "Alex Rodriguez",
      avatar: "/avatars/alex.jpg",
      level: 67
    },
    tags: ["code", "review", "security", "performance", "best-practices"],
    xpReward: 150,
    isPremium: true,
    isBookmarked: false,
    createdAt: new Date("2024-01-10"),
    content: "Analyze the following code for {language} and provide detailed feedback on...",
    rarity: "legendary"
  },
  {
    id: "3",
    title: "UI/UX Design Critique",
    description: "Professional design feedback focusing on usability, accessibility, and visual hierarchy.",
    category: "Design",
    difficulty: "Intermediate",
    rating: 4.7,
    downloads: 15600,
    views: 52000,
    author: {
      name: "Maya Patel",
      avatar: "/avatars/maya.jpg",
      level: 38
    },
    tags: ["design", "ui", "ux", "usability", "accessibility"],
    xpReward: 75,
    isPremium: false,
    isBookmarked: true,
    createdAt: new Date("2024-01-12"),
    lastUsed: new Date("2024-01-18"),
    content: "Evaluate this {design_type} design and provide feedback on...",
    rarity: "epic"
  },
  {
    id: "4",
    title: "Marketing Campaign Strategist",
    description: "Create comprehensive marketing strategies tailored to your target audience and goals.",
    category: "Marketing",
    difficulty: "Advanced",
    rating: 4.6,
    downloads: 9800,
    views: 35000,
    author: {
      name: "Jordan Kim",
      avatar: "/avatars/jordan.jpg",
      level: 51
    },
    tags: ["marketing", "strategy", "campaign", "audience", "growth"],
    xpReward: 100,
    isPremium: true,
    isBookmarked: false,
    createdAt: new Date("2024-01-08"),
    content: "Develop a marketing strategy for {product_type} targeting {audience}...",
    rarity: "epic"
  },
  {
    id: "5",
    title: "Learning Path Creator",
    description: "Design personalized learning paths for any skill or subject area.",
    category: "Education",
    difficulty: "Intermediate",
    rating: 4.5,
    downloads: 11200,
    views: 41000,
    author: {
      name: "Dr. Emily Watson",
      avatar: "/avatars/emily.jpg",
      level: 29
    },
    tags: ["education", "learning", "curriculum", "skills", "development"],
    xpReward: 60,
    isPremium: false,
    isBookmarked: true,
    createdAt: new Date("2024-01-14"),
    content: "Create a structured learning path for {subject} suitable for {skill_level}...",
    rarity: "rare"
  },
  {
    id: "6",
    title: "Business Analysis Framework",
    description: "Comprehensive business analysis tool for market research and strategic planning.",
    category: "Business",
    difficulty: "Advanced",
    rating: 4.8,
    downloads: 7400,
    views: 22000,
    author: {
      name: "Michael Chen",
      avatar: "/avatars/michael.jpg",
      level: 55
    },
    tags: ["business", "analysis", "strategy", "market-research", "planning"],
    xpReward: 120,
    isPremium: true,
    isBookmarked: false,
    createdAt: new Date("2024-01-06"),
    content: "Analyze the business case for {business_idea} including market size...",
    rarity: "legendary"
  },
  {
    id: "7",
    title: "SEO Content Optimizer",
    description: "Optimize your content for search engines with keyword analysis and meta tag generation.",
    category: "Marketing",
    difficulty: "Intermediate",
    rating: 4.7,
    downloads: 13800,
    views: 47000,
    author: {
      name: "Lisa Park",
      avatar: "/avatars/lisa.jpg",
      level: 44
    },
    tags: ["seo", "content", "keywords", "optimization"],
    xpReward: 80,
    isPremium: false,
    isBookmarked: false,
    createdAt: new Date("2024-01-11"),
    content: "Analyze the following content for {topic} and suggest SEO improvements including...",
    rarity: "rare"
  },
  {
    id: "8",
    title: "API Documentation Writer",
    description: "Generate comprehensive API documentation with examples, parameters, and response schemas.",
    category: "Development",
    difficulty: "Advanced",
    rating: 4.8,
    downloads: 6200,
    views: 19000,
    author: {
      name: "Tom Hughes",
      avatar: "/avatars/tom.jpg",
      level: 61
    },
    tags: ["api", "documentation", "technical", "rest"],
    xpReward: 110,
    isPremium: true,
    isBookmarked: false,
    createdAt: new Date("2024-01-09"),
    content: "Generate API documentation for the {endpoint_name} endpoint that handles {operation}...",
    rarity: "epic"
  },
  {
    id: "9",
    title: "Customer Support Email Drafter",
    description: "Draft professional customer support responses that address issues empathetically and effectively.",
    category: "Business",
    difficulty: "Beginner",
    rating: 4.6,
    downloads: 18900,
    views: 63000,
    author: {
      name: "Nadia El-Amin",
      avatar: "/avatars/nadia.jpg",
      level: 35
    },
    tags: ["email", "support", "customer-service", "communication"],
    xpReward: 45,
    isPremium: false,
    isBookmarked: true,
    createdAt: new Date("2024-01-13"),
    lastUsed: new Date("2024-01-19"),
    content: "Draft a professional support response for a customer experiencing {issue_type}...",
    rarity: "common"
  }
];

const categories = [
  { id: "all", name: "All Templates", icon: BookOpen },
  { id: "creative-writing", name: "Creative Writing", icon: Lightbulb },
  { id: "development", name: "Development", icon: Code },
  { id: "design", name: "Design", icon: Palette },
  { id: "marketing", name: "Marketing", icon: TrendingUp },
  { id: "education", name: "Education", icon: BookOpen },
  { id: "business", name: "Business", icon: Target },
];

const difficultyColors = {
  'Beginner': 'text-green-500',
  'Intermediate': 'text-blue-500',
  'Advanced': 'text-purple-500',
  'Expert': 'text-red-500'
};

const rarityColors = {
  'common': 'text-gray-400',
  'rare': 'text-blue-400',
  'epic': 'text-purple-400',
  'legendary': 'text-yellow-400'
};

const rarityGlow = {
  'common': '',
  'rare': 'ring-2 ring-blue-400/20',
  'epic': 'ring-2 ring-purple-400/20',
  'legendary': 'ring-2 ring-yellow-400/20 shadow-lg shadow-yellow-400/10'
};

export default function LibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  // AI Features state
  const [smartFillTemplateId, setSmartFillTemplateId] = useState<string | null>(null);
  const [smartFillTemplate, setSmartFillTemplate] = useState<TemplateDetail | null>(null);
  const [smartFillOpen, setSmartFillOpen] = useState(false);
  const [variationsTemplateId, setVariationsTemplateId] = useState<string | null>(null);
  const [variationsTemplateTitle, setVariationsTemplateTitle] = useState("");
  const [variationsOpen, setVariationsOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<TemplateRecommendation[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const [isFetchingTemplate, setIsFetchingTemplate] = useState(false);

  const { addExperience, addNotification } = useGameStore();

  const filteredTemplates = useMemo(() => {
    const filtered = mockTemplates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || 
                             template.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
      
      const matchesDifficulty = selectedDifficulty === "all" || 
                               template.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      
      const matchesRarity = selectedRarity === "all" || 
                           template.rarity === selectedRarity;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesRarity;
    });

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'xp':
        filtered.sort((a, b) => b.xpReward - a.xpReward);
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedRarity, sortBy]);

  const handleTemplateUse = (template: Template) => {
    addExperience(template.xpReward);
    // Navigate to optimizer pre-filled with template content
    const params = new URLSearchParams({
      template: template.id,
      content: encodeURIComponent(template.content),
      title: template.title,
    });
    router.push(`/optimization?${params.toString()}`);
  };

  const handleBookmark = (templateId: string) => {
    // Toggle bookmark logic would go here
    console.log('Toggle bookmark for:', templateId);
  };

  // AI Feature Handlers
  const handleSmartFill = useCallback(async (templateId: string) => {
    setIsFetchingTemplate(true);
    try {
      // Fetch the full template with fields
      const template = await apiClient.getTemplate(templateId);
      setSmartFillTemplate(template);
      setSmartFillTemplateId(templateId);
      setSmartFillOpen(true);
    } catch (error) {
      console.error('Failed to fetch template for Smart Fill:', error);
      // Fallback: open with just the ID
      setSmartFillTemplateId(templateId);
      setSmartFillOpen(true);
    } finally {
      setIsFetchingTemplate(false);
    }
  }, []);

  const handleVariations = useCallback((templateId: string, templateTitle: string) => {
    setVariationsTemplateId(templateId);
    setVariationsTemplateTitle(templateTitle);
    setVariationsOpen(true);
  }, []);

  const handleKeywordSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setShowAiResults(false);
  }, []);

  const handleRecommendationSelect = useCallback((recommendation: TemplateRecommendation) => {
    // When user selects an AI recommendation, navigate to that template
    router.push(`/templates/${recommendation.template_id}`);
    setShowAiResults(false);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#C9A227] via-[#E8D48B] to-[#C9A227] bg-clip-text text-transparent">
                Template Library
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Discover sacred scrolls of prompt wisdom
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1 hidden sm:flex">
              <BookOpen className="h-4 w-4 mr-1" />
              {filteredTemplates.length} templates
            </Badge>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* AI-Powered Search */}
            <div className="relative flex-1">
              <AISearchBar
                onKeywordSearch={handleKeywordSearch}
                onRecommendationSelect={handleRecommendationSelect}
                placeholder="Search templates with AI (type 10+ chars for semantic search)…"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-background/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-background/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="xp">Most XP</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-background/50"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-secondary/20 rounded-lg border border-border/50"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Rarity</label>
                    <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Rarities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rarities</SelectItem>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Template Grid */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05
                }}
                layout
              >
                <Card className={`group relative cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 bg-card border-border/50 rounded-xl ${rarityGlow[template.rarity]}`}>
                  {/* Premium blur overlay for locked premium templates */}
                  {template.isPremium && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Crown className="h-8 w-8 text-yellow-400 mb-2" />
                      <p className="text-sm font-semibold text-white">Premium Template</p>
                      <p className="text-xs text-white/70 mt-1">Upgrade to unlock</p>
                      <button
                        onClick={() => router.push('/pricing')}
                        className="mt-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-1.5 text-xs font-bold text-black hover:from-yellow-300 hover:to-orange-400 transition-all"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${rarityColors[template.rarity]} bg-${template.rarity}/10`}
                        >
                          {template.rarity}
                        </Badge>
                        {template.isPremium && (
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(template.id)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Bookmark className={`h-4 w-4 ${template.isBookmarked ? 'fill-primary' : ''}`} />
                      </Button>
                    </div>
                    
                    <CardTitle className="text-lg leading-tight">{template.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {template.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {template.downloads > 1000 ? `${(template.downloads / 1000).toFixed(1)}k` : template.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {template.views > 1000 ? `${(template.views / 1000).toFixed(1)}k` : template.views}
                        </div>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={template.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {template.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{template.author.name}</span>
                      <Badge variant="outline" className="text-xs">
                        L{template.author.level}
                      </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[#EBD5A7]/20 text-[#C9A227] dark:bg-[#C9A227]/10 dark:text-[#E8D48B]">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Difficulty and XP */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${difficultyColors[template.difficulty]}`}
                      >
                        {template.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm font-medium text-experience">
                        <Zap className="h-4 w-4" />
                        {template.xpReward} XP
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleTemplateUse(template)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A227] text-white hover:bg-[#C9A227]/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        Use
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSmartFill(template.id);
                        }}
                        className="flex items-center gap-1.5 border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg px-3 py-2 text-sm transition-colors"
                        title="AI Fill — auto-fill variables with AI"
                      >
                        <Wand2 className="h-4 w-4" />
                        <span className="hidden sm:inline">AI Fill</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVariations(template.id, template.title);
                        }}
                        className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                        title="Generate variations"
                      >
                        <Layers className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/20">
              <BookOpen className="h-12 w-12 text-[#C9A227]/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No scrolls found in the library</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search criteria or filters to discover the sacred scrolls you seek.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
                setSelectedRarity("all");
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}

        {/* AI Features Modals */}
        {smartFillTemplateId && (
          <SmartFillPanel
            open={smartFillOpen}
            onOpenChange={setSmartFillOpen}
            templateId={smartFillTemplateId}
            templateTitle={smartFillTemplate?.title}
            templatePreview={smartFillTemplate?.template_content?.substring(0, 150)}
            variables={
              smartFillTemplate?.fields
                ? Object.fromEntries(
                    smartFillTemplate.fields.map((field) => [field.label, field.default_value || ''])
                  )
                : {}
            }
            onApply={(suggestions) => {
              console.log('Applied Smart Fill suggestions:', suggestions);
              // Navigate to optimizer with filled template
              const template = smartFillTemplate || mockTemplates.find(t => t.id === smartFillTemplateId);
              if (template) {
                let filledContent = 'template_content' in template ? template.template_content : template.content;
                Object.entries(suggestions).forEach(([key, value]) => {
                  // Try both {key} and {{key}} patterns
                  filledContent = filledContent.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
                  filledContent = filledContent.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
                });
                const params = new URLSearchParams({
                  template: template.id,
                  content: encodeURIComponent(filledContent),
                  title: `${template.title} (AI Filled)`,
                });
                router.push(`/optimization?${params.toString()}`);
              }
              setSmartFillOpen(false);
              setSmartFillTemplate(null);
              setSmartFillTemplateId(null);
            }}
          />
        )}

        {variationsTemplateId && (
          <VariationsDrawer
            open={variationsOpen}
            onOpenChange={setVariationsOpen}
            templateId={variationsTemplateId}
            templateTitle={variationsTemplateTitle}
            onUseVariation={(variation) => {
              console.log('Using variation:', variation);
              // Navigate to optimizer with variation content
              const params = new URLSearchParams({
                content: encodeURIComponent(variation.content),
                title: variation.title,
              });
              router.push(`/optimization?${params.toString()}`);
            }}
          />
        )}
      </div>
    </div>
  );
}