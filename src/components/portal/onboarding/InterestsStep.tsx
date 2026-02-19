import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';
import { INTERESTS } from '@/constants/onboarding';

interface InterestsStepProps {
    interests: string[];
    toggleInterest: (interest: string) => void;
    age: string;
    setAge: (val: string) => void;
}

export const InterestsStep = ({
    interests,
    toggleInterest,
    age,
    setAge,
}: InterestsStepProps) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl text-foreground mb-2">Your Interests</h1>
                <p className="text-muted-foreground">Select at least 3 interests to help us match you with like-minded members</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                    <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full transition-all ${interests.includes(interest)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {interest}
                    </button>
                ))}
            </div>
            <p className="text-muted-foreground/60 text-sm">{interests.length} selected (minimum 3)</p>

            <div>
                <Label htmlFor="age" className="text-xs uppercase tracking-wider text-white/60 font-medium">How old are you? (21+ required)</Label>
                <Input
                    id="age"
                    type="number"
                    min="21"
                    max="100"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                />
                {age && Number(age) < 21 && (
                    <p className="text-destructive text-xs mt-1">You must be 21 or older to join</p>
                )}
                {age && Number(age) >= 21 && (
                    <p className="text-green-400 text-xs mt-1">✓ Age verified</p>
                )}
            </div>
        </div>
    );
};
