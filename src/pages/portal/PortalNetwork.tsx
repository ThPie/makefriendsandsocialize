import { useState } from 'react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { PremiumPaywall } from '@/components/portal/PremiumPaywall';
import { useAuth } from '@/contexts/AuthContext';
import { getTierDisplayName } from '@/lib/tier-utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Heart, Crown, ArrowRight, Filter, Users, Loader2 } from 'lucide-react';

interface MemberProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  signature_style: string | null;
  avatar_urls: string[];
  interests: string[];
  industry: string | null;
  job_title: string | null;
}

export default function PortalNetwork() {
  const { user, canAccessMatchmaking, membership } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['network-members', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, signature_style, avatar_urls, interests, industry, job_title')
        .eq('is_visible', true)
        .neq('id', user!.id);

      if (error) throw error;
      return (data as MemberProfile[]) || [];
    },
    enabled: !!user && canAccessMatchmaking,
  });

  const requestMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user!.id,
          requested_id: memberId,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already requested an introduction');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Introduction requested successfully');
      queryClient.invalidateQueries({ queryKey: ['connections-sent'] });
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to request introduction'),
  });

  // Get unique interests and industries from all members
  const allInterests = [...new Set(members.flatMap(m => m.interests || []))];
  const allIndustries = [...new Set(members.map(m => m.industry).filter(Boolean))] as string[];

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchTerm ||
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.signature_style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.job_title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInterest = !selectedInterest ||
      member.interests?.includes(selectedInterest);

    const matchesIndustry = !selectedIndustry ||
      member.industry === selectedIndustry;

    return matchesSearch && matchesInterest && matchesIndustry;
  });

  if (!canAccessMatchmaking) {
    return (
      <PremiumPaywall
        title="The Network"
        description="Browse member profiles and request curated introductions to build meaningful connections."
        features={[
          'Browse verified member profiles',
          'Request curated introductions',
          'Priority event access',
          'Exclusive slow dating events',
        ]}
        currentTier={membership?.tier}
        icon="network"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[3/4] w-full" />
              <CardContent className="p-5">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">
          The Network
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover like-minded members and request introductions
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, industry, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Industry Filter */}
        {allIndustries.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Filter by Industry</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedIndustry === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndustry(null)}
              >
                All Industries
              </Button>
              {allIndustries.map((industry) => (
                <Button
                  key={industry}
                  variant={selectedIndustry === industry ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedIndustry(industry)}
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Interest Filter */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Filter by Interest</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedInterest === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInterest(null)}
            >
              <Filter className="h-4 w-4 mr-2" />
              All
            </Button>
            {allInterests.slice(0, 6).map((interest) => (
              <Button
                key={interest}
                variant={selectedInterest === interest ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedInterest(interest)}
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-display text-xl mb-2 text-foreground">No Members Found</h3>
          <p className="text-muted-foreground mb-4">
            No members found matching your criteria. Try adjusting your filters to discover more members.
          </p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedInterest(null); setSelectedIndustry(null); }}>
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="group overflow-hidden hover-lift">
              {/* Photo */}
              <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                {member.avatar_urls?.[0] ? (
                  <img
                    src={member.avatar_urls[0]}
                    alt={member.first_name || 'Member'}
                    width={300}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-3xl">
                        {member.first_name?.[0] || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <h3 className="font-display text-xl text-foreground mb-1">
                  {member.first_name || 'Anonymous'}
                </h3>

                {(member.job_title || member.industry) && (
                  <p className="text-sm text-primary font-medium mb-2">
                    {member.job_title}{member.job_title && member.industry ? ' · ' : ''}{member.industry}
                  </p>
                )}

                {member.signature_style && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    "{member.signature_style}"
                  </p>
                )}

                {member.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {member.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => requestMutation.mutate(member.id)}
                  disabled={requestMutation.isPending}
                >
                  {requestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Request Introduction
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
