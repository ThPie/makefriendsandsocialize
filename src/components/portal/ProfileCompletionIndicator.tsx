import { useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, PartyPopper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useConfetti } from '@/hooks/useConfetti';

interface ProfileData {
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  avatar_urls?: string[] | null;
  bio?: string | null;
  job_title?: string | null;
  industry?: string | null;
  interests?: string[] | null;
  city?: string | null;
}

interface ProfileCompletionIndicatorProps {
  profile: ProfileData;
}

interface CompletionField {
  key: keyof ProfileData;
  label: string;
  weight: number;
  check: (value: unknown) => boolean;
}

const COMPLETION_FIELDS: CompletionField[] = [
  { key: 'first_name', label: 'First name', weight: 15, check: (v) => Boolean(v) },
  { key: 'last_name', label: 'Last name', weight: 15, check: (v) => Boolean(v) },
  { key: 'date_of_birth', label: 'Date of birth', weight: 15, check: (v) => Boolean(v) },
  { key: 'avatar_urls', label: 'Profile photo', weight: 15, check: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'bio', label: 'Bio', weight: 10, check: (v) => Boolean(v) },
  { key: 'job_title', label: 'Job title', weight: 10, check: (v) => Boolean(v) },
  { key: 'industry', label: 'Industry', weight: 10, check: (v) => Boolean(v) },
  { key: 'interests', label: 'Interests (at least 2)', weight: 5, check: (v) => Array.isArray(v) && v.length >= 2 },
  { key: 'city', label: 'Location', weight: 5, check: (v) => Boolean(v) },
];

export function ProfileCompletionIndicator({ profile }: ProfileCompletionIndicatorProps) {
  const { fireOnce } = useConfetti();
  const hasCelebrated = useRef(false);

  const completedFields = COMPLETION_FIELDS.filter((field) => 
    field.check(profile[field.key])
  );
  
  const missingFields = COMPLETION_FIELDS.filter((field) => 
    !field.check(profile[field.key])
  );

  const completionPercentage = completedFields.reduce((acc, field) => acc + field.weight, 0);

  // Fire confetti when reaching 100% for the first time
  useEffect(() => {
    const celebrationKey = 'profile-completion-celebrated';
    const alreadyCelebrated = localStorage.getItem(celebrationKey) === 'true';
    
    if (completionPercentage === 100 && !alreadyCelebrated && !hasCelebrated.current) {
      hasCelebrated.current = true;
      localStorage.setItem(celebrationKey, 'true');
      fireOnce();
    }
  }, [completionPercentage, fireOnce]);
  
  const getMessage = () => {
    if (completionPercentage === 100) return "Your profile is complete!";
    if (completionPercentage >= 75) return "Almost there! Just a few more details.";
    if (completionPercentage >= 50) return "Good progress! Keep adding details.";
    return "Let's build your profile together.";
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {completionPercentage === 100 ? (
              <PartyPopper className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-primary" />
            )}
            <span className="font-medium text-foreground">{getMessage()}</span>
          </div>
          <span className={`text-2xl font-display font-light ${completionPercentage === 100 ? 'text-green-500' : 'text-primary'}`}>
            {completionPercentage}%
          </span>
        </div>
        
        <Progress value={completionPercentage} className="h-2 mb-6" />
        
        {missingFields.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">Missing fields:</p>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field.key}
                  className="px-3 py-1.5 text-xs rounded-full bg-muted text-muted-foreground"
                >
                  {field.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
