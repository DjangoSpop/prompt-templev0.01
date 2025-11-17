'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useTemplate, useBookmarkTemplate, useRateTemplate } from '@/hooks/api';
import {
  Star,
  Heart,
  Users,
  TrendingUp,
  Copy,
  Check,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface EnhancedTemplateDetailViewProps {
  templateId: string;
}

export default function EnhancedTemplateDetailView({ templateId }: EnhancedTemplateDetailViewProps) {
  const { isAuthenticated } = useAuth();
  const { data: template, loading, error, fetch } = useTemplate(templateId);
  const { bookmark, loading: bookmarkLoading } = useBookmarkTemplate();
  const { rate, loading: ratingLoading } = useRateTemplate();

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (templateId) {
      fetch(templateId);
    }
  }, [templateId, fetch]);

  useEffect(() => {
    if (template) {
      setUserRating(template.user_rating || 0);
      setIsBookmarked(template.is_bookmarked || false);
    }
  }, [template]);

  const handleCopy = async () => {
    if (!template) return;
    try {
      await navigator.clipboard.writeText(template.template_content);
      setCopied(true);
      toast.success('Template copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy template');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark templates');
      return;
    }
    try {
      const result = await bookmark(templateId);
      setIsBookmarked(result.is_bookmarked);
      toast.success(result.message);
    } catch (error) {
      toast.error('Failed to bookmark template');
    }
  };

  const handleRating = async (rating: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to rate templates');
      return;
    }

    setUserRating(rating);

    // Show review form if rating is 4 or 5
    if (rating >= 4) {
      setShowReviewForm(true);
    } else {
      // Submit rating immediately for low ratings
      try {
        await rate(templateId, { rating });
        toast.success('Rating submitted!');
        fetch(templateId); // Refresh template data
      } catch (error) {
        toast.error('Failed to submit rating');
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await rate(templateId, { rating: userRating, review: review || undefined });
      toast.success('Thank you for your review!');
      setShowReviewForm(false);
      setReview('');
      fetch(templateId); // Refresh template data
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Template not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background container mx-auto px-4 py-8">
      {/* Header */}
      <Card className="temple-card pyramid-elevation mb-8">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-hieroglyph text-glow mb-3">
                {template.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {template.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="text-base py-1 px-3 border-oasis/30 text-oasis">
                  {template.category.name}
                </Badge>
                {template.is_featured && (
                  <Badge className="bg-pharaoh-gold text-white text-base py-1 px-3">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Featured
                  </Badge>
                )}
                {template.is_public && (
                  <Badge variant="outline" className="text-base py-1 px-3">
                    Public
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <Button
                variant={isBookmarked ? 'default' : 'outline'}
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className="flex items-center space-x-2"
              >
                {bookmarkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-pharaoh fill-current" />
              <div>
                <p className="text-2xl font-bold text-hieroglyph">
                  {template.average_rating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-oasis" />
              <div>
                <p className="text-2xl font-bold text-hieroglyph">
                  {template.usage_count.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Uses</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-hieroglyph">
                  {template.popularity_score}
                </p>
                <p className="text-xs text-muted-foreground">Popularity</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-hieroglyph">
                  {template.author?.username || 'Temple'}
                </p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Template Content */}
      <Card className="temple-card pyramid-elevation mb-8">
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-hieroglyph">Template Content</h2>
            <Button onClick={handleCopy} variant="outline" disabled={copied}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="p-6 bg-secondary rounded-lg border border-primary/20">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {template.template_content}
            </pre>
          </div>

          {template.variables && template.variables.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-hieroglyph mb-3">
                Variables ({template.variables.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <Badge key={variable} variant="outline">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {template.tags && template.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-hieroglyph mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Rating Section */}
      {isAuthenticated && (
        <Card className="temple-card pyramid-elevation">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-hieroglyph mb-4">Rate This Template</h2>

            <div className="flex items-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  onMouseEnter={() => setHoverRating(rating)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={ratingLoading}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= (hoverRating || userRating)
                        ? 'fill-pharaoh text-pharaoh'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              {userRating > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  Your rating: {userRating}/5
                </span>
              )}
            </div>

            {showReviewForm && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-hieroglyph mb-2 block">
                    Leave a review (optional)
                  </label>
                  <Textarea
                    placeholder="Share your experience with this template..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={handleSubmitReview} disabled={ratingLoading}>
                    {ratingLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Submit Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReview('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
