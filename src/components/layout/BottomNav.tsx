import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { label: 'Home', icon: Home, path: '/portal' },
    { label: 'Events', icon: Calendar, path: '/portal/events' },
    { label: 'Network', icon: Users, path: '/portal/connections' },
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
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
            style={{ paddingBottom: 'var(--safe-bottom, 0px)' }}
            aria-label="Mobile navigation"
        >
            {/* Glassmorphic background */}
            <div className="absolute inset-0 bg-background/85 dark:bg-[#0d1a10]/90 backdrop-blur-xl border-t border-border/40 dark:border-white/[0.06]" />

            <div className="relative flex items-center justify-around h-[var(--bottom-nav-height)]">
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            aria-current={active ? 'page' : undefined}
                        >
                            <tab.icon
                                className={cn(
                                    'w-[22px] h-[22px] transition-all duration-200',
                                    active && 'scale-110'
                                )}
                                strokeWidth={active ? 2.5 : 1.8}
                            />
                            <span
                                className={cn(
                                    'text-[10px] leading-none tracking-wide transition-all duration-200',
                                    active ? 'font-semibold' : 'font-medium'
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
