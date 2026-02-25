import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Heart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Handshake,
  ArrowRight,
  Search,
  TrendingUp,
  AlertCircle,
  CalendarClock,
  Send,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface DatingProfile {
  id: string;
  display_name: string;
  photo_url: string | null;
  age: number;
  gender: string;
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
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profile_a?: DatingProfile;
  profile_b?: DatingProfile;
}

export default function AdminMatches() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showMarkMetDialog, setShowMarkMetDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['admin-all-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dating_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch all profiles for the matches
      const profileIds = new Set<string>();
      data?.forEach((match) => {
        profileIds.add(match.user_a_id);
        profileIds.add(match.user_b_id);
      });

      const { data: profiles } = await supabase
        .from('dating_profiles')
        .select('id, display_name, photo_url, age, gender')
        .in('id', Array.from(profileIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      return data?.map((match) => ({
        ...match,
        profile_a: profileMap.get(match.user_a_id),
        profile_b: profileMap.get(match.user_b_id),
      })) as Match[];
    },
  });

  const markAsMetMutation = useMutation({
    mutationFn: async ({ matchId, notes }: { matchId: string; notes: string }) => {
      const { error } = await supabase
        .from('dating_matches')
        .update({
          meeting_status: 'met',
          admin_notes: notes || null,
        })
        .eq('id', matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Match marked as met - decision emails will be sent');
      queryClient.invalidateQueries({ queryKey: ['admin-all-matches'] });
      setShowMarkMetDialog(false);
      setSelectedMatch(null);
      setAdminNotes('');
    },
    onError: (error) => {
      console.error('Error marking match as met:', error);
      toast.error('Failed to update match status');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case 'mutual_yes':
        return <Badge className="bg-dating-forest text-white">Mutual Yes 💚</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Declined</Badge>;
      case 'met':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Met</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMeetingStatusBadge = (meetingStatus: string) => {
    switch (meetingStatus) {
      case 'pending_woman':
        return <Badge variant="outline" className="text-xs">Awaiting Woman</Badge>;
      case 'pending_man':
        return <Badge variant="outline" className="text-xs">Awaiting Man</Badge>;
      case 'scheduling':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">Scheduling</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Scheduled</Badge>;
      case 'met':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Met</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{meetingStatus}</Badge>;
    }
  };

  const getTimeLabel = (timeValue: string) => {
    const labels: Record<string, string> = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
    };
    return labels[timeValue] || timeValue;
  };

  // Filter matches based on search query
  const filteredMatches = matches.filter((match) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      match.profile_a?.display_name?.toLowerCase().includes(search) ||
      match.profile_b?.display_name?.toLowerCase().includes(search)
    );
  });

  const filterMatchesByStatus = (status: string) => {
    switch (status) {
      case 'all':
        return filteredMatches;
      case 'new':
        return filteredMatches.filter((m) => m.meeting_status === 'pending_woman' || m.meeting_status === 'pending_man');
      case 'scheduling':
        return filteredMatches.filter((m) => m.meeting_status === 'scheduling');
      case 'scheduled':
        return filteredMatches.filter((m) => m.meeting_status === 'scheduled');
      case 'met':
        return filteredMatches.filter((m) => m.meeting_status === 'met' && m.status === 'pending');
      case 'mutual_yes':
        return filteredMatches.filter((m) => m.status === 'mutual_yes');
      case 'declined':
        return filteredMatches.filter((m) => m.status === 'declined');
      default:
        return filteredMatches;
    }
  };

  // Stats calculations
  const newMatchCount = matches.filter((m) => m.meeting_status === 'pending_woman' || m.meeting_status === 'pending_man').length;
  const schedulingCount = matches.filter((m) => m.meeting_status === 'scheduling').length;
  const scheduledCount = matches.filter((m) => m.meeting_status === 'scheduled').length;
  const awaitingDecisionCount = matches.filter((m) => m.meeting_status === 'met' && m.status === 'pending').length;
  const mutualCount = matches.filter((m) => m.status === 'mutual_yes').length;
  const declinedCount = matches.filter((m) => m.status === 'declined').length;
  
  // Calculate stuck matches (pending decisions for 7+ days)
  const stuckMatches = matches.filter((m) => {
    if (m.meeting_status !== 'met' || m.status !== 'pending') return false;
    const daysSinceMet = differenceInDays(new Date(), new Date(m.updated_at));
    return daysSinceMet >= 7;
  });

  // Calculate this week's matches
  const thisWeekMatches = matches.filter((m) => {
    const daysSinceCreated = differenceInDays(new Date(), new Date(m.created_at));
    return daysSinceCreated <= 7;
  });

  // Calculate success rate
  const totalDecided = mutualCount + declinedCount;
  const successRate = totalDecided > 0 ? Math.round((mutualCount / totalDecided) * 100) : 0;

  const handleMarkAsMet = (match: Match) => {
    setSelectedMatch(match);
    setAdminNotes(match.admin_notes || '');
    setShowMarkMetDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <h1 className="text-3xl font-display text-foreground">Match Management</h1>
        <p className="text-muted-foreground mt-2">Track and manage all dating matches through the pipeline</p>
      </div>

      {/* Pipeline Visualization */}
      <Card className="bg-gradient-to-r from-dating-forest/5 to-dating-terracotta/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-dating-terracotta" />
            Match Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto py-4 gap-2">
            {[
              { label: 'New', count: newMatchCount, color: 'bg-amber-500' },
              { label: 'Scheduling', count: schedulingCount, color: 'bg-purple-500' },
              { label: 'Scheduled', count: scheduledCount, color: 'bg-green-500' },
              { label: 'Met', count: awaitingDecisionCount, color: 'bg-blue-500' },
              { label: 'Mutual ✓', count: mutualCount, color: 'bg-dating-forest' },
            ].map((stage, index) => (
              <div key={stage.label} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`${stage.color} text-white rounded-full w-10 h-10 flex items-center justify-center font-bold`}>
                    {stage.count}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{stage.label}</span>
                </div>
                {index < 4 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-foreground">{thisWeekMatches.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-dating-terracotta" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
              </div>
              <CalendarClock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Decision</p>
                <p className="text-2xl font-bold text-foreground">{awaitingDecisionCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-dating-forest">{successRate}%</p>
              </div>
              <Handshake className="h-8 w-8 text-dating-forest" />
            </div>
          </CardContent>
        </Card>
        <Card className={stuckMatches.length > 0 ? 'border-amber-500/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stuck (7+ days)</p>
                <p className={`text-2xl font-bold ${stuckMatches.length > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                  {stuckMatches.length}
                </p>
              </div>
              <AlertCircle className={`h-8 w-8 ${stuckMatches.length > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Matches</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="all">All ({filteredMatches.length})</TabsTrigger>
              <TabsTrigger value="new">New ({newMatchCount})</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling ({schedulingCount})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledCount})</TabsTrigger>
              <TabsTrigger value="met">Awaiting ({awaitingDecisionCount})</TabsTrigger>
              <TabsTrigger value="mutual_yes">Mutual Yes ({mutualCount})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({declinedCount})</TabsTrigger>
            </TabsList>

            {['all', 'new', 'scheduling', 'scheduled', 'met', 'mutual_yes', 'declined'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filterMatchesByStatus(tab).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No matches in this category</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Match</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Meeting</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead>Responses</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterMatchesByStatus(tab).map((match) => {
                          const daysSinceCreated = differenceInDays(new Date(), new Date(match.created_at));
                          const isStuck = match.meeting_status === 'met' && match.status === 'pending' && differenceInDays(new Date(), new Date(match.updated_at)) >= 7;
                          
                          return (
                            <TableRow key={match.id} className={isStuck ? 'bg-amber-500/5' : ''}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{match.profile_a?.display_name || 'Unknown'}</span>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{match.profile_b?.display_name || 'Unknown'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-dating-terracotta/10 text-dating-terracotta border-dating-terracotta/20">
                                  {match.compatibility_score}%
                                </Badge>
                              </TableCell>
                              <TableCell>{getStatusBadge(match.status || 'pending')}</TableCell>
                              <TableCell>{getMeetingStatusBadge(match.meeting_status || 'pending_woman')}</TableCell>
                              <TableCell>
                                {match.meeting_date ? (
                                  <div className="text-sm">
                                    <p>{format(new Date(match.meeting_date), 'MMM d, yyyy')}</p>
                                    {match.meeting_time && (
                                      <p className="text-muted-foreground">{getTimeLabel(match.meeting_time)}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Not set</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className={isStuck ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
                                  {daysSinceCreated}d
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className={match.user_a_response === 'accepted' ? 'text-green-600' : match.user_a_response === 'declined' ? 'text-red-600' : 'text-muted-foreground'}>
                                    {match.profile_a?.display_name?.split(' ')[0]}: {match.user_a_response || 'pending'}
                                  </span>
                                  <span className="text-muted-foreground">|</span>
                                  <span className={match.user_b_response === 'accepted' ? 'text-green-600' : match.user_b_response === 'declined' ? 'text-red-600' : 'text-muted-foreground'}>
                                    {match.profile_b?.display_name?.split(' ')[0]}: {match.user_b_response || 'pending'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {match.meeting_status === 'scheduled' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkAsMet(match)}
                                    className="bg-dating-forest hover:bg-dating-forest/90"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Met
                                  </Button>
                                )}
                                {isStuck && (
                                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    Needs follow-up
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Mark as Met Dialog */}
      <Dialog open={showMarkMetDialog} onOpenChange={setShowMarkMetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Meeting Completed</DialogTitle>
            <DialogDescription>
              Mark this meeting as completed. Both users will receive an email to share their decision.
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedMatch.profile_a?.display_name}</span>
                  <Heart className="h-4 w-4 text-dating-terracotta" />
                  <span className="font-medium">{selectedMatch.profile_b?.display_name}</span>
                </div>
                {selectedMatch.meeting_date && (
                  <p className="text-sm text-muted-foreground text-center">
                    Meeting scheduled for {format(new Date(selectedMatch.meeting_date), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (optional)</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Any notes about this meeting..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkMetDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedMatch) {
                  markAsMetMutation.mutate({ matchId: selectedMatch.id, notes: adminNotes });
                }
              }}
              disabled={markAsMetMutation.isPending}
              className="bg-dating-forest hover:bg-dating-forest/90"
            >
              {markAsMetMutation.isPending ? 'Updating...' : 'Confirm Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
