import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface NextEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
}

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] border border-white/20">
      <span className="text-2xl md:text-3xl font-bold text-white font-display tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
    </div>
    <span className="text-xs text-white/60 mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

export const EventCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { data: nextEvent, isError, error } = useQuery({
    queryKey: ['next-event-countdown'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time')
        .gte('date', today)
        .not('status', 'in', '("cancelled","past")')
        .order('date', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('[EventCountdown] Query error:', error);
        throw error;
      }
      return data as NextEvent;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
      // Parse event date and time
      const eventDate = new Date(nextEvent.date);
      if (nextEvent.time) {
        const [hours, minutes] = nextEvent.time.split(':').map(Number);
        eventDate.setHours(hours || 19, minutes || 0, 0, 0);
      } else {
        eventDate.setHours(19, 0, 0, 0); // Default to 7 PM
      }

      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  // Log errors for debugging but don't show error UI - just hide countdown
  if (isError) {
    console.error('[EventCountdown] Failed to load event:', error);
    return null;
  }

  if (!nextEvent) return null;

  const isEventSoon = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <p className="text-sm text-white/70 mb-3 font-medium">
        {isEventSoon ? '🔥 Happening Soon:' : 'Next Event:'}{' '}
        <span className="text-white">{nextEvent.title}</span>
      </p>
      <div className="flex gap-3 md:gap-4 justify-center">
        <CountdownUnit value={timeLeft.days} label="Days" />
        <div className="text-white/40 text-2xl font-light self-center pb-5">:</div>
        <CountdownUnit value={timeLeft.hours} label="Hours" />
        <div className="text-white/40 text-2xl font-light self-center pb-5">:</div>
        <CountdownUnit value={timeLeft.minutes} label="Mins" />
        <div className="text-white/40 text-2xl font-light self-center pb-5">:</div>
        <CountdownUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};
