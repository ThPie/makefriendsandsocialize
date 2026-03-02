import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
  Target,
  Brain,
  Zap,
  Home,
  Flame,
  BookOpen,
  Compass,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Bell,
  Ban,
  ClipboardCheck,
  Coffee,
  User,
  Wine,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const CORE_VALUES_MAP: Record<string, { label: string; icon: string }> = {
  honesty: { label: "Honesty & Transparency", icon: "🤝" },
  loyalty: { label: "Loyalty & Commitment", icon: "💎" },
  family: { label: "Family & Tradition", icon: "👨‍👩‍👧‍👦" },
  adventure: { label: "Adventure & Spontaneity", icon: "🌍" },
  ambition: { label: "Ambition & Career", icon: "🚀" },
  kindness: { label: "Kindness & Compassion", icon: "💝" },
  independence: { label: "Independence & Freedom", icon: "🦅" },
  humor: { label: "Humor & Playfulness", icon: "😄" },
  spirituality: { label: "Spirituality & Faith", icon: "🙏" },
  growth: { label: "Personal Growth", icon: "📚" },
  stability: { label: "Stability & Security", icon: "🏠" },
  creativity: { label: "Creativity & Expression", icon: "🎨" },
  health: { label: "Health & Wellness", icon: "💪" },
  connection: { label: "Deep Connection", icon: "❤️" },
  respect: { label: "Mutual Respect", icon: "🙌" },
  communication: { label: "Open Communication", icon: "💬" },
  trust: { label: "Trust & Reliability", icon: "🔒" },
  fun: { label: "Fun & Enjoyment", icon: "🎉" },
};

interface MatchDimensions {
  communication?: number;
  values?: number;
  goals?: number;
  lifestyle?: number;
  red_flags?: number;
  redFlags?: number;
  gottman_score?: number;
}

interface CompatibilityBreakdownProps {
  compatibilityScore: number;
  matchReason: string;
  matchDimensions?: MatchDimensions | null;
  myValues?: string[] | null;
  theirValues?: string[] | null;
  myCommunicationStyle?: string | null;
  theirCommunicationStyle?: string | null;
  myStressResponse?: string | null;
  theirStressResponse?: string | null;
  myRepairResponse?: string | null;
  theirRepairResponse?: string | null;
  className?: string;
}

// Normalize: if value <= 1, treat as 0-1 and multiply by 100
const normalizeScore = (score: number | undefined | null): number | null => {
  if (score === undefined || score === null) return null;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

/**
 * The 6 scored intake steps (Steps 1, 7, 8 are not scored for compatibility).
 * Each step has a weight. The weighted scores produce the overall %.
 * 
 * Mapping from match_dimensions to steps:
 *   goals    → Step 2: Life & Family
 *   lifestyle → Step 3: Lifestyle  
 *   values   → Step 4: Daily Life & Values
 *   communication → Step 5: Deep Dive (Communication)
 *   redFlags → Step 6: Dealbreakers
 */
interface StepBreakdown {
  stepNum: number;
  title: string;
  icon: React.ElementType;
  dimensionKey: keyof MatchDimensions;
  weight: number; // out of 100
  questions: { label: string; description: string }[];
  explanation: string;
}

const STEP_BREAKDOWNS: StepBreakdown[] = [
  {
    stepNum: 2,
    title: "Life & Family",
    icon: Users,
    dimensionKey: "goals",
    weight: 20,
    questions: [
      { label: "Children preferences", description: "Whether you both align on wanting/having children" },
      { label: "Marriage timeline", description: "How closely your timelines for marriage match" },
      { label: "Family involvement", description: "How you each view family's role in your relationship" },
      { label: "Past family experiences", description: "Compatibility in family backgrounds and values" },
    ],
    explanation: "This score reflects how aligned your visions are on family, marriage, and long-term life planning. Couples who agree here navigate major decisions more smoothly.",
  },
  {
    stepNum: 3,
    title: "Lifestyle & Habits",
    icon: Wine,
    dimensionKey: "lifestyle",
    weight: 15,
    questions: [
      { label: "Smoking & drinking habits", description: "Whether your substance habits are compatible" },
      { label: "Exercise & health", description: "How well your fitness routines align" },
      { label: "Diet preferences", description: "Dietary compatibility for cohabitation" },
      { label: "Screen time habits", description: "How you each spend downtime" },
    ],
    explanation: "Daily habits like exercise, diet, and substance use affect everyday harmony. Compatible lifestyles reduce friction and make sharing a life more natural.",
  },
  {
    stepNum: 4,
    title: "Daily Life & Values",
    icon: Coffee,
    dimensionKey: "values",
    weight: 25,
    questions: [
      { label: "Tuesday night test", description: "How a typical quiet evening looks for each of you" },
      { label: "Financial philosophy", description: "How you each think about money and spending" },
      { label: "Career ambition", description: "Whether your professional drives complement each other" },
      { label: "Core values alignment", description: "How many of your top 5 values overlap" },
    ],
    explanation: "Core values are the foundation of lasting relationships. This score reflects alignment on your daily rhythms, financial outlook, and what matters most to you both.",
  },
  {
    stepNum: 5,
    title: "Deep Dive & Communication",
    icon: Brain,
    dimensionKey: "communication",
    weight: 25,
    questions: [
      { label: "Communication style", description: "Whether your styles (direct, patient, analytical, expressive) complement each other" },
      { label: "Conflict resolution", description: "How you each approach disagreements" },
      { label: "Love language", description: "Whether your ways of giving/receiving love align" },
      { label: "Attachment style", description: "How your attachment patterns interact (secure, anxious, avoidant)" },
      { label: "Stress response", description: "How you each cope under pressure and lean on a partner" },
      { label: "Repair attempts", description: "Willingness to make and accept apologies — the #1 predictor of lasting love" },
    ],
    explanation: "How you express yourself, handle conflict, and repair after disagreements are the strongest predictors of relationship success. Based on research by Dr. John Gottman.",
  },
  {
    stepNum: 6,
    title: "Dealbreakers & Beliefs",
    icon: Shield,
    dimensionKey: "redFlags",
    weight: 15,
    questions: [
      { label: "Dealbreaker check", description: "Whether either of you triggers the other's non-negotiables" },
      { label: "Political alignment", description: "How your political views interact" },
      { label: "Religious compatibility", description: "Whether your spiritual beliefs and practices align" },
      { label: "Trust & fidelity views", description: "Shared expectations around trust and exclusivity" },
      { label: "10-year vision", description: "Whether your long-term visions for life align" },
    ],
    explanation: "This checks your stated dealbreakers, political views, religious beliefs, and long-term vision against each other. A high score means no red flags were detected.",
  },
];

export const CompatibilityBreakdown = ({
  compatibilityScore,
  matchReason,
  matchDimensions,
  myValues = [],
  theirValues = [],
  className,
}: CompatibilityBreakdownProps) => {
  const sharedValues = (myValues || []).filter(v => (theirValues || []).includes(v));

  // Resolve dimension scores, handling both camelCase and snake_case
  const getDimensionScore = (key: keyof MatchDimensions): number | null => {
    if (!matchDimensions) return null;
    // Handle redFlags/red_flags
    if (key === "redFlags") {
      const val = matchDimensions.redFlags ?? matchDimensions.red_flags;
      if (val === undefined || val === null) return null;
      // redFlags is inverted: 0.05 means 95% compatible (few red flags)
      const normalized = val <= 1 ? val : val / 100;
      return Math.round((1 - normalized) * 100);
    }
    return normalizeScore(matchDimensions[key]);
  };

  // Build scored steps
  const scoredSteps = STEP_BREAKDOWNS.map(step => {
    const score = getDimensionScore(step.dimensionKey);
    return { ...step, score };
  }).filter(step => step.score !== null) as (StepBreakdown & { score: number })[];

  // Calculate weighted contribution of each step to the overall score
  const totalWeight = scoredSteps.reduce((sum, s) => sum + s.weight, 0);
  const stepsWithContribution = scoredSteps.map(step => {
    const normalizedWeight = totalWeight > 0 ? step.weight / totalWeight : 0;
    const contribution = Math.round(step.score * normalizedWeight);
    const weightPercent = Math.round(normalizedWeight * 100);
    return { ...step, contribution, weightPercent };
  });

  const calculatedTotal = stepsWithContribution.reduce((sum, s) => sum + s.contribution, 0);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
  };

  const getProgressColor = (score: number): string => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-primary" />
          Your Compatibility Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Here's how your answers compared across each section of the questionnaire, and how much each section contributes to your overall score.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div
          className="text-center p-6 bg-accent rounded-xl border border-border"
          role="region"
          aria-label={`Overall compatibility score: ${compatibilityScore}%`}
        >
          <div className="text-5xl font-display font-bold text-foreground">
            {compatibilityScore}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Overall Compatibility
          </p>
          {stepsWithContribution.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {stepsWithContribution.map(step => (
                <Badge key={step.stepNum} variant="outline" className="text-xs border-border text-muted-foreground">
                  Step {step.stepNum}: +{step.contribution}%
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Step-by-Step Breakdown */}
        {stepsWithContribution.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Score Breakdown by Profile Step
            </h3>
            <p className="text-xs text-muted-foreground">
              Each step has a weight based on its importance for long-term compatibility. Click any step to see which questions contributed.
            </p>
            {stepsWithContribution.map((step) => (
              <ExpandableStep
                key={step.stepNum}
                step={step}
                getScoreColor={getScoreColor}
                getScoreLabel={getScoreLabel}
                getProgressColor={getProgressColor}
              />
            ))}
          </div>
        )}

        {/* Gottman Reference */}
        <div className="p-4 bg-accent rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-medium text-sm text-foreground">Based on Relationship Science</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our matching algorithm weighs communication, conflict resolution, and repair attempts heavily — 
                based on over 50 years of research by{" "}
                <a
                  href="https://www.gottman.com/about/research/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-center gap-0.5"
                >
                  Dr. John Gottman
                  <ExternalLink className="h-3 w-3" />
                </a>
                {" "}at the University of Washington, which identified the key predictors of lasting relationships.
              </p>
            </div>
          </div>
        </div>

        {/* Shared Values */}
        {sharedValues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-foreground">Shared Core Values</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {sharedValues.length} in common
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {sharedValues.map((value) => {
                const valueInfo = CORE_VALUES_MAP[value];
                return (
                  <Badge key={value} variant="secondary" className="text-xs">
                    <span className="mr-1">{valueInfo?.icon || "💫"}</span>
                    {valueInfo?.label || value}
                  </Badge>
                );
              })}
            </div>
            {sharedValues.length >= 3 && (
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Strong values alignment — a key predictor of relationship success!
              </p>
            )}
          </div>
        )}

        {/* AI Match Reason */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">AI Matchmaker Says</span>
              <p className="text-sm italic text-foreground mt-1">"{matchReason}"</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Expandable step with question-level breakdown
function ExpandableStep({
  step,
  getScoreColor,
  getScoreLabel,
  getProgressColor,
}: {
  step: StepBreakdown & { score: number; contribution: number; weightPercent: number };
  getScoreColor: (s: number) => string;
  getScoreLabel: (s: number) => string;
  getProgressColor: (s: number) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = step.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">Step {step.stepNum}: {step.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contributes <strong className="text-foreground">{step.contribution}%</strong> to your overall score (weight: {step.weightPercent}%)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={cn("font-bold text-lg", getScoreColor(step.score))}>
                {step.score}%
              </span>
              <div className="text-[10px] text-muted-foreground">{getScoreLabel(step.score)}</div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step compatibility</span>
                <span className={getScoreColor(step.score)}>{step.score}%</span>
              </div>
              <Progress value={step.score} className="h-2" indicatorClassName={getProgressColor(step.score)} />
            </div>

            {/* Explanation */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.explanation}
              {step.dimensionKey === "communication" && (
                <>
                  {" "}
                  <a
                    href="https://www.gottman.com/blog/the-magic-relationship-ratio-according-to-science/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-center gap-0.5"
                  >
                    Learn more
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </p>

            {/* Question breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Questions evaluated in this step
              </h4>
              {step.questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    getProgressColor(step.score)
                  )} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{q.label}</div>
                    <div className="text-xs text-muted-foreground">{q.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
