import { Card, CardContent } from '@/components/ui/card';
import { Lock, Unlock, Users, Eye, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Feature {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

interface FeatureUnlockCardProps {
  completionPercentage: number;
  isProfileComplete: boolean;
}

export function FeatureUnlockCard({ completionPercentage, isProfileComplete }: FeatureUnlockCardProps) {
  const features: Feature[] = [
    {
      name: 'Profile Visibility',
      description: 'Be discovered by other members',
      icon: Eye,
      unlocked: isProfileComplete,
    },
    {
      name: 'Network Access',
      description: 'Browse and connect with members',
      icon: Users,
      unlocked: isProfileComplete,
    },
    {
      name: 'Introduction Requests',
      description: 'Send connection requests',
      icon: MessageSquare,
      unlocked: isProfileComplete,
    },
  ];

  if (isProfileComplete) {
    return null; // Don't show when all features are unlocked
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground">Unlock Features</h3>
          <span className="text-sm text-muted-foreground">
            {completionPercentage}% complete
          </span>
        </div>
        
        <Progress value={completionPercentage} className="h-2 mb-6" />
        
        <p className="text-sm text-muted-foreground mb-4">
          Complete your profile to unlock these features:
        </p>
        
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                feature.unlocked
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/30'
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  feature.unlocked ? 'bg-primary/20' : 'bg-muted'
                }`}
              >
                {feature.unlocked ? (
                  <Unlock className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium text-sm ${
                    feature.unlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {feature.name}
                </p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              <feature.icon
                className={`h-5 w-5 ${
                  feature.unlocked ? 'text-primary' : 'text-muted-foreground/50'
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
