import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Save, Sparkles, MapPin } from 'lucide-react';
import { ProfileCompletionIndicator } from '@/components/portal/ProfileCompletionIndicator';
import { VerificationBadge } from '@/components/portal/VerificationBadge';
import { VpnBlockedModal } from '@/components/portal/VpnBlockedModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PortalProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [showVpnModal, setShowVpnModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancingBio, setIsEnhancingBio] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    bio: profile?.bio || '',
    job_title: profile?.job_title || '',
    company: profile?.company || '',
    industry: profile?.industry || '',
    linkedin_url: profile?.linkedin_url || '',
    city: profile?.city || '',
    country: profile?.country || '',
  });

  // Auto-detect location on mount if not set
  useEffect(() => {
    if (!formData.city && !formData.country && user) {
      detectLocation();
    }
  }, []);

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-location');
      if (error) throw error;
      if (data?.vpnDetected) {
        // Don't auto-fill if VPN detected, just skip silently
        return;
      }
      setFormData(prev => ({
        ...prev,
        city: prev.city || data?.city || '',
        country: prev.country || data?.country || '',
      }));
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || 'M';

  const avatarSrc = profile?.avatar_urls?.[0]
    || user?.user_metadata?.avatar_url
    || undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(path);

      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_urls: [newUrl] })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Profile photo updated');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEnhanceBio = async () => {
    if (!formData.bio || formData.bio.trim().length < 5) {
      toast.error('Write a few words about yourself first, then let AI polish it.');
      return;
    }
    setIsEnhancingBio(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-bio', {
        body: { bio: formData.bio, firstName: formData.first_name },
      });
      if (error) throw error;
      if (data?.enhancedBio) {
        setFormData(prev => ({ ...prev, bio: data.enhancedBio }));
        toast.success('Bio enhanced! Review and save when ready.');
      }
    } catch (err: any) {
      console.error('Bio enhancement error:', err);
      toast.error('Failed to enhance bio. Try again.');
    } finally {
      setIsEnhancingBio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const profileData = {
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    date_of_birth: profile?.date_of_birth || '',
    avatar_urls: profile?.avatar_urls || [],
    bio: profile?.bio || '',
    job_title: profile?.job_title || '',
    industry: profile?.industry || '',
    interests: profile?.interests || [],
    city: profile?.city || '',
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-24 md:pb-16">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-foreground inline-flex items-center gap-2">
          My Profile
          <VerificationBadge
            isVerified={profile?.is_security_verified || false}
            verifiedAt={profile?.verified_at}
            size="lg"
          />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and how others see you.
        </p>
      </div>

      {/* Profile Completion */}
      <ProfileCompletionIndicator profile={profileData} />

      {/* Avatar + Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Upload a photo'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG under 5MB. This will be visible to other members.</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Bio</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEnhanceBio}
                disabled={isEnhancingBio}
                className="text-xs h-7 gap-1.5 text-primary hover:text-primary/80"
              >
                {isEnhancingBio ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {isEnhancingBio ? 'Enhancing...' : 'AI Polish'}
              </Button>
            </div>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell the community about yourself..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="city">City</Label>
                {isDetectingLocation && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Detecting...
                  </span>
                )}
              </div>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Paris" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="country">Country</Label>
                {!formData.country && !isDetectingLocation && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={detectLocation}
                    className="text-xs h-7 gap-1 text-primary hover:text-primary/80"
                  >
                    <MapPin className="h-3 w-3" />
                    Auto-detect
                  </Button>
                )}
              </div>
              <Input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. France" />
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Professional</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" value={formData.company} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
        </div>

        {/* Save Button — sticky on mobile for easy reach */}
        <div className="sticky bottom-20 md:bottom-0 md:static flex justify-end z-10">
          <Button type="submit" disabled={isSaving} className="min-w-[140px] w-full sm:w-auto shadow-lg md:shadow-none">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>

      <VpnBlockedModal isOpen={showVpnModal} />
    </div>
  );
}
