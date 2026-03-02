import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchDetailLoadingSkeleton } from '@/components/ui/page-skeleton';
import { DateScheduler } from '@/components/dating/DateScheduler';
import { MatchDecision } from '@/components/dating/MatchDecision';
import { CompatibilityBreakdown } from '@/components/dating/CompatibilityBreakdown';
import { MeetingFeedbackForm } from '@/components/dating/MeetingFeedbackForm';
import { MeetingModeUI } from '@/components/dating/MeetingModeUI';
import { MatchRevealMoment } from '@/components/dating/MatchRevealMoment';
import {
  ArrowLeft,
  Heart,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  PartyPopper,
  Lock,
  Zap,
  Video,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fireCelebration } from '@/hooks/useConfetti';

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  photo_url: string | null;
  age: number;
  gender: string;
  location: string | null;
  occupation: string | null;
  bio: string | null;
  core_values_ranked: string[] | null;
  communication_style: string | null;
  stress_response: string | null;
  repair_attempt_response: string | null;
  vibe_clip_url?: string | null;
  vibe_clip_status?: string | null;
}

interface MatchDimensions {
  communication?: number;
  values?: number;
  goals?: number;
  lifestyle?: number;
  red_flags?: number;
  gottman_score?: number;
}

interface Match {
  id: string;
  compatibility_score: number;
  match_reason: string;
  match_dimensions: MatchDimensions | null;
  status: string;
  meeting_status: string;
  meeting_date: string | null;
  meeting_time: string | null;
  user_a_response: string;
  user_b_response: string;
  user_a_id: string;
  user_b_id: string;
  origin_story?: string | null;
}

interface Proposal {
  id: string;
  proposed_date: string;
  proposed_time: string;
  status: string;
  proposed_by: string;
}

export default function PortalMatchDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confettiFiredRef = useRef(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showDecision, setShowDecision] = useState(false);

  // Fetch user's dating profile
  const { data: myProfile } = useQuery({
    queryKey: ['my-dating-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dating_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as DatingProfile | null;
    },
    enabled: !!user?.id,
  });

  // Fetch the match
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dating_matches')
        .select('*')
        .eq('id', matchId)
        .single();
      if (error) throw error;
      return data as unknown as Match;
    },
    enabled: !!matchId,
  });

  // Fetch matched profile
  const { data: matchedProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['matched-profile', match?.user_a_id, match?.user_b_id, myProfile?.id],
    queryFn: async () => {
      if (!match || !myProfile) return null;
      const matchedProfileId = match.user_a_id === myProfile.id ? match.user_b_id : match.user_a_id;
      const { data, error } = await supabase
        .from('dating_profiles')
        .select('*')
        .eq('id', matchedProfileId)
        .single();
      if (error) throw error;
      return data as unknown as DatingProfile;
    },
    enabled: !!match && !!myProfile,
  });

  // Fetch meeting proposals
  const { data: proposals = [] } = useQuery({
    queryKey: ['meeting-proposals', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_proposals')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Proposal[];
    },
    enabled: !!matchId,
  });

  const acceptedProposal = proposals.find(p => p.status === 'accepted');
  const isUserA = match?.user_a_id === myProfile?.id;
  const isWoman = myProfile?.gender.toLowerCase() === 'female' || myProfile?.gender.toLowerCase() === 'woman';
  const isRevealed = match?.status === 'mutual_yes';
  const isDeclined = match?.status === 'declined';
  const awaitingDecision = match?.meeting_status === 'met';
  const isScheduled = match?.meeting_status === 'scheduled';

  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (match?.meeting_status === 'feedback_positive' && !match.origin_story) {
      supabase.functions.invoke('generate-origin-story', { body: { matchId } }).then(() => setShowReveal(true));
    } else if (match?.meeting_status === 'feedback_positive' && match.origin_story) {
      const shown = localStorage.getItem(`reveal_shown_${matchId}`);
      if (!shown) {
        setShowReveal(true);
        localStorage.setItem(`reveal_shown_${matchId}`, 'true');
      }
    }
  }, [match?.meeting_status, match?.origin_story, matchId]);

  useEffect(() => {
    if (isRevealed && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      setTimeout(() => {
        fireCelebration();
        setTimeout(() => fireCelebration(), 400);
      }, 300);
    }
  }, [isRevealed]);

  if (matchLoading || profileLoading) return <MatchDetailLoadingSkeleton />;

  if (!match || !matchedProfile || !myProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Match not found</p>
        <Button variant="outline" onClick={() => navigate('/portal/slow-dating')} className="mt-4">
          Back to Slow Dating
        </Button>
      </div>
    );
  }

  const currentResponse = isUserA ? match.user_a_response : match.user_b_response;
  const otherResponse = isUserA ? match.user_b_response : match.user_a_response;
  const hasDecided = currentResponse !== 'pending';

  const getTimeLabel = (timeValue: string) => {
    const labels: Record<string, string> = {
      morning: 'Morning (10 AM – 12 PM)',
      afternoon: 'Afternoon (2 PM – 5 PM)',
      evening: 'Evening (6 PM – 9 PM)',
    };
    return labels[timeValue] || timeValue;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/portal/slow-dating')}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>

      {showReveal && matchedProfile && (
        <MatchRevealMoment
          matchId={matchId!}
          profileA={myProfile}
          profileB={matchedProfile}
          originStory={match.origin_story}
          onClose={() => setShowReveal(false)}
        />
      )}

      {/* Mutual Connection Banner */}
      {isRevealed && (
        <div className="bg-primary text-primary-foreground rounded-lg p-6 flex items-center justify-center gap-3">
          <PartyPopper className="h-6 w-6" />
          <span className="text-xl font-display">It's a Connection!</span>
          <Heart className="h-6 w-6" />
        </div>
      )}

      {/* Declined Banner */}
      {isDeclined && (
        <Card className="border-border">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">This match has ended gracefully.</p>
          </CardContent>
        </Card>
      )}

      {/* === ACCEPT / REJECT DECISION CARD === */}
      {!isDeclined && !hasDecided && (
        <Card className="border-primary/30 bg-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-display text-foreground">
                What do you think?
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Review the compatibility breakdown below, then let us know if you'd like to move forward with this match.
              </p>
              <div className="flex gap-4 justify-center pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDecision(true)}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 px-8"
                >
                  <ThumbsDown className="h-5 w-5 mr-2" />
                  Not For Me
                </Button>
                <Button
                  size="lg"
                  onClick={() => setShowDecision(true)}
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  I'm Interested
                </Button>
              </div>
              {hasDecided && (
                <p className="text-xs text-muted-foreground">
                  You've already made your decision.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      <Card className="overflow-hidden border-border">
        <CardContent className="p-0">
          <div className="md:flex">
            {/* Photo */}
            <div className="md:w-1/3 min-h-[300px] relative bg-muted/30">
              {matchedProfile.photo_url ? (
                <img
                  src={matchedProfile.photo_url}
                  alt={isRevealed ? matchedProfile.display_name : 'Your Match'}
                  width={300}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "w-full h-full object-cover",
                    !isRevealed && "blur-xl scale-110"
                  )}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
              {!isRevealed && (
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
                    Photo reveals after mutual connection
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:w-2/3 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  {isRevealed ? (
                    <>
                      <h1 className="text-2xl font-display text-foreground">
                        {matchedProfile.display_name}
                      </h1>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span>{matchedProfile.age} years old</span>
                        {matchedProfile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {matchedProfile.location}
                          </span>
                        )}
                        {matchedProfile.occupation && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {matchedProfile.occupation}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                     <>
                       <h1 className="text-2xl font-display text-foreground blur-sm select-none" aria-hidden="true">
                         {matchedProfile.display_name}
                       </h1>
                       <p className="text-muted-foreground mt-1">{matchedProfile.age} years old</p>
                       <p className="text-xs text-muted-foreground/70 mt-1">
                         Name reveals after mutual connection
                       </p>
                     </>
                  )}
                </div>
                <Badge className="text-lg px-3 py-1 bg-primary/10 text-primary border-primary/20">
                  {match.compatibility_score}%
                </Badge>
              </div>

              {/* Clear explanation header */}
              <div className="p-3 rounded-lg bg-accent border border-border">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">How you two match:</span>{' '}
                  <span className="text-muted-foreground">
                    This breakdown shows how compatible you are with this person based on the profile questionnaire you both completed.
                  </span>
                </p>
              </div>

              {/* Bio - Only when revealed */}
              {isRevealed && matchedProfile.bio && (
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">About</h3>
                  <p className="text-foreground">{matchedProfile.bio}</p>
                </div>
              )}

              {/* Vibe Clip */}
              {isRevealed && (matchedProfile as any).vibe_clip_url && (
                <div className="mt-4">
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vibe Clip
                  </h3>
                  <div className="rounded-xl overflow-hidden bg-muted aspect-video border border-border">
                    <video src={(matchedProfile as any).vibe_clip_url} className="w-full h-full object-cover" controls />
                  </div>
                </div>
              )}

              {/* Meeting Info */}
              {isScheduled && match.meeting_date && (
                <div className="bg-accent rounded-lg p-4 border border-border">
                  <h3 className="text-sm uppercase tracking-wide text-primary mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Scheduled Meeting
                  </h3>
                  <p className="font-medium text-foreground">
                    {format(new Date(match.meeting_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  {match.meeting_time && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {getTimeLabel(match.meeting_time)}
                    </p>
                  )}
                </div>
              )}

              {isScheduled && matchId && (
                <div className="mt-6">
                  <MeetingModeUI matchId={matchId} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility Breakdown - Always visible */}
      <CompatibilityBreakdown
        compatibilityScore={match.compatibility_score}
        matchReason={match.match_reason}
        matchDimensions={match.match_dimensions}
        myValues={myProfile.core_values_ranked}
        theirValues={matchedProfile.core_values_ranked}
        myCommunicationStyle={myProfile.communication_style}
        theirCommunicationStyle={matchedProfile.communication_style}
        myStressResponse={myProfile.stress_response}
        theirStressResponse={matchedProfile.stress_response}
        myRepairResponse={myProfile.repair_attempt_response}
        theirRepairResponse={matchedProfile.repair_attempt_response}
      />

      {/* Scheduler or Decision UI */}
      {showScheduler && (
        <DateScheduler
          matchId={match.id}
          currentProfileId={myProfile.id}
          isWoman={isWoman}
          meetingStatus={match.meeting_status}
          proposals={proposals}
          onClose={() => setShowScheduler(false)}
        />
      )}

      {showDecision && (
        <MatchDecision
          matchId={match.id}
          currentProfileId={myProfile.id}
          isUserA={isUserA}
          currentResponse={currentResponse}
          otherResponse={otherResponse}
          onClose={() => setShowDecision(false)}
        />
      )}

      {/* Meeting Feedback UI */}
      {awaitingDecision && (
        <MeetingFeedbackForm
          matchId={match.id}
          userId={user?.id || ''}
          onSuccess={() => {}}
        />
      )}

      {/* Action Cards */}
      {!showScheduler && !showDecision && !isDeclined && (
        <div className="grid gap-4 md:grid-cols-2">
          {(match.meeting_status === 'pending_woman' || match.meeting_status === 'pending_man') && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Schedule Your Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isWoman && match.meeting_status === 'pending_woman'
                    ? "Propose dates that work for you. Your match will then confirm."
                    : !isWoman && match.meeting_status === 'pending_man'
                      ? "Review the proposed dates and accept one that works for you."
                      : "Waiting for the other person to take action."}
                </p>
                <Button
                  onClick={() => setShowScheduler(true)}
                  className="w-full"
                  disabled={
                    (isWoman && match.meeting_status !== 'pending_woman') ||
                    (!isWoman && match.meeting_status !== 'pending_man')
                  }
                >
                  {isWoman ? 'Propose Dates' : 'Review Proposals'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
