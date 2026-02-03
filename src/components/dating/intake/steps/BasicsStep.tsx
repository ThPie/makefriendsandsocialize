/**
 * Step 1: The Basics
 * Basic profile information, photo, demographics, and social media verification
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Camera, Upload, MapPin } from 'lucide-react';
import { VoiceBioRecorder } from '@/components/dating/VoiceBioRecorder';
import type { IntakeFormContext } from '../useIntakeForm';

interface BasicsStepProps {
    form: IntakeFormContext;
    profile?: {
        city?: string | null;
        state?: string | null;
        country?: string | null;
    } | null;
}

export const BasicsStep = ({ form, profile }: BasicsStepProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { formData, updateField, uploadPhoto, isUploading } = form;

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadPhoto(file);
        }
    };

    return (
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <User className="h-6 w-6 text-dating-terracotta" />
                    The Basics
                </CardTitle>
                <CardDescription>
                    Tell us about yourself, who you're looking to meet, and how we can verify your profile.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Photo Upload - Required */}
                <div className="flex flex-col items-center gap-4">
                    <Avatar className={`h-32 w-32 border-4 ${formData.photo_url ? 'border-green-500/40' : 'border-dating-terracotta/20'}`}>
                        <AvatarImage src={formData.photo_url} />
                        <AvatarFallback className="bg-dating-terracotta/10 text-dating-terracotta text-3xl">
                            {formData.display_name ? formData.display_name[0] : <Camera className="h-10 w-10" />}
                        </AvatarFallback>
                    </Avatar>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        aria-label="Upload profile photo"
                    />
                    <Button
                        type="button"
                        variant={formData.photo_url ? "outline" : "default"}
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2"
                        aria-label={formData.photo_url ? "Change photo" : "Upload photo"}
                    >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        {isUploading ? "Uploading..." : formData.photo_url ? "Change Photo" : "Upload Photo *"}
                    </Button>
                    <p className="text-xs text-muted-foreground">Required for verification • Max 5MB</p>
                    {!formData.photo_url && (
                        <p className="text-xs text-dating-terracotta">A photo is required to proceed</p>
                    )}
                </div>

                {/* Name and Age */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="display_name">Full Name *</Label>
                        <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) => updateField("display_name", e.target.value)}
                            placeholder="Your name"
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Age *</Label>
                        <Input
                            id="age"
                            type="number"
                            min={18}
                            max={100}
                            value={formData.age}
                            onChange={(e) => updateField("age", parseInt(e.target.value) || 18)}
                            className="bg-background/50"
                        />
                    </div>
                </div>

                {/* Gender Selection */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>I am a *</Label>
                        <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Man">Man</SelectItem>
                                <SelectItem value="Woman">Woman</SelectItem>
                                <SelectItem value="Non-binary">Non-binary</SelectItem>
                                <SelectItem value="Trans Man">Trans Man</SelectItem>
                                <SelectItem value="Trans Woman">Trans Woman</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>I want to meet *</Label>
                        <Select value={formData.target_gender} onValueChange={(value) => updateField("target_gender", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Men">Men</SelectItem>
                                <SelectItem value="Women">Women</SelectItem>
                                <SelectItem value="Everyone">Everyone</SelectItem>
                                <SelectItem value="Non-binary">Non-binary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Relationship Type */}
                <div className="space-y-3">
                    <Label>What type of relationship are you looking for? *</Label>
                    <Select value={formData.relationship_type} onValueChange={(value) => updateField("relationship_type", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select relationship type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="casual">Casual dating - seeing where things go</SelectItem>
                            <SelectItem value="serious">Serious relationship - looking for a partner</SelectItem>
                            <SelectItem value="marriage">Marriage-minded - looking for "the one"</SelectItem>
                            <SelectItem value="open">Open to see - depends on the connection</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Age Range Preference */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Preferred Age Range</Label>
                        <div className="flex items-center gap-2">
                            <span className="bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded text-sm font-medium">
                                {formData.age_range_min}
                            </span>
                            <span className="text-muted-foreground">to</span>
                            <span className="bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded text-sm font-medium">
                                {formData.age_range_max}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Drag both handles to set your preferred age range
                    </p>
                    <div className="px-2">
                        <Slider
                            value={[formData.age_range_min, formData.age_range_max]}
                            onValueChange={([min, max]) => {
                                updateField("age_range_min", min);
                                updateField("age_range_max", max);
                            }}
                            min={18}
                            max={80}
                            step={1}
                            className="py-4"
                            aria-label="Age range preference"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>18</span>
                            <span>80</span>
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                    <div>
                        <Label className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-dating-terracotta" aria-hidden="true" />
                            Your Location
                        </Label>
                        {profile?.city || profile?.state || profile?.country ? (
                            <p className="text-foreground font-medium mt-2">
                                {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                            </p>
                        ) : (
                            <p className="text-muted-foreground mt-2">No location set</p>
                        )}
                        <Link
                            to="/portal/profile"
                            className="text-sm text-dating-terracotta hover:underline mt-1 inline-block"
                        >
                            Edit your location in your profile →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <Label>Search Radius: {formData.search_radius} miles</Label>
                        <p className="text-sm text-muted-foreground">
                            We'll prioritize matches within this distance.
                        </p>
                        <div className="px-2">
                            <Slider
                                value={[formData.search_radius]}
                                onValueChange={([value]) => updateField("search_radius", value)}
                                min={10}
                                max={100}
                                step={5}
                                className="py-4"
                                aria-label="Search radius"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>10 miles</span>
                                <span>100 miles</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Occupation */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                            id="occupation"
                            value={formData.occupation}
                            onChange={(e) => updateField("occupation", e.target.value)}
                            placeholder="What do you do?"
                            className="bg-background/50"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="bio">Short Bio</Label>
                        <VoiceBioRecorder
                            currentBio={formData.bio}
                            onBioUpdate={(bio) => updateField("bio", bio)}
                        />
                    </div>
                    <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                        placeholder="A few sentences about yourself... or use the microphone to record!"
                        className="min-h-[80px] bg-background/50"
                    />
                </div>

                {/* Social Media Links */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                    <div>
                        <Label className="text-base">Social Media Profiles</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                            Help us verify your identity. We'll review these privately and keep them confidential.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="linkedin_url">LinkedIn</Label>
                            <Input
                                id="linkedin_url"
                                value={formData.linkedin_url}
                                onChange={(e) => updateField("linkedin_url", e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram_url">Instagram</Label>
                            <Input
                                id="instagram_url"
                                value={formData.instagram_url}
                                onChange={(e) => updateField("instagram_url", e.target.value)}
                                placeholder="https://instagram.com/..."
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facebook_url">Facebook</Label>
                            <Input
                                id="facebook_url"
                                value={formData.facebook_url}
                                onChange={(e) => updateField("facebook_url", e.target.value)}
                                placeholder="https://facebook.com/..."
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twitter_url">X (Twitter)</Label>
                            <Input
                                id="twitter_url"
                                value={formData.twitter_url}
                                onChange={(e) => updateField("twitter_url", e.target.value)}
                                placeholder="https://x.com/..."
                                className="bg-background/50"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </>
    );
};
