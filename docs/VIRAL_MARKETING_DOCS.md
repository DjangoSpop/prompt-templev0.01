# 🏛️ PROMPT TEMPLE — VIRAL SHARING & GROWTH ENGINE

## Sprint: Viral Prompt Sharing System

**Objective**: Build a complete viral loop where users share optimized prompts on social media, driving new signups who become sharers themselves — targeting a viral coefficient of 1.5+.

**North Star**: Every prompt optimization is a potential social media post. Every share is a potential new user. Every new user is a potential sharer.

---

## 📐 ARCHITECTURE OVERVIEW

```
USER OPTIMIZES PROMPT
        │
        ▼
┌─────────────────────────┐
│  Wow Score ≥ 7/10?      │──No──▶ Standard flow
│  (auto-trigger share)   │
└────────┬────────────────┘
         │ Yes
         ▼
┌─────────────────────────┐
│  SHARE MODAL             │
│  ┌───────────────────┐   │
│  │ Before / After     │   │
│  │ Prompt Preview     │   │
│  │ Wow Score Badge    │   │
│  └───────────────────┘   │
│                           │
│  [Twitter] [LinkedIn]     │
│  [Copy Link] [Embed]      │
│  ┌───────────────────┐   │
│  │ +50 credits reward │   │
│  └───────────────────┘   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  PUBLIC SHARE PAGE       │
│  /share/{share_token}    │
│                           │
│  ┌───────────────────┐   │
│  │ Before → After     │   │
│  │ Wow Score          │   │
│  │ "Powered by        │   │
│  │  Prompt Temple"    │   │
│  └───────────────────┘   │
│                           │
│  [Try It Free] CTA       │
│  ┌───────────────────┐   │
│  │ OG Image auto-gen  │   │
│  │ (Twitter/LinkedIn  │   │
│  │  card preview)     │   │
│  └───────────────────┘   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  NEW USER LANDS          │
│  → Signs up              │
│  → Gets 25 welcome creds │
│  → Referrer gets 50 creds│
│  → Optimizes own prompt  │
│  → Gets wow score ≥ 7    │
│  → Shares again ──▶ LOOP │
└─────────────────────────┘
```

---

## 🗄️ SPRINT 1: BACKEND — Models, APIs & Share Infrastructure

### 1.1 New Models

**File**: `prompter/models.py` — append after existing models

```python
import secrets
import hashlib
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class SharedPrompt(models.Model):
    """
    Public share of an optimized prompt.
    Each share generates a unique token for the public URL.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_prompts')
    
    # The prompt content (sanitized — never expose full original if user opts out)
    original_prompt = models.TextField(help_text="The before version")
    optimized_prompt = models.TextField(help_text="The after version")
    wow_score = models.FloatField(default=0.0, help_text="Optimization quality 0-10")
    
    # Public share metadata
    share_token = models.CharField(max_length=32, unique=True, db_index=True)
    title = models.CharField(max_length=200, blank=True, help_text="Optional user-provided title")
    category = models.CharField(
        max_length=50,
        choices=[
            ('coding', 'Coding'),
            ('writing', 'Writing'),
            ('business', 'Business'),
            ('marketing', 'Marketing'),
            ('education', 'Education'),
            ('creative', 'Creative'),
            ('data', 'Data & Analytics'),
            ('other', 'Other'),
        ],
        default='other'
    )
    
    # Privacy controls
    show_original = models.BooleanField(default=True, help_text="Show before/after or only optimized")
    is_public = models.BooleanField(default=True)
    
    # Engagement tracking
    view_count = models.PositiveIntegerField(default=0)
    copy_count = models.PositiveIntegerField(default=0)
    reshare_count = models.PositiveIntegerField(default=0)
    click_through_count = models.PositiveIntegerField(default=0)  # clicked "Try It Free"
    
    # Credit reward tracking
    credits_earned = models.IntegerField(default=0)
    share_reward_claimed = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Optional expiry for share links")

    class Meta:
        db_table = 'shared_prompts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['share_token']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['category', '-view_count']),
            models.Index(fields=['-wow_score', '-view_count']),
        ]

    def save(self, *args, **kwargs):
        if not self.share_token:
            self.share_token = secrets.token_urlsafe(16)[:32]
        super().save(*args, **kwargs)

    @property
    def share_url(self):
        return f"https://prompttemple2030.com/share/{self.share_token}"

    @property
    def engagement_score(self):
        """Weighted engagement metric for trending/leaderboard."""
        return (
            self.view_count * 1
            + self.copy_count * 3
            + self.reshare_count * 5
            + self.click_through_count * 10
        )

    def __str__(self):
        return f"Share by {self.user.username} — wow:{self.wow_score}"


class ReferralLink(models.Model):
    """
    Persistent referral link per user.
    Each user gets one referral code — tracks all signups from it.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referral_link')
    referral_code = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Stats
    total_clicks = models.PositiveIntegerField(default=0)
    total_signups = models.PositiveIntegerField(default=0)
    total_credits_earned = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'referral_links'

    def save(self, *args, **kwargs):
        if not self.referral_code:
            # Generate short, memorable code: PT-XXXXXX
            raw = secrets.token_hex(4).upper()
            self.referral_code = f"PT-{raw}"
        super().save(*args, **kwargs)

    @property
    def referral_url(self):
        return f"https://prompttemple2030.com/ref/{self.referral_code}"

    def __str__(self):
        return f"{self.user.username} — {self.referral_code} ({self.total_signups} signups)"


class ReferralConversion(models.Model):
    """
    Tracks each successful referral conversion (signup via referral link).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referred_by')
    referral_link = models.ForeignKey(ReferralLink, on_delete=models.CASCADE, related_name='conversions')
    
    # Source tracking
    source_platform = models.CharField(
        max_length=30,
        choices=[
            ('twitter', 'Twitter/X'),
            ('linkedin', 'LinkedIn'),
            ('direct_link', 'Direct Link'),
            ('whatsapp', 'WhatsApp'),
            ('email', 'Email'),
            ('other', 'Other'),
        ],
        default='direct_link'
    )
    
    # Reward tracking
    referrer_credits_awarded = models.IntegerField(default=50)
    referred_credits_awarded = models.IntegerField(default=25)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'referral_conversions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.referrer.username} → {self.referred_user.username}"


class ShareAnalytics(models.Model):
    """
    Per-event analytics for shared prompts.
    Tracks every view, copy, reshare, and CTA click.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shared_prompt = models.ForeignKey(SharedPrompt, on_delete=models.CASCADE, related_name='analytics')
    
    event_type = models.CharField(
        max_length=20,
        choices=[
            ('view', 'Page View'),
            ('copy', 'Copied Prompt'),
            ('reshare', 'Re-shared'),
            ('cta_click', 'CTA Click'),
            ('signup', 'Signup from Share'),
        ]
    )
    
    # Visitor info (anonymous — no PII)
    referrer_url = models.URLField(blank=True, default='')
    platform = models.CharField(max_length=30, blank=True, default='')  # twitter, linkedin, direct
    country_code = models.CharField(max_length=5, blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'share_analytics'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['shared_prompt', 'event_type']),
            models.Index(fields=['event_type', '-created_at']),
        ]


class ViralAchievement(models.Model):
    """
    Gamification badges unlocked by sharing milestones.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    
    achievement_type = models.CharField(
        max_length=50,
        choices=[
            ('first_share', 'First Share'),
            ('first_referral', 'First Referral'),
            ('share_5', '5 Shares'),
            ('share_25', '25 Shares'),
            ('share_100', '100 Shares'),
            ('referral_5', '5 Referrals'),
            ('referral_25', '25 Referrals'),
            ('viral_prompt', 'Viral Prompt (100+ views)'),
            ('wow_master', 'Wow Master (10 prompts scoring 9+)'),
            ('influencer', 'Influencer (500+ total engagement)'),
        ]
    )
    
    credits_awarded = models.IntegerField(default=0)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'viral_achievements'
        unique_together = ['user', 'achievement_type']

    def __str__(self):
        return f"{self.user.username} — {self.achievement_type}"
```

### 1.2 Serializers

**File**: `prompter/serializers_viral.py` — new file

```python
from rest_framework import serializers
from .models import SharedPrompt, ReferralLink, ReferralConversion, ViralAchievement


class SharedPromptCreateSerializer(serializers.ModelSerializer):
    """For creating a new share."""
    class Meta:
        model = SharedPrompt
        fields = [
            'original_prompt', 'optimized_prompt', 'wow_score',
            'title', 'category', 'show_original',
        ]

    def validate_wow_score(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("Wow score must be between 0 and 10.")
        return value


class SharedPromptPublicSerializer(serializers.ModelSerializer):
    """For the public share page — no user PII."""
    username = serializers.SerializerMethodField()
    share_url = serializers.ReadOnlyField()
    engagement_score = serializers.ReadOnlyField()

    class Meta:
        model = SharedPrompt
        fields = [
            'id', 'username', 'original_prompt', 'optimized_prompt',
            'wow_score', 'title', 'category', 'show_original',
            'view_count', 'copy_count', 'reshare_count',
            'share_url', 'engagement_score', 'created_at',
        ]

    def get_username(self, obj):
        return obj.user.first_name or obj.user.username[:8]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.show_original:
            data.pop('original_prompt', None)
        return data


class SharedPromptListSerializer(serializers.ModelSerializer):
    """For user's own share dashboard."""
    share_url = serializers.ReadOnlyField()
    engagement_score = serializers.ReadOnlyField()

    class Meta:
        model = SharedPrompt
        fields = [
            'id', 'title', 'category', 'wow_score',
            'view_count', 'copy_count', 'reshare_count',
            'click_through_count', 'credits_earned',
            'share_url', 'engagement_score', 'created_at',
        ]


class ReferralLinkSerializer(serializers.ModelSerializer):
    referral_url = serializers.ReadOnlyField()

    class Meta:
        model = ReferralLink
        fields = [
            'referral_code', 'referral_url',
            'total_clicks', 'total_signups', 'total_credits_earned',
        ]


class ReferralConversionSerializer(serializers.ModelSerializer):
    referred_username = serializers.SerializerMethodField()

    class Meta:
        model = ReferralConversion
        fields = [
            'referred_username', 'source_platform',
            'referrer_credits_awarded', 'created_at',
        ]

    def get_referred_username(self, obj):
        return obj.referred_user.first_name or obj.referred_user.username[:8]


class ViralAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViralAchievement
        fields = ['achievement_type', 'credits_awarded', 'unlocked_at']


class ViralDashboardSerializer(serializers.Serializer):
    """Aggregated viral stats for user dashboard."""
    total_shares = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_copies = serializers.IntegerField()
    total_cta_clicks = serializers.IntegerField()
    total_referral_signups = serializers.IntegerField()
    total_credits_earned_from_sharing = serializers.IntegerField()
    viral_coefficient = serializers.FloatField()
    achievements = ViralAchievementSerializer(many=True)
    top_shared_prompts = SharedPromptListSerializer(many=True)
    referral_link = ReferralLinkSerializer()
```

### 1.3 Views / API Endpoints

**File**: `prompter/views_viral.py` — new file

```python
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum, F
from django.db import transaction
from django.utils import timezone

from .models import (
    SharedPrompt, ReferralLink, ReferralConversion,
    ShareAnalytics, ViralAchievement,
)
from .serializers_viral import (
    SharedPromptCreateSerializer, SharedPromptPublicSerializer,
    SharedPromptListSerializer, ReferralLinkSerializer,
    ReferralConversionSerializer, ViralDashboardSerializer,
    ViralAchievementSerializer,
)

# ─── Achievement reward config ────────────────────────────────────
ACHIEVEMENT_REWARDS = {
    'first_share': 25,
    'first_referral': 50,
    'share_5': 50,
    'share_25': 150,
    'share_100': 500,
    'referral_5': 200,
    'referral_25': 1000,
    'viral_prompt': 100,
    'wow_master': 200,
    'influencer': 500,
}

SHARE_CREDIT_REWARD = 50  # Credits per share action


# ─── Helper: Award credits ───────────────────────────────────────
def award_credits(user, amount, reason=""):
    """
    Award credits to user. Integrate with your existing
    UserSubscription / UsageQuota credit system.
    """
    # TODO: Wire into your actual credit system
    # Example: user.profile.add_credits(amount, reason)
    pass


# ─── Helper: Check & unlock achievements ─────────────────────────
def check_achievements(user):
    """Check if user qualifies for new achievements."""
    share_count = SharedPrompt.objects.filter(user=user).count()
    referral_count = ReferralConversion.objects.filter(referrer=user).count()
    total_views = SharedPrompt.objects.filter(user=user).aggregate(
        total=Sum('view_count')
    )['total'] or 0
    total_engagement = SharedPrompt.objects.filter(user=user).aggregate(
        total=Sum(
            F('view_count') * 1
            + F('copy_count') * 3
            + F('reshare_count') * 5
            + F('click_through_count') * 10
        )
    )['total'] or 0
    high_wow = SharedPrompt.objects.filter(user=user, wow_score__gte=9).count()

    milestones = {
        'first_share': share_count >= 1,
        'first_referral': referral_count >= 1,
        'share_5': share_count >= 5,
        'share_25': share_count >= 25,
        'share_100': share_count >= 100,
        'referral_5': referral_count >= 5,
        'referral_25': referral_count >= 25,
        'viral_prompt': SharedPrompt.objects.filter(user=user, view_count__gte=100).exists(),
        'wow_master': high_wow >= 10,
        'influencer': total_engagement >= 500,
    }

    newly_unlocked = []
    for achievement_type, qualified in milestones.items():
        if qualified:
            obj, created = ViralAchievement.objects.get_or_create(
                user=user,
                achievement_type=achievement_type,
                defaults={'credits_awarded': ACHIEVEMENT_REWARDS.get(achievement_type, 0)}
            )
            if created:
                award_credits(user, obj.credits_awarded, f"Achievement: {achievement_type}")
                newly_unlocked.append(obj)

    return newly_unlocked


# ═══════════════════════════════════════════════════════════════════
# PUBLIC ENDPOINTS (no auth required)
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_share_view(request, share_token):
    """
    GET /api/share/{share_token}/
    Public page for a shared prompt. Increments view count.
    Returns prompt data + OG metadata for social previews.
    """
    shared = get_object_or_404(SharedPrompt, share_token=share_token, is_public=True)

    # Increment view count (fire-and-forget)
    SharedPrompt.objects.filter(pk=shared.pk).update(view_count=F('view_count') + 1)

    # Log analytics
    ShareAnalytics.objects.create(
        shared_prompt=shared,
        event_type='view',
        referrer_url=request.META.get('HTTP_REFERER', ''),
        platform=request.GET.get('utm_source', ''),
    )

    serializer = SharedPromptPublicSerializer(shared)
    data = serializer.data

    # Add OG meta for frontend SSR
    data['og_meta'] = {
        'title': f"🏛️ Prompt Temple — Wow Score {shared.wow_score}/10",
        'description': f"See how this prompt was transformed from basic to professional-grade.",
        'image': f"https://prompttemple2030.com/api/og-image/{shared.share_token}/",
        'url': shared.share_url,
    }

    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_share_event(request, share_token):
    """
    POST /api/share/{share_token}/event/
    Track copy, reshare, or CTA click events from the public share page.
    Body: { "event_type": "copy" | "reshare" | "cta_click" }
    """
    shared = get_object_or_404(SharedPrompt, share_token=share_token)
    event_type = request.data.get('event_type')

    if event_type not in ('copy', 'reshare', 'cta_click'):
        return Response({'error': 'Invalid event_type'}, status=400)

    # Increment counter
    counter_map = {
        'copy': 'copy_count',
        'reshare': 'reshare_count',
        'cta_click': 'click_through_count',
    }
    SharedPrompt.objects.filter(pk=shared.pk).update(
        **{counter_map[event_type]: F(counter_map[event_type]) + 1}
    )

    # Log analytics
    ShareAnalytics.objects.create(
        shared_prompt=shared,
        event_type=event_type,
        referrer_url=request.META.get('HTTP_REFERER', ''),
        platform=request.data.get('platform', ''),
    )

    return Response({'status': 'tracked'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def referral_landing(request, referral_code):
    """
    GET /api/ref/{referral_code}/
    Track referral link click. Frontend redirects to signup with ref param.
    """
    ref_link = get_object_or_404(ReferralLink, referral_code=referral_code)
    ReferralLink.objects.filter(pk=ref_link.pk).update(total_clicks=F('total_clicks') + 1)

    return Response({
        'referrer_name': ref_link.user.first_name or ref_link.user.username[:8],
        'signup_url': f"https://prompttemple2030.com/signup?ref={referral_code}",
        'welcome_bonus': 25,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def trending_shares(request):
    """
    GET /api/share/trending/
    Public trending prompts — sorted by engagement score.
    """
    shares = SharedPrompt.objects.filter(
        is_public=True,
        created_at__gte=timezone.now() - timezone.timedelta(days=30),
    ).order_by('-view_count', '-wow_score')[:20]

    serializer = SharedPromptPublicSerializer(shares, many=True)
    return Response(serializer.data)


# ═══════════════════════════════════════════════════════════════════
# AUTHENTICATED ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_share(request):
    """
    POST /api/share/create/
    Create a new shared prompt. Awards credits on first creation.
    """
    serializer = SharedPromptCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    with transaction.atomic():
        shared = serializer.save(user=request.user)

        # Award share credits
        if not shared.share_reward_claimed:
            shared.credits_earned = SHARE_CREDIT_REWARD
            shared.share_reward_claimed = True
            shared.save(update_fields=['credits_earned', 'share_reward_claimed'])
            award_credits(request.user, SHARE_CREDIT_REWARD, "Shared a prompt")

        # Check for new achievements
        new_achievements = check_achievements(request.user)

    response_data = SharedPromptListSerializer(shared).data
    response_data['new_achievements'] = ViralAchievementSerializer(new_achievements, many=True).data
    response_data['credits_awarded'] = SHARE_CREDIT_REWARD

    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_shares(request):
    """
    GET /api/share/mine/
    User's own shared prompts with engagement stats.
    """
    shares = SharedPrompt.objects.filter(user=request.user).order_by('-created_at')
    serializer = SharedPromptListSerializer(shares, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_share(request, share_id):
    """
    DELETE /api/share/{share_id}/
    User can delete their own share (un-publish).
    """
    shared = get_object_or_404(SharedPrompt, id=share_id, user=request.user)
    shared.is_public = False
    shared.save(update_fields=['is_public'])
    return Response({'status': 'unpublished'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_referral_link(request):
    """
    GET /api/referral/mine/
    Get or create the user's referral link.
    """
    ref_link, created = ReferralLink.objects.get_or_create(user=request.user)
    serializer = ReferralLinkSerializer(ref_link)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_referral_conversions(request):
    """
    GET /api/referral/conversions/
    List of people who signed up via user's referral.
    """
    conversions = ReferralConversion.objects.filter(referrer=request.user).order_by('-created_at')
    serializer = ReferralConversionSerializer(conversions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def viral_dashboard(request):
    """
    GET /api/viral/dashboard/
    Aggregated viral stats for the user's growth dashboard.
    """
    user = request.user
    shares = SharedPrompt.objects.filter(user=user)

    total_shares = shares.count()
    aggregates = shares.aggregate(
        total_views=Sum('view_count'),
        total_copies=Sum('copy_count'),
        total_cta=Sum('click_through_count'),
        total_credits=Sum('credits_earned'),
    )

    referral_signups = ReferralConversion.objects.filter(referrer=user).count()

    # Viral coefficient: signups generated / shares made
    viral_coeff = 0.0
    if total_shares > 0:
        total_signups_from_shares = (aggregates['total_cta'] or 0) * 0.1  # est. 10% conversion
        viral_coeff = round((total_signups_from_shares + referral_signups) / total_shares, 2)

    ref_link, _ = ReferralLink.objects.get_or_create(user=user)
    achievements = ViralAchievement.objects.filter(user=user)
    top_prompts = shares.order_by('-view_count')[:5]

    data = {
        'total_shares': total_shares,
        'total_views': aggregates['total_views'] or 0,
        'total_copies': aggregates['total_copies'] or 0,
        'total_cta_clicks': aggregates['total_cta'] or 0,
        'total_referral_signups': referral_signups,
        'total_credits_earned_from_sharing': aggregates['total_credits'] or 0,
        'viral_coefficient': viral_coeff,
        'achievements': ViralAchievementSerializer(achievements, many=True).data,
        'top_shared_prompts': SharedPromptListSerializer(top_prompts, many=True).data,
        'referral_link': ReferralLinkSerializer(ref_link).data,
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_achievements(request):
    """
    GET /api/viral/achievements/
    """
    achievements = ViralAchievement.objects.filter(user=request.user)
    return Response(ViralAchievementSerializer(achievements, many=True).data)
```

### 1.4 URL Routing

**File**: `prompter/urls_viral.py` — new file

```python
from django.urls import path
from . import views_viral

urlpatterns = [
    # Public (no auth)
    path('share/<str:share_token>/', views_viral.public_share_view, name='public-share'),
    path('share/<str:share_token>/event/', views_viral.track_share_event, name='share-event'),
    path('share/trending/', views_viral.trending_shares, name='trending-shares'),
    path('ref/<str:referral_code>/', views_viral.referral_landing, name='referral-landing'),

    # Authenticated
    path('share/create/', views_viral.create_share, name='create-share'),
    path('share/mine/', views_viral.my_shares, name='my-shares'),
    path('share/<uuid:share_id>/delete/', views_viral.delete_share, name='delete-share'),
    path('referral/mine/', views_viral.my_referral_link, name='my-referral'),
    path('referral/conversions/', views_viral.my_referral_conversions, name='my-referral-conversions'),
    path('viral/dashboard/', views_viral.viral_dashboard, name='viral-dashboard'),
    path('viral/achievements/', views_viral.my_achievements, name='my-achievements'),
]
```

**Wire into main `urls.py`:**
```python
# In prompter/urls.py — add this include
path('api/v1/', include('prompter.urls_viral')),
```

### 1.5 Migration

```bash
python manage.py makemigrations prompter
python manage.py migrate
```

---

## 🎨 SPRINT 2: FRONTEND — Share Modal, Public Page & Dashboard

### 2.1 Share Modal Component (Next.js + Framer Motion + Pharaonic Theme)

**File**: `app/components/ShareModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, Linkedin, Link2, Copy, Check, Gift } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  optimizedPrompt: string;
  wowScore: number;
  category?: string;
}

export default function ShareModal({
  isOpen, onClose, originalPrompt, optimizedPrompt, wowScore, category = 'other'
}: ShareModalProps) {
  const [title, setTitle] = useState('');
  const [showOriginal, setShowOriginal] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    share_url: string;
    credits_awarded: number;
    new_achievements: any[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/v1/share/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          original_prompt: originalPrompt,
          optimized_prompt: optimizedPrompt,
          wow_score: wowScore,
          title,
          category,
          show_original: showOriginal,
        }),
      });
      const data = await res.json();
      setShareResult(data);
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const shareToTwitter = () => {
    if (!shareResult) return;
    const text = `🏛️ Just transformed a basic prompt into a ${wowScore}/10 masterpiece with @PromptTemple!\n\nSee the before/after:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareResult.share_url)}`,
      '_blank'
    );
  };

  const shareToLinkedIn = () => {
    if (!shareResult) return;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareResult.share_url)}`,
      '_blank'
    );
  };

  const copyLink = async () => {
    if (!shareResult) return;
    await navigator.clipboard.writeText(shareResult.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              border: '1px solid rgba(201, 162, 39, 0.3)',
              boxShadow: '0 0 60px rgba(201, 162, 39, 0.15)',
            }}
          >
            {/* Gold accent bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C9A227, #EBD5A7, #C9A227)' }} />

            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#EBD5A7' }}>
                  🏛️ Share Your Masterpiece
                </h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(235, 213, 167, 0.6)' }}>
                  Earn 50 credits for sharing
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} style={{ color: '#EBD5A7' }} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-4">
              {!shareResult ? (
                <>
                  {/* Preview */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(201, 162, 39, 0.08)', border: '1px solid rgba(201, 162, 39, 0.15)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold" style={{ color: '#C9A227' }}>{wowScore}/10</span>
                      <span className="text-sm" style={{ color: '#EBD5A7' }}>Wow Score</span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: 'rgba(235, 213, 167, 0.5)' }}>
                      {optimizedPrompt.slice(0, 120)}...
                    </p>
                  </div>

                  {/* Title input */}
                  <input
                    type="text"
                    placeholder="Add a title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(201, 162, 39, 0.2)',
                      color: '#EBD5A7',
                    }}
                  />

                  {/* Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOriginal}
                      onChange={(e) => setShowOriginal(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span className="text-sm" style={{ color: '#EBD5A7' }}>
                      Show before/after comparison
                    </span>
                  </label>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #C9A227, #D4AF37)',
                      color: '#1a1a2e',
                    }}
                  >
                    {isSharing ? '⏳ Creating share link...' : '🔗 Generate Share Link (+50 credits)'}
                  </button>
                </>
              ) : (
                <>
                  {/* Success state */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-4"
                  >
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="font-bold text-lg" style={{ color: '#C9A227' }}>
                      +{shareResult.credits_awarded} Credits Earned!
                    </p>
                    {shareResult.new_achievements.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 justify-center">
                        {shareResult.new_achievements.map((a: any) => (
                          <span key={a.achievement_type} className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(201, 162, 39, 0.2)', color: '#C9A227' }}>
                            🏆 {a.achievement_type.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Share buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={shareToTwitter}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                      style={{ background: 'rgba(29, 161, 242, 0.15)', border: '1px solid rgba(29, 161, 242, 0.3)' }}>
                      <Twitter size={24} color="#1DA1F2" />
                      <span className="text-xs" style={{ color: '#1DA1F2' }}>Twitter</span>
                    </button>

                    <button onClick={shareToLinkedIn}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                      style={{ background: 'rgba(0, 119, 181, 0.15)', border: '1px solid rgba(0, 119, 181, 0.3)' }}>
                      <Linkedin size={24} color="#0077B5" />
                      <span className="text-xs" style={{ color: '#0077B5' }}>LinkedIn</span>
                    </button>

                    <button onClick={copyLink}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                      style={{ background: 'rgba(201, 162, 39, 0.15)', border: '1px solid rgba(201, 162, 39, 0.3)' }}>
                      {copied ? <Check size={24} color="#4ade80" /> : <Link2 size={24} color="#C9A227" />}
                      <span className="text-xs" style={{ color: '#C9A227' }}>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  {/* Link preview */}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(235, 213, 167, 0.6)' }}>
                    <Link2 size={14} />
                    <span className="truncate">{shareResult.share_url}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 2.2 Auto-Trigger: Smart Share Suggestion

**File**: `app/hooks/useShareSuggestion.ts`

```ts
import { useState, useEffect } from 'react';

const WOW_THRESHOLD = 7;

interface UseShareSuggestionProps {
  wowScore: number | null;
  hasSharedBefore: boolean;
}

export function useShareSuggestion({ wowScore, hasSharedBefore }: UseShareSuggestionProps) {
  const [shouldSuggest, setShouldSuggest] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (wowScore !== null && wowScore >= WOW_THRESHOLD && !dismissed) {
      // Delay the suggestion to let the wow moment sink in
      const timer = setTimeout(() => setShouldSuggest(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [wowScore, dismissed]);

  const dismiss = () => {
    setDismissed(true);
    setShouldSuggest(false);
  };

  return { shouldSuggest, dismiss };
}
```

### 2.3 Public Share Page (Server-Rendered for SEO + OG tags)

**File**: `app/share/[token]/page.tsx`

```tsx
import { Metadata } from 'next';
import SharePageClient from './SharePageClient';

// Server-side: fetch share data for OG tags
async function getShareData(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/share/${token}/`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const data = await getShareData(params.token);
  if (!data) return { title: 'Prompt Temple' };

  return {
    title: data.og_meta.title,
    description: data.og_meta.description,
    openGraph: {
      title: data.og_meta.title,
      description: data.og_meta.description,
      images: [data.og_meta.image],
      url: data.og_meta.url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.og_meta.title,
      description: data.og_meta.description,
      images: [data.og_meta.image],
    },
  };
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const data = await getShareData(params.token);
  return <SharePageClient data={data} token={params.token} />;
}
```

**File**: `app/share/[token]/SharePageClient.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';

interface SharePageClientProps {
  data: any;
  token: string;
}

export default function SharePageClient({ data, token }: SharePageClientProps) {
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#0f0f1a' }}>
        <p style={{ color: '#EBD5A7' }}>This share link has expired or doesn't exist.</p>
      </div>
    );
  }

  const trackEvent = async (eventType: string) => {
    fetch(`/api/v1/share/${token}/event/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType }),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.optimized_prompt);
    trackEvent('copy');
  };

  const handleCTA = () => {
    trackEvent('cta_click');
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
          style={{ color: '#C9A227' }}
        >
          🏛️ Prompt Temple
        </motion.h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(235, 213, 167, 0.6)' }}>
          Professional-Grade Prompt Engineering
        </p>
      </div>

      {/* Wow Score */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.05))',
          border: '2px solid #C9A227',
          boxShadow: '0 0 40px rgba(201, 162, 39, 0.2)',
        }}
      >
        <div className="text-center">
          <div className="text-2xl font-black" style={{ color: '#C9A227' }}>{data.wow_score}</div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: '#EBD5A7' }}>wow</div>
        </div>
      </motion.div>

      {/* Before / After */}
      <div className="max-w-2xl mx-auto px-4 space-y-6 pb-12">
        {data.original_prompt && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>
              ❌ Before
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {data.original_prompt}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#22c55e' }}>
            ✅ After — Optimized by Prompt Temple
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {data.optimized_prompt}
          </p>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={handleCopy}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(201, 162, 39, 0.15)', border: '1px solid rgba(201, 162, 39, 0.3)', color: '#C9A227' }}>
            📋 Copy Prompt
          </button>
          <button onClick={handleCTA}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #C9A227, #D4AF37)', color: '#1a1a2e' }}>
            🏛️ Try It Free
          </button>
        </div>

        {/* Shared by */}
        <p className="text-center text-xs" style={{ color: 'rgba(235, 213, 167, 0.4)' }}>
          Shared by {data.username} • {new Date(data.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
```

### 2.4 OG Image Generator (API Route)

**File**: `app/api/og-image/[token]/route.tsx`

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { token: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/share/${params.token}/`);
  const data = await res.json();

  return new ImageResponse(
    (
      <div style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e, #0f3460)',
        fontFamily: 'Arial',
      }}>
        {/* Gold border accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #C9A227, #EBD5A7, #C9A227)',
        }} />

        {/* Logo */}
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏛️</div>
        <div style={{ color: '#C9A227', fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
          Prompt Temple
        </div>

        {/* Wow Score */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 32px', borderRadius: '16px',
          background: 'rgba(201, 162, 39, 0.15)',
          border: '2px solid rgba(201, 162, 39, 0.4)',
          marginBottom: '30px',
        }}>
          <span style={{ color: '#C9A227', fontSize: '64px', fontWeight: 'bold' }}>
            {data.wow_score}
          </span>
          <span style={{ color: '#EBD5A7', fontSize: '20px' }}>/10 Wow Score</span>
        </div>

        {/* Tagline */}
        <div style={{ color: 'rgba(235, 213, 167, 0.7)', fontSize: '20px' }}>
          See how this prompt was transformed into a masterpiece
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## 📊 SPRINT 3: VIRAL DASHBOARD PAGE

### 3.1 Dashboard Component

**File**: `app/dashboard/viral/page.tsx`

This page uses Recharts (already in your stack) to show sharing analytics, referral stats, achievements, and viral coefficient tracking over time. Key sections:

- **Viral Coefficient Gauge** — real-time K-factor display
- **Shares Over Time** — Recharts AreaChart
- **Top Performing Prompts** — sorted by engagement score
- **Referral Leaderboard** — your signups + credits earned
- **Achievement Badges** — pharaonic-styled unlock cards
- **Referral Link Card** — one-click copy with WhatsApp/Email share buttons

---

## 🔗 SPRINT 4: REFERRAL SYSTEM INTEGRATION

### 4.1 Signup Flow Integration

Wire the referral code into your existing signup:

```python
# In your signup view / serializer
def create_user(request):
    # ... existing signup logic ...
    
    ref_code = request.data.get('referral_code') or request.GET.get('ref')
    if ref_code:
        try:
            ref_link = ReferralLink.objects.get(referral_code=ref_code)
            # Create conversion record
            ReferralConversion.objects.create(
                referrer=ref_link.user,
                referred_user=new_user,
                referral_link=ref_link,
                source_platform=request.data.get('utm_source', 'direct_link'),
                referrer_credits_awarded=50,
                referred_credits_awarded=25,
            )
            # Award credits
            award_credits(ref_link.user, 50, f"Referral: {new_user.username}")
            award_credits(new_user, 25, "Welcome bonus (referred)")
            
            # Update referral link stats
            ref_link.total_signups += 1
            ref_link.total_credits_earned += 50
            ref_link.save(update_fields=['total_signups', 'total_credits_earned'])
            
            # Check referrer achievements
            check_achievements(ref_link.user)
        except ReferralLink.DoesNotExist:
            pass  # Invalid ref code — continue signup normally
```

---

## ✅ ACCEPTANCE CRITERIA

| Feature | Criteria | Status |
|---------|----------|--------|
| **Share Modal** | Opens after optimization with wow ≥ 7; creates share link; awards 50 credits | ⬜ |
| **Public Share Page** | SSR with OG tags; before/after display; view/copy/CTA tracking | ⬜ |
| **OG Image** | Auto-generated 1200x630 card with wow score + pharaonic branding | ⬜ |
| **Twitter Share** | Pre-filled tweet with wow score + share URL | ⬜ |
| **LinkedIn Share** | Opens LinkedIn share dialog with URL | ⬜ |
| **Copy Link** | Clipboard copy with visual feedback | ⬜ |
| **Referral System** | Unique code per user; tracks clicks, signups, credit rewards | ⬜ |
| **Referral Signup** | Referred user gets 25 credits; referrer gets 50 credits | ⬜ |
| **Viral Dashboard** | Shows shares, views, copies, CTAs, viral coefficient, achievements | ⬜ |
| **Achievements** | 10 achievement types; auto-unlock on milestones; credit rewards | ⬜ |
| **Trending Page** | Public endpoint returning top 20 shared prompts (last 30 days) | ⬜ |
| **Analytics Tracking** | Every view/copy/reshare/CTA logged with platform + referrer | ⬜ |
| **Credit Integration** | Share credits wired to existing UserSubscription/UsageQuota system | ⬜ |
| **Privacy Controls** | User can toggle show_original; can un-publish shares | ⬜ |

---

## 📈 VIRAL COEFFICIENT TARGETS

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| Shares created | 50 | 500 | 5,000 |
| Avg views per share | 10 | 25 | 50 |
| CTA click rate | 5% | 8% | 12% |
| Signup conversion from CTA | 10% | 15% | 20% |
| Viral coefficient (K) | 0.5 | 1.0 | 1.5+ |

**K > 1.0 = exponential growth** — each user brings more than one new user.

---

## 🏗️ IMPLEMENTATION ORDER

1. **Backend models + migration** (1 day)
2. **Backend API views + URLs** (1 day)
3. **Share Modal frontend** (1 day)
4. **Public share page + OG image** (1 day)
5. **Referral system integration** (0.5 day)
6. **Viral dashboard** (1 day)
7. **Achievement system** (0.5 day)
8. **Testing + credit system wiring** (1 day)

**Total: ~7 days sprint**

---

## 🔑 KEY PRINCIPLE

> Every optimization is a potential share. Every share is a potential signup. Every signup is a potential sharer.
>
> The "wow effect" is both the product AND the marketing. When a user sees their basic prompt transformed into a 9/10 masterpiece, they WANT to show people. We just make it frictionless.
