import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Search, Heart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Attendee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_urls: string[] | null;
  job_title: string | null;
  industry: string | null;
}

interface EventAttendeePreviewProps {
  eventId: string;
  totalCount: number;
  maxAvatars?: number;
}

export function EventAttendeePreview({
  eventId,
  totalCount,
  maxAvatars = 5,
}: EventAttendeePreviewProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch preview attendees (first few for avatars)
  const { data: previewAttendees = [] } = useQuery({
    queryKey: ['event-attendees-preview', eventId],
    queryFn: async () => {
      const { data: rsvps, error } = await supabase
        .from('event_rsvps')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .limit(maxAvatars);

      if (error) throw error;
      const userIds = (rsvps || []).map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_urls')
        .in('id', userIds);

      return (profiles || []).map((p) => ({
        id: p.id,
        first_name: p.first_name,
        avatar_urls: p.avatar_urls,
      }));
    },
    enabled: !!user && totalCount > 0,
  });

  // Fetch full attendee list when modal opens
  const { data: allAttendees = [], isLoading: loadingAll } = useQuery({
    queryKey: ['event-attendees-full', eventId],
    queryFn: async () => {
      const { data: rsvps, error } = await supabase
        .from('event_rsvps')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (error) throw error;
      const userIds = (rsvps || []).map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_urls, job_title, industry')
        .in('id', userIds);

      return (profiles || []) as Attendee[];
    },
    enabled: isOpen && !!user,
  });

  // Fetch user's connections to show "You know X people"
  const { data: connections = [] } = useQuery({
    queryKey: ['user-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('connections')
        .select('requester_id, requested_id')
        .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return (data || []).map((c) =>
        c.requester_id === user.id ? c.requested_id : c.requester_id
      );
    },
    enabled: isOpen && !!user,
  });

  const filteredAttendees = allAttendees.filter(
    (a) =>
      !searchTerm ||
      a.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const knownAttendees = allAttendees.filter((a) => connections.includes(a.id));
  const remaining = totalCount - maxAvatars;

  if (totalCount === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Be the first to RSVP!</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
          <TooltipProvider>
            <div className="flex -space-x-2">
              {previewAttendees.slice(0, maxAvatars).map((attendee, idx) => (
                <Tooltip key={attendee.id || idx}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-7 w-7 border-2 border-background ring-0">
                      <AvatarImage src={attendee.avatar_urls?.[0]} />
                      <AvatarFallback className="text-xs bg-muted">
                        {attendee.first_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{attendee.first_name || 'Member'}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {remaining > 0 && (
                <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{remaining}
                  </span>
                </div>
              )}
            </div>
          </TooltipProvider>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {totalCount} going
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Who's Going</DialogTitle>
        </DialogHeader>

        {knownAttendees.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg mb-4">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm">
              You know{' '}
              <span className="font-medium text-primary">
                {knownAttendees.length} {knownAttendees.length === 1 ? 'person' : 'people'}
              </span>{' '}
              going
            </span>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          {loadingAll ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAttendees.map((attendee) => {
                const isKnown = connections.includes(attendee.id);
                return (
                  <div
                    key={attendee.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      isKnown ? 'bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={attendee.avatar_urls?.[0]} />
                      <AvatarFallback>{attendee.first_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {attendee.first_name} {attendee.last_name?.[0]}.
                        </p>
                        {isKnown && (
                          <Heart className="h-3 w-3 text-primary fill-primary" />
                        )}
                      </div>
                      {(attendee.job_title || attendee.industry) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {attendee.job_title}
                          {attendee.job_title && attendee.industry && ' · '}
                          {attendee.industry}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredAttendees.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No attendees found
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
