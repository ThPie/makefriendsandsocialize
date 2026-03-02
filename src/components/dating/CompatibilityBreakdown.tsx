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
  User,
  Home,
  Flame,
  BookOpen,
  Scale,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export const CompatibilityBreakdown = ({
  compatibilityScore,
  matchReason,
  matchDimensions,
  myValues = [],
  theirValues = [],
  myCommunicationStyle,
  theirCommunicationStyle,
  myStressResponse,
  theirStressResponse,
  myRepairResponse,
  theirRepairResponse,
  className,
}: CompatibilityBreakdownProps) => {
  const sharedValues = (myValues || []).filter(v => (theirValues || []).includes(v));

  const getCommunicationScore = () => {
    if (!myCommunicationStyle || !theirCommunicationStyle) return null;
    const complementary = [['direct', 'patient'], ['analytical', 'expressive']];
    if (myCommunicationStyle === theirCommunicationStyle) return 70;
    for (const pair of complementary) {
      if (pair.includes(myCommunicationStyle) && pair.includes(theirCommunicationStyle)) return 90;
    }
    return 75;
  };

  const getRepairScore = () => {
    if (!myRepairResponse || !theirRepairResponse) return null;
    const positiveResponses = ['accept_easily', 'usually_accept', 'accept'];
    const myPositive = positiveResponses.some(r => myRepairResponse.toLowerCase().includes(r.replace('_', ' ')));
    const theirPositive = positiveResponses.some(r => theirRepairResponse.toLowerCase().includes(r.replace('_', ' ')));
    if (myPositive && theirPositive) return 95;
    if (myPositive || theirPositive) return 70;
    return 45;
  };

  const getStressScore = () => {
    if (!myStressResponse || !theirStressResponse) return null;
    if (myStressResponse === theirStressResponse) return 85;
    const leanIn = ['lean_on_partner', 'talk_it_out', 'seek_support'];
    const myLeanIn = leanIn.some(r => myStressResponse.toLowerCase().includes(r.replace('_', ' ')));
    const theirLeanIn = leanIn.some(r => theirStressResponse.toLowerCase().includes(r.replace('_', ' ')));
    if (myLeanIn && theirLeanIn) return 80;
    if (!myLeanIn && !theirLeanIn) return 60;
    return 70;
  };

  const communicationScore = matchDimensions?.communication ?? getCommunicationScore();
  const repairScore = matchDimensions?.red_flags ?? getRepairScore();
  const stressScore = getStressScore();
  const valuesScoreAI = matchDimensions?.values;
  const goalsScore = matchDimensions?.goals;
  const lifestyleScore = matchDimensions?.lifestyle;

  const gottmanScore = matchDimensions?.gottman_score ?? ((): number | null => {
    const factors = [
      { score: repairScore, weight: 3 },
      { score: communicationScore, weight: 2 },
      { score: stressScore, weight: 2 },
    ].filter(f => f.score !== null);
    return factors.length > 0
      ? Math.round(factors.reduce((acc, f) => acc + (f.score || 0) * f.weight, 0) / factors.reduce((acc, f) => acc + f.weight, 0))
      : null;
  })();

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

  // Map sections to the intake form steps
  const sections = [
    // Step 1: The Basics → Overall score header
    // Step 2: Family & Future
    goalsScore !== undefined && {
      key: 'goals',
      icon: Compass,
      label: 'Family & Future Goals',
      step: 'Step 2',
      score: goalsScore,
      description: goalsScore >= 85
        ? "Aligned vision for family and the future"
        : goalsScore >= 70
          ? "Similar direction with some differences"
          : "Different goals — worth discussing early",
    },
    // Step 3: Habits & Lifestyle
    lifestyleScore !== undefined && {
      key: 'lifestyle',
      icon: Home,
      label: 'Habits & Lifestyle',
      step: 'Step 3',
      score: lifestyleScore,
      description: lifestyleScore >= 85
        ? "Very compatible daily routines and habits"
        : lifestyleScore >= 70
          ? "Mostly compatible lifestyle choices"
          : "Different lifestyles — could complement each other",
    },
    // Step 4: Lifestyle / Social
    valuesScoreAI !== undefined && {
      key: 'values',
      icon: Heart,
      label: 'Core Values',
      step: 'Step 4',
      score: valuesScoreAI,
      description: valuesScoreAI >= 85
        ? "Strong alignment on what matters most"
        : valuesScoreAI >= 70
          ? "Good overlap in core values"
          : "Different values — a growth opportunity",
    },
    // Step 5: Deep Dive → Communication
    communicationScore !== null && {
      key: 'communication',
      icon: MessageCircle,
      label: 'Communication Style',
      step: 'Step 5',
      score: communicationScore,
      description: communicationScore >= 85
        ? "Complementary styles — you balance each other"
        : communicationScore >= 70
          ? "Compatible communication patterns"
          : "Different styles — may need extra understanding",
    },
    // Step 5 continued: Conflict Resolution
    repairScore !== null && {
      key: 'repair',
      icon: Shield,
      label: 'Conflict Resolution',
      step: 'Step 5',
      score: repairScore,
      description: repairScore >= 85
        ? "Both open to repair — strongest predictor of lasting love"
        : repairScore >= 70
          ? "Good potential for working through disagreements"
          : "May need to develop repair skills together",
    },
    // Step 5 continued: Stress Response
    stressScore !== null && {
      key: 'stress',
      icon: Target,
      label: 'Stress Response',
      step: 'Step 5',
      score: stressScore,
      description: stressScore >= 80
        ? "Compatible coping styles — you support each other naturally"
        : stressScore >= 65
          ? "Different but workable approaches"
          : "Complementary growth opportunity here",
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: any;
    label: string;
    step: string;
    score: number;
    description: string;
  }>;

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-primary" />
          Your Compatibility Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on the questionnaire you both completed during sign-up
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div
          className="text-center p-5 bg-accent rounded-xl border border-border"
          role="region"
          aria-label={`Overall compatibility score: ${compatibilityScore}%`}
        >
          <div className="text-5xl font-display font-bold text-foreground">
            {compatibilityScore}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Overall Compatibility
          </p>
        </div>

        {/* Gottman Score */}
        {gottmanScore !== null && (
          <div className="p-4 bg-accent rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Gottman Research Score</span>
              </div>
              <span className={cn("font-bold text-lg", getScoreColor(gottmanScore))}>
                {gottmanScore}%
                <span className="text-xs font-normal ml-1 text-muted-foreground">({getScoreLabel(gottmanScore)})</span>
              </span>
            </div>
            <Progress value={gottmanScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on 50+ years of relationship research predicting long-term success
            </p>
          </div>
        )}

        {/* Dimension Sections mapped to intake steps */}
        {sections.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Breakdown by Profile Section
            </h3>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.key} className="space-y-2 p-3 rounded-lg bg-accent/50 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm text-foreground">{section.label}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground border-border">
                        {section.step}
                      </Badge>
                    </div>
                    <span className={cn("font-semibold", getScoreColor(section.score))}>
                      {section.score}%
                      <span className="text-xs font-normal ml-1 text-muted-foreground">
                        ({getScoreLabel(section.score)})
                      </span>
                    </span>
                  </div>
                  <Progress value={section.score} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Shared Values */}
        {sharedValues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-foreground">Shared Core Values</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {sharedValues.length} of 5
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
