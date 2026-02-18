import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Headphones,
  Calendar as CalendarIcon,
  Crown,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const bookingSchema = z.object({
  booking_type: z.enum(['call', 'chat', 'in_person']),
  topic: z.string().min(1, 'Please select a topic'),
  preferred_date: z.date({ required_error: 'Please select a date' }),
  preferred_time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Booking {
  id: string;
  booking_type: string;
  topic: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
}

const TOPICS = [
  { value: 'networking_advice', label: 'Networking Advice' },
  { value: 'membership_questions', label: 'Membership Questions' },
  { value: 'event_planning', label: 'Event Planning Help' },
  { value: 'introduction_help', label: 'Introduction Assistance' },
  { value: 'other', label: 'Other' },
];

const BOOKING_TYPES = [
  { value: 'call', label: 'Video Call', description: '30-minute video session' },
  { value: 'chat', label: 'Chat Support', description: 'Async messaging support' },
  { value: 'in_person', label: 'In Person', description: 'Meet at a local venue' },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/25', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-primary/15 text-primary border-primary/25', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-white/10 text-white/50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/15 text-red-400 border-red-500/25', icon: XCircle },
};

export default function PortalConcierge() {
  const { user, membership } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const userTier = membership?.tier || 'patron';
  const canBook = userTier === 'fellow' || userTier === 'founder';

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      booking_type: 'call',
      topic: '',
      notes: '',
    },
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['concierge-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('concierge_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Booking[];
    },
    enabled: !!user && canBook,
  });

  const createBooking = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const { error } = await (supabase as any).from('concierge_bookings').insert({
        user_id: user!.id,
        booking_type: data.booking_type,
        topic: data.topic,
        preferred_date: format(data.preferred_date, 'yyyy-MM-dd'),
        preferred_time: data.preferred_time,
        notes: data.notes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concierge-bookings'] });
      toast.success('Booking request submitted! We\'ll confirm shortly.');
      form.reset();
      setShowForm(false);
    },
    onError: () => {
      toast.error('Failed to submit booking');
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await (supabase as any)
        .from('concierge_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concierge-bookings'] });
      toast.success('Booking cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel booking');
    },
  });

  if (!canBook) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            1:1 Concierge Support
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Get personalized guidance from our concierge team. Upgrade to Insider or Patron
            to unlock dedicated support for networking, introductions, and membership questions.
          </p>
        </div>

        <Card className="bg-card border-primary/20 mb-8">
          <CardContent className="p-8">
            <h3 className="font-display text-xl text-foreground mb-4">Concierge Benefits</h3>
            <ul className="text-left space-y-3 text-muted-foreground mb-6">
              <li className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-primary" />
                <span>30-minute video consultations</span>
              </li>
              <li className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-primary" />
                <span>Personalized networking advice</span>
              </li>
              <li className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-primary" />
                <span>Introduction assistance</span>
              </li>
              <li className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-primary" />
                <span>Event planning support</span>
              </li>
            </ul>
            <Button asChild size="lg" className="w-full">
              <Link to="/membership">
                Upgrade to Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            Concierge Services
          </h1>
          <p className="text-muted-foreground">
            Your personal guide to an exceptional membership
          </p>
        </div>
        {!showForm && upcomingBookings.length === 0 && (
          <Button onClick={() => setShowForm(true)}>
            <Headphones className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        )}
      </div>

      {/* Service Overview - Show when no form and no bookings */}
      {!showForm && bookings.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-white/[0.08] backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h2 className="font-display text-xl text-foreground">What is Concierge?</h2>
                <p className="text-muted-foreground">
                  Our Concierge service provides personalized, 1:1 support to help you make the most
                  of your MakeFriends membership. Whether you need networking advice, help with
                  introductions, or guidance on events, our team is here to assist.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Headphones className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">30-Min Video Calls</p>
                      <p className="text-xs text-muted-foreground">Face-to-face guidance sessions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Flexible Scheduling</p>
                      <p className="text-xs text-muted-foreground">Book at your convenience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Crown className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Included in Membership</p>
                      <p className="text-xs text-muted-foreground">No additional cost for Fellows & Founders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Confirmation in 24h</p>
                      <p className="text-xs text-muted-foreground">Quick response guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-64 flex flex-col justify-center">
                <Button onClick={() => setShowForm(true)} size="lg" className="w-full">
                  <Headphones className="h-4 w-4 mr-2" />
                  Book Your Session
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Average response time: 12 hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Form */}
      {showForm && (
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Book a Concierge Session</CardTitle>
            <CardDescription>
              Choose your preferred time and we'll confirm within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createBooking.mutate(data))} className="space-y-6">
                {/* Booking Type */}
                <FormField
                  control={form.control}
                  name="booking_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                      <div className="grid grid-cols-3 gap-4">
                        {BOOKING_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => field.onChange(type.value)}
                            className={cn(
                              'p-4 rounded-lg border-2 text-left transition-all',
                              field.value === type.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <p className="font-medium">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Topic */}
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="What would you like to discuss?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOPICS.map((topic) => (
                            <SelectItem key={topic.value} value={topic.value}>
                              {topic.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date and Time */}
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="preferred_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferred_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Anything specific you'd like to discuss?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={createBooking.isPending}>
                    {createBooking.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Upcoming Sessions</h2>
          <div className="grid gap-4">
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={() => cancelBooking.mutate(booking.id)}
                cancelling={cancelBooking.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Past Sessions</h2>
          <div className="grid gap-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && !showForm && !isLoading && (
        <Card className="p-12 text-center border-white/[0.08] bg-white/[0.04]">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-xl mb-2">No Sessions Yet</h3>
          <p className="text-muted-foreground mb-6">
            Book your first concierge session to get personalized support
          </p>
          <Button onClick={() => setShowForm(true)}>
            Book Your First Session
          </Button>
        </Card>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel?: () => void;
  cancelling?: boolean;
}

function BookingCard({ booking, onCancel, cancelling }: BookingCardProps) {
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const Icon = statusConfig.icon;
  const topic = TOPICS.find((t) => t.value === booking.topic)?.label || booking.topic;
  const bookingType = BOOKING_TYPES.find((t) => t.value === booking.booking_type)?.label || booking.booking_type;

  return (
    <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{topic}</h4>
              <Badge className={statusConfig.color}>
                <Icon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {bookingType} • {new Date(booking.preferred_date).toLocaleDateString()} at {booking.preferred_time}
            </p>
            {booking.notes && (
              <p className="text-sm text-muted-foreground mt-2">{booking.notes}</p>
            )}
          </div>
          {onCancel && booking.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={cancelling}
              className="text-destructive hover:text-destructive"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
