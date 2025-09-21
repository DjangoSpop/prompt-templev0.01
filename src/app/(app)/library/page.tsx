"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  
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
    // addNotification({
    //   id: Date.now().toString(),
    //   type: 'achievement',
    //   title: 'Template Used!',
    //   message: `You earned ${template.xpReward} XP from "${template.title}"`,
    //   read: false,
    //   timestamp: new Date()
    // });
  // };
  };
  const handleBookmark = (templateId: string) => {
    // Toggle bookmark logic would go here
    console.log('Toggle bookmark for:', templateId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Template Library
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover and use powerful AI templates to boost your productivity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <BookOpen className="h-4 w-4 mr-1" />
                {filteredTemplates.length} templates
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates, tags, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
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
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <Card className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] glass-effect ${rarityGlow[template.rarity]}`}>
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
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
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
                      <Button 
                        className="flex-1" 
                        onClick={() => handleTemplateUse(template)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm" className="px-3">
                        <Share2 className="h-4 w-4" />
                      </Button>
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
            <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search criteria or filters to find the templates you&apos;re looking for.
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
      </div>
    </div>
  );
}