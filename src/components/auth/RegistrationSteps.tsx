import { startTransition } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { BrandLogo } from '@/components/common/BrandLogo';
import { INTERESTS, INDUSTRIES, MOTIVATIONS } from '@/config/constants';

interface RegistrationStepsProps {
    step: number;
    setStep: (step: number) => void;
    isSubmitting: boolean;
    acceptedTerms: boolean;
    setAcceptedTerms: (value: boolean) => void;
    // Step 2 fields
    industry: string;
    setIndustry: (value: string) => void;
    customIndustry: string;
    setCustomIndustry: (value: string) => void;
    jobTitle: string;
    setJobTitle: (value: string) => void;
    signatureStyle: string;
    setSignatureStyle: (value: string) => void;
    selectedBrands: string[];
    toggleMotivation: (motivation: string) => void;
    // Step 3 fields
    valuesInPartner: string;
    setValuesInPartner: (value: string) => void;
    selectedInterests: string[];
    toggleInterest: (interest: string) => void;
    // Submit
    handleFinalSubmit: () => void;
}

export function RegistrationSteps({
    step,
    setStep,
    isSubmitting,
    acceptedTerms,
    setAcceptedTerms,
    industry,
    setIndustry,
    customIndustry,
    setCustomIndustry,
    jobTitle,
    setJobTitle,
    signatureStyle,
    setSignatureStyle,
    selectedBrands,
    toggleMotivation,
    valuesInPartner,
    setValuesInPartner,
    selectedInterests,
    toggleInterest,
    handleFinalSubmit,
}: RegistrationStepsProps) {
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

            {/* Gradient Overlay — Stitch forest green */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/85" />

            {/* Floating Particles */}
            <FloatingParticles count={20} />

            <div className="relative z-10 w-full max-w-2xl animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6 flex justify-center">
                        <BrandLogo className="h-14 w-auto drop-shadow-sm" />
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
                            className={`h-2 w-12 rounded-full transition-all duration-300 ${s < step ? 'bg-[hsl(var(--accent-gold))]' : s === step ? 'bg-[hsl(var(--accent-gold))] shadow-lg shadow-[hsl(var(--accent-gold))]/50' : 'bg-white/20'
                                }`}
                        />
                    ))}
                </div>

                {/* Form Card - Glassmorphism */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                    {/* Step 2: About You */}
                    {(step as number) === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="font-display text-2xl text-white">About You</h2>
                                <p className="text-white/50 text-sm mt-1">Tell us a bit about yourself</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Industry</Label>
                                <Select
                                    value={industry}
                                    onValueChange={(value) => {
                                        setIndustry(value);
                                        if (value !== 'Other') {
                                            setCustomIndustry('');
                                        }
                                    }}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 [&>span]:text-white/70 [&[data-state=open]>span]:text-white">
                                        <SelectValue placeholder="Select your industry" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/10 z-50">
                                        {INDUSTRIES.map((ind) => (
                                            <SelectItem
                                                key={ind}
                                                value={ind}
                                                className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                                            >
                                                {ind}
                                            </SelectItem>
                                        ))}
                                        <SelectItem
                                            value="Other"
                                            className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                                        >
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {industry === 'Other' && (
                                    <Input
                                        placeholder="Please specify your industry"
                                        value={customIndustry}
                                        onChange={(e) => setCustomIndustry(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 mt-2"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jobTitle" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Job Title</Label>
                                <Input
                                    id="jobTitle"
                                    placeholder="e.g. Creative Director, Founder"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signatureStyle" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">
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
                                <Label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">What brings you to our community?</Label>
                                <div className="flex flex-wrap gap-2">
                                    {MOTIVATIONS.map((motivation) => (
                                        <button
                                            key={motivation}
                                            onClick={() => toggleMotivation(motivation)}
                                            className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${selectedBrands.includes(motivation)
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
                                    onClick={() => { requestAnimationFrame(() => { setTimeout(() => { startTransition(() => setStep(3)); }, 0); }); }}
                                    className="flex-1 gold-gradient-bg hover:brightness-110 text-black font-bold shadow-[0_4px_14px_0_rgba(212,175,55,0.3)]"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Your Lifestyle */}
                    {(step as number) === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="font-display text-2xl text-white">Your Lifestyle</h2>
                                <p className="text-white/50 text-sm mt-1">Help us understand what you're looking for</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="values" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">
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
                                <Label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Your Interests</Label>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map((interest) => (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${selectedInterests.includes(interest)
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

                            {/* Terms & Privacy Consent */}
                            <div className="flex items-start gap-3 pt-2">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    className="mt-1 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <label htmlFor="terms" className="text-sm text-white/70 cursor-pointer leading-relaxed">
                                    I have read and agree to the{' '}
                                    <Link
                                        to="/privacy"
                                        target="_blank"
                                        className="text-primary hover:text-primary/80 underline underline-offset-2"
                                    >
                                        Privacy Policy
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        to="/terms"
                                        target="_blank"
                                        className="text-primary hover:text-primary/80 underline underline-offset-2"
                                    >
                                        Terms of Service
                                    </Link>
                                </label>
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
                                    onClick={() => { requestAnimationFrame(() => { setTimeout(() => { handleFinalSubmit(); }, 0); }); }}
                                    disabled={isSubmitting || !acceptedTerms}
                                    className="flex-1 gold-gradient-bg hover:brightness-110 text-black font-bold shadow-[0_4px_14px_0_rgba(212,175,55,0.3)] disabled:opacity-50"
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
