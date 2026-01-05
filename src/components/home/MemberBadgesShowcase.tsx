import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';
import { Award, Star, Users, Calendar, Heart, Zap } from 'lucide-react';

const SHOWCASE_BADGES = [
  {
    icon: Star,
    name: 'Founding Member',
    description: 'Joined in the first month',
    color: 'from-yellow-400 to-amber-500',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Calendar,
    name: 'Event Regular',
    description: 'Attended 10+ events',
    color: 'from-blue-400 to-indigo-500',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    name: 'Connector',
    description: 'Made 5+ connections',
    color: 'from-emerald-400 to-teal-500',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Heart,
    name: 'Community Builder',
    description: 'Referred 3+ members',
    color: 'from-rose-400 to-pink-500',
    iconColor: 'text-rose-400',
  },
  {
    icon: Award,
    name: 'VIP Member',
    description: 'Founder tier subscriber',
    color: 'from-purple-400 to-violet-500',
    iconColor: 'text-purple-400',
  },
  {
    icon: Zap,
    name: 'Early Adopter',
    description: 'First to try new features',
    color: 'from-orange-400 to-red-500',
    iconColor: 'text-orange-400',
  },
];

export const MemberBadgesShowcase = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-muted/30" id="badges">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`scroll-animate text-center mb-12 md:mb-16 ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-foreground">
            Earn <span className="text-primary">Recognition</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-3 max-w-2xl mx-auto">
            Celebrate your journey with exclusive member badges that unlock special perks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {SHOWCASE_BADGES.map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center p-4 md:p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                <badge.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm md:text-base mb-1">
                {badge.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
