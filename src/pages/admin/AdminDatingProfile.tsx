import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MatchCard } from "@/components/dating/MatchCard";
import { ArrowLeft, User, Heart, Sparkles, Check, X, Loader2 } from "lucide-react";

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  target_gender: string;
  age_range_min: number;
  age_range_max: number;
  location: string | null;
  occupation: string | null;
  conflict_resolution: string | null;
  emotional_connection: string | null;
  tuesday_night_test: string | null;
  dealbreakers: string | null;
  core_values: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
}

interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  compatibility_score: number;
  match_reason: string;
  status: string;
  created_at: string;
  matched_profile?: DatingProfile;
}

const AdminDatingProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFindingMatches, setIsFindingMatches] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["dating-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dating_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as DatingProfile | null;
    },
    enabled: !!id,
  });

  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ["dating-matches", id],
    queryFn: async () => {
      // Get matches where this profile is user_a or user_b
      const { data: matchData, error } = await supabase
        .from("dating_matches")
        .select("*")
        .or(`user_a_id.eq.${id},user_b_id.eq.${id}`)
        .order("compatibility_score", { ascending: false });
      
      if (error) throw error;

      // Get the matched profiles
      const matchedProfileIds = matchData.map((m) => 
        m.user_a_id === id ? m.user_b_id : m.user_a_id
      );

      if (matchedProfileIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("dating_profiles")
        .select("*")
        .in("id", matchedProfileIds);

      if (profilesError) throw profilesError;

      // Combine matches with profile data
      return matchData.map((match) => {
        const matchedProfileId = match.user_a_id === id ? match.user_b_id : match.user_a_id;
        return {
          ...match,
          matched_profile: profiles.find((p) => p.id === matchedProfileId),
        };
      }) as Match[];
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("dating_profiles")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dating-profile", id] });
      toast({ title: "Profile status updated" });
    },
  });

  const handleFindMatches = async () => {
    if (!id) return;
    
    setIsFindingMatches(true);
    
    try {
      const response = await supabase.functions.invoke("find-matches", {
        body: { profileId: id },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      toast({
        title: "Matches Found!",
        description: `Found ${result.matches?.length || 0} compatible matches.`,
      });

      refetchMatches();
    } catch (error: any) {
      console.error("Error finding matches:", error);
      toast({
        title: "Match Finding Failed",
        description: error.message || "There was an error finding matches.",
        variant: "destructive",
      });
    } finally {
      setIsFindingMatches(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
        <Button variant="outline" onClick={() => navigate("/admin/dating")} className="mt-4">
          Back to Profiles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dating")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-foreground">{profile.display_name}</h1>
          <p className="text-muted-foreground">
            {profile.age} • {profile.gender} • {profile.location || "Location not specified"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(profile.status)}
          {profile.status === "pending" && (
            <>
              <Button
                variant="outline"
                className="text-green-500 hover:text-green-600"
                onClick={() => updateStatusMutation.mutate("approved")}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-600"
                onClick={() => updateStatusMutation.mutate("rejected")}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-2">
            <Heart className="h-4 w-4" />
            Matches ({matches?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Looking for</p>
                  <p className="font-medium">{profile.target_gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-medium">{profile.age_range_min} - {profile.age_range_max}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupation</p>
                  <p className="font-medium">{profile.occupation || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deep Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Deep Dive Answers</CardTitle>
              <CardDescription>Their responses to the matchmaking questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.conflict_resolution && (
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Conflict Resolution</p>
                  <p className="text-muted-foreground">{profile.conflict_resolution}</p>
                </div>
              )}
              {profile.emotional_connection && (
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Emotional Connection</p>
                  <p className="text-muted-foreground">{profile.emotional_connection}</p>
                </div>
              )}
              {profile.tuesday_night_test && (
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Tuesday Night Test</p>
                  <p className="text-muted-foreground">{profile.tuesday_night_test}</p>
                </div>
              )}
              {profile.dealbreakers && (
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Dealbreakers</p>
                  <p className="text-muted-foreground">{profile.dealbreakers}</p>
                </div>
              )}
              {profile.core_values && (
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Core Values</p>
                  <p className="text-muted-foreground">{profile.core_values}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compatible Matches</CardTitle>
                  <CardDescription>AI-powered compatibility analysis (60%+ threshold)</CardDescription>
                </div>
                <Button
                  onClick={handleFindMatches}
                  disabled={isFindingMatches || profile.status !== "approved"}
                  className="gap-2"
                >
                  {isFindingMatches ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Find Matches
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.status !== "approved" && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Profile must be approved before finding matches.</p>
                </div>
              )}
              
              {profile.status === "approved" && matchesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              {profile.status === "approved" && !matchesLoading && matches?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No matches found yet.</p>
                  <p className="text-sm">Click "Find Matches" to run the AI matching engine.</p>
                </div>
              )}

              {matches && matches.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDatingProfile;
