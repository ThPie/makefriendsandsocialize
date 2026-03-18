import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, PenLine } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileStrengthIndicatorProps {
  formData: Record<string, unknown>;
  className?: string;
}

/**
 * Fields that carry the most weight in matching.
 * Detailed text answers get a depth bonus (longer = higher confidence multiplier).
 */
const HIGH_IMPACT_FIELDS = [
  { key: "repair_attempt_response", label: "Repair attempts", weight: 8 },
  { key: "core_values_ranked", label: "Core values", weight: 10 },
  { key: "conflict_resolution", label: "Conflict resolution", weight: 6 },
  { key: "communication_style", label: "Communication style", weight: 5 },
  { key: "financial_philosophy", label: "Financial philosophy", weight: 6 },
  { key: "stress_response", label: "Stress response", weight: 4 },
  { key: "trust_fidelity_views", label: "Trust & fidelity", weight: 5 },
  { key: "ten_year_vision", label: "10-year vision", weight: 5 },
  { key: "wants_children", label: "Children preferences", weight: 7 },
  { key: "attachment_style", label: "Attachment style", weight: 4 },
];

const TEXT_DEPTH_THRESHOLDS = {
  minimal: 20,  // under 20 chars = minimal
  moderate: 80, // 20-80 chars = moderate
  detailed: 80, // 80+ chars = detailed (confidence boost)
};

function getFieldStrength(value: unknown): { filled: boolean; depth: "empty" | "minimal" | "moderate" | "detailed" } {
  if (value === null || value === undefined || value === "") {
    return { filled: false, depth: "empty" };
  }
  if (Array.isArray(value)) {
    return { filled: value.length > 0, depth: value.length >= 3 ? "detailed" : value.length >= 1 ? "moderate" : "empty" };
  }
  if (typeof value === "string") {
    const len = value.trim().length;
    if (len === 0) return { filled: false, depth: "empty" };
    if (len < TEXT_DEPTH_THRESHOLDS.minimal) return { filled: true, depth: "minimal" };
    if (len < TEXT_DEPTH_THRESHOLDS.moderate) return { filled: true, depth: "moderate" };
    return { filled: true, depth: "detailed" };
  }
  return { filled: true, depth: "moderate" };
}

export const ProfileStrengthIndicator = ({ formData, className }: ProfileStrengthIndicatorProps) => {
  const fieldResults = HIGH_IMPACT_FIELDS.map(field => {
    const value = formData[field.key];
    const strength = getFieldStrength(value);
    return { ...field, ...strength };
  });

  const totalWeight = HIGH_IMPACT_FIELDS.reduce((sum, f) => sum + f.weight, 0);
  
  // Calculate weighted score: detailed = 100%, moderate = 70%, minimal = 40%, empty = 0%
  const depthMultipliers: Record<string, number> = {
    empty: 0,
    minimal: 0.4,
    moderate: 0.7,
    detailed: 1.0,
  };

  const weightedScore = fieldResults.reduce((sum, f) => {
    return sum + f.weight * depthMultipliers[f.depth];
  }, 0);

  const strengthPercent = Math.round((weightedScore / totalWeight) * 100);

  const emptyHighImpact = fieldResults.filter(f => !f.filled);
  const minimalFields = fieldResults.filter(f => f.depth === "minimal");

  const getStrengthLabel = () => {
    if (strengthPercent >= 90) return { label: "Excellent", color: "text-emerald-500", tip: "Your detailed answers give our matching the best data to work with!" };
    if (strengthPercent >= 70) return { label: "Strong", color: "text-emerald-400", tip: "Great job! Adding more detail to a few answers could boost your match precision." };
    if (strengthPercent >= 50) return { label: "Good", color: "text-amber-400", tip: "You're on the right track. Expanding your answers helps us find deeper compatibility." };
    if (strengthPercent >= 30) return { label: "Building", color: "text-amber-500", tip: "The more you share, the better we can match you. Detailed answers boost precision by up to 30%." };
    return { label: "Just Starting", color: "text-red-400", tip: "Fill in the high-impact questions below for the most accurate matches." };
  };

  const { label, color, tip } = getStrengthLabel();

  return (
    <div className={cn("space-y-4 p-5 rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Profile Strength</span>
        </div>
        <span className={cn("text-lg font-bold", color)}>{strengthPercent}%</span>
      </div>

      <Progress value={strengthPercent} className="h-2" />

      <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        {tip}
      </p>

      {/* Show which high-impact fields need attention */}
      {(emptyHighImpact.length > 0 || minimalFields.length > 0) && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <PenLine className="h-3 w-3" />
            Boost your score:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {emptyHighImpact.map(f => (
              <span key={f.key} className="text-[11px] px-2 py-0.5 rounded-full bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border border-[hsl(var(--accent-gold))]/20">
                {f.label} ({f.weight}%)
              </span>
            ))}
            {minimalFields.map(f => (
              <span key={f.key} className="text-[11px] px-2 py-0.5 rounded-full bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border border-[hsl(var(--accent-gold))]/20">
                {f.label} — add detail
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
