import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface ProfileBasicInfoProps {
    firstName: string;
    setFirstName: (value: string) => void;
    lastName: string;
    setLastName: (value: string) => void;
    dateOfBirth: string;
    setDateOfBirth: (value: string) => void;
    bio: string;
    setBio: (value: string) => void;
    bioError: string | null;
    setBioError: (value: string | null) => void;
    calculateAge: (dob: string) => number;
    validateAge: () => boolean;
}

export const ProfileBasicInfo = ({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    dateOfBirth,
    setDateOfBirth,
    bio,
    setBio,
    bioError,
    setBioError,
    calculateAge,
    validateAge,
}: ProfileBasicInfoProps) => {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
            <h2 className="font-display text-xl text-foreground mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth * (Must be 21+)
                </Label>
                <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={format(new Date(new Date().setFullYear(new Date().getFullYear() - 21)), 'yyyy-MM-dd')}
                    className="max-w-xs"
                />
                {dateOfBirth && !validateAge() && (
                    <p className="text-sm text-destructive">You must be at least 21 years old to join.</p>
                )}
                {dateOfBirth && validateAge() && (
                    <p className="text-sm text-muted-foreground">Age: {calculateAge(dateOfBirth)} years old</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">About Me</Label>
                <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and what you're looking for in this community..."
                    value={bio}
                    onChange={(e) => {
                        setBio(e.target.value);
                        setBioError(null);
                    }}
                    className={`min-h-[100px] ${bioError ? 'border-destructive' : ''}`}
                />
                {bioError && (
                    <p className="text-sm text-destructive">{bioError}</p>
                )}
            </div>
        </div>
    );
};
