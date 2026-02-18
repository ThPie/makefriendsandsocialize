import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { BrandedLoader } from '@/components/ui/branded-loader';
import { Search, Bell, ArrowLeft, Bookmark, ArrowRight, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Filter categories from Stitch
const FILTERS = ['All Members', 'Finance', 'Tech', 'Real Estate', 'Arts'];

export default function PortalNetwork() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Members');

  useEffect(() => {
    async function fetchMembers() {
      // Mock fetching logic - we'd filter by industry in a real query
      let query = supabase
        .from('profiles')
        .select('*')
        .limit(20);

      if (user) {
        query = query.neq('id', user.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    }
    fetchMembers();
  }, [user, activeFilter]);


  if (loading) return <BrandedLoader />;

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#0a0f0b]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0a0f0b]/95 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Link to="/portal" className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex gap-4">
            <button className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <button className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors relative">
              <span className="absolute top-2.5 right-2.5 size-2 bg-[#D4AF37] rounded-full border-2 border-[#0a0f0b]"></span>
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white line-clamp-1">The Network</h1>
        </div>

        {/* Filter Chips */}
        <div className="px-4 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-all duration-200",
                  activeFilter === filter
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-white/10 backdrop-blur-sm border border-white/10 text-slate-300 hover:bg-white/20"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-28 space-y-4">
        {/* Connect Card (CTA) */}
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl group border border-white/10">
          {/* This card simulates the "Swipe" UI from the Stitch design, 
                 showing the first member with interaction cues.
                 For now, we'll just show the first member in the list nicely.
             */}

          {members.length > 0 && (
            <>
              <div className="relative h-full w-full bg-[#1e2a22]">
                <img
                  alt={members[0].first_name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={members[0].avatar_urls?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                <div className="absolute top-4 right-4">
                  <button className="size-10 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white/80 hover:text-white transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="font-display text-3xl font-medium mb-1">{members[0].first_name} {members[0].last_name}</h2>
                      <p className="text-sm font-medium text-[#D4AF37] mb-2">{members[0].job_title || 'Member'}</p>
                      <div className="flex gap-2 mt-3">
                        {members[0].industry && (
                          <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-medium tracking-wide uppercase">
                            {members[0].industry}
                          </span>
                        )}
                        {members[0].city && (
                          <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-medium tracking-wide uppercase">
                            {members[0].city}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={`/portal/profile/${members[0].id}`} className="size-12 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all">
                      <ArrowRight className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* List of other members */}
        {members.slice(1).map((member) => (
          <div key={member.id} className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl group border border-white/10">
            <div className="relative h-full w-full bg-[#1e2a22]">
              <img
                alt={member.first_name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={member.avatar_urls?.[0] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              <div className="absolute top-4 right-4">
                <button className="size-10 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white/80 hover:text-white transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-display text-3xl font-medium mb-1">{member.first_name} {member.last_name}</h2>
                    <p className="text-sm font-medium text-slate-300 mb-2">{member.job_title || 'Member'}</p>
                    <div className="flex gap-2 mt-3">
                      {member.industry && (
                        <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-medium tracking-wide uppercase">
                          {member.industry}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to={`/portal/profile/${member.id}`} className="size-12 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="text-center py-6">
          <p className="text-sm text-slate-400">You've reached the end of the list</p>
        </div>
      </main>
    </div>
  );
}
