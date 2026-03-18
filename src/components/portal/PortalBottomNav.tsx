import { Link, useLocation } from 'react-router-dom';
import { House, CalendarBlank, UsersThree, HeartStraight, UserCircle } from '@phosphor-icons/react';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', icon: House, path: '/portal' },
  { label: 'Events', icon: CalendarBlank, path: '/portal/events' },
  { label: 'Network', icon: UsersThree, path: '/portal/connections' },
  { label: 'Connect', icon: HeartStraight, path: '/portal/slow-dating' },
  { label: 'Profile', icon: UserCircle, path: '/portal/profile' },
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
                active ? 'text-[hsl(var(--accent-gold))]' : 'text-muted-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <tab.icon
                size={22}
                weight={active ? 'duotone' : 'regular'}
              />
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
