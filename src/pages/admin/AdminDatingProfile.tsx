import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ADMIN_BASE } from '@/lib/route-paths';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MatchCard } from "@/components/dating/MatchCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, User, Heart, Search, Check, X, Loader2, MapPin, Briefcase, Calendar,
  Shield, ExternalLink, AlertTriangle, CheckCircle2, HelpCircle, Linkedin, Instagram, Facebook, Twitter,
  Baby, Wine, Cigarette, Users
} from "lucide-react";

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
  photo_url: string | null;
  bio: string | null;
  conflict_resolution: string | null;
  emotional_connection: string | null;
  tuesday_night_test: string | null;
  dealbreakers: string | null;
  core_values: string | null;
  support_style: string | null;
  vulnerability_check: string | null;
  financial_philosophy: string | null;
  current_curiosity: string | null;
  politics_stance: string | null;
  religion_stance: string | null;
  future_goals: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  // Social URLs are now stored encrypted in dating_profile_sensitive_data table
  social_verification_status: string | null;
  social_verification_notes: string | null;
  relationship_type: string | null;
  marriage_timeline: string | null;
  has_children: boolean | null;
  children_details: string | null;
  wants_children: string | null;
  been_married: boolean | null;
  marriage_history: string | null;
  smoking_status: string | null;
  drinking_status: string | null;
  drug_use: string | null;
  exercise_frequency: string | null;
  diet_preference: string | null;
  love_language: string | null;
  attachment_style: string | null;
  introvert_extrovert: string | null;
  morning_night_person: string | null;
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
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Fetch sensitive data separately from encrypted table (admin-only access)
  const { data: sensitiveData } = useQuery({
    queryKey: ["dating-profile-sensitive", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dating_profile_sensitive_data', {
        _dating_profile_id: id
      });
      
      if (error) {
        console.error("Error fetching sensitive data:", { message: error.message });
        return null;
      }
      return data?.[0] as { phone_number: string | null; linkedin_url: string | null; instagram_url: string | null; facebook_url: string | null; twitter_url: string | null } | null;
    },
    enabled: !!id,
  });

  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ["dating-matches", id],
    queryFn: async () => {
      const { data: matchData, error } = await supabase
        .from("dating_matches")
        .select("*")
        .or(`user_a_id.eq.${id},user_b_id.eq.${id}`)
        .order("compatibility_score", { ascending: false });
      
      if (error) throw error;

      const matchedProfileIds = matchData.map((m) => 
        m.user_a_id === id ? m.user_b_id : m.user_a_id
      );

      if (matchedProfileIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("dating_profiles")
        .select("*")
        .in("id", matchedProfileIds);

      if (profilesError) throw profilesError;

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

  const handleVerifySocial = async () => {
    if (!id) return;
    
    setIsVerifying(true);
    
    try {
      const response = await supabase.functions.invoke("verify-social-profiles", {
        body: { profileId: id },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      toast({
        title: "Verification Complete",
        description: result.summary || "Profile has been verified.",
      });

      queryClient.invalidateQueries({ queryKey: ["dating-profile", id] });
    } catch (error: any) {
      console.error("Error verifying profile:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "There was an error verifying the profile.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vetted":
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Vetted</Badge>;
      case "matched":
        return <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/20">Matched</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
    }
  };

  const getVerificationBadge = (status: string | null) => {
    switch (status) {
      case "clean":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified Clean
          </Badge>
        );
      case "flagged":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Flagged
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
            <HelpCircle className="h-3 w-3" />
            Pending Verification
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-muted-foreground/20 gap-1">
            <HelpCircle className="h-3 w-3" />
            Unverified
          </Badge>
        );
    }
  };

  const isVetted = profile?.status === "vetted" || profile?.status === "approved";
  const hasSocialLinks = sensitiveData?.linkedin_url || sensitiveData?.instagram_url || sensitiveData?.facebook_url || sensitiveData?.twitter_url;

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
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dating")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-dating-terracotta/20">
            <AvatarImage src={profile.photo_url || ""} />
            <AvatarFallback className="bg-dating-terracotta/10 text-dating-terracotta text-2xl">
              {profile.display_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl text-foreground">{profile.display_name}</h1>
              {getStatusBadge(profile.status)}
              {getVerificationBadge(profile.social_verification_status)}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {profile.age} years old
              </span>
              <span>{profile.gender}</span>
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
              {profile.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profile.occupation}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {hasSocialLinks && (
              <Button
                variant="outline"
                onClick={handleVerifySocial}
                disabled={isVerifying}
                className="gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Run OSINT Scan
                  </>
                )}
              </Button>
            )}
            {(profile.status === "new" || profile.status === "pending") && (
              <>
                <Button
                  variant="outline"
                  className="text-green-500 hover:text-green-600"
                  onClick={() => updateStatusMutation.mutate("vetted")}
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
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-2">
            <Shield className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-2">
            <Heart className="h-4 w-4" />
            Matches ({matches?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Bio */}
          {profile.bio && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-display">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Relationship & Preferences */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Relationship Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Looking for</p>
                  <p className="font-medium">{profile.target_gender}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-medium">{profile.age_range_min} - {profile.age_range_max}</p>
                </div>
                {profile.relationship_type && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Relationship Type</p>
                    <p className="font-medium capitalize">{profile.relationship_type.replace(/_/g, " ")}</p>
                  </div>
                )}
                {profile.marriage_timeline && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Marriage Timeline</p>
                    <p className="font-medium capitalize">{profile.marriage_timeline.replace(/_/g, " ")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Family & Children */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Users className="h-5 w-5 text-dating-terracotta" />
                Family Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Previously Married</p>
                  <p className="font-medium">{profile.been_married ? "Yes" : "No"}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Has Children</p>
                  <p className="font-medium">{profile.has_children ? "Yes" : "No"}</p>
                </div>
                {profile.wants_children && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Wants Children</p>
                    <p className="font-medium capitalize">{profile.wants_children.replace(/_/g, " ")}</p>
                  </div>
                )}
                {profile.children_details && (
                  <div className="bg-muted/30 rounded-lg p-4 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Children Details</p>
                    <p className="font-medium">{profile.children_details}</p>
                  </div>
                )}
                {profile.marriage_history && (
                  <div className="bg-muted/30 rounded-lg p-4 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Marriage History</p>
                    <p className="font-medium">{profile.marriage_history}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Habits */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Wine className="h-5 w-5 text-dating-terracotta" />
                Lifestyle Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {profile.smoking_status && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Cigarette className="h-3 w-3" /> Smoking
                    </p>
                    <p className="font-medium capitalize">{profile.smoking_status.replace(/_/g, " ")}</p>
                  </div>
                )}
                {profile.drinking_status && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Wine className="h-3 w-3" /> Drinking
                    </p>
                    <p className="font-medium capitalize">{profile.drinking_status}</p>
                  </div>
                )}
                {profile.exercise_frequency && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Exercise</p>
                    <p className="font-medium capitalize">{profile.exercise_frequency.replace(/_/g, " ")}</p>
                  </div>
                )}
                {profile.diet_preference && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Diet</p>
                    <p className="font-medium capitalize">{profile.diet_preference}</p>
                  </div>
                )}
                {profile.drug_use && (
                  <div className="bg-muted/30 rounded-lg p-4 sm:col-span-2 lg:col-span-4">
                    <p className="text-sm text-muted-foreground">Drug Use Statement</p>
                    <p className="font-medium">{profile.drug_use}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personality & Connection Style */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Personality & Connection Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {profile.love_language && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Love Language</p>
                    <p className="font-medium capitalize">{profile.love_language.replace(/_/g, " ")}</p>
                  </div>
                )}
                {profile.attachment_style && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Attachment Style</p>
                    <p className="font-medium capitalize">{profile.attachment_style.replace(/_/g, " ")}</p>
                  </div>
                )}
                {profile.introvert_extrovert && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Social Energy</p>
                    <p className="font-medium capitalize">{profile.introvert_extrovert}</p>
                  </div>
                )}
                {profile.morning_night_person && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Daily Rhythm</p>
                    <p className="font-medium capitalize">{profile.morning_night_person.replace(/_/g, " ")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deep Questions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Deep Dive Answers</CardTitle>
              <CardDescription>Their responses to the matchmaking questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Tuesday Night Test", value: profile.tuesday_night_test, description: "Their ideal quiet evening" },
                { label: "Conflict Resolution", value: profile.conflict_resolution, description: "How they handle disagreements" },
                { label: "Emotional Connection", value: profile.emotional_connection, description: "What connection means to them" },
                { label: "Support Style", value: profile.support_style, description: "How they like to be supported" },
                { label: "Vulnerability Check", value: profile.vulnerability_check, description: "Their dating fears" },
                { label: "Core Values", value: profile.core_values, description: "What matters most" },
                { label: "Financial Philosophy", value: profile.financial_philosophy, description: "Their relationship with money" },
                { label: "Current Curiosity", value: profile.current_curiosity, description: "What they're learning" },
                { label: "Dealbreakers", value: profile.dealbreakers, description: "Non-negotiables" },
                { label: "Future Goals", value: profile.future_goals, description: "Long-term vision" },
              ].filter(item => item.value).map((item, index) => (
                <div key={index} className="bg-muted/20 rounded-xl p-5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-dating-terracotta">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{item.value}</p>
                </div>
              ))}

              {/* Stance Questions */}
              {(profile.politics_stance || profile.religion_stance) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.politics_stance && (
                    <div className="bg-muted/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Political Alignment</p>
                      <p className="font-medium capitalize">{profile.politics_stance.replace(/_/g, " ")}</p>
                    </div>
                  )}
                  {profile.religion_stance && (
                    <div className="bg-muted/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Religious/Spiritual Views</p>
                      <p className="font-medium capitalize">{profile.religion_stance.replace(/_/g, " ")}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          {/* Social Media Links */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Social Media Profiles</CardTitle>
                  <CardDescription>Links provided by the applicant</CardDescription>
                </div>
                {getVerificationBadge(profile.social_verification_status)}
              </div>
            </CardHeader>
            <CardContent>
              {hasSocialLinks ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {sensitiveData?.linkedin_url && (
                    <a
                      href={sensitiveData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-[#0077B5]" />
                      <span className="flex-1 truncate">{sensitiveData.linkedin_url}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {sensitiveData?.instagram_url && (
                    <a
                      href={sensitiveData.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-[#E4405F]" />
                      <span className="flex-1 truncate">{sensitiveData.instagram_url}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {sensitiveData?.facebook_url && (
                    <a
                      href={sensitiveData.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-[#1877F2]" />
                      <span className="flex-1 truncate">{sensitiveData.facebook_url}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {sensitiveData?.twitter_url && (
                    <a
                      href={sensitiveData.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="flex-1 truncate">{sensitiveData.twitter_url}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No social media profiles provided</p>
                </div>
              )}

              {hasSocialLinks && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <Button
                    onClick={handleVerifySocial}
                    disabled={isVerifying}
                    className="gap-2 bg-dating-terracotta hover:bg-dating-terracotta/90"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running OSINT Scan...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Run AI Verification Scan
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Uses AI to analyze social profiles for red flags and verify identity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Notes */}
          {profile.social_verification_notes && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-display">Verification Report</CardTitle>
                <CardDescription>AI-generated analysis of social profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap bg-muted/30 rounded-lg p-4 text-sm font-mono">
                    {profile.social_verification_notes}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Compatible Matches</CardTitle>
                  <CardDescription>AI-powered compatibility analysis (60%+ threshold)</CardDescription>
                </div>
                <Button
                  onClick={handleFindMatches}
                  disabled={isFindingMatches || !isVetted}
                  className="gap-2 bg-dating-terracotta hover:bg-dating-terracotta/90"
                >
                  {isFindingMatches ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Find Matches
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isVetted && (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Profile must be vetted before finding matches.</p>
                </div>
              )}
              
              {isVetted && matchesLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              {isVetted && !matchesLoading && matches?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
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
