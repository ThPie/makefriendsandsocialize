import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Headphones,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  id: string;
  user_id: string;
  booking_type: string;
  topic: string;
  notes: string | null;
  preferred_date: string;
  preferred_time: string;
  status: string;
  scheduled_at: string | null;
  admin_notes: string | null;
  created_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const TOPICS: Record<string, string> = {
  networking_advice: 'Networking Advice',
  membership_questions: 'Membership Questions',
  event_planning: 'Event Planning',
  introduction_help: 'Introduction Help',
  other: 'Other',
};

const BOOKING_TYPES: Record<string, string> = {
  call: 'Video Call',
  chat: 'Chat Support',
  in_person: 'In Person',
};

export default function AdminConcierge() {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-concierge-bookings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('concierge_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((data || []).map((b: any) => b.user_id))] as string[];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, first_name, last_name').in('id', userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      return (data || []).map((booking: any) => ({
        ...booking,
        profile: profileMap.get(booking.user_id),
      })) as Booking[];
    },
  });

  const updateBooking = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => {
      const updates: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updates.admin_notes = notes;
      }

      if (status === 'confirmed') {
        const booking = bookings.find((b) => b.id === id);
        if (booking) {
          updates.scheduled_at = `${booking.preferred_date}T${booking.preferred_time}:00`;
        }
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await (supabase as any)
        .from('concierge_bookings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-concierge-bookings'] });
      toast.success('Booking updated');
      setSelectedBooking(null);
      setAdminNotes('');
    },
    onError: () => toast.error('Failed to update booking'),
  });

  const filteredBookings = bookings.filter(
    (b) => statusFilter === 'all' || b.status === statusFilter
  );

  const stats = {
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    total: bookings.length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground mb-2">Concierge Bookings</h1>
        <p className="text-muted-foreground">Manage member concierge sessions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className={`cursor-pointer transition-all ${
            statusFilter === 'pending' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setStatusFilter('pending')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            statusFilter === 'confirmed' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setStatusFilter('confirmed')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            statusFilter === 'completed' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setStatusFilter('completed')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            statusFilter === 'all' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No bookings found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  const Icon = statusConfig.icon;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {booking.profile?.first_name || 'Unknown'}{' '}
                              {booking.profile?.last_name?.[0]}.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {BOOKING_TYPES[booking.booking_type] || booking.booking_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{TOPICS[booking.topic] || booking.topic}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.preferred_date), 'dd MMM yyyy')} at{' '}
                          {booking.preferred_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setAdminNotes(booking.admin_notes || '');
                          }}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Booking</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Member</p>
                <p className="font-medium">
                  {selectedBooking.profile?.first_name}{' '}
                  {selectedBooking.profile?.last_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p>{BOOKING_TYPES[selectedBooking.booking_type]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Topic</p>
                  <p>{TOPICS[selectedBooking.topic]}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Requested Time</p>
                <p>
                  {format(new Date(selectedBooking.preferred_date), 'EEEE, dd MMMM yyyy')}{' '}
                  at {selectedBooking.preferred_time}
                </p>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Member Notes</p>
                  <p className="p-2 bg-muted rounded-lg text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                />
              </div>

              <div className="flex gap-2">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() =>
                        updateBooking.mutate({
                          id: selectedBooking.id,
                          status: 'confirmed',
                          notes: adminNotes,
                        })
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateBooking.mutate({
                          id: selectedBooking.id,
                          status: 'cancelled',
                          notes: adminNotes,
                        })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <Button
                    className="flex-1"
                    onClick={() =>
                      updateBooking.mutate({
                        id: selectedBooking.id,
                        status: 'completed',
                        notes: adminNotes,
                      })
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}

                {adminNotes !== selectedBooking.admin_notes && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateBooking.mutate({
                        id: selectedBooking.id,
                        status: selectedBooking.status,
                        notes: adminNotes,
                      })
                    }
                  >
                    Save Notes
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
