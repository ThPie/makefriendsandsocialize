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
import { ArrowLeft, ArrowRight, Check, Loader2, Camera, User, Briefcase, Heart, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, getRegionsForCountry } from '@/lib/location-data';

const INTERESTS = [
  'Arts & Culture', 'Fine Dining & Wine', 'Travel & Adventure', 'Entrepreneurship',
  'Wellness & Mindfulness', 'Music & Nightlife', 'Philanthropy', 'Fashion & Design',
  'Technology & Innovation', 'Sports & Fitness', 'Photography', 'Reading & Literature'
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Real Estate', 'Media & Entertainment',
  'Consulting', 'Legal', 'Education', 'Hospitality', 'Retail',
  'Manufacturing', 'Non-Profit', 'Government', 'Other'
];

const COMMUNITY_GOALS = [
  { id: 'networking', label: 'Professional Networking' },
  { id: 'business', label: 'Business Growth & Partnerships' },
  { id: 'social', label: 'Social Connections & Friendships' },
  { id: 'learning', label: 'Learning & Personal Development' },
  { id: 'events', label: 'Access to Exclusive Events' },
  { id: 'dating', label: 'Dating & Romance' },
];

const TARGET_INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Real Estate', 'Media',
  'Consulting', 'Legal', 'Education', 'Hospitality', 'Creative Arts'
];

export default function PortalOnboarding() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [showVpnModal, setShowVpnModal] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const totalSteps = 5;

  // Step 1: Basic Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

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
      setDateOfBirth(profile.date_of_birth || '');
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
        
        console.log('Location detection result:', data);
        
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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
        if (dateOfBirth) {
          const age = calculateAge(dateOfBirth);
          if (age < 21) {
            toast.error('You must be 21 or older to join');
            return false;
          }
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
          date_of_birth: dateOfBirth || null,
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
          date_of_birth: dateOfBirth || null,
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

      await refreshProfile();
      toast.success('Profile completed! Your application is being reviewed.');
      navigate('/auth/waiting');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    if (photos.length >= 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

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

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl text-white mb-2">Welcome! Let's get started</h1>
              <p className="text-white/60">Tell us a bit about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-white">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Profile Photo</Label>
              <div className="flex gap-4 items-center">
                {photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <label className="w-20 h-20 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 text-white/60" />
                        <span className="text-xs text-white/60 mt-1">Add</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
              <p className="text-white/40 text-xs mt-2">Add up to 3 photos (optional but recommended)</p>
            </div>

            {isDetectingLocation ? (
              <div className="flex items-center gap-2 text-white/60 text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Detecting your location...</span>
              </div>
            ) : (
              <>
                {locationDetected && (country || city) && (
                  <div className="flex items-center gap-2 text-primary text-sm mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location detected - you can adjust if needed</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Country</Label>
                    <LocationCombobox
                      value={country}
                      onValueChange={(val) => {
                        setCountry(val);
                        setState('');
                        setCity('');
                      }}
                      options={countries}
                      placeholder="Select country"
                      searchPlaceholder="Search countries..."
                    />
                  </div>
                  <div>
                    <Label className="text-white">State/Province</Label>
                    <LocationCombobox
                      value={state}
                      onValueChange={setState}
                      options={states}
                      placeholder="Select state"
                      searchPlaceholder="Search states..."
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">City *</Label>
                  <CityAutocomplete
                    value={city}
                    onValueChange={setCity}
                    country={country}
                    state={state}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 2:
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
                onChange={(e) => setBio(e.target.value)}
                className="bg-white/10 border-white/20 text-white min-h-[120px]"
                placeholder="Tell us about yourself, your background, and what makes you unique..."
              />
              <p className="text-white/40 text-xs mt-1">{bio.length}/50 characters minimum</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl text-white mb-2">Community Goals</h1>
              <p className="text-white/60">What are you looking to get out of the community?</p>
            </div>

            <div>
              <Label className="text-white mb-3 block">Why are you joining? *</Label>
              <div className="grid grid-cols-2 gap-3">
                {COMMUNITY_GOALS.map((goal) => (
                  <div
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      communityGoals.includes(goal.id)
                        ? 'bg-primary/20 border-primary text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {communityGoals.includes(goal.id) && <Check className="h-4 w-4 text-primary" />}
                      <span className="text-sm">{goal.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white mb-3 block">Industries you want to connect with</Label>
              <div className="flex flex-wrap gap-2">
                {TARGET_INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleTargetIndustry(ind)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      targetIndustries.includes(ind)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="offering" className="text-white">What can you offer the community? (optional)</Label>
              <Textarea
                id="offering"
                value={communityOffering}
                onChange={(e) => setCommunityOffering(e.target.value)}
                className="bg-white/10 border-white/20 text-white min-h-[100px]"
                placeholder="Share your expertise, mentorship opportunities, or unique value you can bring..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl text-white mb-2">Your Interests</h1>
              <p className="text-white/60">Select at least 3 interests to help us match you with like-minded members</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    interests.includes(interest)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-white/40 text-sm">{interests.length} selected (minimum 3)</p>

            <div>
              <Label htmlFor="dob" className="text-white">Date of Birth (21+ required)</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl text-white mb-2">Almost Done!</h1>
              <p className="text-white/60">Review your profile and submit your application</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                {photos[0] ? (
                  <img src={photos[0]} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-white font-medium text-lg">{firstName} {lastName}</h3>
                  <p className="text-white/60">{jobTitle} at {company}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Location:</span>
                  <p className="text-white">{city}{state ? `, ${state}` : ''}</p>
                </div>
                <div>
                  <span className="text-white/40">Industry:</span>
                  <p className="text-white">{industry === 'Other' ? customIndustry : industry}</p>
                </div>
              </div>

              {bio && (
                <div>
                  <span className="text-white/40 text-sm">Bio:</span>
                  <p className="text-white text-sm line-clamp-2">{bio}</p>
                </div>
              )}

              {interests.length > 0 && (
                <div>
                  <span className="text-white/40 text-sm">Interests:</span>
                  <p className="text-white text-sm">{interests.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 pt-4">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-1 border-white/30"
              />
              <label htmlFor="terms" className="text-white/70 text-sm leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>.
                I understand that my application will be reviewed by the membership committee.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <VpnBlockedModal isOpen={showVpnModal} />
      
      <PortalOnboardingLayout currentStep={step} totalSteps={totalSteps}>
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
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

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
    </>
  );
}
