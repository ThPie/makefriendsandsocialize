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

// Normalize scores: if value is <= 1, treat as 0-1 range and multiply by 100
const normalizeScore = (score: number | undefined | null): number | null => {
  if (score === undefined || score === null) return null;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

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

  const communicationScore = normalizeScore(matchDimensions?.communication) ?? getCommunicationScore();
  const repairScore = normalizeScore(matchDimensions?.red_flags) ?? getRepairScore();
  const stressScore = getStressScore();
  const valuesScoreAI = normalizeScore(matchDimensions?.values);
  const goalsScore = normalizeScore(matchDimensions?.goals);
  const lifestyleScore = normalizeScore(matchDimensions?.lifestyle);

  const gottmanScore = normalizeScore(matchDimensions?.gottman_score) ?? ((): number | null => {
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

  const getProgressColor = (score: number): string => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-400";
    return "bg-red-400";
  };

  const getStepDescription = (key: string, score: number): { summary: string; detail: string } => {
    const descriptions: Record<string, { high: string; mid: string; low: string; detail: string }> = {
      goals: {
        high: "Aligned vision for family and the future",
        mid: "Similar direction with some differences",
        low: "Different goals — worth discussing early",
        detail: "This score reflects how aligned your views are on family planning, marriage timeline, having children, and long-term life vision. Couples who share similar future goals tend to navigate major life decisions more smoothly.",
      },
      lifestyle: {
        high: "Very compatible daily routines and habits",
        mid: "Mostly compatible lifestyle choices",
        low: "Different lifestyles — could complement each other",
        detail: "This measures compatibility in daily habits like morning/night preferences, exercise routines, diet, smoking, drinking, and screen time. Compatible lifestyles reduce everyday friction and make cohabitation more natural.",
      },
      dailyLife: {
        high: "Your social and daily lives mesh well",
        mid: "Some overlap in how you spend your time",
        low: "Different day-to-day rhythms — room for balance",
        detail: "This covers your social preferences (introvert/extrovert), hobbies, weekend activities, and how you recharge. It helps predict how naturally you'll integrate into each other's daily lives.",
      },
      values: {
        high: "Strong alignment on what matters most",
        mid: "Good overlap in core values",
        low: "Different values — a growth opportunity",
        detail: "Core values are the foundation of lasting relationships. This score reflects alignment on your top-ranked values like honesty, family, ambition, kindness, and spirituality. Shared values predict long-term satisfaction more than shared interests.",
      },
      communication: {
        high: "Complementary styles — you balance each other",
        mid: "Compatible communication patterns",
        low: "Different styles — may need extra understanding",
        detail: "How you express yourself and listen to each other matters deeply. This measures whether your communication styles (direct, patient, analytical, expressive) complement or clash. Good communication compatibility is a top predictor of relationship health.",
      },
      repair: {
        high: "Both open to repair — strongest predictor of lasting love",
        mid: "Good potential for working through disagreements",
        low: "May need to develop repair skills together",
        detail: "Based on Gottman's research, the ability to make and accept 'repair attempts' during conflict is the #1 predictor of relationship longevity. This score reflects how both of you handle conflict resolution and apologies.",
      },
      stress: {
        high: "Compatible coping styles — you support each other naturally",
        mid: "Different but workable approaches",
        low: "Complementary growth opportunity here",
        detail: "How you each handle stress and lean on a partner during tough times affects daily harmony. This score looks at whether your stress responses (seeking support, needing space, talking it out) align or complement each other.",
      },
      dealbreakers: {
        high: "No red flags detected between you two",
        mid: "Minor differences that are manageable",
        low: "Some potential friction points to be aware of",
        detail: "This checks your stated dealbreakers against the other person's profile. A high score means neither of you triggers the other's non-negotiables, which is essential for a viable match.",
      },
    };

    const d = descriptions[key] || { high: "Good compatibility", mid: "Moderate compatibility", low: "Lower compatibility", detail: "Based on your questionnaire responses." };
    const summary = score >= 85 ? d.high : score >= 70 ? d.mid : d.low;
    return { summary, detail: d.detail };
  };

  // Map to the 8 intake steps
  const sections = [
    goalsScore !== null && {
      key: 'goals',
      icon: Compass,
      label: 'Life & Family',
      stepNum: 2,
      score: goalsScore,
    },
    lifestyleScore !== null && {
      key: 'lifestyle',
      icon: Home,
      label: 'Lifestyle',
      stepNum: 3,
      score: lifestyleScore,
    },
    valuesScoreAI !== null && {
      key: 'dailyLife',
      icon: Coffee,
      label: 'Daily Life',
      stepNum: 4,
      score: valuesScoreAI,
    },
    communicationScore !== null && {
      key: 'communication',
      icon: MessageCircle,
      label: 'Communication Style',
      stepNum: 5,
      score: communicationScore,
    },
    repairScore !== null && {
      key: 'repair',
      icon: Shield,
      label: 'Conflict Resolution',
      stepNum: 5,
      score: repairScore,
    },
    stressScore !== null && {
      key: 'stress',
      icon: Target,
      label: 'Stress Response',
      stepNum: 5,
      score: stressScore,
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: any;
    label: string;
    stepNum: number;
    score: number;
  }>;

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-primary" />
          Your Compatibility Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Here's how your answers compared across each section of the questionnaire
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
            <Progress value={gottmanScore} className="h-2" indicatorClassName={getProgressColor(gottmanScore)} />
            <p className="text-xs text-muted-foreground mt-2">
              Based on 50+ years of relationship research predicting long-term success
            </p>
          </div>
        )}

        {/* Dimension Sections with expandable dropdowns */}
        {sections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Breakdown by Profile Section
            </h3>
            {sections.map((section) => (
              <ExpandableSection
                key={section.key}
                section={section}
                getScoreColor={getScoreColor}
                getScoreLabel={getScoreLabel}
                getProgressColor={getProgressColor}
                getStepDescription={getStepDescription}
              />
            ))}
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

// Expandable section component
function ExpandableSection({
  section,
  getScoreColor,
  getScoreLabel,
  getProgressColor,
  getStepDescription,
}: {
  section: { key: string; icon: any; label: string; stepNum: number; score: number };
  getScoreColor: (s: number) => string;
  getScoreLabel: (s: number) => string;
  getProgressColor: (s: number) => string;
  getStepDescription: (key: string, score: number) => { summary: string; detail: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = section.icon;
  const { summary, detail } = getStepDescription(section.key, section.score);

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
                <span className="font-medium text-sm text-foreground">{section.label}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground border-border">
                  Step {section.stepNum}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("font-bold text-lg", getScoreColor(section.score))}>
              {section.score}%
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Compatibility</span>
                <span className={getScoreColor(section.score)}>{getScoreLabel(section.score)}</span>
              </div>
              <Progress value={section.score} className="h-2" indicatorClassName={getProgressColor(section.score)} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {detail}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
