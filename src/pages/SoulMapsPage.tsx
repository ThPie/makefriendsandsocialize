import { Helmet } from 'react-helmet-async';
import { Heart, Users, Briefcase, Sparkles, Swords, Brain } from 'lucide-react';
import { QuizCard } from '@/components/soul-maps/QuizCard';
import { motion } from 'framer-motion';

const quizzes = [
  {
    title: 'How Do You Love & Connect?',
    description: 'Discover your attachment style and understand the invisible patterns shaping your closest relationships.',
    category: 'Dating',
    time: '3 min',
    icon: Heart,
    to: '/soul-maps/attachment-style',
  },
];

const comingSoon = [
  {
    title: 'What Kind of Friend Are You?',
    description: 'Uncover your friendship archetype and what you bring to your inner circle.',
    category: 'Friendship',
    time: '4 min',
    icon: Users,
  },
  {
    title: "What's Your Networking Style?",
    description: 'Discover how you naturally build professional relationships — and how to lean into it.',
    category: 'Business',
    time: '3 min',
    icon: Briefcase,
  },
  {
    title: 'What Do You Need in a Social Life?',
    description: 'Map your social energy, preferences, and what truly recharges you.',
    category: 'Self',
    time: '4 min',
    icon: Sparkles,
  },
  {
    title: 'How Do You Handle Conflict?',
    description: "Your conflict style shapes every relationship. Find out what's really going on.",
    category: 'All Circles',
    time: '3 min',
    icon: Swords,
  },
  {
    title: 'Are You Ready to Date?',
    description: 'An honest look at where you are emotionally before inviting someone new in.',
    category: 'Dating',
    time: '5 min',
    icon: Brain,
  },
];

const SoulMapsPage = () => (
  <>
    <Helmet>
      <title>Soul Maps — Know Yourself. Connect Better. | MakeFriends & Socialize</title>
      <meta name="description" content="Beautifully designed quizzes to help you understand how you show up in friendship, dating, work, and life. Discover your attachment style and more." />
    </Helmet>

    {/* Hero */}
    <section className="relative min-h-[50vh] md:min-h-[55vh] flex items-end bg-background overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-gold))]/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="content-container w-full pb-12 pt-32 md:pt-40 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl space-y-4"
        >
          <span className="inline-block text-[10px] uppercase tracking-[0.2em] font-medium px-3 py-1.5 rounded-full bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border border-[hsl(var(--accent-gold))]/20">
            New — Soul Maps
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-foreground leading-[1.1]">
            Know Yourself.<br />Connect Better.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
            Beautifully designed quizzes to help you understand how you show up in friendship, dating, work, and life.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Quiz Grid */}
    <section className="content-container py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map((q) => (
          <QuizCard key={q.title} {...q} />
        ))}
        {comingSoon.map((q) => (
          <QuizCard key={q.title} {...q} comingSoon />
        ))}
      </div>
    </section>
  </>
);

export default SoulMapsPage;
