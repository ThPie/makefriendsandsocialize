/**
 * WeightBadge — shows the matching weight of a question in the intake form.
 * Helps users understand which questions matter most for compatibility scoring.
 */
interface WeightBadgeProps {
  weight: number; // out of 100
  className?: string;
}

export const WeightBadge = ({ weight, className }: WeightBadgeProps) => {
  const intensity = weight >= 7 ? "high" : weight >= 4 ? "medium" : "low";
  const colors = {
    high: "bg-[hsl(var(--accent-gold))]/20 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/30",
    medium: "bg-white/10 text-white/60 border-white/20",
    low: "bg-white/5 text-white/40 border-white/10",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium tracking-wide ${colors[intensity]} ${className || ""}`}
      title={`This question contributes ${weight}% to your overall compatibility score`}
    >
      {weight}% weight
    </span>
  );
};
