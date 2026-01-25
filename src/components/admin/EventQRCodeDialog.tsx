import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, QrCode, CheckCircle2, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EventQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    check_in_code?: string | null;
  };
}

interface RSVPWithProfile {
  id: string;
  user_id: string;
  status: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_urls: string[] | null;
  } | null;
  checked_in: boolean;
}

export function EventQRCodeDialog({ open, onOpenChange, event }: EventQRCodeDialogProps) {
  const queryClient = useQueryClient();
  const [checkInCode, setCheckInCode] = useState(event.check_in_code || '');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const checkInUrl = `${origin}/portal/checkin/${event.id}/${checkInCode}`;

  // Fetch RSVPs with check-in status
  const { data: rsvps = [], isLoading: rsvpsLoading } = useQuery({
    queryKey: ['event-rsvps-checkin', event.id],
    queryFn: async () => {
      // Get RSVPs
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select('id, user_id, status')
        .eq('event_id', event.id)
        .eq('status', 'confirmed');

      if (rsvpError) throw rsvpError;

      // Get check-ins
      const { data: checkinData } = await (supabase as any)
        .from('event_checkins')
        .select('user_id')
        .eq('event_id', event.id);

      const checkedInUserIds = new Set((checkinData || []).map((c: any) => c.user_id));

      // Get profiles
      const userIds = (rsvpData || []).map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_urls')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return (rsvpData || []).map(rsvp => ({
        ...rsvp,
        profile: profileMap.get(rsvp.user_id) || null,
        checked_in: checkedInUserIds.has(rsvp.user_id),
      })) as RSVPWithProfile[];
    },
    enabled: open,
  });

  // Generate check-in code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { error } = await supabase
        .from('events')
        .update({ check_in_code: newCode } as any)
        .eq('id', event.id);
      if (error) throw error;
      return newCode;
    },
    onSuccess: (newCode) => {
      setCheckInCode(newCode);
      toast.success('Check-in code generated');
    },
    onError: () => {
      toast.error('Failed to generate code');
    },
  });

  // Manual check-in mutation
  const manualCheckinMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await (supabase as any)
        .from('event_checkins')
        .insert({
          event_id: event.id,
          user_id: userId,
          check_in_method: 'manual_admin',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvps-checkin', event.id] });
      toast.success('Member checked in');
    },
    onError: () => {
      toast.error('Failed to check in member');
    },
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      toast.success('Check-in URL copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('event-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${event.title.replace(/\s+/g, '-')}-checkin-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const checkedInCount = rsvps.filter(r => r.checked_in).length;
  const totalRsvps = rsvps.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Event Check-In
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="qr" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="qr" className="flex-1">QR Code</TabsTrigger>
            <TabsTrigger value="attendees" className="flex-1">
              Attendees ({checkedInCount}/{totalRsvps})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4 mt-4">
            <div className="text-center">
              <h3 className="font-medium text-lg mb-2">{event.title}</h3>
              
              {checkInCode ? (
                <>
                  <div className="bg-white p-4 rounded-xl inline-block shadow-sm border">
                    <QRCodeSVG
                      id="event-qr-code"
                      value={checkInUrl}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={checkInUrl}
                        readOnly
                        className="text-xs"
                      />
                      <Button size="icon" variant="outline" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={downloadQR}>
                        <Download className="h-4 w-4 mr-2" />
                        Download QR
                      </Button>
                      <Button variant="outline" onClick={() => generateCodeMutation.mutate()}>
                        Regenerate Code
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 space-y-4">
                  <p className="text-muted-foreground">
                    Generate a check-in code to enable QR scanning at the event.
                  </p>
                  <Button
                    onClick={() => generateCodeMutation.mutate()}
                    disabled={generateCodeMutation.isPending}
                  >
                    {generateCodeMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Generate Check-In Code
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attendees" className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                {checkedInCount} of {totalRsvps} checked in
              </Label>
              <Badge variant={checkedInCount === totalRsvps ? 'default' : 'secondary'}>
                {Math.round((checkedInCount / totalRsvps) * 100) || 0}%
              </Badge>
            </div>

            <ScrollArea className="h-[300px]">
              {rsvpsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : rsvps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No RSVPs yet
                </p>
              ) : (
                <div className="space-y-2">
                  {rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        rsvp.checked_in ? 'bg-primary/5 border-primary/20' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={rsvp.profile?.avatar_urls?.[0]} />
                          <AvatarFallback>
                            {rsvp.profile?.first_name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {rsvp.profile?.first_name} {rsvp.profile?.last_name?.[0]}.
                          </p>
                        </div>
                      </div>

                      {rsvp.checked_in ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Checked In
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => manualCheckinMutation.mutate(rsvp.user_id)}
                          disabled={manualCheckinMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
