import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Badge {
  id: string;
  type: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export const BADGE_DEFINITIONS: Omit<Badge, 'id' | 'earned' | 'earnedAt'>[] = [
  {
    type: 'newcomer',
    name: 'Newcomer',
    icon: '🌱',
    description: 'Welcome to The Gathering!',
  },
  {
    type: 'picture_perfect',
    name: 'Picture Perfect',
    icon: '📸',
    description: 'Uploaded your first profile photo',
  },
  {
    type: 'storyteller',
    name: 'Storyteller',
    icon: '✍️',
    description: 'Wrote your personal bio',
  },
  {
    type: 'professional',
    name: 'Professional',
    icon: '💼',
    description: 'Added your job title and industry',
  },
  {
    type: 'all_set',
    name: 'All Set',
    icon: '🎯',
    description: '100% profile completion',
  },
];

interface BadgeDisplayProps {
  earnedBadges: { badge_type: string; earned_at: string }[];
  showAll?: boolean;
  compact?: boolean;
}

export function BadgeDisplay({ earnedBadges, showAll = true, compact = false }: BadgeDisplayProps) {
  const badges: Badge[] = BADGE_DEFINITIONS.map((def) => {
    const earned = earnedBadges.find((b) => b.badge_type === def.type);
    return {
      id: def.type,
      ...def,
      earned: !!earned,
      earnedAt: earned?.earned_at,
    };
  });

  const displayBadges = showAll ? badges : badges.filter((b) => b.earned);

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {displayBadges.map((badge) => (
            <Tooltip key={badge.type}>
              <TooltipTrigger asChild>
                <div
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    badge.earned
                      ? 'bg-primary/10 cursor-pointer hover:scale-110'
                      : 'bg-muted opacity-40 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {badge.earned && badge.earnedAt && (
                  <p className="text-xs text-primary mt-1">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Your Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {displayBadges.map((badge) => (
            <div
              key={badge.type}
              className={`flex flex-col items-center p-4 rounded-lg text-center transition-all ${
                badge.earned
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/50 opacity-50'
              }`}
            >
              <span className={`text-3xl mb-2 ${!badge.earned && 'grayscale'}`}>
                {badge.icon}
              </span>
              <span className="font-medium text-sm text-foreground">{badge.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{badge.description}</span>
              {badge.earned && badge.earnedAt && (
                <span className="text-xs text-primary mt-2">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
