import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, Heart, User } from 'lucide-react';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', icon: Home, path: '/portal' },
  { label: 'Events', icon: Calendar, path: '/portal/events' },
  { label: 'Circles', icon: Users, path: '/portal/connections' },
  { label: 'Connect', icon: Heart, path: '/portal/slow-dating' },
  { label: 'Profile', icon: User, path: '/portal/profile' },
];

export function PortalBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/portal') return location.pathname === '/portal';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Portal navigation"
    >
      {/* Solid surface background */}
      <div className="absolute inset-0 bg-card border-t border-border" />

      <div className="relative flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={() => haptic('selection')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-200',
                active
                  ? 'text-[hsl(var(--accent-gold))]'
                  : 'text-muted-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <tab.icon
                className="w-[22px] h-[22px]"
                strokeWidth={active ? 2.5 : 1.5}
                fill={active ? 'currentColor' : 'none'}
              />
              {/* Only show label for active tab */}
              {active && (
                <span className="text-[10px] leading-none tracking-wide font-medium">
                  {tab.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
