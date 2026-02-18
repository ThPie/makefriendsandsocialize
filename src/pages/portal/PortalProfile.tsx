import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { PushNotificationSettings } from '@/components/portal/PushNotificationSettings';
import { EmailPreferences } from '@/components/portal/EmailPreferences';
import { ProfileCompletionIndicator } from '@/components/portal/ProfileCompletionIndicator';
import { VerificationBadge } from '@/components/portal/VerificationBadge';
import { differenceInYears, parse } from 'date-fns';
import { ImageCropper } from '@/components/admin/ImageCropper';
import { VpnBlockedModal } from '@/components/portal/VpnBlockedModal';
import { validateBio } from '@/lib/text-validation';
import { ProfilePhotoSection } from '@/components/portal/profile/ProfilePhotoSection';
import { ProfileBasicInfo } from '@/components/portal/profile/ProfileBasicInfo';
import { ProfileProfessionalInfo } from '@/components/portal/profile/ProfileProfessionalInfo';
import { ProfileInterestsSection } from '@/components/portal/profile/ProfileInterestsSection';
import { ProfileLocationSection } from '@/components/portal/profile/ProfileLocationSection';
import { VibeClipUpload } from '@/components/portal/VibeClipUpload';

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
    if (!dateOfBirth) return true;
    const age = calculateAge(dateOfBirth);
    return age >= 21;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (dateOfBirth && !validateAge()) {
      toast.error('You must be at least 21 years old to join');
      return;
    }

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

    e.target.value = '';

    if (avatarUrls.length >= 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

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

      if (uploadError) throw uploadError;

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
    if (cropperImage) URL.revokeObjectURL(cropperImage);
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

      if (uploadError) throw uploadError;

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

      <ProfileCompletionIndicator profile={profileData} />

      <form onSubmit={handleSubmit} className="space-y-8">
        <ProfilePhotoSection
          avatarUrls={avatarUrls}
          isUploading={isUploading}
          initials={initials}
          handleImageSelect={handleImageSelect}
          removePhoto={removePhoto}
        />

        <ProfileBasicInfo
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          bio={bio}
          setBio={setBio}
          bioError={bioError}
          setBioError={setBioError}
          calculateAge={calculateAge}
          validateAge={validateAge}
        />

        <ProfileProfessionalInfo
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          industry={industry}
          setIndustry={setIndustry}
        />

        <ProfileInterestsSection
          selectedInterests={selectedInterests}
          toggleInterest={toggleInterest}
        />

        <ProfileLocationSection
          country={country}
          setCountry={setCountry}
          state={state}
          setState={setState}
          city={city}
          setCity={setCity}
          isDetectingLocation={isDetectingLocation}
          detectLocation={detectLocation}
        />

        {/* Vibe Clip Section */}
        {user && (
          <VibeClipUpload
            userId={user.id}
            existingUrl={(profile as any)?.vibe_clip_url}
            status={(profile as any)?.vibe_clip_status}
          />
        )}

        {/* Visibility */}
        <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm rounded-2xl p-6">
          <h2 className="font-display text-xl text-foreground mb-4">Profile Visibility</h2>
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
        </div>

        <EmailPreferences />
        <PushNotificationSettings />

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

      {cropperImage && (
        <ImageCropper
          imageUrl={cropperImage}
          isOpen={!!cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onSkip={handleCropSkip}
        />
      )}

      <VpnBlockedModal isOpen={showVpnModal} />
    </div>
  );
}
