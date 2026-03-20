import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ADMIN_BASE } from '@/lib/route-paths';
import { Search, User, Heart, Check, X, Eye, UserSearch, Users, Clock, RefreshCw, Sparkles, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  target_gender: string;
  location: string | null;
  occupation: string | null;
  bio: string | null;
  photo_url: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
}

const AdminDating = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ["dating-profiles", page],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const [listRes, countRes] = await Promise.all([
        supabase
          .from("dating_profiles")
          .select("id, user_id, display_name, age, gender, target_gender, location, occupation, bio, photo_url, status, is_active, created_at")
          .order("created_at", { ascending: false })
          .range(from, to),
        supabase
          .from("dating_profiles")
          .select("*", { count: 'exact', head: true }),
      ]);
      if (listRes.error) throw listRes.error;
      return { profiles: listRes.data as DatingProfile[], total: countRes.count || 0 };
    },
  });
  const profiles = profilesData?.profiles;

  // Get matching stats - latest match and total count
  const { data: matchingStats } = useQuery({
    queryKey: ["matching-stats"],
    queryFn: async () => {
      const [latestMatch, totalMatches] = await Promise.all([
        supabase
          .from("dating_matches")
          .select("created_at, compatibility_score")
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("dating_matches")
          .select("id", { count: "exact", head: true })
      ]);
      
      return {
        lastRunAt: latestMatch.data?.created_at || null,
        totalMatches: totalMatches.count || 0
      };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("dating_profiles")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dating-profiles"] });
      toast({ title: "Profile status updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const runMatchingMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('find-matches');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dating-profiles"] });
      toast({ 
        title: "Matching Complete",
        description: `Found ${data?.matchesCreated || 0} new matches from ${data?.profilesProcessed || 0} profiles.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Matching failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const preprocessMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('preprocess-dating-profile', {
        body: { batchAll: true }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dating-profiles"] });
      toast({ 
        title: "Preprocessing Complete",
        description: `Processed ${data?.processed || 0} of ${data?.total || 0} profiles.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Preprocessing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredProfiles = profiles?.filter((profile) => {
    const matchesSearch = profile.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || profile.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vetted":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Vetted</Badge>;
      case "matched":
        return <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/20">Matched</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">New</Badge>;
    }
  };

  const stats = {
    total: profiles?.length || 0,
    new: profiles?.filter((p) => p.status === "new" || p.status === "pending").length || 0,
    vetted: profiles?.filter((p) => p.status === "vetted" || p.status === "approved").length || 0,
    matched: profiles?.filter((p) => p.status === "matched").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Slow Dating</h1>
          <p className="text-muted-foreground">Manage dating profiles and curate matches</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => preprocessMutation.mutate()}
            disabled={preprocessMutation.isPending || stats.total === 0}
          >
            <Sparkles className={`h-4 w-4 mr-2 ${preprocessMutation.isPending ? 'animate-pulse' : ''}`} />
            {preprocessMutation.isPending ? 'Processing...' : 'Preprocess All'}
          </Button>
          <Button
            onClick={() => runMatchingMutation.mutate()}
            disabled={runMatchingMutation.isPending || stats.vetted === 0}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${runMatchingMutation.isPending ? 'animate-spin' : ''}`} />
            {runMatchingMutation.isPending ? 'Running...' : 'Re-run Matching'}
          </Button>
        </div>
      </div>

      {/* Matching Stats Banner */}
      {matchingStats && (
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Matching Run</p>
                  <p className="font-medium">
                    {matchingStats.lastRunAt 
                      ? formatDistanceToNow(new Date(matchingStats.lastRunAt), { addSuffix: true })
                      : 'Never run'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-pink-500">{matchingStats.totalMatches}</p>
                  <p className="text-xs text-muted-foreground">Total Matches Created</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profiles</p>
                <p className="text-3xl font-display font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--accent-gold))]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Applications</p>
                <p className="text-3xl font-display font-bold text-amber-500">{stats.new}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vetted</p>
                <p className="text-3xl font-display font-bold text-green-500">{stats.vetted}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matched</p>
                <p className="text-3xl font-display font-bold text-pink-500">{stats.matched}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-display">Dating Profiles</CardTitle>
          <CardDescription>Review applications and manage active profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "new", label: "New" },
                { value: "vetted", label: "Vetted" },
                { value: "matched", label: "Matched" },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading profiles...</div>
          ) : filteredProfiles?.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No profiles found</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProfiles?.map((profile) => (
                <Card 
                  key={profile.id}
                  className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  onClick={() => navigate(`${ADMIN_BASE}/dating/${profile.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Photo Header */}
                    <div className="relative h-40 bg-gradient-to-br from-dating-forest to-dating-charcoal overflow-hidden">
                      {profile.photo_url ? (
                        <img 
                          src={profile.photo_url} 
                          alt={profile.display_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-16 w-16 text-dating-cream/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg text-white">{profile.display_name}</h3>
                          {getStatusBadge(profile.status)}
                        </div>
                        <p className="text-white/80 text-sm">
                          {profile.age} • {profile.gender}
                        </p>
                      </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="p-4 space-y-3">
                      {profile.location && (
                        <p className="text-sm text-muted-foreground">{profile.location}</p>
                      )}
                      {profile.occupation && (
                        <p className="text-sm text-foreground">{profile.occupation}</p>
                      )}
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {(profile.status === "new" || profile.status === "pending") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({ id: profile.id, status: "vetted" });
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Vet
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({ id: profile.id, status: "rejected" });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(profile.status === "vetted" || profile.status === "approved") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${ADMIN_BASE}/dating/${profile.id}`);
                            }}
                          >
                            <UserSearch className="h-4 w-4 mr-1" />
                            Find Matches
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/dating/${profile.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDating;
