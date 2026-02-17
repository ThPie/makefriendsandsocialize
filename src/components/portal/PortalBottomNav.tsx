import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Heart, User } from 'lucide-react';
import { haptic } from '@/lib/haptics';

const tabs = [
  { label: 'Home', icon: LayoutDashboard, path: '/portal' },
  { label: 'Events', icon: Calendar, path: '/portal/events' },
  { label: 'Network', icon: Users, path: '/portal/connections' },
  { label: 'Dating', icon: Heart, path: '/portal/slow-dating' },
  { label: 'Profile', icon: User, path: '/portal/profile' },
];

export function PortalBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/90 backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Portal navigation"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={() => haptic('selection')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
