import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AdminDateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onRangeChange: (from: Date | undefined, to: Date | undefined) => void;
  className?: string;
}

export function AdminDateRangePicker({ from, to, onRangeChange, className }: AdminDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: 'All', days: 0 },
  ];

  const handlePreset = (days: number) => {
    if (days === 0) {
      onRangeChange(undefined, undefined);
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      onRangeChange(start, end);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex rounded-lg border border-border overflow-hidden">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset.days)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              !from && !to && preset.days === 0
                ? 'bg-primary text-primary-foreground'
                : from && preset.days > 0 &&
                  Math.abs((new Date().getTime() - from.getTime()) / (1000 * 60 * 60 * 24) - preset.days) < 1
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'justify-start text-left font-normal h-8',
              !from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {from ? (
              to ? (
                `${format(from, 'MMM d')} – ${format(to, 'MMM d')}`
              ) : (
                format(from, 'MMM d, yyyy')
              )
            ) : (
              <span>Custom range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from, to }}
            onSelect={(range) => {
              onRangeChange(range?.from, range?.to);
              if (range?.from && range?.to) setIsOpen(false);
            }}
            numberOfMonths={2}
            className={cn('p-3 pointer-events-auto')}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
