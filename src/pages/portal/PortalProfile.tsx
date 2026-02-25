import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Settings, MapPin, Edit3, Camera, Briefcase, Award, Play, Info } from 'lucide-react';
import { WidgetErrorBoundary } from '@/components/ui/widget-error-boundary';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { ProfileCompletionIndicator } from '@/components/portal/ProfileCompletionIndicator';
import { VerificationBadge } from '@/components/portal/VerificationBadge';
import { VpnBlockedModal } from '@/components/portal/VpnBlockedModal';
import { toast } from 'sonner';

export default function PortalProfile() {
  const { user, profile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showVpnModal, setShowVpnModal] = useState(false);

  const handlePhotoEdit = () => {
    toast.info("Photo editing is coming soon!");
  };

  const displayProfile = {
    ...profile,
    job_title: profile?.job_title || 'Member',
    location: profile?.city || 'Global',
    age: profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : '',
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
    <div className="w-full pb-16 space-y-8">
      <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between">
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
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="hidden md:flex items-center gap-2">
          <Settings className="w-4 h-4" /> Edit Profile
        </Button>
      </div>

      <ProfileCompletionIndicator profile={profileData} />

      {/* Photo Grid — wider on desktop */}
      <section className="grid grid-cols-3 gap-4 h-[320px] md:h-[380px]">
        {/* Main Photo - Large */}
        <div className="col-span-2 relative rounded-2xl overflow-hidden border border-border group">
          {profile?.avatar_urls?.[0] ? (
            <img src={profile.avatar_urls[0]} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-card flex items-center justify-center">
              <span className="text-6xl font-display text-foreground/20">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          <button
            onClick={handlePhotoEdit}
            className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Secondary Photos Column */}
        <div className="col-span-1 flex flex-col gap-4 h-full">
          <div className="flex-1 rounded-2xl overflow-hidden border border-border relative">
            {profile?.avatar_urls?.[1] ? (
              <img src={profile.avatar_urls[1]} alt="Secondary 1" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-border relative">
            {profile?.avatar_urls?.[2] ? (
              <img src={profile.avatar_urls[2]} alt="Secondary 2" className="w-full h-full object-cover" />
            ) : (
              <div
                onClick={handlePhotoEdit}
                className="w-full h-full bg-card border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
              >
                <Camera className="w-8 h-8 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Cards — two-column on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Basic Info</h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[hsl(var(--accent-gold))] text-sm font-medium hover:text-[hsl(var(--accent-gold))]/80"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                <p className="text-sm font-medium text-foreground">{profile?.first_name} {profile?.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="text-sm font-medium text-foreground">{displayProfile.age || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-1 text-foreground">
                  <MapPin className="w-3 h-3 text-[hsl(var(--accent-gold))]" />
                  <span className="text-sm font-medium">{displayProfile.location}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                <p className="text-sm font-medium text-foreground">2024</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bio</p>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                {profile?.bio || 'No bio yet. Click edit to add one!'}
              </p>
            </div>
          </div>
        </section>

        {/* Professional Info Card */}
        <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Professional Info</h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[hsl(var(--accent-gold))] text-sm font-medium hover:text-[hsl(var(--accent-gold))]/80"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Job Title</p>
              <p className="text-sm font-medium text-foreground">{displayProfile.job_title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile?.interests?.map((interest: string) => (
                  <span key={interest} className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground border border-border">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Vibe Clip Card — full width */}
      <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Vibe Clip</h2>
          <span className="text-xs text-muted-foreground">0:15s</span>
        </div>
        <div className="relative w-full h-40 md:h-48 rounded-lg overflow-hidden bg-background group cursor-pointer">
          <div className="absolute inset-0 opacity-60 bg-gradient-to-r from-purple-900 via-blue-900 to-background"></div>
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50">
            <div className="w-1 h-8 bg-[hsl(var(--accent-gold))] rounded-full animate-pulse"></div>
            <div className="w-1 h-12 bg-[hsl(var(--accent-gold))] rounded-full animate-pulse delay-75"></div>
            <div className="w-1 h-6 bg-[hsl(var(--accent-gold))] rounded-full animate-pulse delay-100"></div>
            <div className="w-1 h-10 bg-[hsl(var(--accent-gold))] rounded-full animate-pulse delay-150"></div>
            <div className="w-1 h-4 bg-[hsl(var(--accent-gold))] rounded-full animate-pulse delay-200"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--accent-gold))]/20 backdrop-blur-sm flex items-center justify-center border border-[hsl(var(--accent-gold))]/50 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-[hsl(var(--accent-gold))] fill-current" />
            </div>
          </div>
        </div>
      </section>

      <VpnBlockedModal isOpen={showVpnModal} />
    </div>
  );
}
