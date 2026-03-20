import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, Building2, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { label: 'Home', icon: Home, path: '/portal' },
    { label: 'Events', icon: Calendar, path: '/portal/events' },
    { label: 'Directory', icon: Building2, path: '/founders-circle/directory' },
    { label: 'Connect', icon: Heart, path: '/portal/slow-dating' },
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
            {/* Background */}
            <div className="absolute inset-0 bg-[hsl(var(--card))] border-t border-border" />

            <div className="relative flex items-center justify-around h-16">
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-150',
                                active
                                    ? 'text-[hsl(var(--accent-gold))]'
                                    : 'text-[hsl(var(--text-muted))]'
                            )}
                            aria-current={active ? 'page' : undefined}
                        >
                            <tab.icon
                                className="w-[22px] h-[22px]"
                                strokeWidth={active ? 2 : 1.5}
                                fill={active ? 'currentColor' : 'none'}
                            />
                            {/* Label only shown for active tab */}
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
