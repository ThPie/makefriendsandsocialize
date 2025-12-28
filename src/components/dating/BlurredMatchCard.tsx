import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, Calendar, Clock, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface Match {
  id: string;
  compatibility_score: number;
  match_reason: string;
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
  isWoman: boolean;
}

export const BlurredMatchCard = ({ 
  match, 
  currentProfileId, 
  onSchedule, 
  onViewDetails,
  isWoman 
}: BlurredMatchCardProps) => {
  const profile = match.matched_profile;
  const isRevealed = match.status === 'mutual_yes';
  const isDeclined = match.status === 'declined';
  
  // Determine if user can take action based on meeting status
  const canProposeDates = isWoman && match.meeting_status === 'pending_woman';
  const canRespondToDates = !isWoman && match.meeting_status === 'pending_man';
  const isScheduled = match.meeting_status === 'scheduled';
  const awaitingDecision = match.meeting_status === 'met';
  
  if (!profile) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-dating-terracotta/20 text-dating-terracotta border-dating-terracotta/30";
    if (score >= 75) return "bg-dating-forest/20 text-dating-forest border-dating-forest/30";
    return "bg-dating-blush/20 text-dating-blush border-dating-blush/30";
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

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isRevealed 
        ? "border-dating-forest shadow-lg shadow-dating-forest/10" 
        : "border-dating-cream hover:shadow-md"
    )}>
      <CardContent className="p-0">
        {/* Revealed celebration banner */}
        {isRevealed && (
          <div className="bg-gradient-to-r from-dating-forest to-dating-forest/80 text-white px-4 py-3 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-display">It's a Connection!</span>
            <Sparkles className="h-5 w-5" />
          </div>
        )}

        <div className="flex">
          {/* Photo Section */}
          <div className="w-32 h-full min-h-[180px] relative flex-shrink-0 bg-dating-cream/30 overflow-hidden">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt="Match"
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  !isRevealed && "blur-xl scale-110"
                )}
              />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center",
                !isRevealed && "blur-md"
              )}>
                <User className="h-12 w-12 text-dating-forest/30" />
              </div>
            )}
            
            {/* Overlay for blurred state */}
            {!isRevealed && (
              <div className="absolute inset-0 bg-dating-cream/40 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-dating-forest/20 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-dating-forest" />
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 p-4 space-y-3">
            {/* Header */}
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
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
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

            {/* Match Reason - Always Visible */}
            <div className="bg-dating-forest/5 rounded-lg p-3 border border-dating-forest/10">
              <p className="text-xs uppercase tracking-wide text-dating-forest/70 mb-1">Why you match</p>
              <p className="text-sm text-foreground italic line-clamp-2">
                "{match.match_reason}"
              </p>
            </div>

            {/* Revealed: Show full bio */}
            {isRevealed && profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              {awaitingDecision ? (
                <Button
                  size="sm"
                  className="flex-1 bg-dating-terracotta hover:bg-dating-terracotta/90"
                  onClick={onViewDetails}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Make Decision
                </Button>
              ) : canProposeDates || canRespondToDates ? (
                <Button
                  size="sm"
                  className="flex-1 bg-dating-forest hover:bg-dating-forest/90"
                  onClick={onSchedule}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {canProposeDates ? 'Propose Dates' : 'View Proposals'}
                </Button>
              ) : isScheduled ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-dating-forest text-dating-forest"
                  onClick={onViewDetails}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  View Meeting Details
                </Button>
              ) : isRevealed ? (
                <Button
                  size="sm"
                  className="flex-1 bg-dating-forest hover:bg-dating-forest/90"
                  onClick={onViewDetails}
                >
                  View Full Profile
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={onViewDetails}
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
