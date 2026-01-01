import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';
import { OnboardingStep } from './OnboardingStep';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useConfetti } from '@/hooks/useConfetti';
import { Users, Upload, X } from 'lucide-react';

const INTERESTS = [
  'Art & Culture', 'Music', 'Food & Wine', 'Travel', 'Technology',
  'Entrepreneurship', 'Fitness', 'Photography', 'Reading', 'Film',
  'Fashion', 'Investing', 'Wellness', 'Sports', 'Philanthropy'
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Real Estate', 'Media & Entertainment',
  'Consulting', 'Legal', 'Education', 'Hospitality', 'Retail',
  'Manufacturing', 'Non-Profit', 'Government', 'Other'
];

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { fireConfetti } = useConfetti();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setDateOfBirth(profile.date_of_birth || '');
      setBio(profile.bio || '');
      setJobTitle(profile.job_title || '');
      setIndustry(profile.industry || '');
      setInterests(profile.interests || []);
      setCity(profile.city || '');
      setPhotos(profile.avatar_urls || []);
    }
  }, [profile]);

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateAge = (): boolean => {
    if (!dateOfBirth) return false;
    return calculateAge(dateOfBirth) >= 21;
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploading(true);
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
        
      setPhotos(prev => [...prev, publicUrl]);
      toast.success('Photo uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const saveProgress = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName || null,
          last_name: lastName || null,
          date_of_birth: dateOfBirth || null,
          bio: bio || null,
          job_title: jobTitle || null,
          industry: industry || null,
          interests: interests,
          city: city || null,
          avatar_urls: photos,
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    await saveProgress();
    
    // Mark onboarding as complete
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
    
    fireConfetti();
    toast.success('Welcome to Make Friends and Socialize! 🎉');
    onComplete();
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      await saveProgress();
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Basic info
        return !!firstName && !!lastName && validateAge();
      case 2: // About you
        return !!bio && bio.length >= 20;
      case 3: // Interests
        return interests.length >= 2;
      case 4: // Photo
        return photos.length > 0;
      default:
        return true;
    }
  };

  const steps = [
    {
      title: 'Welcome to Make Friends and Socialize',
      description: 'Let\'s set up your profile so you can connect with like-minded members',
      content: (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-6"
          >
            ✨
          </motion.div>
          <p className="text-muted-foreground max-w-md">
            A complete profile helps you stand out and make meaningful connections.
            This will only take a few minutes.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span> Be visible to members
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span> Request introductions
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span> Unlock all features
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span> Earn badges
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Basic Information',
      description: 'Tell us a bit about yourself',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Your last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth * (21+)</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
            />
            {dateOfBirth && !validateAge() && (
              <p className="text-sm text-destructive">
                You must be 21 or older to join Make Friends and Socialize
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'About You',
      description: 'Share what makes you unique',
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio * (at least 20 characters)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your passions, and what brings you to our community..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/20 characters minimum
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Founder, Designer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Interests & Location',
      description: 'Help us connect you with the right people',
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Interests * (select at least 2)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                    interests.includes(interest)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {interests.length} selected
            </p>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <CityAutocomplete value={city} onValueChange={setCity} />
          </div>
        </div>
      ),
    },
    {
      title: 'Profile Photo',
      description: 'Add a photo so members can recognize you',
      content: (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {photos.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Profile ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Add Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Add at least one photo. You can add up to 4 photos.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6">
        <AnimatePresence mode="wait">
          <OnboardingStep
            key={currentStep}
            title={steps[currentStep].title}
            description={steps[currentStep].description}
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={currentStep > 0 ? handleSkip : undefined}
            canProceed={canProceed()}
            isLastStep={currentStep === steps.length - 1}
            isLoading={isLoading}
          >
            {steps[currentStep].content}
          </OnboardingStep>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
