import { useRef } from 'react';
import { Crown, Mic, Utensils, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mapping of icon names to components
const iconMap: Record<string, any> = {
    crown: Crown,
    restaurant: Utensils,
    volunteer_activism: HeartHandshake,
    mic: Mic,
};

// Default badges from Stitch design
const defaultBadges = [
    { id: 1, name: 'Founding', sub: 'Member', icon: 'crown', colorFrom: 'from-yellow-200', colorTo: 'to-yellow-600', shadow: 'shadow-yellow-900/20', textRef: 'text-yellow-950' },
    { id: 2, name: 'Epicurean', sub: 'Dining', icon: 'restaurant', colorFrom: 'from-slate-300', colorTo: 'to-slate-500', shadow: 'shadow-slate-900/20', textRef: 'text-slate-900' },
    { id: 3, name: 'Philanthropist', sub: 'Donor', icon: 'volunteer_activism', colorFrom: 'from-amber-400', colorTo: 'to-amber-700', shadow: 'shadow-amber-900/20', textRef: 'text-amber-950' },
    { id: 4, name: 'Host', sub: 'Events', icon: 'mic', colorFrom: 'from-orange-300', colorTo: 'to-orange-600', shadow: 'shadow-orange-900/20', textRef: 'text-orange-950' },
];

interface BadgeScrollerProps {
    earnedBadges?: any[]; // We can expand this later to use real data
}

export function BadgeScroller({ earnedBadges = [] }: BadgeScrollerProps) {
    // Use default badges if none provided/earned yet, for visualization
    const displayBadges = earnedBadges.length > 0 ? earnedBadges : defaultBadges;

    return (
        <section className="mb-8">
            <div className="px-1 flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-semibold text-white">Your Distinctions</h3>
                <button className="text-xs text-[#d4af37] hover:text-[#f3e5ab] transition-colors uppercase tracking-wider font-medium">
                    View All
                </button>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
                {displayBadges.map((badge, idx) => {
                    const Icon = iconMap[badge.icon] || Crown;

                    return (
                        <div key={idx} className="snap-center shrink-0 w-32 p-4 rounded-xl bg-[#1e2b21]/70 backdrop-blur-md border border-white/5 flex flex-col items-center justify-center gap-3 group">
                            <div className={cn(
                                "size-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                                badge.colorFrom,
                                badge.colorTo,
                                badge.shadow
                            )}>
                                <Icon className={cn("w-6 h-6", badge.textRef)} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white mb-0.5">{badge.name}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{badge.sub}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    );
}
