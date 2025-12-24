import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';
import { MemberAvatars } from '@/components/home/MemberAvatars';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { BrandedLoader } from '@/components/ui/branded-loader';
import contactHero from '@/assets/contact-hero.webp';
import logoWhite from '@/assets/logo-white.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

const INTERESTS = [
  'Arts & Culture', 'Fine Dining & Wine', 'Travel & Adventure', 'Entrepreneurship',
  'Wellness & Mindfulness', 'Music & Nightlife', 'Philanthropy', 'Fashion & Design',
  'Technology & Innovation', 'Sports & Fitness'
];

const MOTIVATIONS = [
  'Networking', 'New Friendships', 'Dating & Romance', 'Business Connections',
  'Cultural Events', 'Personal Growth', 'Exclusive Experiences', 'Like-minded Community'
];

const defaultAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signUp, signIn, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Member stats state
  const [memberCount, setMemberCount] = useState(928);
  const [avatarUrls, setAvatarUrls] = useState<string[]>(defaultAvatars);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signatureStyle, setSignatureStyle] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [valuesInPartner, setValuesInPartner] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Fetch member stats from meetup_stats (same as Hero)
  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const { data, error } = await supabase
          .from('meetup_stats')
          .select('member_count, avatar_urls')
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setMemberCount(data.member_count || 928);
          
          if (data.avatar_urls && data.avatar_urls.length > 0) {
            const memberPhotos = data.avatar_urls.filter((url: string) => 
              url.includes('member_') || 
              url.includes('photos.meetupstatic.com') ||
              url.includes('secure.meetupstatic.com/photos/member')
            );
            
            const photosToUse = memberPhotos.length >= 5 ? memberPhotos : data.avatar_urls;
            const uniquePhotos = [...new Set(photosToUse)];
            const shuffled = uniquePhotos.sort(() => Math.random() - 0.5);
            
            setAvatarUrls(shuffled.length > 0 ? shuffled : defaultAvatars);
          }
        }
      } catch (err) {
        console.error('Error fetching member stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchMemberStats();
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/portal');
    }
  }, [user, isLoading, navigate]);

  const validateStep1 = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (mode === 'signup' && password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
      return false;
    }
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    if (mode === 'signin') {
      setIsSubmitting(true);
      const { error } = await signIn(email, password);
      setIsSubmitting(false);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
        return;
      }
      navigate('/portal');
    } else {
      setStep(2);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    const { error: signUpError } = await signUp(email, password);
    
    if (signUpError) {
      setIsSubmitting(false);
      if (signUpError.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
        setMode('signin');
        setStep(1);
      } else {
        toast.error(signUpError.message);
      }
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          signature_style: signatureStyle,
          favorite_brands: selectedBrands,
          values_in_partner: valuesInPartner,
          interests: selectedInterests,
          industry,
          job_title: jobTitle,
        })
        .eq('id', session.user.id);

      await supabase
        .from('application_waitlist')
        .insert({
          user_id: session.user.id,
          style_description: signatureStyle,
          favorite_brands: selectedBrands,
          values_in_partner: valuesInPartner,
          interests: selectedInterests,
          industry,
          job_title: jobTitle,
          status: 'pending',
        });
    }

    setIsSubmitting(false);
    navigate('/auth/waiting');
  };

  const toggleMotivation = (motivation: string) => {
    setSelectedBrands(prev => 
      prev.includes(motivation) 
        ? prev.filter(b => b !== motivation)
        : [...prev, motivation]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  if (isLoading) {
    return <BrandedLoader />;
  }

  // Split-screen layout for Step 1 (credentials)
  if (step === 1) {
    return (
      <div className="min-h-screen flex relative">
        {/* Background Image for Mobile/Tablet */}
        <div 
          className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `url(${contactHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)]/95 via-[hsl(180,50%,12%)]/90 to-[hsl(180,55%,15%)]/85" />
          <FloatingParticles count={15} />
        </div>

        {/* Floating Particles - Desktop */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none">
          <FloatingParticles count={12} />
        </div>

        {/* Left Side - Form with Gradient Background */}
        <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 overflow-hidden">
          {/* Layered Gradient Background - Desktop only */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)] via-[hsl(180,50%,12%)] to-[hsl(180,55%,15%)] hidden lg:block" />
          
          {/* Radial Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[hsl(180,60%,25%)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <span className="font-display text-[20rem] font-bold text-white/[0.02] select-none tracking-tighter">
              MFS
            </span>
          </div>
          
          {/* Glassmorphism Form Container */}
          <div className="relative z-10 max-w-md mx-auto w-full">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in">
              {/* Logo */}
              <Link to="/" className="inline-block mb-10">
                <img src={logoWhite} alt="MakeFriends & Socialize" className="h-10" />
              </Link>

              {/* Header */}
              <div className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
                  {mode === 'signin' ? 'Sign in' : 'Create Account'}
                </h1>
                <p className="text-white/60">
                  {mode === 'signin' 
                    ? 'Welcome back! Please enter your details.'
                    : 'Join our exclusive community today.'
                  }
                </p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/90">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                          <Input
                            id="firstName"
                            placeholder="James"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white/90">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Harrington"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="remember" className="text-sm text-white/60 cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <Link to="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <Button
                  onClick={handleStep1Submit}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === 'signin' ? (
                    'Sign In'
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-white/50">
                  {mode === 'signin' ? "Don't have an account?" : 'Already a member?'}{' '}
                  <button
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setStep(1);
                    }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Branded Panel */}
        <div 
          className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-12"
          style={{
            backgroundImage: `url(${contactHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 flex flex-col items-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-display text-4xl xl:text-5xl text-white mb-4 drop-shadow-lg">
              Welcome to<br />
              <span className="text-primary">MakeFriends & Socialize</span>
            </h2>
            <p className="text-white/90 text-lg max-w-md mb-8 drop-shadow-md">
              Join an exclusive community of refined individuals who share a passion for meaningful connections, curated experiences, and extraordinary moments.
            </p>
            
            {/* Floating Card with Avatars */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-white font-medium mb-4">
                Get access to exclusive events and connect with like-minded people
              </p>
              <MemberAvatars 
                avatarUrls={avatarUrls} 
                memberCount={memberCount} 
                isLoading={isLoadingStats}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-step signup (steps 2 & 3) - modern video background layout
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-poster.webp"
      >
        <source src="/videos/hero-1.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)]/95 via-[hsl(180,50%,12%)]/90 to-[hsl(180,55%,15%)]/85" />
      
      {/* Floating Particles */}
      <FloatingParticles count={20} />
      
      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logoWhite} alt="MakeFriends & Socialize" className="h-10 mx-auto" />
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            Complete Your Application
          </h1>
          <p className="text-white/60">
            Just a few more details to personalize your experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-all duration-300 ${
                s < step ? 'bg-primary' : s === step ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Form Card - Glassmorphism */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-white">About You</h2>
                <p className="text-white/50 text-sm mt-1">Tell us a bit about yourself</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-white/90">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g. Finance, Technology, Media"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-white/90">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Creative Director, Founder"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureStyle" className="text-white/90">
                  Tell us about yourself
                </Label>
                <Textarea
                  id="signatureStyle"
                  placeholder="I'm a creative director with a passion for art and design. I thrive in environments where meaningful conversations happen..."
                  value={signatureStyle}
                  onChange={(e) => setSignatureStyle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white/90">What brings you to our community?</Label>
                <div className="flex flex-wrap gap-2">
                  {MOTIVATIONS.map((motivation) => (
                    <button
                      key={motivation}
                      onClick={() => toggleMotivation(motivation)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                        selectedBrands.includes(motivation)
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                          : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      {motivation}
                      {selectedBrands.includes(motivation) && <Check className="inline ml-1.5 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Your Lifestyle */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-white">Your Lifestyle</h2>
                <p className="text-white/50 text-sm mt-1">Help us understand what you're looking for</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="values" className="text-white/90">
                  What would make your membership valuable?
                </Label>
                <Textarea
                  id="values"
                  placeholder="Access to curated events, meeting inspiring people, and being part of a community that values authenticity..."
                  value={valuesInPartner}
                  onChange={(e) => setValuesInPartner(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white/90">Your Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                          : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && <Check className="inline ml-1.5 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
