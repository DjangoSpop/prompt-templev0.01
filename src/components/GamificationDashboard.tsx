'use client';

import { useGamification } from '@/providers/AnalyticsProvider';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award,
  TrendingUp,
  Crown,
  Medal,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function GamificationDashboard() {
  const { user } = useAuth();
  const {
    achievements,
    badges,
    userStats,
    getUnlockedAchievements,
    getProgressAchievements,
    getNextLevelProgress,
    getRecentBadges,
  } = useGamification();

  if (!user || !userStats) {
    return null;
  }

  const unlockedAchievements = getUnlockedAchievements();
  const progressAchievements = getProgressAchievements();
  const nextLevelProgress = getNextLevelProgress();
  const recentBadges = getRecentBadges(3);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getRankIcon = (rank: string) => {
    if (rank.toLowerCase().includes('legend')) return Crown;
    if (rank.toLowerCase().includes('master') || rank.toLowerCase().includes('expert')) return Trophy;
    if (rank.toLowerCase().includes('advanced')) return Medal;
    return Star;
  };

  return (
    <div className="space-y-6">
      {/* User Level & XP */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
            <p className="text-gray-600">Keep creating and using templates to level up!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">Level {userStats.level || 1}</div>
            <p className="text-sm text-gray-600">{userStats.rank || 'Beginner'}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Experience Points</span>
            <span className="font-medium">
              {(userStats.experience_points || 0).toLocaleString()} / {(userStats.next_level_xp || 100).toLocaleString()} XP
            </span>
          </div>
          <Progress value={nextLevelProgress * 100} className="h-3" />
          <p className="text-xs text-gray-500">
            {((userStats.next_level_xp || 100) - (userStats.experience_points || 0)).toLocaleString()} XP to next level
          </p>
        </div>
      </Card>

      {/* Current Streak */}
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Flame className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {userStats.daily_streak || 0} Day Streak
            </h3>
            <p className="text-gray-600">Keep using templates daily to maintain your streak!</p>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
            <Trophy className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{unlockedAchievements.length}</div>
          <div className="text-xs text-gray-600">Achievements</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{badges.length}</div>
          <div className="text-xs text-gray-600">Badges Earned</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{userStats.level || 1}</div>
          <div className="text-xs text-gray-600">Current Level</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="p-2 bg-yellow-100 rounded-lg w-fit mx-auto mb-2">
            <Zap className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{userStats.daily_streak || 0}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </Card>
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Badges</h3>
          <div className="space-y-3">
            {recentBadges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getRarityColor(badge.rarity)}`}>
                  <Award className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{badge.name}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  <p className="text-xs text-gray-500">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                  {badge.rarity}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Achievement Progress */}
      {progressAchievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Achievement Progress
          </h3>
          <div className="space-y-4">
            {progressAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-blue-600">
                      +{achievement.points} XP
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {achievement.progress} / {achievement.total_required}
                    </span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.total_required) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = achievement.unlocked ? Trophy : Target;
            return (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${
                  achievement.unlocked 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.unlocked ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked ? (
                      <p className="text-xs text-green-600 mt-1">
                        Unlocked {new Date(achievement.unlocked_at!).toLocaleDateString()}
                      </p>
                    ) : achievement.progress > 0 ? (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Progress</span>
                          <span>{achievement.progress}/{achievement.total_required}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.total_required) * 100} 
                          className="h-1 mt-1" 
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-blue-600">
                      +{achievement.points} XP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}