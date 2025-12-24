import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

const INTERESTS = [
  'Art & Culture', 'Wine & Dining', 'Travel', 'Fashion', 'Architecture',
  'Literature', 'Music', 'Philanthropy', 'Entrepreneurship', 'Wellness'
];

const BRANDS = [
  'Hermès', 'Loro Piana', 'Brunello Cucinelli', 'Tom Ford', 'Ralph Lauren',
  'Zegna', 'Dior', 'Chanel', 'Gucci', 'Prada'
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signUp, signIn, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    
    // Sign up the user
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

    // Wait for session to be established
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Update profile
      await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          signature_style: signatureStyle,
          favorite_brands: selectedBrands,
          values_in_partner: valuesInPartner,
          interests: selectedInterests,
        })
        .eq('id', session.user.id);

      // Submit application
      await supabase
        .from('application_waitlist')
        .insert({
          user_id: session.user.id,
          style_description: signatureStyle,
          favorite_brands: selectedBrands,
          values_in_partner: valuesInPartner,
          interests: selectedInterests,
          status: 'pending',
        });
    }

    setIsSubmitting(false);
    navigate('/auth/waiting');
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-secondary-foreground mb-4">
            {mode === 'signin' ? 'Welcome Back' : 'Apply for Membership'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'signin' 
              ? 'Sign in to access your member portal'
              : 'Join an exclusive community of refined individuals'
            }
          </p>
        </div>

        {/* Progress Steps (signup only) */}
        {mode === 'signup' && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-card rounded-lg p-8 shadow-elegant">
          {/* Step 1: Credentials */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-card-foreground">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-card-foreground">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="James"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-card-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Harrington"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={handleStep1Submit}
                disabled={isSubmitting}
                className="w-full"
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

              <p className="text-center text-sm text-muted-foreground">
                {mode === 'signin' ? "Don't have an account?" : 'Already a member?'}{' '}
                <button
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setStep(1);
                  }}
                  className="text-primary hover:underline"
                >
                  {mode === 'signin' ? 'Apply for Membership' : 'Sign In'}
                </button>
              </p>
            </div>
          )}

          {/* Step 2: Style Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-card-foreground">Your Style Profile</h2>
                <p className="text-muted-foreground text-sm mt-1">Tell us about your personal aesthetic</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureStyle" className="text-card-foreground">
                  Describe Your Signature Style
                </Label>
                <Textarea
                  id="signatureStyle"
                  placeholder="Timeless elegance with a modern edge. I gravitate towards quality craftsmanship and understated luxury..."
                  value={signatureStyle}
                  onChange={(e) => setSignatureStyle(e.target.value)}
                  className="bg-background min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground">Brands That Resonate With You</Label>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedBrands.includes(brand)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent text-card-foreground border-border hover:border-primary'
                      }`}
                    >
                      {brand}
                      {selectedBrands.includes(brand) && <Check className="inline ml-1 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Values */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-card-foreground">Your Values</h2>
                <p className="text-muted-foreground text-sm mt-1">What matters most to you in a connection</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="values" className="text-card-foreground">
                  What Do You Value Most in a Partner?
                </Label>
                <Textarea
                  id="values"
                  placeholder="Intellectual curiosity, shared appreciation for the finer things, authenticity..."
                  value={valuesInPartner}
                  onChange={(e) => setValuesInPartner(e.target.value)}
                  className="bg-background min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground">Your Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent text-card-foreground border-border hover:border-primary'
                      }`}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && <Check className="inline ml-1 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
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
