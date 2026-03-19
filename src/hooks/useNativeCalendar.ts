import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { haptic } from '@/lib/haptics';
import { parseLocalDate } from '@/lib/date-utils';

interface CalendarEvent {
  title: string;
  date: string;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  venue_name?: string | null;
  city?: string | null;
}

/**
 * Generates a calendar file (.ics) and triggers download/share.
 * Works on both web and native without extra Capacitor plugins.
 */
export function useNativeCalendar() {
  const isNative = Capacitor.isNativePlatform();

  const addToCalendar = useCallback(async (event: CalendarEvent) => {
    try {
      const eventDate = parseLocalDate(event.date);
      
      // Parse time if available (e.g., "7:00 PM", "19:00")
      let startDate = new Date(eventDate);
      let endDate = new Date(eventDate);
      
      if (event.time) {
        const timeParts = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2]);
          const ampm = timeParts[3]?.toUpperCase();
          
          if (ampm === 'PM' && hours !== 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          startDate.setHours(hours, minutes, 0);
          endDate.setHours(hours + 2, minutes, 0); // Default 2-hour duration
        }
      } else {
        // All-day event
        startDate.setHours(0, 0, 0);
        endDate.setHours(23, 59, 59);
      }

      const location = [event.venue_name, event.location, event.city]
        .filter(Boolean)
        .join(', ');

      // Build .ics content
      const formatICSDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MFS//Events//EN',
        'BEGIN:VEVENT',
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${event.title}`,
        location ? `LOCATION:${location}` : '',
        event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n').substring(0, 500)}` : '',
        `UID:${Date.now()}@mfs.app`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].filter(Boolean).join('\r\n');

      if (isNative) {
        // On native, use the Share plugin to share the .ics file
        try {
          const { Share } = await import('@capacitor/share');
          
          // Create a data URL for the .ics file
          const blob = new Blob([icsContent], { type: 'text/calendar' });
          const reader = new FileReader();
          
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          await Share.share({
            title: `Add "${event.title}" to Calendar`,
            text: `${event.title} - ${event.date}${event.time ? ` at ${event.time}` : ''}`,
            url: dataUrl,
            dialogTitle: 'Add to Calendar',
          });

          haptic('success');
        } catch (shareError) {
          // Fallback: download the file
          downloadICS(icsContent, event.title);
        }
      } else {
        // Web fallback: download the .ics file
        downloadICS(icsContent, event.title);
      }

      toast.success('Calendar event created!');
    } catch (error) {
      console.error('Failed to add to calendar:', error);
      toast.error('Failed to add to calendar');
    }
  }, [isNative]);

  return { addToCalendar };
}

function downloadICS(content: string, title: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
