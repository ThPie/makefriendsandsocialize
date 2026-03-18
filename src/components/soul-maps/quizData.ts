export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized';

export interface QuizOption {
  text: string;
  style: AttachmentStyle;
}

export interface QuizQuestion {
  scenario: string;
  question: string;
  options: QuizOption[];
}

export const attachmentQuestions: QuizQuestion[] = [
  {
    scenario: 'In a new relationship',
    question: "When someone you're dating doesn't reply for a few hours, you tend to…",
    options: [
      { text: "Feel fine — they're probably busy, and I trust we're good.", style: 'secure' },
      { text: "Wonder if I said something wrong and start rehearsing my next message.", style: 'anxious' },
      { text: "Feel relieved. A little space is actually welcome.", style: 'avoidant' },
      { text: "Oscillate between wanting to reach out and telling myself it doesn't matter.", style: 'disorganized' },
    ],
  },
  {
    scenario: 'After an argument',
    question: "A close friend and you had a tense disagreement. When the dust settles, you…",
    options: [
      { text: "Reach out to clear the air — conflicts can bring people closer.", style: 'secure' },
      { text: "Replay the argument on loop, worried they're upset with me.", style: 'anxious' },
      { text: "Need several days alone before I'm ready to talk it through.", style: 'avoidant' },
      { text: "Desperately want to reconnect but feel paralysed about how to start.", style: 'disorganized' },
    ],
  },
  {
    scenario: 'Getting vulnerable',
    question: "When someone offers you deep emotional support during a hard time, you feel…",
    options: [
      { text: "Grateful and able to receive it without overthinking.", style: 'secure' },
      { text: "Relieved, but quietly worried they'll eventually grow tired of me.", style: 'anxious' },
      { text: "Uncomfortable — I prefer figuring things out on my own.", style: 'avoidant' },
      { text: "Both deeply moved and oddly suspicious of their motives.", style: 'disorganized' },
    ],
  },
  {
    scenario: 'Your ideal closeness',
    question: "In friendships and romantic partnerships, you find yourself naturally wanting…",
    options: [
      { text: "Real intimacy balanced with healthy independence — both matter.", style: 'secure' },
      { text: "More closeness and reassurance than most people seem comfortable with.", style: 'anxious' },
      { text: "Independence first, with connection on my own terms.", style: 'avoidant' },
      { text: "Deep closeness, but it often frightens me when I get too close.", style: 'disorganized' },
    ],
  },
  {
    scenario: 'When someone pulls away',
    question: "A person you care about suddenly becomes distant without explanation. You…",
    options: [
      { text: "Give them space and check in once calmly, trusting it will pass.", style: 'secure' },
      { text: "Reach out more than usual, needing to know everything is okay.", style: 'anxious' },
      { text: "Feel relieved of a social pressure and focus on other things.", style: 'avoidant' },
      { text: "Cycle between reaching out intensely and abruptly going cold myself.", style: 'disorganized' },
    ],
  },
  {
    scenario: 'Your inner narrative',
    question: "Deep down, when it comes to your worthiness of love, you tend to believe…",
    options: [
      { text: "I'm worthy of love and I generally trust the people I invite in.", style: 'secure' },
      { text: "I am loveable — but I worry others will eventually see my flaws.", style: 'anxious' },
      { text: "I'm capable and self-sufficient; needing others feels like weakness.", style: 'avoidant' },
      { text: "I honestly go back and forth — some days yes, some days I'm not sure.", style: 'disorganized' },
    ],
  },
  {
    scenario: 'Commitment and trust',
    question: "When a relationship starts getting serious and real, you tend to…",
    options: [
      { text: "Feel excited. Depth and commitment make relationships meaningful.", style: 'secure' },
      { text: "Cling tightly — and constantly check whether they feel the same.", style: 'anxious' },
      { text: "Feel an urge to slow down or create emotional distance.", style: 'avoidant' },
      { text: "Desperately want it, yet find subtle ways to sabotage it.", style: 'disorganized' },
    ],
  },
];

export interface ResultProfile {
  type: AttachmentStyle;
  title: string;
  subtitle: string;
  description: string;
  traits: string[];
  growthEdge: string;
  color: string;
}

export const resultProfiles: Record<AttachmentStyle, ResultProfile> = {
  secure: {
    type: 'secure',
    title: 'Securely Attached',
    subtitle: 'The steady harbour in the storm',
    description: 'You approach relationships with a quiet confidence that comes from trusting both yourself and others. You can be emotionally present without losing yourself, and you navigate conflict with curiosity rather than fear.',
    traits: [
      'Warm / Honest / Emotionally available',
      'Seeks connection under stress',
      'Core belief: "I am worthy; others can be trusted"',
      'Superpower: Making others feel truly safe',
    ],
    growthEdge: "Notice moments when you assume others share your emotional ease — not everyone has had the same foundation.",
    color: 'hsl(var(--accent-gold))',
  },
  anxious: {
    type: 'anxious',
    title: 'Anxiously Attached',
    subtitle: 'The heart that loves too hard to stay still',
    description: "You feel things deeply and love with your whole self. But that intensity often comes paired with a fear of abandonment that keeps you scanning for signs of rejection.",
    traits: [
      'Warm / Devoted / Hyper-attuned',
      'Seeks reassurance under stress',
      'Core belief: "I\'m loveable, but people leave"',
      'Superpower: Deep empathy and emotional intuition',
    ],
    growthEdge: "Practise self-soothing before reaching outward. Ask: is this about what's actually happening, or an old wound being activated?",
    color: 'hsl(200, 70%, 55%)',
  },
  avoidant: {
    type: 'avoidant',
    title: 'Avoidantly Attached',
    subtitle: 'The independent soul who keeps the door ajar',
    description: "You've built a life that runs on autonomy. You're capable, self-contained, and fiercely private — and you've learned that relying on yourself is the safest bet.",
    traits: [
      'Independent / Reliable / Emotionally restrained',
      'Withdraws under stress',
      'Core belief: "I\'m fine alone; needs feel burdensome"',
      'Superpower: Composure and self-sufficiency',
    ],
    growthEdge: "Emotional intimacy can coexist with autonomy. Notice when you pull away — not to stop it, but to understand what it's protecting.",
    color: 'hsl(160, 50%, 45%)',
  },
  disorganized: {
    type: 'disorganized',
    title: 'Disorganized Attachment',
    subtitle: 'The paradox of wanting what frightens you',
    description: 'You hold two truths at once: a deep hunger for connection and a nervous system that treats closeness as a threat. This is the most complex style — and absolutely possible to heal.',
    traits: [
      'Intense / Deeply feeling / Unpredictable',
      'Simultaneous approach-and-withdraw',
      'Core belief: "Love is dangerous; loneliness is worse"',
      'Superpower: Profound resilience and self-awareness',
    ],
    growthEdge: "With the right support, your nervous system can learn that closeness is safe. You've survived a great deal. Thriving is the next chapter.",
    color: 'hsl(280, 50%, 55%)',
  },
};

export function calculateScores(answers: AttachmentStyle[]): Record<AttachmentStyle, number> {
  const counts: Record<AttachmentStyle, number> = { secure: 0, anxious: 0, avoidant: 0, disorganized: 0 };
  answers.forEach((a) => { counts[a]++; });
  const total = answers.length || 1;
  return {
    secure: Math.round((counts.secure / total) * 100),
    anxious: Math.round((counts.anxious / total) * 100),
    avoidant: Math.round((counts.avoidant / total) * 100),
    disorganized: Math.round((counts.disorganized / total) * 100),
  };
}

export function getWinningStyle(scores: Record<AttachmentStyle, number>): AttachmentStyle {
  return (Object.entries(scores) as [AttachmentStyle, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}
