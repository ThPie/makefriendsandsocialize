import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Sparkles, Clock, CheckCircle2, XCircle, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BlurredMatchCard } from '@/components/dating/BlurredMatchCard';

interface DatingProfile {
  id: string;
  display_name: string;
  photo_url: string | null;
  bio: string | null;
  status: string;
  age: number;
  gender: string;
  location: string | null;
  created_at: string;
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
  created_at: string;
  matched_profile?: {
    id: string;
    display_name: string;
    photo_url: string | null;
    age: number;
    gender: string;
    location: string | null;
    occupation: string | null;
    bio: string | null;
  };
}

export default function PortalSlowDating() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's dating profile
  const { data: profile, isLoading: profileLoading } = useQuery({
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

  // Fetch user's matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['my-dating-matches', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get matches where user is either user_a or user_b
      const { data: matchesA, error: errorA } = await supabase
        .from('dating_matches')
        .select('*')
        .eq('user_a_id', profile.id);

      const { data: matchesB, error: errorB } = await supabase
        .from('dating_matches')
        .select('*')
        .eq('user_b_id', profile.id);

      if (errorA) throw errorA;
      if (errorB) throw errorB;

      const allMatches = [...(matchesA || []), ...(matchesB || [])];

      // Fetch matched profile details for each match
      const enrichedMatches = await Promise.all(
        allMatches.map(async (match) => {
          const matchedProfileId = match.user_a_id === profile.id ? match.user_b_id : match.user_a_id;
          
          const { data: matchedProfile } = await supabase
            .from('dating_profiles')
            .select('id, display_name, photo_url, age, gender, location, occupation, bio')
            .eq('id', matchedProfileId)
            .single();

          return {
            ...match,
            matched_profile: matchedProfile,
          };
        })
      );

      return enrichedMatches as Match[];
    },
    enabled: !!profile?.id,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'vetted':
        return {
          label: 'Vetted',
          icon: CheckCircle2,
          className: 'bg-primary/10 text-primary border-primary/20',
          description: 'Your profile is approved and our matchmakers are finding your ideal connections.',
        };
      case 'pending':
      case 'new':
        return {
          label: 'Under Review',
          icon: Clock,
          className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          description: 'Our team is carefully reviewing your profile. This typically takes 2-3 business days.',
        };
      case 'rejected':
        return {
          label: 'Not Approved',
          icon: XCircle,
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          description: 'Unfortunately, your profile was not approved at this time.',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          className: 'bg-muted text-muted-foreground',
          description: '',
        };
    }
  };

  const isWoman = profile?.gender?.toLowerCase() === 'female' || profile?.gender?.toLowerCase() === 'woman';

  // Categorize matches
  const activeMatches = matches?.filter(m => m.status !== 'declined' && m.status !== 'mutual_yes') || [];
  const revealedMatches = matches?.filter(m => m.status === 'mutual_yes') || [];
  const endedMatches = matches?.filter(m => m.status === 'declined') || [];

  if (profileLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No profile - show CTA to apply
  if (!profile) {
    return (
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-display font-light text-foreground mb-2">Slow Dating</h1>
          <p className="text-muted-foreground">Curated matchmaking for meaningful connections</p>
        </div>

        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-light text-foreground mb-4">
              Join Our Slow Dating Community
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Experience a more intentional approach to dating. Our curators carefully review each profile 
              to create meaningful introductions based on shared values and genuine compatibility.
            </p>
            <Button asChild size="lg">
              <Link to="/dating/apply">
                <Sparkles className="mr-2 h-5 w-5" />
                Apply Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(profile.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-display font-light text-foreground mb-2">Slow Dating</h1>
        <p className="text-muted-foreground">Your curated matchmaking journey</p>
      </div>

      {/* Profile Status Card */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Your Dating Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={profile.photo_url || undefined} alt={profile.display_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {profile.display_name?.[0] || 'M'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-display text-foreground">{profile.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.age} years old{profile.location && ` • ${profile.location}`}
                </p>
              </div>

              <Badge variant="outline" className={statusConfig.className}>
                <StatusIcon className="h-3.5 w-3.5 mr-1" />
                {statusConfig.label}
              </Badge>

              <p className="text-sm text-muted-foreground">
                {statusConfig.description}
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link to="/dating/apply">
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revealed Matches Section */}
      {revealedMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-display font-light text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Connections
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
              {revealedMatches.length}
            </Badge>
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {revealedMatches.map((match) => (
              <BlurredMatchCard
                key={match.id}
                match={match}
                currentProfileId={profile.id}
                isWoman={isWoman}
                onSchedule={() => navigate(`/portal/match/${match.id}`)}
                onViewDetails={() => navigate(`/portal/match/${match.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Matches Section */}
      <div>
        <h2 className="text-xl font-display font-light text-foreground mb-6 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Active Matches
          {activeMatches.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeMatches.length}
            </Badge>
          )}
        </h2>

        {matchesLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : activeMatches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeMatches.map((match) => (
              <BlurredMatchCard
                key={match.id}
                match={match}
                currentProfileId={profile.id}
                isWoman={isWoman}
                onSchedule={() => navigate(`/portal/match/${match.id}`)}
                onViewDetails={() => navigate(`/portal/match/${match.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="py-16 text-center">
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Active Matches Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {profile.status === 'vetted'
                  ? "Our matchmakers are carefully reviewing profiles to find your ideal connections. We'll notify you when we find a match!"
                  : "Once your profile is approved, our matchmakers will begin finding compatible matches for you."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ended Matches Section */}
      {endedMatches.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-muted-foreground mb-6">
            Past Matches
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {endedMatches.map((match) => (
              <BlurredMatchCard
                key={match.id}
                match={match}
                currentProfileId={profile.id}
                isWoman={isWoman}
                onSchedule={() => {}}
                onViewDetails={() => navigate(`/portal/match/${match.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
