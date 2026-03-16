import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Search, Crown, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { ScanHistoryTimeline } from '@/components/admin/ScanHistoryTimeline';

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_urls: string[] | null;
  interests: string[] | null;
  is_visible: boolean | null;
  created_at: string;
  membership?: {
    tier: 'patron' | 'fellow' | 'founder';
    status: 'pending' | 'active' | 'cancelled' | 'expired';
    started_at: string | null;
  };
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const PAGE_SIZE = 25;

  useEffect(() => {
    fetchMembers();
  }, [page]);

  async function fetchMembers() {
    setIsLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const [profilesRes, membershipsRes, countRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, first_name, last_name, bio, avatar_urls, interests, is_visible, created_at')
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase
        .from('memberships')
        .select('user_id, tier, status, started_at'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
    ]);

    if (profilesRes.error) {
      toast.error('Failed to fetch members');
      setIsLoading(false);
      return;
    }

    setTotalCount(countRes.count || 0);

    const membersWithMembership = profilesRes.data?.map((profile) => ({
      ...profile,
      membership: membershipsRes.data?.find((m) => m.user_id === profile.id),
    })) || [];

    setMembers(membersWithMembership);
    setIsLoading(false);
  }

  async function updateMemberTier(memberId: string, newTier: 'patron' | 'fellow' | 'founder') {
    setIsUpdating(true);

    const { error } = await supabase
      .from('memberships')
      .update({ tier: newTier })
      .eq('user_id', memberId);

    if (error) {
      toast.error('Failed to update tier');
      setIsUpdating(false);
      return;
    }

    toast.success(`Tier updated to ${newTier}`);
    setIsUpdating(false);
    fetchMembers();
    setSelectedMember(null);
  }

  const filteredMembers = members.filter((member) => {
    const name = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const activeMembers = filteredMembers.filter(
    (m) => m.membership?.status === 'active'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Members
        </h1>
        <p className="text-muted-foreground">
          View and manage all registered members
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {activeMembers.length} active members
        </Badge>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const initials = member.first_name && member.last_name
            ? `${member.first_name[0]}${member.last_name[0]}`
            : 'M';

          return (
            <Card
              key={member.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedMember(member)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_urls?.[0]} />
                    <AvatarFallback className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {member.first_name && member.last_name
                        ? `${member.first_name} ${member.last_name}`
                        : 'Unnamed Member'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {member.membership?.tier && (
                        <Badge
                          variant={
                            member.membership.tier === 'founder'
                              ? 'default'
                              : member.membership.tier === 'fellow'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {member.membership.tier === 'founder' && (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {getTierDisplayName(member.membership.tier)}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          member.membership?.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {member.membership?.status || 'pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Joined {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AdminPagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No members found
        </div>
      )}

      {/* Member Detail Modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Member Details
            </DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Security History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="flex-1 overflow-auto mt-4">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedMember.avatar_urls?.[0]} />
                      <AvatarFallback className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] text-xl">
                        {selectedMember.first_name?.[0] || 'M'}
                        {selectedMember.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl font-display text-foreground">
                        {selectedMember.first_name || ''} {selectedMember.last_name || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Member since {format(new Date(selectedMember.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Status</p>
                      <Badge
                        variant={
                          selectedMember.membership?.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {selectedMember.membership?.status || 'pending'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profile Visibility</p>
                      <Badge variant="outline">
                        {selectedMember.is_visible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                  </div>

                  {selectedMember.bio && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Bio</p>
                      <p className="text-foreground">{selectedMember.bio}</p>
                    </div>
                  )}

                  {selectedMember.interests && selectedMember.interests.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.interests.map((interest) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Change Membership Tier
                    </p>
                    <div className="flex gap-3">
                      <Select
                        value={selectedMember.membership?.tier || 'patron'}
                        onValueChange={(value) =>
                          updateMemberTier(
                            selectedMember.id,
                            value as 'patron' | 'fellow' | 'founder'
                          )
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patron">Patron</SelectItem>
                          <SelectItem value="fellow">Fellow</SelectItem>
                          <SelectItem value="founder">Founder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="flex-1 overflow-auto mt-4">
                <ScanHistoryTimeline userId={selectedMember.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
