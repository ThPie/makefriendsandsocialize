import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Briefcase } from 'lucide-react';
import { INDUSTRIES } from '@/constants/onboarding';

interface ProfessionalStepProps {
    jobTitle: string;
    setJobTitle: (val: string) => void;
    company: string;
    setCompany: (val: string) => void;
    industry: string;
    setIndustry: (val: string) => void;
    customIndustry: string;
    setCustomIndustry: (val: string) => void;
    linkedinUrl: string;
    setLinkedinUrl: (val: string) => void;
    bio: string;
    setBio: (val: string) => void;
    bioError: string | null;
    setBioError: (val: string | null) => void;
}

export const ProfessionalStep = ({
    jobTitle,
    setJobTitle,
    company,
    setCompany,
    industry,
    setIndustry,
    customIndustry,
    setCustomIndustry,
    linkedinUrl,
    setLinkedinUrl,
    bio,
    setBio,
    bioError,
    setBioError,
}: ProfessionalStepProps) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl text-white mb-2">Professional Background</h1>
                <p className="text-white/60">Help others understand what you do</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="jobTitle" className="text-white">Job Title *</Label>
                    <Input
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Senior Product Manager"
                    />
                </div>
                <div>
                    <Label htmlFor="company" className="text-white">Company/Organization *</Label>
                    <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Acme Inc."
                    />
                </div>
            </div>

            <div>
                <Label className="text-white">Industry *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                        {INDUSTRIES.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {industry === 'Other' && (
                    <Input
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        className="mt-2 bg-white/10 border-white/20 text-white"
                        placeholder="Please specify your industry"
                    />
                )}
            </div>

            <div>
                <Label htmlFor="linkedin" className="text-white">LinkedIn URL (optional)</Label>
                <Input
                    id="linkedin"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="https://linkedin.com/in/yourprofile"
                />
            </div>

            <div>
                <Label htmlFor="bio" className="text-white">Bio * (minimum 50 characters)</Label>
                <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => {
                        setBio(e.target.value);
                        setBioError(null);
                    }}
                    className={`bg-white/10 border-white/20 text-white min-h-[120px] ${bioError ? 'border-destructive' : ''}`}
                    placeholder="Tell us about yourself, your background, and what makes you unique..."
                />
                <p className="text-white/40 text-xs mt-1">{bio.length}/50 characters minimum</p>
                {bioError && (
                    <p className="text-sm text-destructive mt-1">{bioError}</p>
                )}
            </div>
        </div>
    );
};
