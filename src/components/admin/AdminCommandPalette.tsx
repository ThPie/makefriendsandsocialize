import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_BASE } from '@/lib/route-paths';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  Shield,
  ShieldAlert,
  Calendar,
  Image,
  Settings,
  UserCog,
  Quote,
  HeartHandshake,
  TrendingUp,
  Target,
  Gift,
  Scale,
  ClipboardList,
  Microscope,
  Headphones,
  Search,
} from 'lucide-react';

const commandItems = [
  { title: 'Overview', url: ADMIN_BASE, icon: LayoutDashboard, group: 'Navigate' },
  { title: 'Applications', url: `${ADMIN_BASE}/applications`, icon: FileText, group: 'Navigate' },
  { title: 'Circle Applications', url: `${ADMIN_BASE}/circles`, icon: Users, group: 'Navigate' },
  { title: 'Members', url: `${ADMIN_BASE}/members`, icon: Users, group: 'Navigate' },
  { title: 'Appeals', url: `${ADMIN_BASE}/appeals`, icon: Scale, group: 'Navigate' },
  { title: 'Referrals', url: `${ADMIN_BASE}/referrals`, icon: Gift, group: 'Navigate' },
  { title: 'Founder Companies', url: `${ADMIN_BASE}/businesses`, icon: Users, group: 'Navigate' },
  { title: 'Lead Generation', url: `${ADMIN_BASE}/leads`, icon: Target, group: 'Navigate' },
  { title: 'Security Reports', url: `${ADMIN_BASE}/security`, icon: ShieldAlert, group: 'Navigate' },
  { title: 'Security Dashboard', url: `${ADMIN_BASE}/security-dashboard`, icon: Shield, group: 'Navigate' },
  { title: 'Slow Dating', url: `${ADMIN_BASE}/dating`, icon: HeartHandshake, group: 'Navigate' },
  { title: 'Review Queue', url: `${ADMIN_BASE}/dating/review`, icon: ClipboardList, group: 'Navigate' },
  { title: 'Matches', url: `${ADMIN_BASE}/matches`, icon: Heart, group: 'Navigate' },
  { title: 'Analytics', url: `${ADMIN_BASE}/analytics`, icon: TrendingUp, group: 'Navigate' },
  { title: 'Events', url: `${ADMIN_BASE}/events`, icon: Calendar, group: 'Navigate' },
  { title: 'Event Analytics', url: `${ADMIN_BASE}/event-analytics`, icon: TrendingUp, group: 'Navigate' },
  { title: 'Event Photos', url: `${ADMIN_BASE}/photos`, icon: Image, group: 'Navigate' },
  { title: 'Connections', url: `${ADMIN_BASE}/connections`, icon: UserCog, group: 'Navigate' },
  { title: 'Testimonials', url: `${ADMIN_BASE}/testimonials`, icon: Quote, group: 'Navigate' },
  { title: 'Concierge', url: `${ADMIN_BASE}/concierge`, icon: Headphones, group: 'Navigate' },
  { title: 'Content', url: `${ADMIN_BASE}/content`, icon: Image, group: 'Navigate' },
  { title: 'Research', url: `${ADMIN_BASE}/research`, icon: Microscope, group: 'Navigate' },
  { title: 'Roles', url: `${ADMIN_BASE}/roles`, icon: Shield, group: 'Navigate' },
  { title: 'Settings', url: `${ADMIN_BASE}/settings`, icon: Settings, group: 'Navigate' },
];

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false);
      navigate(url);
    },
    [navigate],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, members, events..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {commandItems.map((item) => (
            <CommandItem
              key={item.url}
              onSelect={() => handleSelect(item.url)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

interface AdminCommandTriggerProps {
  className?: string;
}

export function AdminCommandTrigger({ className }: AdminCommandTriggerProps) {
  return (
    <button
      onClick={() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm ${className}`}
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden md:inline">Search...</span>
      <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}
