import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

  // Mock data for display if profile is missing fields
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
    <div className="max-w-md mx-auto pb-24 space-y-6">
      <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

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

      <section className="grid grid-cols-3 gap-3 h-[280px]">
        {/* Main Photo - Large */}
        <div className="col-span-2 relative rounded-2xl overflow-hidden border border-white/5 group">
          {profile?.avatar_urls?.[0] ? (
            <img src={profile.avatar_urls[0]} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#1e2b21] flex items-center justify-center">
              <span className="text-4xl font-display text-white/20">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          <button
            onClick={handlePhotoEdit}
            className="absolute bottom-3 right-3 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full transition-all"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Secondary Photos Column */}
        <div className="col-span-1 flex flex-col gap-3 h-full">
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative">
            {profile?.avatar_urls?.[1] ? (
              <img src={profile.avatar_urls[1]} alt="Secondary 1" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#253028] flex items-center justify-center">
                <Camera className="w-6 h-6 text-white/20" />
              </div>
            )}
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative">
            {profile?.avatar_urls?.[2] ? (
              <img src={profile.avatar_urls[2]} alt="Secondary 2" className="w-full h-full object-cover" />
            ) : (
              <div
                onClick={handlePhotoEdit}
                className="w-full h-full bg-[#1e2b21] border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-[#253028] transition-colors"
              >
                <Camera className="w-6 h-6 text-white/40" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Basic Info Card */}
      <section className="bg-[#1e2b21] rounded-xl p-5 border border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Basic Info</h2>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-[#1a5b2a] text-sm font-medium hover:text-[#1a5b2a]/80"
          >
            Edit
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Full Name</p>
              <p className="text-sm font-medium text-slate-200">{profile?.first_name} {profile?.last_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Age</p>
              <p className="text-sm font-medium text-slate-200">{displayProfile.age || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Location</p>
              <div className="flex items-center gap-1 text-slate-200">
                <MapPin className="w-3 h-3 text-[#1a5b2a]" />
                <span className="text-sm font-medium">{displayProfile.location}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Member Since</p>
              <p className="text-sm font-medium text-slate-200">2024</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Bio</p>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {profile?.bio || 'No bio yet. Click edit to add one!'}
            </p>
          </div>
        </div>
      </section>

      {/* Professional Info Card */}
      <section className="bg-[#1e2b21] rounded-xl p-5 border border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Professional Info</h2>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-[#1a5b2a] text-sm font-medium hover:text-[#1a5b2a]/80"
          >
            Edit
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Job Title</p>
            <p className="text-sm font-medium text-slate-200">{displayProfile.job_title}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile?.interests?.map((interest: string) => (
                <span key={interest} className="px-3 py-1 bg-[#253028] rounded-full text-xs font-medium text-slate-300 border border-white/10">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vibe Clip Card (Placeholder) */}
      <section className="bg-[#1e2b21] rounded-xl p-5 border border-white/5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Vibe Clip</h2>
          <span className="text-xs text-slate-500">0:15s</span>
        </div>
        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 group cursor-pointer">
          {/* Background Visual */}
          <div className="absolute inset-0 opacity-60 bg-gradient-to-r from-purple-900 via-blue-900 to-slate-900"></div>
          {/* Waveform Simulation */}
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50">
            <div className="w-1 h-8 bg-[#1a5b2a] rounded-full animate-pulse"></div>
            <div className="w-1 h-12 bg-[#1a5b2a] rounded-full animate-pulse delay-75"></div>
            <div className="w-1 h-6 bg-[#1a5b2a] rounded-full animate-pulse delay-100"></div>
            <div className="w-1 h-10 bg-[#1a5b2a] rounded-full animate-pulse delay-150"></div>
            <div className="w-1 h-4 bg-[#1a5b2a] rounded-full animate-pulse delay-200"></div>
          </div>
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-12 h-12 rounded-full bg-[#1a5b2a]/20 backdrop-blur-sm flex items-center justify-center border border-[#1a5b2a]/50 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-[#1a5b2a] fill-current" />
            </div>
          </div>
        </div>
      </section>

      <VpnBlockedModal isOpen={showVpnModal} />
    </div>
  );
}
