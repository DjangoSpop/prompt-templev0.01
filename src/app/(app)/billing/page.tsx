"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Crown,
  Zap,
  Download,
  Upload,
  Users,
  Check,
  Calendar,
  TrendingUp,
  Activity,
  Award,
  Gift,
  Coins,
  RefreshCw,
  Share,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    templates: number | 'unlimited';
    teamMembers: number | 'unlimited';
    apiCalls: number | 'unlimited';
    storage: string;
  };
  popular?: boolean;
  current?: boolean;
}

interface UsageStats {
  templates: {
    used: number;
    limit: number | 'unlimited';
  };
  apiCalls: {
    used: number;
    limit: number | 'unlimited';
  };
  storage: {
    used: number;
    limit: number;
  };
  teamMembers: {
    used: number;
    limit: number | 'unlimited';
  };
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  downloadUrl?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Temple Apprentice',
    price: 0,
    interval: 'monthly',
    features: [
      '50 template uses per month',
      '5 custom templates',
      'Basic gamification',
      'Community support',
      '1GB storage'
    ],
    limits: {
      templates: 50,
      teamMembers: 1,
      apiCalls: 1000,
      storage: '1GB'
    },
    current: true
  },
  {
    id: 'pro',
    name: 'Temple Guardian',
    price: 19,
    interval: 'monthly',
    features: [
      'Unlimited template uses',
      'Advanced templates access',
      'Team collaboration (up to 10)',
      'Priority support',
      'Advanced analytics',
      '10GB storage',
      'Custom integrations'
    ],
    limits: {
      templates: 'unlimited',
      teamMembers: 10,
      apiCalls: 10000,
      storage: '10GB'
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Temple Master',
    price: 99,
    interval: 'monthly',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      '100GB storage',
      'API access'
    ],
    limits: {
      templates: 'unlimited',
      teamMembers: 'unlimited',
      apiCalls: 'unlimited',
      storage: '100GB'
    }
  }
];

const mockUsage: UsageStats = {
  templates: {
    used: 32,
    limit: 50
  },
  apiCalls: {
    used: 650,
    limit: 1000
  },
  storage: {
    used: 0.3,
    limit: 1
  },
  teamMembers: {
    used: 1,
    limit: 1
  }
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    description: 'Temple Guardian - Monthly Subscription',
    amount: 19,
    status: 'completed',
    downloadUrl: '/invoices/inv-001.pdf'
  },
  {
    id: '2',
    date: new Date('2023-12-15'),
    description: 'Temple Guardian - Monthly Subscription',
    amount: 19,
    status: 'completed',
    downloadUrl: '/invoices/inv-002.pdf'
  },
  {
    id: '3',
    date: new Date('2023-11-15'),
    description: 'Temple Guardian - Monthly Subscription',
    amount: 19,
    status: 'completed',
    downloadUrl: '/invoices/inv-003.pdf'
  }
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);

  const { addExperience, addNotification } = useGameStore();

  const currentPlan = pricingPlans.find(plan => plan.current);
  const usage = mockUsage;

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeDialog(true);
  };

  const processUpgrade = async () => {
    setIsProcessingUpgrade(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const plan = pricingPlans.find(p => p.id === selectedPlan);
    if (plan) {
      toast.success(`Successfully upgraded to ${plan.name}!`);
      addExperience(200);
      // addNotification({
      //   id: Date.now().toString(),
      //   type: 'achievement',
      //   title: 'Plan Upgraded!',
      //   message: `Welcome to ${plan.name}! You earned 200 XP bonus.`,
      //   read: false,
      //   timestamp: new Date()
      // });
    }
    
    setIsProcessingUpgrade(false);
    setShowUpgradeDialog(false);
  };

  const getUsagePercentage = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Billing & Usage
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your subscription and track your usage
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentPlan && (
                <Badge variant="secondary" className="px-4 py-2">
                  <Crown className="h-4 w-4 mr-1" />
                  {currentPlan.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="usage" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            {/* Current Plan Summary */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      {currentPlan?.name || 'No Active Plan'}
                    </CardTitle>
                    <CardDescription>
                      {currentPlan?.price === 0 ? 'Free Plan' : `$${currentPlan?.price}/${currentPlan?.interval}`}
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleUpgrade('pro')}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Templates Usage */}
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Templates</p>
                        <p className="text-lg font-semibold">
                          {usage.templates.used}
                          {usage.templates.limit !== 'unlimited' && ` / ${usage.templates.limit}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {usage.templates.limit !== 'unlimited' && (
                    <Progress 
                      value={getUsagePercentage(usage.templates.used, usage.templates.limit)}
                      className="h-2"
                    />
                  )}
                </CardContent>
              </Card>

              {/* API Calls Usage */}
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-experience/10 rounded-lg flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-experience" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">API Calls</p>
                        <p className="text-lg font-semibold">
                          {usage.apiCalls.used.toLocaleString()}
                          {usage.apiCalls.limit !== 'unlimited' && ` / ${usage.apiCalls.limit.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {usage.apiCalls.limit !== 'unlimited' && (
                    <Progress 
                      value={getUsagePercentage(usage.apiCalls.used, usage.apiCalls.limit)}
                      className="h-2"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Storage Usage */}
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <Upload className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Storage</p>
                        <p className="text-lg font-semibold">
                          {usage.storage.used}GB / {usage.storage.limit}GB
                        </p>
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.storage.used, usage.storage.limit)}
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Team Members Usage */}
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-achievement/10 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-achievement" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Team Members</p>
                        <p className="text-lg font-semibold">
                          {usage.teamMembers.used}
                          {usage.teamMembers.limit !== 'unlimited' && ` / ${usage.teamMembers.limit}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {usage.teamMembers.limit !== 'unlimited' && (
                    <Progress 
                      value={getUsagePercentage(usage.teamMembers.used, usage.teamMembers.limit)}
                      className="h-2"
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Usage Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Insights
                </CardTitle>
                <CardDescription>
                  Understand your usage patterns and optimize your plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">64%</div>
                    <div className="text-sm text-muted-foreground">Templates Used</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-experience mb-1">23</div>
                    <div className="text-sm text-muted-foreground">Days Left in Cycle</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-achievement mb-1">+15%</div>
                    <div className="text-sm text-muted-foreground">Usage vs Last Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            {/* Plan Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-4 p-1 bg-secondary/20 rounded-lg">
                <Button
                  variant={billingInterval === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingInterval('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={billingInterval === 'yearly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingInterval('yearly')}
                  className="flex items-center gap-1"
                >
                  Yearly
                  <Badge variant="secondary" className="text-xs">Save 20%</Badge>
                </Button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map(plan => (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative ${plan.popular ? 'z-10' : ''}`}
                >
                  <Card className={`glass-effect h-full ${
                    plan.popular ? 'border-primary/50 ring-2 ring-primary/20' : ''
                  } ${plan.current ? 'bg-primary/5' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold">
                        ${billingInterval === 'yearly' ? Math.round(plan.price * 0.8 * 12) : plan.price}
                        <span className="text-lg font-normal text-muted-foreground">
                          /{billingInterval === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingInterval === 'yearly' && plan.price > 0 && (
                        <p className="text-sm text-green-600">
                          Save ${Math.round(plan.price * 0.2 * 12)} annually
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map(feature => (
                          <div key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        {plan.current ? (
                          <Button disabled className="w-full">
                            Current Plan
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleUpgrade(plan.id)}
                            variant={plan.popular ? 'default' : 'outline'}
                            className="w-full"
                          >
                            {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-primary rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">VISA</span>
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTransactions.map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium">${transaction.amount}</p>
                          <Badge 
                            variant={
                              transaction.status === 'completed' ? 'secondary' :
                              transaction.status === 'pending' ? 'outline' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        {transaction.downloadUrl && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            {/* Loyalty Program */}
            <Card className="border-achievement/20 bg-gradient-to-r from-achievement/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-achievement" />
                  Temple Loyalty Program
                </CardTitle>
                <CardDescription>
                  Earn coins for every action and unlock exclusive rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-achievement">2,450 Coins</p>
                    <p className="text-sm text-muted-foreground">Available to spend</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-8 w-8 text-achievement" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Earn Coins</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Use templates: 10 coins</li>
                      <li>• Complete challenges: 50 coins</li>
                      <li>• Invite friends: 100 coins</li>
                      <li>• Monthly subscription: 200 coins</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Redeem Rewards</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 1 month free: 2,000 coins</li>
                      <li>• Exclusive templates: 500 coins</li>
                      <li>• Custom avatar: 300 coins</li>
                      <li>• Priority support: 1,000 coins</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referral Program
                </CardTitle>
                <CardDescription>
                  Invite friends and earn rewards together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                    <div>
                      <p className="font-medium">Share your referral link</p>
                      <p className="text-sm text-muted-foreground">
                        You get $10, they get 20% off their first month
                      </p>
                    </div>
                    <Button>
                      <Share className="h-4 w-4 mr-1" />
                      Share Link
                    </Button>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-lg font-semibold">3 friends referred</p>
                    <p className="text-sm text-muted-foreground">You&apos;ve earned $30 in credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <>
                  Upgrade to {pricingPlans.find(p => p.id === selectedPlan)?.name} and unlock powerful features.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You&apos;ll be charged immediately and your new features will be available right away.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={processUpgrade} disabled={isProcessingUpgrade}>
              {isProcessingUpgrade ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Upgrade'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}