"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Plus,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  Target,
  Trophy,
  Star,
  Zap,
  MessageSquare,
  Share2,
  Settings,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Clock,
  Flame,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  level: number;
  experience: number;
  joinedAt: Date;
  lastActive: Date;
  contributionScore: number;
  specialties: string[];
  status: 'online' | 'away' | 'offline';
}

interface Team {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  totalExperience: number;
  averageLevel: number;
  createdAt: Date;
  isPrivate: boolean;
  members: TeamMember[];
  recentActivity: Activity[];
  achievements: Achievement[];
  currentChallenge?: Challenge;
}

interface Activity {
  id: string;
  type: 'template_used' | 'achievement_earned' | 'level_up' | 'challenge_completed';
  user: {
    name: string;
    avatar: string;
  };
  description: string;
  timestamp: Date;
  xpGained?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond';
  unlockedAt: Date;
  unlockedBy: {
    name: string;
    avatar: string;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'team' | 'individual';
  progress: number;
  maxProgress: number;
  endsAt: Date;
  reward: {
    xp: number;
    badge?: string;
  };
}

const mockTeam: Team = {
  id: "1",
  name: "AI Innovators",
  description: "A collaborative team focused on pushing the boundaries of AI-assisted content creation and prompt engineering.",
  avatar: "/teams/ai-innovators.jpg",
  memberCount: 8,
  totalExperience: 45600,
  averageLevel: 34,
  createdAt: new Date("2024-01-01"),
  isPrivate: false,
  members: [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
      role: "owner",
      level: 45,
      experience: 12500,
      joinedAt: new Date("2024-01-01"),
      lastActive: new Date("2024-01-21"),
      contributionScore: 950,
      specialties: ["Creative Writing", "Content Strategy"],
      status: "online"
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      avatar: "/avatars/alex.jpg",
      role: "admin",
      level: 42,
      experience: 11200,
      joinedAt: new Date("2024-01-03"),
      lastActive: new Date("2024-01-21"),
      contributionScore: 820,
      specialties: ["Code Review", "Technical Writing"],
      status: "online"
    },
    {
      id: "3",
      name: "Maya Patel",
      avatar: "/avatars/maya.jpg",
      role: "member",
      level: 38,
      experience: 8900,
      joinedAt: new Date("2024-01-05"),
      lastActive: new Date("2024-01-20"),
      contributionScore: 670,
      specialties: ["UI/UX Design", "User Research"],
      status: "away"
    },
    {
      id: "4",
      name: "Jordan Kim",
      avatar: "/avatars/jordan.jpg",
      role: "member",
      level: 35,
      experience: 7800,
      joinedAt: new Date("2024-01-08"),
      lastActive: new Date("2024-01-19"),
      contributionScore: 540,
      specialties: ["Marketing", "Analytics"],
      status: "offline"
    }
  ],
  recentActivity: [
    {
      id: "1",
      type: "achievement_earned",
      user: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" },
      description: "earned the 'Template Master' achievement",
      timestamp: new Date("2024-01-21T10:30:00"),
      xpGained: 150
    },
    {
      id: "2",
      type: "template_used",
      user: { name: "Alex Rodriguez", avatar: "/avatars/alex.jpg" },
      description: "used 'Advanced Code Review Assistant' template",
      timestamp: new Date("2024-01-21T09:15:00"),
      xpGained: 100
    },
    {
      id: "3",
      type: "level_up",
      user: { name: "Maya Patel", avatar: "/avatars/maya.jpg" },
      description: "reached Level 38",
      timestamp: new Date("2024-01-20T16:45:00"),
      xpGained: 200
    }
  ],
  achievements: [
    {
      id: "1",
      title: "Template Master",
      description: "Team used 100+ unique templates",
      icon: "trophy",
      rarity: "gold",
      unlockedAt: new Date("2024-01-21T10:30:00"),
      unlockedBy: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" }
    },
    {
      id: "2",
      title: "Collaboration Champion",
      description: "Team members shared 50+ templates with each other",
      icon: "users",
      rarity: "silver",
      unlockedAt: new Date("2024-01-15T14:20:00"),
      unlockedBy: { name: "Alex Rodriguez", avatar: "/avatars/alex.jpg" }
    }
  ],
  currentChallenge: {
    id: "1",
    title: "Weekly Innovation Sprint",
    description: "Create and use 25 new templates as a team",
    type: "team",
    progress: 18,
    maxProgress: 25,
    endsAt: new Date("2024-01-28"),
    reward: {
      xp: 500,
      badge: "Sprint Master"
    }
  }
};

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User
};

const roleColors = {
  owner: "text-yellow-500",
  admin: "text-blue-500",
  member: "text-gray-500"
};

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-gray-500"
};

const rarityColors = {
  bronze: "text-amber-600",
  silver: "text-gray-400",
  gold: "text-yellow-500",
  diamond: "text-cyan-400"
};

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [searchMembers, setSearchMembers] = useState("");
  
  const { user, addExperience, addNotification } = useGameStore();
  
  const team = mockTeam; // In a real app, this would come from an API

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Invitation sent to ${inviteEmail}`);
    // addNotification({
    //   id: Date.now().toString(),
    //   type: 'info',
    //   title: 'Team Invitation Sent',
    //   message: `Invitation sent to ${inviteEmail}`,
    //   read: false,
    //   timestamp: new Date()
    // });
    
    setInviteEmail("");
    setShowInviteDialog(false);
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `https://promptcraft.app/teams/join/${team.id}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  const filteredMembers = team.members.filter(member =>
    member.name.toLowerCase().includes(searchMembers.toLowerCase()) ||
    member.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchMembers.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                  <AvatarImage src={team.avatar} />
                  <AvatarFallback className="bg-primary/10 text-lg font-bold">
                    {team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border border-border">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">
                  {team.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {team.memberCount} members
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-achievement" />
                    Level {team.averageLevel} avg
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-experience" />
                    {team.totalExperience.toLocaleString()} total XP
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Members
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Members</DialogTitle>
                    <DialogDescription>
                      Invite new members to join your team and collaborate on projects.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address</label>
                      <Input
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Role</label>
                      <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Or share invite link:</p>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={`https://promptcraft.app/teams/join/${team.id}`}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={handleCopyInviteLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember}>
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Challenge */}
            {team.currentChallenge && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {team.currentChallenge.title}
                    </CardTitle>
                    <Badge variant="secondary">
                      {Math.ceil((team.currentChallenge.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                    </Badge>
                  </div>
                  <CardDescription>
                    {team.currentChallenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {team.currentChallenge.progress}/{team.currentChallenge.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(team.currentChallenge.progress / team.currentChallenge.maxProgress) * 100}
                      className="h-3"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-achievement" />
                        <span>Reward: {team.currentChallenge.reward.xp} XP</span>
                        {team.currentChallenge.reward.badge && (
                          <Badge variant="outline">{team.currentChallenge.reward.badge}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Team Level</p>
                      <p className="text-3xl font-bold text-primary">{team.averageLevel}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total XP</p>
                      <p className="text-3xl font-bold text-experience">{team.totalExperience.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-experience/10 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-experience" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Achievements</p>
                      <p className="text-3xl font-bold text-achievement">{team.achievements.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-achievement/10 rounded-lg flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-achievement" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span> {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {activity.xpGained && (
                        <Badge variant="secondary" className="text-xs">
                          +{activity.xpGained} XP
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Search Members */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchMembers}
                  onChange={(e) => setSearchMembers(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map(member => {
                const RoleIcon = roleIcons[member.role];
                
                return (
                  <Card key={member.id} className="glass-effect">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColors[member.status]} rounded-full border-2 border-background`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{member.name}</h3>
                            <RoleIcon className={`h-4 w-4 ${roleColors[member.role]}`} />
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Level {member.level}</span>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-experience" />
                            {member.experience} XP
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Contribution</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-achievement" />
                            {member.contributionScore}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {member.specialties.slice(0, 2).map(specialty => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {member.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.specialties.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <div>Joined {member.joinedAt.toLocaleDateString()}</div>
                          <div>Active {member.lastActive.toLocaleDateString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {team.achievements.map(achievement => (
                <Card key={achievement.id} className="glass-effect">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 bg-${achievement.rarity}/10 rounded-lg flex items-center justify-center`}>
                        <Trophy className={`h-6 w-6 ${rarityColors[achievement.rarity]}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge variant="outline" className={`text-xs ${rarityColors[achievement.rarity]}`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={achievement.unlockedBy.avatar} />
                        <AvatarFallback className="text-xs">
                          {achievement.unlockedBy.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>Unlocked by {achievement.unlockedBy.name}</span>
                      <span>•</span>
                      <span>{achievement.unlockedAt.toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            {/* Active Challenge */}
            {team.currentChallenge && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Active Challenge: {team.currentChallenge.title}
                  </CardTitle>
                  <CardDescription>
                    {team.currentChallenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {team.currentChallenge.progress} / {team.currentChallenge.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(team.currentChallenge.progress / team.currentChallenge.maxProgress) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Ends {team.currentChallenge.endsAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-experience" />
                        {team.currentChallenge.reward.xp} XP reward
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Challenge History */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Challenges</CardTitle>
                <CardDescription>
                  View completed team challenges and their outcomes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No previous challenges found.</p>
                  <p className="text-sm">Complete your first challenge to see it here!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}