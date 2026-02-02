import { Check } from "lucide-react";

const INTERESTS = [
    'Networking & Business', 'Arts & Culture', 'Food & Dining', 'Travel & Adventure',
    'Fitness & Wellness', 'Sports', 'Music & Entertainment', 'Tech & Innovation',
    'Philanthropy & Volunteering', 'Wine & Spirits', 'Reading & Literature', 'Outdoor Activities'
];

interface ProfileInterestsSectionProps {
    selectedInterests: string[];
    toggleInterest: (interest: string) => void;
}

export const ProfileInterestsSection = ({
    selectedInterests,
    toggleInterest,
}: ProfileInterestsSectionProps) => {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
            <h2 className="font-display text-xl text-foreground mb-4">Interests</h2>
            <div className="space-y-2">
                <p className="text-sm text-foreground font-medium">Select your interests (choose at least 2)</p>
                <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedInterests.includes(interest)
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-transparent text-foreground border-border hover:border-primary'
                                }`}
                        >
                            {interest}
                            {selectedInterests.includes(interest) && <Check className="inline ml-1 h-3 w-3" />}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    {selectedInterests.length} of 2 minimum selected
                </p>
            </div>
        </div>
    );
};
