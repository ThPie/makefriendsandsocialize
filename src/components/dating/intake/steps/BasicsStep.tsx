/**
 * Step 1: The Basics
 * Basic profile information, photo, demographics, and social media verification
 */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Camera, Upload, MapPin, Sparkles, ImagePlus } from 'lucide-react';
import { VoiceBioRecorder } from '@/components/dating/VoiceBioRecorder';
import type { IntakeFormContext } from '../useIntakeForm';
import { cn } from '@/lib/utils';

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
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const { formData, updateField, uploadPhoto, isUploading, fieldErrors } = form;

    // Detect mobile/tablet for showing camera button
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadPhoto(file);
        }
        // Reset input so same file can be re-selected
        event.target.value = '';
    };

    // Helper for error styling
    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];

    const inputErrorClass = (field: string) =>
        hasError(field)
            ? 'border-red-500/70 ring-1 ring-red-500/30 focus:border-red-500 focus:ring-red-500/30'
            : 'border-white/10 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20';

    const selectErrorClass = (field: string) =>
        hasError(field)
            ? 'border-red-500/70 ring-1 ring-red-500/30 focus:ring-red-500/30 focus:border-red-500'
            : 'border-white/10 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="text-center pb-8 border-b border-white/10">
                <div className="mx-auto w-12 h-12 bg-dating-terracotta/20 rounded-full flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-dating-terracotta" />
                </div>
                <CardTitle className="font-display text-3xl text-white mb-2">
                    The Basics
                </CardTitle>
                <CardDescription className="text-white/60 text-base max-w-md mx-auto">
                    Let's start your journey. Tell us who you are and what you're looking for.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-10 pt-8">
                {/* Photo Upload - Centered & Premium */}
                <div className="flex flex-col items-center gap-6">
                    <div className={cn(
                        "relative group cursor-pointer",
                        hasError('photo_url') && "animate-pulse"
                    )} onClick={() => fileInputRef.current?.click()}>
                        <div className={cn(
                            "absolute inset-0 rounded-full blur-xl opacity-20 transition-opacity duration-500 group-hover:opacity-40",
                            hasError('photo_url') ? "bg-red-500 opacity-40" :
                                formData.photo_url ? "bg-green-500" : "bg-dating-terracotta"
                        )} />
                        <Avatar className={cn(
                            "h-40 w-40 border-4 transition-all duration-300",
                            hasError('photo_url')
                                ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                                : formData.photo_url
                                    ? "border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                    : "border-white/10 hover:border-dating-terracotta/50"
                        )}>
                            <AvatarImage src={formData.photo_url} className="object-cover" />
                            <AvatarFallback className="bg-[#1a231b] text-white/20 text-4xl">
                                {formData.display_name ? formData.display_name[0] : <Camera className="h-12 w-12" />}
                            </AvatarFallback>
                        </Avatar>

                        <div className={cn(
                            "absolute bottom-2 right-2 p-2 rounded-full text-[#1a231b] shadow-lg transform transition-transform duration-300 group-hover:scale-110",
                            hasError('photo_url') ? "bg-red-500" : "bg-[#D4AF37]"
                        )}>
                            {formData.photo_url ? <Sparkles className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                        </div>
                    </div>

                    {/* Hidden file input for gallery/upload */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                    />

                    {/* Hidden file input for native camera (mobile only) */}
                    {isMobile && (
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    )}

                    <div className="text-center space-y-3">
                        {/* Two buttons: Upload + Camera */}
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className={cn(
                                    "transition-all duration-300 min-w-[130px] gap-2",
                                    hasError('photo_url')
                                        ? "border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                                        : "border-dating-terracotta text-dating-terracotta hover:bg-dating-terracotta hover:text-white"
                                )}
                            >
                                <ImagePlus className="h-4 w-4" />
                                {isUploading ? "Uploading..." : "Upload Photo"}
                            </Button>

                            {/* Take Photo - only on mobile where native camera opens */}
                            {isMobile && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => cameraInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={cn(
                                        "transition-all duration-300 min-w-[130px] gap-2",
                                        hasError('photo_url')
                                            ? "border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                                            : "border-dating-terracotta text-dating-terracotta hover:bg-dating-terracotta hover:text-white"
                                    )}
                                >
                                    <Camera className="h-4 w-4" />
                                    Take Photo
                                </Button>
                            )}
                        </div>

                        {hasError('photo_url') ? (
                            <p className="text-xs text-red-400 font-medium">{errorMsg('photo_url')}</p>
                        ) : (
                            <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
                                Required • High Quality
                            </p>
                        )}
                    </div>
                </div>

                {/* Personal Information */}
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="display_name" className="text-white/80">Full Name</Label>
                        <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) => updateField("display_name", e.target.value)}
                            placeholder="e.g. James St. Patrick"
                            className={cn("bg-white/5 text-white placeholder:text-white/20 h-12", inputErrorClass('display_name'))}
                        />
                        {hasError('display_name') && (
                            <p className="text-xs text-red-400">{errorMsg('display_name')}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-white/80">Age</Label>
                        <Input
                            id="age"
                            type="number"
                            min={18}
                            max={100}
                            value={formData.age}
                            onChange={(e) => updateField("age", parseInt(e.target.value) || 18)}
                            className={cn("bg-white/5 text-white placeholder:text-white/20 h-12", inputErrorClass('age'))}
                        />
                        {hasError('age') && (
                            <p className="text-xs text-red-400">{errorMsg('age')}</p>
                        )}
                    </div>
                </div>

                {/* Gender & Preferences */}
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-white/80">I identify as</Label>
                        <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                            <SelectTrigger className={cn("bg-white/5 text-white h-12", selectErrorClass('gender'))}>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                <SelectItem value="Man" className="focus:bg-white/10 focus:text-white">Man</SelectItem>
                                <SelectItem value="Woman" className="focus:bg-white/10 focus:text-white">Woman</SelectItem>
                                <SelectItem value="Non-binary" className="focus:bg-white/10 focus:text-white">Non-binary</SelectItem>
                                <SelectItem value="Trans Man" className="focus:bg-white/10 focus:text-white">Trans Man</SelectItem>
                                <SelectItem value="Trans Woman" className="focus:bg-white/10 focus:text-white">Trans Woman</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasError('gender') && (
                            <p className="text-xs text-red-400">{errorMsg('gender')}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white/80">Interested in meeting</Label>
                        <Select value={formData.target_gender} onValueChange={(value) => updateField("target_gender", value)}>
                            <SelectTrigger className={cn("bg-white/5 text-white h-12", selectErrorClass('target_gender'))}>
                                <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                <SelectItem value="Men" className="focus:bg-white/10 focus:text-white">Men</SelectItem>
                                <SelectItem value="Women" className="focus:bg-white/10 focus:text-white">Women</SelectItem>
                                <SelectItem value="Everyone" className="focus:bg-white/10 focus:text-white">Everyone</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasError('target_gender') && (
                            <p className="text-xs text-red-400">{errorMsg('target_gender')}</p>
                        )}
                    </div>
                </div>

                {/* Relationship Type */}
                <div className={cn(
                    "space-y-3 p-6 rounded-xl bg-white/5 border transition-colors",
                    hasError('relationship_type') ? "border-red-500/50" : "border-white/10"
                )}>
                    <Label className="text-white/90 text-lg font-display">Relationship Intent</Label>
                    <Select value={formData.relationship_type} onValueChange={(value) => updateField("relationship_type", value)}>
                        <SelectTrigger className={cn("bg-transparent text-white h-12", selectErrorClass('relationship_type'))}>
                            <SelectValue placeholder="What are you looking for?" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                            <SelectItem value="serious" className="focus:bg-white/10 focus:text-white">
                                <div className="flex flex-col py-1">
                                    <span className="font-medium">Serious Relationship</span>
                                    <span className="text-xs text-white/50">Looking for a partner</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="marriage" className="focus:bg-white/10 focus:text-white">
                                <div className="flex flex-col py-1">
                                    <span className="font-medium">Marriage Minded</span>
                                    <span className="text-xs text-white/50">Ready for long-term commitment</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="casual" className="focus:bg-white/10 focus:text-white">
                                <div className="flex flex-col py-1">
                                    <span className="font-medium">Casual Dating</span>
                                    <span className="text-xs text-white/50">Seeing where things go</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {hasError('relationship_type') && (
                        <p className="text-xs text-red-400">{errorMsg('relationship_type')}</p>
                    )}
                </div>

                {/* Age Range Slider */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-white/80">Age Preference</Label>
                        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="text-[#D4AF37] font-mono font-medium">{formData.age_range_min}</span>
                            <span className="text-white/30 text-xs uppercase">to</span>
                            <span className="text-[#D4AF37] font-mono font-medium">{formData.age_range_max}</span>
                        </div>
                    </div>
                    <Slider
                        value={[formData.age_range_min, formData.age_range_max]}
                        onValueChange={([min, max]) => {
                            updateField("age_range_min", min);
                            updateField("age_range_max", max);
                        }}
                        min={18}
                        max={80}
                        step={1}
                        className="py-2"
                    />
                </div>

                {/* Location - Elegant Design */}
                <div className="space-y-6 pt-6 border-t border-white/10">
                    <div className="flex items-start justify-between">
                        <div>
                            <Label className="text-base text-white flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                                Location
                            </Label>
                            {profile?.city ? (
                                <p className="text-white/60 text-sm">
                                    Based in <span className="text-white">{[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}</span>
                                </p>
                            ) : (
                                <Link to="/portal/profile" className="text-sm text-dating-terracotta hover:text-[#D4AF37] transition-colors">
                                    Set your location in profile settings →
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-white/80 text-sm">Search Radius</Label>
                            <span className="text-xs text-white/40">{formData.search_radius} miles</span>
                        </div>
                        <Slider
                            value={[formData.search_radius]}
                            onValueChange={([value]) => updateField("search_radius", value)}
                            min={10}
                            max={100}
                            step={5}
                            className="py-2"
                        />
                    </div>
                </div>

                {/* Occupation & Bio */}
                <div className="space-y-6 pt-6 border-t border-white/10">
                    <div className="space-y-2">
                        <Label htmlFor="occupation" className="text-white/80">Occupation</Label>
                        <Input
                            id="occupation"
                            value={formData.occupation}
                            onChange={(e) => updateField("occupation", e.target.value)}
                            placeholder="e.g. Architect"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20 h-12"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="bio" className="text-white/80">Bio</Label>
                            <VoiceBioRecorder
                                currentBio={formData.bio}
                                onBioUpdate={(bio) => updateField("bio", bio)}
                            />
                        </div>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => updateField("bio", e.target.value)}
                            placeholder="Share a glimpse into your world..."
                            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20 resize-none"
                        />
                    </div>
                </div>

                {/* Social Verification - Minimalist */}
                <div className="pt-6 border-t border-white/10">
                    <Label className="text-white block mb-4">Social Verification (Private)</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            value={formData.linkedin_url}
                            onChange={(e) => updateField("linkedin_url", e.target.value)}
                            placeholder="LinkedIn URL"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10 text-sm"
                        />
                        <Input
                            value={formData.instagram_url}
                            onChange={(e) => updateField("instagram_url", e.target.value)}
                            placeholder="Instagram Handle"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10 text-sm"
                        />
                    </div>
                </div>
            </CardContent>
        </div>
    );
};
