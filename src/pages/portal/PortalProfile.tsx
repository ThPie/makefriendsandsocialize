import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Settings, MapPin, Edit3, Camera, Briefcase, Award, Play, Info } from 'lucide-react';
import { WidgetErrorBoundary } from '@/components/ui/widget-error-boundary';

export default function PortalProfile() {
  const { user, profile } = useAuth();

  if (!profile) return null;

  // Mock data for display if profile is missing fields
  const displayProfile = {
    ...profile,
    job_title: profile.job_title || 'Member',
    location: profile.city || 'Global',
    age: profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : '',
  };

  return (
    <div className="max-w-md mx-auto pb-24 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <h1 className="text-xl font-bold tracking-tight text-white">My Profile</h1>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-slate-300">
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Completion Card */}
      <div className="bg-[#1e2b21] p-5 rounded-2xl shadow-sm border border-white/5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-white">Profile Completeness</span>
          <span className="text-sm font-bold text-[#1a5b2a]">85%</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#1a5b2a] w-[85%] rounded-full"></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1a5b2a]" />
          <p className="text-xs text-slate-400">Complete your bio to reach 100% visibility.</p>
        </div>
      </div>

      {/* Photos Grid */}
      <section className="grid grid-cols-3 gap-3 h-64">
        {/* Main Large Photo */}
        <div className="col-span-2 h-full relative group rounded-2xl overflow-hidden border border-white/5">
          <img
            src={profile.avatar_urls?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces'}
            alt="Main profile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          <button className="absolute bottom-3 right-3 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full transition-all">
            <Edit3 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Secondary Photos Column */}
        <div className="col-span-1 flex flex-col gap-3 h-full">
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative">
            {profile.avatar_urls?.[1] ? (
              <img src={profile.avatar_urls[1]} alt="Secondary 1" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#253028] flex items-center justify-center">
                <Camera className="w-6 h-6 text-white/20" />
              </div>
            )}
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative">
            {profile.avatar_urls?.[2] ? (
              <img src={profile.avatar_urls[2]} alt="Secondary 2" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#1e2b21] border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-[#253028] transition-colors">
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
          <button className="text-[#1a5b2a] text-sm font-medium hover:text-[#1a5b2a]/80">Edit</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Full Name</p>
              <p className="text-sm font-medium text-slate-200">{profile.first_name} {profile.last_name}</p>
            </div>
            {displayProfile.age && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Age</p>
                <p className="text-sm font-medium text-slate-200">{displayProfile.age}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Location</p>
            <div className="flex items-center gap-1 text-slate-200">
              <MapPin className="w-4 h-4 text-[#1a5b2a]" />
              <span className="text-sm font-medium">{displayProfile.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Info Card */}
      <section className="bg-[#1e2b21] rounded-xl p-5 border border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Professional Info</h2>
          <button className="text-[#1a5b2a] text-sm font-medium hover:text-[#1a5b2a]/80">Edit</button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Job Title</p>
            <p className="text-sm font-medium text-slate-200">{displayProfile.job_title}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((interest: string) => (
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

    </div>
  );
}
