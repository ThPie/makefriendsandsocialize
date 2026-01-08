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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Core values mapping for display
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

interface CompatibilityBreakdownProps {
  compatibilityScore: number;
  matchReason: string;
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
  // Calculate shared values
  const sharedValues = (myValues || []).filter(v => (theirValues || []).includes(v));
  const valuesScore = Math.min(100, (sharedValues.length / 5) * 100);
  
  // Calculate communication compatibility
  const getCommunicationScore = () => {
    if (!myCommunicationStyle || !theirCommunicationStyle) return null;
    
    // Complementary styles score higher
    const complementary = [
      ['direct', 'patient'],
      ['analytical', 'expressive'],
    ];
    
    if (myCommunicationStyle === theirCommunicationStyle) return 70;
    
    for (const pair of complementary) {
      if (pair.includes(myCommunicationStyle) && pair.includes(theirCommunicationStyle)) {
        return 90;
      }
    }
    return 75;
  };
  
  // Calculate repair attempt compatibility (Gottman's #1 predictor)
  const getRepairScore = () => {
    if (!myRepairResponse || !theirRepairResponse) return null;
    
    const positiveResponses = ['accept_easily', 'usually_accept', 'accept'];
    const myPositive = positiveResponses.some(r => myRepairResponse.toLowerCase().includes(r.replace('_', ' ')));
    const theirPositive = positiveResponses.some(r => theirRepairResponse.toLowerCase().includes(r.replace('_', ' ')));
    
    if (myPositive && theirPositive) return 95;
    if (myPositive || theirPositive) return 70;
    return 45;
  };

  // Calculate stress response compatibility
  const getStressScore = () => {
    if (!myStressResponse || !theirStressResponse) return null;
    
    // Similar stress responses indicate compatibility
    if (myStressResponse === theirStressResponse) return 85;
    
    // Complementary responses
    const leanIn = ['lean_on_partner', 'talk_it_out', 'seek_support'];
    const needSpace = ['need_space', 'withdraw', 'alone_time'];
    
    const myLeanIn = leanIn.some(r => myStressResponse.toLowerCase().includes(r.replace('_', ' ')));
    const theirLeanIn = leanIn.some(r => theirStressResponse.toLowerCase().includes(r.replace('_', ' ')));
    
    if (myLeanIn && theirLeanIn) return 80;
    if (!myLeanIn && !theirLeanIn) return 60; // Both withdraw - not ideal
    return 70; // One leans in, one needs space - workable
  };

  const communicationScore = getCommunicationScore();
  const repairScore = getRepairScore();
  const stressScore = getStressScore();

  // Calculate Gottman Score (weighted average of relationship predictors)
  const gottmanFactors = [
    { score: repairScore, weight: 3 },
    { score: communicationScore, weight: 2 },
    { score: stressScore, weight: 2 },
  ].filter(f => f.score !== null);

  const gottmanScore = gottmanFactors.length > 0
    ? Math.round(
        gottmanFactors.reduce((acc, f) => acc + (f.score || 0) * f.weight, 0) /
        gottmanFactors.reduce((acc, f) => acc + f.weight, 0)
      )
    : null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className={cn("border-dating-forest/20", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-dating-forest" />
          Compatibility Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-4 bg-gradient-to-br from-dating-forest/10 to-dating-terracotta/10 rounded-xl">
          <div className="text-5xl font-display font-bold text-dating-forest">
            {compatibilityScore}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">Overall Compatibility</p>
        </div>

        {/* Gottman Score */}
        {gottmanScore !== null && (
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-dating-terracotta" />
                <span className="font-medium text-sm">Gottman Research Score</span>
              </div>
              <span className={cn("font-bold text-lg", getScoreColor(gottmanScore))}>
                {gottmanScore}%
              </span>
            </div>
            <Progress value={gottmanScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on 50+ years of relationship research predicting long-term success
            </p>
          </div>
        )}

        {/* Shared Values */}
        {sharedValues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-dating-terracotta" />
              <span className="font-medium text-sm">Shared Core Values</span>
              <Badge variant="secondary" className="ml-auto">
                {sharedValues.length} of 5
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {sharedValues.map((value) => {
                const valueInfo = CORE_VALUES_MAP[value];
                return (
                  <Badge
                    key={value}
                    className="bg-dating-forest/10 text-dating-forest border-dating-forest/20 hover:bg-dating-forest/20"
                  >
                    <span className="mr-1">{valueInfo?.icon || "💫"}</span>
                    {valueInfo?.label || value}
                  </Badge>
                );
              })}
            </div>
            {sharedValues.length >= 3 && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Strong values alignment - a key predictor of relationship success!
              </p>
            )}
          </div>
        )}

        {/* Communication Style */}
        {communicationScore !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Communication Style</span>
              </div>
              <span className={cn("font-semibold", getScoreColor(communicationScore))}>
                {communicationScore}%
              </span>
            </div>
            <Progress value={communicationScore} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {communicationScore >= 85
                ? "Complementary styles - you balance each other well"
                : communicationScore >= 70
                ? "Compatible communication patterns"
                : "Different styles - may require extra understanding"}
            </p>
          </div>
        )}

        {/* Repair Attempts */}
        {repairScore !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">Conflict Resolution</span>
              </div>
              <span className={cn("font-semibold", getScoreColor(repairScore))}>
                {repairScore}%
              </span>
            </div>
            <Progress value={repairScore} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {repairScore >= 85
                ? "Both open to repair - strongest predictor of lasting relationships"
                : repairScore >= 70
                ? "Good potential for working through disagreements"
                : "May need to develop repair skills together"}
            </p>
          </div>
        )}

        {/* Stress Response */}
        {stressScore !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Stress Response</span>
              </div>
              <span className={cn("font-semibold", getScoreColor(stressScore))}>
                {stressScore}%
              </span>
            </div>
            <Progress value={stressScore} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {stressScore >= 80
                ? "Compatible coping styles - you support each other naturally"
                : stressScore >= 65
                ? "Different but workable approaches to stress"
                : "Complementary growth opportunity in this area"}
            </p>
          </div>
        )}

        {/* Match Reason Quote */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-dating-forest mt-0.5 shrink-0" />
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
