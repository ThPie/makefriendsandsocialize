import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { DateScheduler } from '@/components/dating/DateScheduler';
import { MatchDecision } from '@/components/dating/MatchDecision';
import { 
  ArrowLeft, 
  Heart, 
  User, 
  MapPin, 
  Briefcase, 
  Calendar,
  Clock,
  Sparkles,
  Lock
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
      return data as DatingProfile | null;
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
      return data as Match;
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
      return data as DatingProfile;
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

  if (matchLoading || profileLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

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

  const isUserA = match.user_a_id === myProfile.id;
  const isWoman = myProfile.gender.toLowerCase() === 'female' || myProfile.gender.toLowerCase() === 'woman';
  const isRevealed = match.status === 'mutual_yes';
  const isDeclined = match.status === 'declined';
  const awaitingDecision = match.meeting_status === 'met';
  const isScheduled = match.meeting_status === 'scheduled';

  // Fire confetti when viewing a mutual match for the first time
  useEffect(() => {
    if (isRevealed && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      // Delay slightly so the page renders first
      setTimeout(() => {
        fireCelebration();
        setTimeout(() => fireCelebration(), 400);
      }, 300);
    }
  }, [isRevealed]);
  
  const currentResponse = isUserA ? match.user_a_response : match.user_b_response;
  const otherResponse = isUserA ? match.user_b_response : match.user_a_response;

  const getTimeLabel = (timeValue: string) => {
    const labels: Record<string, string> = {
      morning: 'Morning (10 AM - 12 PM)',
      afternoon: 'Afternoon (2 PM - 5 PM)',
      evening: 'Evening (6 PM - 9 PM)',
    };
    return labels[timeValue] || timeValue;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/portal/slow-dating')}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>

      {/* Revealed Banner */}
      {isRevealed && (
        <div className="bg-gradient-to-r from-dating-forest to-dating-forest/80 text-white rounded-lg p-6 flex items-center justify-center gap-3">
          <Sparkles className="h-6 w-6" />
          <span className="text-xl font-display">It's a Connection!</span>
          <Sparkles className="h-6 w-6" />
        </div>
      )}

      {/* Declined Banner */}
      {isDeclined && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">This match has ended gracefully.</p>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      <Card className={cn(
        "overflow-hidden",
        isRevealed ? "border-dating-forest" : "border-dating-cream"
      )}>
        <CardContent className="p-0">
          <div className="md:flex">
            {/* Photo */}
            <div className="md:w-1/3 min-h-[300px] relative bg-dating-cream/30">
              {matchedProfile.photo_url ? (
                <img
                  src={matchedProfile.photo_url}
                  alt={isRevealed ? matchedProfile.display_name : 'Your Match'}
                  className={cn(
                    "w-full h-full object-cover",
                    !isRevealed && "blur-2xl scale-110"
                  )}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-24 w-24 text-dating-forest/30" />
                </div>
              )}
              
              {!isRevealed && (
                <div className="absolute inset-0 bg-dating-cream/40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-dating-forest/20 flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-10 w-10 text-dating-forest" />
                    </div>
                    <p className="text-sm text-dating-forest font-medium">
                      Profile reveals after mutual connection
                    </p>
                  </div>
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
                      <h1 className="text-2xl font-display text-foreground">Your Match</h1>
                      <p className="text-muted-foreground">Complete the journey to reveal</p>
                    </>
                  )}
                </div>
                <Badge className="text-lg px-3 py-1 bg-dating-terracotta/10 text-dating-terracotta border-dating-terracotta/20">
                  {match.compatibility_score}%
                </Badge>
              </div>

              {/* Match Reason - Always Visible */}
              <div className="bg-dating-forest/5 rounded-lg p-4 border border-dating-forest/10">
                <h3 className="text-sm uppercase tracking-wide text-dating-forest/70 mb-2">
                  Why You Match
                </h3>
                <p className="text-foreground italic">"{match.match_reason}"</p>
              </div>

              {/* Bio - Only when revealed */}
              {isRevealed && matchedProfile.bio && (
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">About</h3>
                  <p className="text-foreground">{matchedProfile.bio}</p>
                </div>
              )}

              {/* Meeting Info */}
              {isScheduled && match.meeting_date && (
                <div className="bg-dating-cream/30 rounded-lg p-4 border border-dating-cream">
                  <h3 className="text-sm uppercase tracking-wide text-dating-forest mb-2 flex items-center gap-2">
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
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Action Cards */}
      {!showScheduler && !showDecision && !isDeclined && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Scheduling Card */}
          {(match.meeting_status === 'pending_woman' || match.meeting_status === 'pending_man') && (
            <Card className="border-dating-forest/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-dating-forest" />
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
                  className="w-full bg-dating-forest hover:bg-dating-forest/90"
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

          {/* Decision Card */}
          {awaitingDecision && (
            <Card className="border-dating-terracotta/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-dating-terracotta" />
                  After Your Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentResponse === 'pending'
                    ? "Did you feel a connection? Share your decision."
                    : currentResponse === 'accepted'
                    ? "You said yes! Waiting for their decision..."
                    : "You've made your decision."}
                </p>
                <Button
                  onClick={() => setShowDecision(true)}
                  className="w-full bg-dating-terracotta hover:bg-dating-terracotta/90"
                  disabled={currentResponse !== 'pending'}
                >
                  {currentResponse === 'pending' ? 'Make Your Decision' : 'View Decision'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
