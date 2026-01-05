import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Download } from 'lucide-react';
import { generateGoogleCalendarUrl, downloadICalFile } from '@/lib/calendar-utils';

interface AddToCalendarButtonProps {
  event: {
    id: string;
    title: string;
    date: string;
    time?: string | null;
    location?: string | null;
    description?: string | null;
    venue_name?: string | null;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AddToCalendarButton({ 
  event, 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: AddToCalendarButtonProps) {
  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadIcal = () => {
    downloadICalFile(event);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`gap-2 ${className}`}
          aria-label="Add to calendar"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Add to Calendar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        <DropdownMenuItem 
          onClick={handleGoogleCalendar}
          className="cursor-pointer"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDownloadIcal}
          className="cursor-pointer"
        >
          <Download className="h-4 w-4 mr-2" />
          Download .ics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
