import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalOnboardingLayout } from '@/components/portal/PortalOnboardingLayout';
import { VpnBlockedModal } from '@/components/portal/VpnBlockedModal';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';
import { BrandedLoader } from '@/components/ui/branded-loader';
import { ImageCropper } from '@/components/admin/ImageCropper';
import { ArrowLeft, ArrowRight, Check, Loader2, Camera, User, Briefcase, Heart, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, getRegionsForCountry } from '@/lib/location-data';
import { validateBio } from '@/lib/text-validation';

import { BasicInfoStep } from '@/components/portal/onboarding/BasicInfoStep';
import { ProfessionalStep } from '@/components/portal/onboarding/ProfessionalStep';
import { GoalsStep } from '@/components/portal/onboarding/GoalsStep';
import { InterestsStep } from '@/components/portal/onboarding/InterestsStep';
import { ReviewStep } from '@/components/portal/onboarding/ReviewStep';
import { INDUSTRIES, COMMUNITY_GOALS, TARGET_INDUSTRIES, INTERESTS } from '@/constants/onboarding';

export default function PortalOnboarding() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidatingPhoto, setIsValidatingPhoto] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [showVpnModal, setShowVpnModal] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const totalSteps = 5;

  // Image cropper state
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Bio validation state
  const [bioError, setBioError] = useState<string | null>(null);

  // Step 1: Basic Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');

  // Step 2: Professional Info
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [bio, setBio] = useState('');

  // Step 3: Community Goals
  const [communityGoals, setCommunityGoals] = useState<string[]>([]);
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [communityOffering, setCommunityOffering] = useState('');

  // Step 4: Interests
  const [interests, setInterests] = useState<string[]>([]);

  // Step 5: Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const countries = COUNTRIES;
  const states = country ? getRegionsForCountry(country) : [];

  // Pre-fill from existing profile and restore saved step
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhotos(profile.avatar_urls || []);
      setCountry(profile.country || '');
      setState(profile.state || '');
      setCity(profile.city || '');
      // Derive age from stored date_of_birth
      if (profile.date_of_birth) {
        const birthYear = new Date(profile.date_of_birth).getFullYear();
        const derivedAge = new Date().getFullYear() - birthYear;
        setAge(String(derivedAge));
      }
      setJobTitle(profile.job_title || '');
      setIndustry(profile.industry || '');
      setBio(profile.bio || '');
      setInterests(profile.interests || []);
      setCompany(profile.company || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setCommunityGoals(profile.community_goals || []);
      setTargetIndustries(profile.target_industries || []);
      setCommunityOffering(profile.community_offering || '');

      // Restore saved step (progress persistence)
      if (profile.onboarding_step && profile.onboarding_step > 1) {
        setStep(profile.onboarding_step);
      }

      // If location is already set, mark as detected
      if (profile.country || profile.city) {
        setLocationDetected(true);
      }
    }
  }, [profile]);

  // Detect location and check for VPN on mount
  useEffect(() => {
    const detectLocation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.functions.invoke('detect-location');

        if (import.meta.env.DEV) console.log('Location detection result:', data);

        if (error) {
          console.error('Location detection error:', error);
          setIsDetectingLocation(false);
          return;
        }

        // Check for VPN/proxy
        if (data?.isVpn) {
          setShowVpnModal(true);
          setIsDetectingLocation(false);
          return;
        }

        // Only auto-fill if user hasn't already set values
        if (!locationDetected && data?.success) {
          if (data.country && !country) {
            setCountry(data.country);
          }
          if (data.state && !state) {
            setState(data.state);
          }
          if (data.city && !city) {
            setCity(data.city);
          }
          setLocationDetected(true);
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        // Silent failure - user can still enter manually
      } finally {
        setIsDetectingLocation(false);
      }
    };

    if (user && !locationDetected) {
      detectLocation();
    } else {
      setIsDetectingLocation(false);
    }
  }, [user, locationDetected]);

  // Auth redirect handled synchronously in render below



  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!firstName.trim() || !lastName.trim()) {
          toast.error('Please enter your full name');
          return false;
        }
        if (!city.trim()) {
          toast.error('Please enter your city');
          return false;
        }
        return true;
      case 2:
        if (!jobTitle.trim()) {
          toast.error('Please enter your job title');
          return false;
        }
        if (!company.trim()) {
          toast.error('Please enter your company or organization');
          return false;
        }
        if (!industry) {
          toast.error('Please select your industry');
          return false;
        }
        if (industry === 'Other' && !customIndustry.trim()) {
          toast.error('Please specify your industry');
          return false;
        }
        if (!bio.trim() || bio.length < 50) {
          toast.error('Please write a bio (at least 50 characters)');
          return false;
        }
        // Validate bio for gibberish
        const bioValidationError = validateBio(bio, 50);
        if (bioValidationError) {
          setBioError(bioValidationError);
          toast.error(bioValidationError);
          return false;
        }
        setBioError(null);
        return true;
      case 3:
        if (communityGoals.length === 0) {
          toast.error('Please select at least one community goal');
          return false;
        }
        return true;
      case 4:
        if (interests.length < 3) {
          toast.error('Please select at least 3 interests');
          return false;
        }
        if (age && Number(age) < 21) {
          toast.error('You must be 21 or older to join');
          return false;
        }
        return true;
      case 5:
        if (!acceptedTerms) {
          toast.error('Please accept the terms and privacy policy');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    // Save progress at each step
    await saveProgress();

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const saveProgress = async () => {
    if (!user) return;

    const finalIndustry = industry === 'Other' ? customIndustry : industry;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_urls: photos,
          country,
          state,
          city,
          date_of_birth: age ? `${new Date().getFullYear() - Number(age)}-01-01` : null,
          job_title: jobTitle,
          company,
          industry: finalIndustry,
          linkedin_url: linkedinUrl || null,
          bio,
          community_goals: communityGoals,
          target_industries: targetIndustries,
          community_offering: communityOffering || null,
          interests,
          onboarding_step: step, // Persist current step for resume capability
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const finalIndustry = industry === 'Other' ? customIndustry : industry;

      // Update profile with all data and mark as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_urls: photos,
          country,
          state,
          city,
          date_of_birth: age ? `${new Date().getFullYear() - Number(age)}-01-01` : null,
          job_title: jobTitle,
          company,
          industry: finalIndustry,
          linkedin_url: linkedinUrl || null,
          bio,
          community_goals: communityGoals,
          target_industries: targetIndustries,
          community_offering: communityOffering || null,
          interests,
          onboarding_completed: true,
          profile_completed_at: new Date().toISOString(),
          terms_accepted_at: new Date().toISOString(),
          is_visible: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Check if user already has an application entry
      const { data: existingApp } = await supabase
        .from('application_waitlist')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingApp) {
        // Create application entry
        const { error: appError } = await supabase
          .from('application_waitlist')
          .insert({
            user_id: user.id,
            status: 'pending',
            interests,
            community_goals: communityGoals,
          });

        if (appError) throw appError;
      }

      // Send profile complete notification email
      try {
        await supabase.functions.invoke('send-profile-notification', {
          body: { user_id: user.id, notification_type: 'profile_complete' },
        });
      } catch (emailErr) {
        console.error('Failed to send notification email:', emailErr);
        // Non-critical, continue
      }

      await refreshProfile();
      toast.success('✅ Application submitted! Check your email for confirmation.');
      navigate('/auth/waiting');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    if (photos.length >= 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    const file = e.target.files[0];
    e.target.value = ''; // Reset input so same file can be selected again

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // AI-powered photo validation
    setIsValidatingPhoto(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: 'Does this image show a real photograph of a real human person? Answer ONLY with: REAL_PERSON or NOT_REAL_PERSON. Say NOT_REAL_PERSON if the image is AI-generated, a cartoon, an avatar, an animal, an object, or has no visible human face.' },
                { type: 'image_url', image_url: { url: base64 } }
              ]
            }],
          }),
        });

        const aiData = await response.json();
        const answer = aiData?.choices?.[0]?.message?.content?.trim();

        if (answer !== 'REAL_PERSON') {
          toast.error('Please upload a real photo of yourself. AI-generated images, avatars, and non-human photos are not accepted.');
          setIsValidatingPhoto(false);
          return;
        }
      } catch (err) {
        // If AI check fails, fail open so users aren't blocked
        console.error('Photo validation failed:', err);
      }

      // Proceed to cropper
      const imageUrl = URL.createObjectURL(file);
      setCropperImage(imageUrl);
      setPendingFile(file);
      setIsValidatingPhoto(false);
    };
    reader.readAsDataURL(file);
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

      setPhotos([...photos, publicUrl]);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
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

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setPhotos([...photos, publicUrl]);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
      setPendingFile(null);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const toggleGoal = (goal: string) => {
    if (communityGoals.includes(goal)) {
      setCommunityGoals(communityGoals.filter(g => g !== goal));
    } else {
      setCommunityGoals([...communityGoals, goal]);
    }
  };

  const toggleTargetIndustry = (ind: string) => {
    if (targetIndustries.includes(ind)) {
      setTargetIndustries(targetIndustries.filter(i => i !== ind));
    } else {
      setTargetIndustries([...targetIndustries, ind]);
    }
  };

  if (authLoading) {
    return <BrandedLoader message="Loading..." />;
  }

  // Redirect unauthenticated users immediately — no flash, no toast
  if (!user) {
    navigate('/auth', { replace: true });
    return null;
  }

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <BasicInfoStep
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            photos={photos}
            isUploading={isUploading}
            isValidatingPhoto={isValidatingPhoto}
            handlePhotoSelect={handlePhotoSelect}
            removePhoto={removePhoto}
            isDetectingLocation={isDetectingLocation}
            locationDetected={locationDetected}
            country={country}
            setCountry={setCountry}
            state={state}
            setState={setState}
            city={city}
            setCity={setCity}
            countries={countries}
            states={states}
          />
        );

      case 2:
        return (
          <ProfessionalStep
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            company={company}
            setCompany={setCompany}
            industry={industry}
            setIndustry={setIndustry}
            customIndustry={customIndustry}
            setCustomIndustry={setCustomIndustry}
            linkedinUrl={linkedinUrl}
            setLinkedinUrl={setLinkedinUrl}
            bio={bio}
            setBio={setBio}
            bioError={bioError}
            setBioError={setBioError}
          />
        );

      case 3:
        return (
          <GoalsStep
            communityGoals={communityGoals}
            toggleGoal={toggleGoal}
            targetIndustries={targetIndustries}
            toggleTargetIndustry={toggleTargetIndustry}
            communityOffering={communityOffering}
            setCommunityOffering={setCommunityOffering}
          />
        );

      case 4:
        return (
          <InterestsStep
            interests={interests}
            toggleInterest={toggleInterest}
            age={age}
            setAge={setAge}
          />
        );

      case 5:
        return (
          <ReviewStep
            firstName={firstName}
            lastName={lastName}
            jobTitle={jobTitle}
            company={company}
            industry={industry}
            customIndustry={customIndustry}
            city={city}
            state={state}
            bio={bio}
            interests={interests}
            photos={photos}
            acceptedTerms={acceptedTerms}
            setAcceptedTerms={setAcceptedTerms}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <VpnBlockedModal isOpen={showVpnModal} />

      <PortalOnboardingLayout currentStep={step} totalSteps={totalSteps}>
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {stepContent()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : step === totalSteps ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {step === totalSteps ? 'Submit Application' : 'Continue'}
            </Button>
          </div>
        </div>
      </PortalOnboardingLayout>

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
    </>
  );
}
