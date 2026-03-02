import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, Calendar, Clock, CheckCircle2, XCircle, PartyPopper, MessageCircle, Target, Sparkles, Home, Lock, Eye, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlurredImage } from "@/hooks/useBlurredImage";

interface DatingProfile {
  id: string;
  display_name: string;
  photo_url: string | null;
  age: number;
  gender: string;
  location: string | null;
  occupation: string | null;
  bio: string | null;
}

interface MatchDimensions {
  communication?: number;
  values?: number;
  goals?: number;
  lifestyle?: number;
}

interface Match {
  id: string;
  compatibility_score: number;
  match_reason: string;
  match_dimensions?: MatchDimensions | null;
  status: string;
  meeting_status: string;
  meeting_date: string | null;
  meeting_time: string | null;
  user_a_response: string;
  user_b_response: string;
  user_a_id: string;
  user_b_id: string;
  matched_profile?: DatingProfile;
}

interface BlurredMatchCardProps {
  match: Match;
  currentProfileId: string;
  onSchedule: () => void;
  onViewDetails: () => void;
  onReveal?: () => void;
  isWoman: boolean;
  availableReveals?: number;
  hasUnlimitedReveals?: boolean;
  canReveal?: boolean;
}

export const BlurredMatchCard = ({
  match,
  currentProfileId,
  onSchedule,
  onViewDetails,
  onReveal,
  isWoman,
  availableReveals = 0,
  hasUnlimitedReveals = false,
  canReveal = false,
}: BlurredMatchCardProps) => {
  const profile = match.matched_profile;
  const isRevealed = match.status === 'mutual_yes';
  const isDeclined = match.status === 'declined';

  // Server-side blurred image for security
  const { data: blurredPhotoUrl } = useBlurredImage(
    profile?.photo_url,
    !isRevealed && !!profile?.photo_url
  );

  // Determine if user can take action based on meeting status
  const canProposeDates = isWoman && match.meeting_status === 'pending_woman';
  const canRespondToDates = !isWoman && match.meeting_status === 'pending_man';
  const isScheduled = match.meeting_status === 'scheduled';
  const awaitingDecision = match.meeting_status === 'met';

  if (!profile) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-primary/20 text-primary border-primary/30";
    if (score >= 75) return "bg-primary/15 text-primary border-primary/25";
    return "bg-muted text-muted-foreground border-border";
  };

  const getDimensionScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-muted-foreground";
  };

  const getMeetingStatusText = () => {
    switch (match.meeting_status) {
      case 'pending_woman':
        return isWoman ? 'Propose meeting dates' : 'Waiting for date proposals';
      case 'pending_man':
        return isWoman ? 'Waiting for response' : 'Review date proposals';
      case 'scheduling':
        return 'Finalizing date';
      case 'scheduled':
        return `Meeting on ${new Date(match.meeting_date!).toLocaleDateString()}`;
      case 'met':
        return 'Ready for your decision';
      default:
        return 'New match';
    }
  };

  const getMeetingStatusIcon = () => {
    switch (match.meeting_status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'met':
        return <Heart className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isDeclined) {
    return (
      <Card className="overflow-hidden border-muted/50 opacity-60">
        <CardContent className="p-6 text-center">
          <XCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-medium text-muted-foreground">Match Ended</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            This connection has concluded gracefully.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get dimensional scores
  const dimensions = match.match_dimensions;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 cursor-pointer",
        isRevealed
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-border hover:shadow-md"
      )}
      onClick={onViewDetails}
    >
      <CardContent className="p-0">
        {/* Revealed celebration banner */}
        {isRevealed && (
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-3 flex items-center justify-center gap-2">
            <PartyPopper className="h-5 w-5" />
            <span className="font-display">It's a Connection!</span>
            <Heart className="h-5 w-5" />
          </div>
        )}

        <div className="flex">
          {/* Photo Section - server-side blur for security */}
          <div className="w-32 h-full min-h-[200px] relative flex-shrink-0 bg-muted/30 overflow-hidden">
            {isRevealed && profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt="Match"
                className="w-full h-full object-cover transition-all duration-500"
              />
            ) : blurredPhotoUrl ? (
              <img
                src={blurredPhotoUrl}
                alt="Match"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-12 w-12 text-primary/30" />
              </div>
            )}

            {/* Overlay for blurred state */}
            {!isRevealed && (
              <div className="absolute inset-0 bg-muted/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 p-4 space-y-3">
            {/* Header - Show age always, hide name/location before reveal */}
            <div className="flex items-start justify-between">
              <div>
                {isRevealed ? (
                  <>
                    <h3 className="font-display text-lg text-foreground">
                      {profile.display_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.age} years old
                      {profile.location && ` • ${profile.location}`}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-display text-lg text-foreground">
                      Your Match
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.age} years old
                    </p>
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                      {getMeetingStatusIcon()}
                      {getMeetingStatusText()}
                    </p>
                  </>
                )}
              </div>
              <Badge className={cn("text-sm font-semibold px-2 py-1", getScoreColor(match.compatibility_score))}>
                {match.compatibility_score}%
              </Badge>
            </div>

            {/* Dimensional Scores - Always visible */}
            {dimensions && (
              <div className="grid grid-cols-2 gap-2">
                {dimensions.communication !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <MessageCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Comm:</span>
                    <span className={cn("font-semibold", getDimensionScoreColor(dimensions.communication))}>
                      {dimensions.communication}%
                    </span>
                  </div>
                )}
                {dimensions.values !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Values:</span>
                    <span className={cn("font-semibold", getDimensionScoreColor(dimensions.values))}>
                      {dimensions.values}%
                    </span>
                  </div>
                )}
                {dimensions.goals !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Target className="h-3 w-3 text-purple-500" />
                    <span className="text-muted-foreground">Goals:</span>
                    <span className={cn("font-semibold", getDimensionScoreColor(dimensions.goals))}>
                      {dimensions.goals}%
                    </span>
                  </div>
                )}
                {dimensions.lifestyle !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Home className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Lifestyle:</span>
                    <span className={cn("font-semibold", getDimensionScoreColor(dimensions.lifestyle))}>
                      {dimensions.lifestyle}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Match Reason - Show generic teaser before reveal for privacy */}
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
              <p className="text-xs uppercase tracking-wide text-primary/70 mb-1">Why you match</p>
              {isRevealed ? (
                <p className="text-sm text-foreground italic line-clamp-2">
                  "{match.match_reason}"
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic line-clamp-2">
                  Strong compatibility in communication and shared values. Reveal to see full details.
                </p>
              )}
            </div>

            {/* Revealed: Show full bio */}
            {isRevealed && profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Reveal Credits Badge - For non-revealed matches */}
            {!isRevealed && (hasUnlimitedReveals || availableReveals > 0) && (
              <div className="flex items-center gap-2">
                {hasUnlimitedReveals ? (
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                    <Infinity className="h-3 w-3 mr-1" />
                    Unlimited Reveals
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-amber-500/5 text-amber-600 border-amber-500/20">
                    <Eye className="h-3 w-3 mr-1" />
                    {availableReveals} reveal{availableReveals !== 1 ? 's' : ''} left
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              {awaitingDecision ? (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={onViewDetails}
                  aria-label="Make decision on this match"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Make Decision
                </Button>
              ) : canProposeDates || canRespondToDates ? (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={onSchedule}
                  aria-label={canProposeDates ? 'Propose dates for meeting' : 'View date proposals'}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {canProposeDates ? 'Propose Dates' : 'View Proposals'}
                </Button>
              ) : isScheduled ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={onViewDetails}
                  aria-label="View meeting details"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  View Meeting Details
                </Button>
              ) : isRevealed ? (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={onViewDetails}
                  aria-label="View full profile"
                >
                  View Full Profile
                </Button>
              ) : onReveal ? (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={onReveal}
                  aria-label="Reveal this match's profile"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Reveal Match
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={onViewDetails}
                  aria-label="View match details"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
