import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import { format } from 'date-fns';

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
  profile_a?: DatingProfile;
  profile_b?: DatingProfile;
}

export default function AdminMatches() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showMarkMetDialog, setShowMarkMetDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
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

  const filterMatches = (status: string) => {
    switch (status) {
      case 'all':
        return matches;
      case 'scheduled':
        return matches.filter((m) => m.meeting_status === 'scheduled');
      case 'met':
        return matches.filter((m) => m.meeting_status === 'met');
      case 'mutual_yes':
        return matches.filter((m) => m.status === 'mutual_yes');
      case 'declined':
        return matches.filter((m) => m.status === 'declined');
      default:
        return matches;
    }
  };

  const scheduledCount = matches.filter((m) => m.meeting_status === 'scheduled').length;
  const metCount = matches.filter((m) => m.meeting_status === 'met').length;
  const mutualCount = matches.filter((m) => m.status === 'mutual_yes').length;
  const declinedCount = matches.filter((m) => m.status === 'declined').length;

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
      <div>
        <h1 className="text-3xl font-display text-foreground">Match Management</h1>
        <p className="text-muted-foreground mt-2">Manage matches and mark meetings as completed</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Decision</p>
                <p className="text-2xl font-bold text-foreground">{metCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mutual Matches</p>
                <p className="text-2xl font-bold text-foreground">{mutualCount}</p>
              </div>
              <Handshake className="h-8 w-8 text-dating-terracotta" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Declined</p>
                <p className="text-2xl font-bold text-foreground">{declinedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({matches.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledCount})</TabsTrigger>
              <TabsTrigger value="met">Awaiting Decision ({metCount})</TabsTrigger>
              <TabsTrigger value="mutual_yes">Mutual Yes ({mutualCount})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({declinedCount})</TabsTrigger>
            </TabsList>

            {['all', 'scheduled', 'met', 'mutual_yes', 'declined'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filterMatches(tab).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No matches in this category</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Meeting</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Responses</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterMatches(tab).map((match) => (
                        <TableRow key={match.id}>
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
                                Mark as Met
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
