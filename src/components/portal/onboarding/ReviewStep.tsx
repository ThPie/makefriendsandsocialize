import { User, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ReviewStepProps {
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
    industry: string;
    customIndustry: string;
    city: string;
    state: string;
    bio: string;
    interests: string[];
    photos: string[];
    acceptedTerms: boolean;
    setAcceptedTerms: (val: boolean) => void;
}

export const ReviewStep = ({
    firstName,
    lastName,
    jobTitle,
    company,
    industry,
    customIndustry,
    city,
    state,
    bio,
    interests,
    photos,
    acceptedTerms,
    setAcceptedTerms,
}: ReviewStepProps) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl text-foreground mb-2">Almost Done!</h1>
                <p className="text-muted-foreground">Review your profile and submit your application</p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                    {photos[0] ? (
                        <img src={photos[0]} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-foreground font-medium text-lg">{firstName} {lastName}</h3>
                        <p className="text-muted-foreground">{jobTitle} at {company}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground/60">Location:</span>
                        <p className="text-foreground">{city}{state ? `, ${state}` : ''}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground/60">Industry:</span>
                        <p className="text-foreground">{industry === 'Other' ? customIndustry : industry}</p>
                    </div>
                </div>

                {bio && (
                    <div>
                        <span className="text-muted-foreground/60 text-sm">Bio:</span>
                        <p className="text-foreground text-sm line-clamp-2">{bio}</p>
                    </div>
                )}

                {interests.length > 0 && (
                    <div>
                        <span className="text-muted-foreground/60 text-sm">Interests:</span>
                        <p className="text-foreground text-sm">{interests.join(', ')}</p>
                    </div>
                )}
            </div>

            <div className="flex items-start gap-3 pt-4">
                <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-1 border-border"
                />
                <label htmlFor="terms" className="text-muted-foreground text-sm leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>.
                    I understand that my application will be reviewed by the membership committee.
                </label>
            </div>
        </div>
    );
};
