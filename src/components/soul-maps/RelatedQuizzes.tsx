import { Heart, Users, Briefcase, Sparkles, Swords, Brain } from 'lucide-react';
import { QuizCard } from './QuizCard';

const relatedQuizzes = [
  {
    title: 'What Kind of Friend Are You?',
    description: 'Uncover your friendship archetype and what you bring to your inner circle.',
    category: 'Friendship',
    time: '4 min',
    icon: Users,
  },
  {
    title: "What's Your Networking Style?",
    description: 'Discover how you naturally build professional relationships.',
    category: 'Business',
    time: '3 min',
    icon: Briefcase,
  },
  {
    title: 'Are You Ready to Date?',
    description: 'An honest look at where you are emotionally before inviting someone new in.',
    category: 'Dating',
    time: '5 min',
    icon: Brain,
  },
];

export const RelatedQuizzes = () => (
  <section className="mt-16 pt-12 border-t border-border/40">
    <div className="space-y-1 mb-6">
      <p className="text-xs uppercase tracking-[0.15em] text-[hsl(var(--accent-gold))]">You May Also Like</p>
      <h3 className="text-xl font-display font-semibold text-foreground">Explore More Quizzes</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {relatedQuizzes.map((q) => (
        <QuizCard key={q.title} {...q} comingSoon />
      ))}
    </div>
  </section>
);
