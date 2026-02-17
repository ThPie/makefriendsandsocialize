import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, Users, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { label: 'Home', icon: Home, path: '/portal' },
    { label: 'Events', icon: Calendar, path: '/portal/events' },
    { label: 'Network', icon: Users, path: '/portal/network' },
    { label: 'Perks', icon: Sparkles, path: '/portal/perks' },
    { label: 'Profile', icon: User, path: '/portal/profile' },
];

export function BottomNav() {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/portal') return location.pathname === '/portal';
        return location.pathname.startsWith(path);
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl"
            style={{ paddingBottom: 'var(--safe-bottom, 0px)' }}
            aria-label="Mobile navigation"
        >
            <div className="flex items-center justify-around h-[var(--bottom-nav-height)]">
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors duration-200',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            aria-current={active ? 'page' : undefined}
                        >
                            <tab.icon
                                className={cn(
                                    'w-5 h-5 transition-all duration-200',
                                    active && 'scale-110'
                                )}
                                strokeWidth={active ? 2.5 : 1.8}
                            />
                            <span
                                className={cn(
                                    'text-[10px] leading-tight font-medium transition-all duration-200',
                                    active && 'font-semibold'
                                )}
                            >
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
