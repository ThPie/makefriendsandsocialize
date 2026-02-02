import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Heart } from 'lucide-react';
import { COMMUNITY_GOALS, TARGET_INDUSTRIES } from '@/constants/onboarding';

interface GoalsStepProps {
    communityGoals: string[];
    toggleGoal: (goalId: string) => void;
    targetIndustries: string[];
    toggleTargetIndustry: (industry: string) => void;
    communityOffering: string;
    setCommunityOffering: (val: string) => void;
}

export const GoalsStep = ({
    communityGoals,
    toggleGoal,
    targetIndustries,
    toggleTargetIndustry,
    communityOffering,
    setCommunityOffering,
}: GoalsStepProps) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl text-white mb-2">Community Goals</h1>
                <p className="text-white/60">What are you looking to get out of the community?</p>
            </div>

            <div>
                <Label className="text-white mb-3 block">Why are you joining? *</Label>
                <div className="grid grid-cols-2 gap-3">
                    {COMMUNITY_GOALS.map((goal) => (
                        <div
                            key={goal.id}
                            onClick={() => toggleGoal(goal.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${communityGoals.includes(goal.id)
                                    ? 'bg-primary/20 border-primary text-white'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {communityGoals.includes(goal.id) && <Check className="h-4 w-4 text-primary" />}
                                <span className="text-sm">{goal.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <Label className="text-white mb-3 block">Industries you want to connect with</Label>
                <div className="flex flex-wrap gap-2">
                    {TARGET_INDUSTRIES.map((ind) => (
                        <button
                            key={ind}
                            type="button"
                            onClick={() => toggleTargetIndustry(ind)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${targetIndustries.includes(ind)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            {ind}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label htmlFor="offering" className="text-white">What can you offer the community? (optional)</Label>
                <Textarea
                    id="offering"
                    value={communityOffering}
                    onChange={(e) => setCommunityOffering(e.target.value)}
                    className="bg-white/10 border-white/20 text-white min-h-[100px]"
                    placeholder="Share your expertise, mentorship opportunities, or unique value you can bring..."
                />
            </div>
        </div>
    );
};
