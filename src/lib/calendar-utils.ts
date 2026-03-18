import { parseLocalDate } from './date-utils';

/**
 * Generate Google Calendar event URL
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  date: string;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  venue_name?: string | null;
}): string {
  const startDate = parseLocalDate(event.date);
  
  // Parse time if available
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  } else {
    startDate.setHours(18, 0, 0, 0); // Default to 6 PM
  }
  
  // Event duration: 2 hours default
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ format)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  
  const location = event.venue_name || event.location || '';
  const description = event.description || 'Make Friends and Socialize Event';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: description,
    location: location,
    sf: 'true',
    output: 'xml',
  });
  
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate iCal file content
 */
export function generateICalContent(event: {
  title: string;
  date: string;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  venue_name?: string | null;
  id: string;
}): string {
  const startDate = new Date(event.date);
  
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  } else {
    startDate.setHours(18, 0, 0, 0);
  }
  
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  const formatICalDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, -1);
  };
  
  const location = event.venue_name || event.location || '';
  const description = (event.description || 'Make Friends and Socialize Event').replace(/\n/g, '\\n');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Make Friends and Socialize//Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatICalDate(startDate)}Z
DTEND:${formatICalDate(endDate)}Z
SUMMARY:${event.title}
DESCRIPTION:${description}
LOCATION:${location}
UID:${event.id}@makefriends.social
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

/**
 * Download iCal file
 */
export function downloadICalFile(event: Parameters<typeof generateICalContent>[0]): void {
  const content = generateICalContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
