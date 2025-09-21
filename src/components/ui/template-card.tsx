'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Download, 
  Eye, 
  Bookmark, 
  Share2, 
  Play, 
  Crown, 
  Zap,
  Clock,
  User,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Template } from '@/store/templatesStore';
import { useI18nStore } from '@/store/i18nStore';

export interface TemplateCardProps {
  template: Template;
  onUse?: (template: Template) => void;
  onBookmark?: (templateId: string) => void;
  onShare?: (template: Template) => void;
  onView?: (template: Template) => void;
  variant?: 'grid' | 'list' | 'compact';
  showStats?: boolean;
  showActions?: boolean;
  className?: string;
}

const rarityColors = {
  'common': 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  'rare': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  'epic': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  'legendary': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-lg shadow-yellow-500/20'
};

const rarityGlow = {
  'common': '',
  'rare': 'ring-2 ring-blue-500/20',
  'epic': 'ring-2 ring-purple-500/20',
  'legendary': 'ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10'
};

const difficultyColors = {
  'Beginner': 'text-green-600 bg-green-50 border-green-200',
  'Intermediate': 'text-blue-600 bg-blue-50 border-blue-200',
  'Advanced': 'text-purple-600 bg-purple-50 border-purple-200',
  'Expert': 'text-red-600 bg-red-50 border-red-200'
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUse,
  onBookmark,
  onShare,
  onView,
  variant = 'grid',
  showStats = true,
  showActions = true,
  className,
}) => {
  const { t, isRTL } = useI18nStore();

  const handleUse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUse?.(template);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(template.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(template);
  };

  const handleCardClick = () => {
    onView?.(template);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat(isRTL ? 'ar' : 'en', { numeric: 'auto' }).format(
      -Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  // List variant
  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card 
          className={cn(
            'group cursor-pointer transition-all duration-300',
            'hover:shadow-md hover:border-accent/30',
            'glass-effect',
            rarityGlow[template.rarity],
            isRTL && 'text-right'
          )}
          onClick={handleCardClick}
        >
          <CardContent className="p-4">
            <div className={cn(
              'flex items-start gap-4',
              isRTL && 'flex-row-reverse'
            )}>
              {/* Avatar */}
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={template.author.avatar} />
                <AvatarFallback className="font-medium">
                  {template.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Header */}
                <div className={cn(
                  'flex items-start justify-between gap-2',
                  isRTL && 'flex-row-reverse'
                )}>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'flex items-center gap-2 mb-1',
                      isRTL && 'flex-row-reverse'
                    )}>
                      <h3 className="font-semibold text-lg truncate">
                        {template.title}
                      </h3>
                      
                      {/* Badges */}
                      <div className={cn(
                        'flex items-center gap-1.5 flex-shrink-0',
                        isRTL && 'flex-row-reverse'
                      )}>
                        <Badge className={cn('text-xs', rarityColors[template.rarity])}>
                          {t(`library.rarity.${template.rarity}`)}
                        </Badge>
                        
                        {template.isPremium && (
                          <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                            <Crown className="h-3 w-3 mr-1" />
                            {t('library.premium')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Bookmark */}
                  {showActions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmark}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Bookmark className={cn(
                        'h-4 w-4', 
                        template.isBookmarked && 'fill-current text-yellow-500'
                      )} />
                    </Button>
                  )}
                </div>

                {/* Meta info */}
                <div className={cn(
                  'flex items-center gap-4 text-sm text-muted-foreground',
                  isRTL && 'flex-row-reverse'
                )}>
                  <span className={cn(
                    'flex items-center gap-1',
                    isRTL && 'flex-row-reverse'
                  )}>
                    <User className="h-3.5 w-3.5" />
                    {template.author.name}
                  </span>
                  
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', difficultyColors[template.difficulty])}
                  >
                    {t(`library.difficulty.${template.difficulty.toLowerCase()}`)}
                  </Badge>
                  
                  {showStats && (
                    <>
                      <span className={cn(
                        'flex items-center gap-1',
                        isRTL && 'flex-row-reverse'
                      )}>
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {template.rating}
                      </span>
                      
                      <span className={cn(
                        'flex items-center gap-1',
                        isRTL && 'flex-row-reverse'
                      )}>
                        <Download className="h-3.5 w-3.5" />
                        {formatCount(template.downloads)}
                      </span>
                    </>
                  )}
                  
                  <span className={cn(
                    'flex items-center gap-1 text-accent',
                    isRTL && 'flex-row-reverse'
                  )}>
                    <Zap className="h-3.5 w-3.5" />
                    {template.xpReward} XP
                  </span>
                </div>

                {/* Tags */}
                <div className={cn(
                  'flex flex-wrap gap-1',
                  isRTL && 'flex-row-reverse'
                )}>
                  {template.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className={cn(
                  'flex items-center gap-2 flex-shrink-0',
                  isRTL && 'flex-row-reverse'
                )}>
                  <Button 
                    onClick={handleUse}
                    size="sm"
                    className="gap-1"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {t('library.useTemplate')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="p-2"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>

                  <ChevronRight className={cn(
                    'h-4 w-4 text-muted-foreground',
                    isRTL && 'rotate-180'
                  )} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card 
          className={cn(
            'group cursor-pointer transition-all duration-300',
            'hover:shadow-md hover:border-accent/30',
            rarityGlow[template.rarity],
            isRTL && 'text-right'
          )}
          onClick={handleCardClick}
        >
          <CardContent className="p-3">
            <div className={cn(
              'flex items-center justify-between gap-2',
              isRTL && 'flex-row-reverse'
            )}>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {template.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {template.author.name}
                </p>
              </div>
              
              <div className={cn(
                'flex items-center gap-1 flex-shrink-0',
                isRTL && 'flex-row-reverse'
              )}>
                <Badge className={cn('text-xs', rarityColors[template.rarity])}>
                  {template.rarity.charAt(0).toUpperCase()}
                </Badge>
                
                {showActions && (
                  <Button
                    onClick={handleUse}
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        className={cn(
          'group cursor-pointer transition-all duration-300',
          'hover:shadow-lg hover:border-accent/30',
          'glass-effect h-full flex flex-col',
          rarityGlow[template.rarity],
          isRTL && 'text-right'
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className={cn(
            'flex items-start justify-between mb-2',
            isRTL && 'flex-row-reverse'
          )}>
            <div className={cn(
              'flex items-center gap-2',
              isRTL && 'flex-row-reverse'
            )}>
              <Badge className={cn('text-xs', rarityColors[template.rarity])}>
                {t(`library.rarity.${template.rarity}`)}
              </Badge>
              
              {template.isPremium && (
                <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                  <Crown className="h-3 w-3 mr-1" />
                  {t('library.premium')}
                </Badge>
              )}
            </div>
            
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Bookmark className={cn(
                  'h-4 w-4',
                  template.isBookmarked && 'fill-current text-yellow-500'
                )} />
              </Button>
            )}
          </div>
          
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {template.title}
          </CardTitle>
          
          <CardDescription className="text-sm line-clamp-3 flex-1">
            {template.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          {/* Stats */}
          {showStats && (
            <div className={cn(
              'flex items-center justify-between text-sm text-muted-foreground',
              isRTL && 'flex-row-reverse'
            )}>
              <div className={cn(
                'flex items-center gap-3',
                isRTL && 'flex-row-reverse'
              )}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        'flex items-center gap-1',
                        isRTL && 'flex-row-reverse'
                      )}>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {template.rating}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('template.rating')}: {template.rating}/5</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        'flex items-center gap-1',
                        isRTL && 'flex-row-reverse'
                      )}>
                        <Download className="h-4 w-4" />
                        {formatCount(template.downloads)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{template.downloads.toLocaleString()} {t('template.downloads')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        'flex items-center gap-1',
                        isRTL && 'flex-row-reverse'
                      )}>
                        <Eye className="h-4 w-4" />
                        {formatCount(template.views)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{template.views.toLocaleString()} {t('template.views')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Author */}
          <div className={cn(
            'flex items-center gap-2',
            isRTL && 'flex-row-reverse'
          )}>
            <Avatar className="h-6 w-6">
              <AvatarImage src={template.author.avatar} />
              <AvatarFallback className="text-xs">
                {template.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {template.author.name}
            </span>
            <Badge variant="outline" className="text-xs">
              L{template.author.level}
            </Badge>
          </div>

          {/* Tags */}
          <div className={cn(
            'flex flex-wrap gap-1',
            isRTL && 'flex-row-reverse'
          )}>
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
          <div className={cn(
            'flex items-center justify-between mt-auto',
            isRTL && 'flex-row-reverse'
          )}>
            <Badge 
              variant="outline" 
              className={cn('text-xs', difficultyColors[template.difficulty])}
            >
              {t(`library.difficulty.${template.difficulty.toLowerCase()}`)}
            </Badge>
            
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium text-accent',
              isRTL && 'flex-row-reverse'
            )}>
              <Zap className="h-4 w-4" />
              {template.xpReward} XP
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className={cn(
              'flex gap-2 pt-2',
              isRTL && 'flex-row-reverse'
            )}>
              <Button 
                className="flex-1 gap-2"
                onClick={handleUse}
              >
                <Play className="h-4 w-4" />
                {t('library.useTemplate')}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className="px-3"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Last used indicator */}
          {template.lastUsed && (
            <div className={cn(
              'flex items-center gap-1 text-xs text-muted-foreground mt-2',
              isRTL && 'flex-row-reverse'
            )}>
              <Clock className="h-3 w-3" />
              {t('workspace.lastUsed', { date: formatDate(template.lastUsed) })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { TemplateCard };