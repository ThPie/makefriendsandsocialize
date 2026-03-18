import { TransitionLink } from '@/components/ui/TransitionLink';
import { Card } from '@/components/ui/card';
import { Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface QuizCardProps {
  title: string;
  description: string;
  category: string;
  time: string;
  icon: LucideIcon;
  to?: string;
  comingSoon?: boolean;
}

const categoryColors: Record<string, string> = {
  Dating: 'bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400',
  Friendship: 'bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400',
  Business: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
  Self: 'bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400',
  'All Circles': 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400',
};

export const QuizCard = ({ title, description, category, time, icon: Icon, to, comingSoon }: QuizCardProps) => {
  const Wrapper = comingSoon ? 'div' : TransitionLink;
  const wrapperProps = comingSoon ? {} : { to: to || '#' };

  return (
    <Wrapper {...(wrapperProps as any)} className="block group">
      <Card className={cn(
        "h-full p-6 transition-all duration-200",
        comingSoon
          ? "opacity-50 cursor-default"
          : "hover:border-[hsl(var(--accent-gold))]/40 hover:shadow-md dark:hover:shadow-none"
      )}>
        <div className="flex flex-col h-full gap-4">
          {/* Top row: icon + category */}
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-transparent group-hover:border-[hsl(var(--accent-gold))] transition-colors">
              {comingSoon ? (
                <Lock className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
              ) : (
                <Icon className="w-5 h-5 text-foreground group-hover:text-[hsl(var(--accent-gold))]" strokeWidth={1} />
              )}
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-[0.15em] font-medium px-2.5 py-1 rounded-full",
              comingSoon ? 'bg-muted text-muted-foreground' : (categoryColors[category] || 'bg-muted text-muted-foreground')
            )}>
              {comingSoon ? 'Coming Soon' : category}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <h3 className="text-base font-semibold text-foreground leading-snug">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" strokeWidth={1} />
              <span>{time}</span>
            </div>
            {!comingSoon && (
              <span className="text-xs font-medium text-[hsl(var(--accent-gold))] uppercase tracking-widest group-hover:underline">
                Take Quiz →
              </span>
            )}
          </div>
        </div>
      </Card>
    </Wrapper>
  );
};
