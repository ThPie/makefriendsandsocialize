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
  PlaneTakeoff,
  Ticket,
  Utensils,
  Shirt,
  CalendarDays,
  ChevronLeft,
  Info
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
        {/* Same Upgrade UI as before, omitted for brevity as it's fine */}
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
        <Button asChild size="lg" className="w-full">
          <Link to="/membership">
            Upgrade to Access
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="space-y-8 pb-32">
      {/* Header - Only hide if in form mode for immersion */}
      {!showForm && (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
              Concierge
            </h1>
          </div>
          {/* Notification bell could go here */}
        </div>
      )}

      {/* Main View */}
      {!showForm && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-[#1c261c] shadow-lg ring-1 ring-[#3c533c]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
            <img
              alt="Luxury hotel lobby"
              className="h-48 w-full object-cover opacity-80"
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"
            />
            <div className="relative z-20 p-5 flex flex-col h-48 justify-end">
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 px-2 py-0.5 w-fit border border-[#D4AF37]/30 backdrop-blur-sm">
                <Crown className="h-3 w-3 text-[#D4AF37]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Premium Member</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Dedicated to Your Lifestyle</h2>
              <p className="text-gray-300 text-sm leading-relaxed max-w-[90%]">Experience 1:1 support for global travel, exclusive dining, and VIP access tailored just for you.</p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div>
            <h3 className="mb-3 px-1 text-base font-semibold text-foreground flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[#D4AF37]"></span>
              Premium Benefits
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: PlaneTakeoff, title: "Bespoke Travel", sub: "Custom itineraries" },
                { icon: Ticket, title: "VIP Access", sub: "Events & galas" },
                { icon: Utensils, title: "Reservations", sub: "Michelin dining" },
                { icon: Shirt, title: "Styling", sub: "Personal shopping" }
              ].map((item, idx) => (
                <div key={idx} className="group flex flex-col items-start gap-3 rounded-xl border border-white/5 bg-[#1c261c] p-4 transition-all hover:border-primary/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action */}
          <Button
            className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 rounded-xl"
            onClick={() => setShowForm(true)}
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            Book Your Session
          </Button>

          {/* Upcoming Bookings List */}
          {upcomingBookings.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">Upcoming Bookings</h3>
              </div>
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
        </div>
      )}

      {/* Booking Form Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background-light dark:bg-[#111811] flex flex-col animate-in slide-in-from-bottom-5">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-[#111811]/95 backdrop-blur-md px-4 py-3 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-xs font-medium uppercase tracking-widest text-primary">New Request</span>
              </div>
              <div className="w-10"></div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 max-w-md mx-auto w-full pb-24">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">When shall we meet?</h1>
              <p className="text-muted-foreground text-sm">Select a date and time for your concierge session.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createBooking.mutate(data))} className="space-y-8">

                {/* Calendar */}
                <FormField
                  control={form.control}
                  name="preferred_date"
                  render={({ field }) => (
                    <FormItem>
                      <div className="bg-white dark:bg-[#1c261c] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                          className="rounded-md border-none w-full flex justify-center"
                          classNames={{
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Available Times */}
                <FormField
                  control={form.control}
                  name="preferred_time"
                  render={({ field }) => (
                    <FormItem>
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Available Times
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
                        {TIME_SLOTS.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => field.onChange(time)}
                            className={cn(
                              "snap-start shrink-0 flex items-center justify-center h-12 px-6 rounded-xl font-medium text-sm transition-all",
                              field.value === time
                                ? "bg-primary text-[#111811] font-semibold shadow-lg shadow-primary/20 scale-[1.02]"
                                : "bg-white dark:bg-[#1c261c] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-primary/50"
                            )}
                          >
                            {time}
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
                          <SelectTrigger className="bg-white dark:bg-[#1c261c] border-white/10 h-12">
                            <SelectValue placeholder="What would you like to discuss?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOPICS.map((topic) => (
                            <SelectItem key={topic.value} value={topic.value}>{topic.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Booking Type */}
                <FormField
                  control={form.control}
                  name="booking_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        {BOOKING_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => field.onChange(type.value)}
                            className={cn(
                              'p-3 rounded-lg border text-left transition-all text-xs',
                              field.value === type.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-white/10 bg-[#1c261c] text-muted-foreground hover:border-primary/50'
                            )}
                          >
                            <div className="font-semibold mb-1">{type.label}</div>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Summary Note */}
                {form.watch('preferred_date') && form.watch('preferred_time') && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Booking for <strong className="text-foreground">{format(form.watch('preferred_date'), 'EEE, MMM d')}</strong> at <strong className="text-foreground">{form.watch('preferred_time')}</strong>.</p>
                    </div>
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-background-light/80 dark:bg-[#111811]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 z-40">
                  <div className="max-w-md mx-auto">
                    <Button
                      type="submit"
                      className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 rounded-xl"
                      disabled={createBooking.isPending}
                    >
                      {createBooking.isPending ? 'Confirming...' : 'Submit Booking'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>

              </form>
            </Form>
          </main>
        </div>
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
    <Card className="border-white/[0.08] bg-[#1c261c] backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">{topic}</h4>
              <Badge className={statusConfig.color}>
                <Icon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              {bookingType} • {format(new Date(booking.preferred_date), 'MMM d, yyyy')} at {booking.preferred_time}
            </p>
          </div>
          {onCancel && booking.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={cancelling}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
