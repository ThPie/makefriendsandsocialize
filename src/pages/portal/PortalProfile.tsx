import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Check, Camera, X, Calendar, MapPin } from 'lucide-react';
import { PushNotificationSettings } from '@/components/portal/PushNotificationSettings';
import { EmailPreferences } from '@/components/portal/EmailPreferences';
import { ProfileCompletionIndicator } from '@/components/portal/ProfileCompletionIndicator';
import { VerificationBadge } from '@/components/portal/VerificationBadge';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';
import { COUNTRIES, getRegionsForCountry } from '@/lib/location-data';
import { format, differenceInYears, parse } from 'date-fns';
import { ImageCropper } from '@/components/admin/ImageCropper';
import { VpnBlockedModal } from '@/components/portal/VpnBlockedModal';
import { validateBio } from '@/lib/text-validation';

const INTERESTS = [
  'Networking & Business', 'Arts & Culture', 'Food & Dining', 'Travel & Adventure',
  'Fitness & Wellness', 'Sports', 'Music & Entertainment', 'Tech & Innovation',
  'Philanthropy & Volunteering', 'Wine & Spirits', 'Reading & Literature', 'Outdoor Activities'
];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Real Estate', 'Legal',
  'Marketing & Advertising', 'Consulting', 'Entertainment & Media', 'Education',
  'Hospitality', 'Retail', 'Manufacturing', 'Non-Profit', 'Government', 'Other'
];

export default function PortalProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Image cropper state
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  // Location detection state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showVpnModal, setShowVpnModal] = useState(false);
  
  // Bio validation state
  const [bioError, setBioError] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setDateOfBirth(profile.date_of_birth || '');
      setBio(profile.bio || '');
      setJobTitle(profile.job_title || '');
      setIndustry(profile.industry || '');
      setSelectedInterests(profile.interests || []);
      setAvatarUrls(profile.avatar_urls || []);
      setIsVisible(profile.is_visible || false);
      setCountry(profile.country || '');
      setState(profile.state || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    try {
      const birthDate = parse(dob, 'yyyy-MM-dd', new Date());
      return differenceInYears(new Date(), birthDate);
    } catch {
      return 0;
    }
  };

  const validateAge = (): boolean => {
    if (!dateOfBirth) return true; // Allow empty during editing
    const age = calculateAge(dateOfBirth);
    return age >= 21;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate age if DOB is provided
    if (dateOfBirth && !validateAge()) {
      toast.error('You must be at least 21 years old to join');
      return;
    }

    // Validate bio for gibberish
    if (bio.trim()) {
      const bioValidationError = validateBio(bio, 20);
      if (bioValidationError) {
        setBioError(bioValidationError);
        toast.error(bioValidationError);
        return;
      }
    }
    setBioError(null);

    setIsSubmitting(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        bio,
        job_title: jobTitle,
        industry,
        interests: selectedInterests,
        avatar_urls: avatarUrls,
        is_visible: isVisible,
        country,
        state,
        city,
      })
      .eq('id', user.id);

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    await refreshProfile();
    toast.success('Profile updated successfully');
  };

  // Handle location detection
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-location');
      
      if (error) {
        console.error('Location detection error:', error);
        toast.error('Failed to detect location');
        return;
      }
      
      // Check for VPN/proxy
      if (data?.isVpn) {
        setShowVpnModal(true);
        return;
      }
      
      if (data?.success) {
        if (data.country) setCountry(data.country);
        if (data.state) setState(data.state);
        if (data.city) setCity(data.city);
        toast.success('Location detected successfully');
      } else {
        toast.error('Could not detect your location');
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      toast.error('Failed to detect location');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Reset input so same file can be selected again
    e.target.value = '';

    if (avatarUrls.length >= 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Open cropper instead of uploading directly
    const imageUrl = URL.createObjectURL(file);
    setCropperImage(imageUrl);
    setPendingFile(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;
    
    setIsUploading(true);
    setCropperImage(null);

    try {
      const fileName = `${user.id}/${Date.now()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, croppedBlob, {
          contentType: 'image/webp',
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setAvatarUrls(prev => [...prev, publicUrl]);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
      setPendingFile(null);
    }
  };

  const handleCropCancel = () => {
    if (cropperImage) {
      URL.revokeObjectURL(cropperImage);
    }
    setCropperImage(null);
    setPendingFile(null);
  };

  const handleCropSkip = async () => {
    if (!pendingFile || !user) return;
    
    setIsUploading(true);
    setCropperImage(null);

    try {
      const fileExt = pendingFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, pendingFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setAvatarUrls(prev => [...prev, publicUrl]);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
      setPendingFile(null);
    }
  };

  const removePhoto = async (index: number) => {
    const urlToRemove = avatarUrls[index];
    
    // Extract file path from URL for deletion
    try {
      const url = new URL(urlToRemove);
      const pathParts = url.pathname.split('/profile-photos/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage
          .from('profile-photos')
          .remove([filePath]);
      }
    } catch (error) {
      console.error('Error removing file from storage:', error);
    }

    setAvatarUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || 'M';

  // Build profile data for completion indicator
  const profileData = {
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dateOfBirth,
    avatar_urls: avatarUrls,
    bio,
    job_title: jobTitle,
    industry,
    interests: selectedInterests,
    city,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2 flex items-center gap-2">
          My Profile
          <VerificationBadge 
            isVerified={profile?.is_security_verified || false} 
            verifiedAt={profile?.verified_at}
            size="lg"
          />
        </h1>
        <p className="text-muted-foreground">
          Build your profile to connect with our community
        </p>
      </div>

      {/* Profile Completion Indicator */}
      <ProfileCompletionIndicator profile={profileData} />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photos Section */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Profile Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Existing photos - using img tag for better display control */}
              {avatarUrls.map((url, index) => (
                <div key={index} className="relative group h-32 w-32 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={`Profile photo ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Fallback behind the image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground -z-10">
                    {initials}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {avatarUrls.length < 3 && (
                <label className="h-32 w-32 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Upload up to 3 high-quality photos. Portrait orientation recommended.
            </p>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  setBioError(null); // Clear error on change
                }}
                className={`min-h-[100px] ${bioError ? 'border-destructive' : ''}`}
              />
              {bioError && (
                <p className="text-sm text-destructive">{bioError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select your interests (choose at least 2)</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedInterests.includes(interest)
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
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl">Location</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={detectLocation}
                disabled={isDetectingLocation}
              >
                {isDetectingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                Detect My Location
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <LocationCombobox
                  value={country}
                  onValueChange={(value) => {
                    setCountry(value);
                    // Reset state when country changes
                    if (value !== country) {
                      setState('');
                    }
                  }}
                  options={COUNTRIES}
                  placeholder="Select country"
                  searchPlaceholder="Search countries..."
                  emptyMessage="No countries found."
                  allowCustom={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                {getRegionsForCountry(country).length > 0 ? (
                  <LocationCombobox
                    value={state}
                    onValueChange={setState}
                    options={getRegionsForCountry(country)}
                    placeholder="Select state"
                    searchPlaceholder="Search states..."
                    emptyMessage="No states found."
                    allowCustom={true}
                  />
                ) : (
                  <Input
                    id="state"
                    placeholder="State / Province"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <CityAutocomplete
                  value={city}
                  onValueChange={setCity}
                  country={country}
                  state={state}
                  placeholder="Search for a city..."
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your location helps us connect you with nearby members and events.
            </p>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Profile Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="text-foreground font-medium">Make my profile visible to other members</p>
                <p className="text-sm text-muted-foreground">
                  When enabled, Fellow and Founder members can discover your profile
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Email Preferences */}
        <EmailPreferences />

        {/* Push Notifications */}
        <PushNotificationSettings />

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || (dateOfBirth && !validateAge())} size="lg">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          imageUrl={cropperImage}
          isOpen={!!cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onSkip={handleCropSkip}
        />
      )}

      {/* VPN Blocked Modal */}
      <VpnBlockedModal isOpen={showVpnModal} />
    </div>
  );
}
