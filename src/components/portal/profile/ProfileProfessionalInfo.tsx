import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationCombobox } from "@/components/ui/location-combobox";

const INDUSTRIES = [
    'Technology', 'Finance & Banking', 'Healthcare', 'Real Estate', 'Legal',
    'Marketing & Advertising', 'Consulting', 'Entertainment & Media', 'Education',
    'Hospitality', 'Retail', 'Manufacturing', 'Non-Profit', 'Government', 'Other'
];

interface ProfileProfessionalInfoProps {
    jobTitle: string;
    setJobTitle: (value: string) => void;
    industry: string;
    setIndustry: (value: string) => void;
}

export const ProfileProfessionalInfo = ({
    jobTitle,
    setJobTitle,
    industry,
    setIndustry,
}: ProfileProfessionalInfoProps) => {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h2 className="font-display text-xl text-foreground mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                        id="jobTitle"
                        placeholder="e.g., Software Engineer, Marketing Director"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <LocationCombobox
                        value={industry}
                        onValueChange={setIndustry}
                        options={INDUSTRIES}
                        placeholder="Select industry"
                        searchPlaceholder="Search industries..."
                        emptyMessage="No industries found."
                        allowCustom={true}
                    />
                </div>
            </div>
        </div>
    );
};
