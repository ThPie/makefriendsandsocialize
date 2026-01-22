import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, ArrowRight, ArrowLeft, AlertCircle, Mail, CheckCircle, ChevronDown } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Country data with flags (emoji), dial codes, and formatting patterns
const COUNTRIES = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(XXX) XXX-XXXX' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(XXX) XXX-XXXX' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: 'XXXX XXXXXX' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: 'XXX XXX XXX' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', format: 'XX XXX XXXX' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: 'XXXX XXXXXXX' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: 'X XX XX XX XX' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', format: 'XXX XXXXXXX' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', format: 'XXX XXX XXX' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', format: 'X XXXXXXXX' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', format: 'XXX XX XX XX' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', format: 'XXX XXXXXXX' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', format: 'XX XXX XX XX' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', format: 'XX XXX XX XX' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', format: 'XXX XX XXX' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', format: 'XX XX XX XX' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', format: 'XX XXX XXXX' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', format: 'XX XXX XXXX' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', format: 'XXX XXX XXX' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', format: 'XXX XXX XXX' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: 'XXXXX XXXXX' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: 'XX XXXX XXXX' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', format: 'XX XXXX XXXX' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', format: 'XXX XXXX XXXX' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', format: 'XXXX XXXX' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', format: 'XXXX XXXX' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: 'XX XXX XXXX' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', format: 'XX XXX XXXX' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', format: 'XX XXX XXXX' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', format: 'XX XXX XXXX' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', format: 'XX XXXX XXXX' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', format: 'XX XXXXX XXXX' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', format: 'XX XXXX XXXX' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', format: 'XXX XXX XXXX' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', format: 'X XXXX XXXX' },
];

const getDefaultCountryCode = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToCountry: Record<string, string> = {
      'America/New_York': 'US', 'America/Los_Angeles': 'US', 'America/Chicago': 'US',
      'America/Denver': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
      'Pacific/Honolulu': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
      'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL',
      'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ',
      'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN',
      'Asia/Hong_Kong': 'HK', 'Asia/Singapore': 'SG', 'Asia/Kolkata': 'IN',
      'Asia/Dubai': 'AE', 'Africa/Johannesburg': 'ZA', 'America/Sao_Paulo': 'BR',
      'America/Mexico_City': 'MX', 'America/Buenos_Aires': 'AR',
    };
    
    const country = timezoneToCountry[timezone];
    if (country) return country;
    
    // Fallback: try navigator.language
    const locale = navigator.language || (navigator as any).userLanguage || '';
    const countryFromLocale = locale.split('-')[1]?.toUpperCase();
    if (countryFromLocale && COUNTRIES.find(c => c.code === countryFromLocale)) {
      return countryFromLocale;
    }
    
    return 'US';
  } catch {
    return 'US';
  }
};

// Format phone number for display based on country format
const formatPhoneDisplay = (digits: string, countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return digits;
  
  const formatPattern = country.format;
  let result = '';
  let digitIndex = 0;
  
  for (let i = 0; i < formatPattern.length && digitIndex < digits.length; i++) {
    if (formatPattern[i] === 'X') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += formatPattern[i];
    }
  }
  
  // Add remaining digits if pattern is exhausted
  if (digitIndex < digits.length) {
    result += digits.slice(digitIndex);
  }
  
  return result;
};

interface PhoneOTPLoginProps {
  onSuccess?: () => void;
  onSwitchToEmail?: () => void;
  disabled?: boolean;
}

export function PhoneOTPLogin({ onSuccess, onSwitchToEmail, disabled }: PhoneOTPLoginProps) {
  const [phoneDigits, setPhoneDigits] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const country = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  // Set default country on mount
  useEffect(() => {
    const defaultCode = getDefaultCountryCode();
    setSelectedCountry(defaultCode);
  }, []);

  // Clear error/success when user starts typing
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    
    // Extract only digits from input
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    
    // Limit to reasonable phone length (15 digits max per E.164)
    if (digits.length <= 15) {
      setPhoneDigits(digits);
    }
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setError(null);
  };

  const getFullPhoneNumber = (): string => {
    return `${country.dialCode}${phoneDigits}`;
  };

  const validatePhoneNumber = (): boolean => {
    // Check minimum length (at least 6 digits for shortest valid numbers)
    if (phoneDigits.length < 6) {
      setError('Please enter a valid phone number');
      return false;
    }
    // Check maximum length (15 digits max for E.164)
    if (phoneDigits.length > 15) {
      setError('Phone number is too long');
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    setError(null);
    
    if (!phoneDigits) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber()) {
      return;
    }

    const formattedPhone = getFullPhoneNumber();
    setIsLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpError) {
        console.error('OTP send error:', otpError);
        
        const errorMsg = otpError.message.toLowerCase();
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('too many')) {
          setError('Too many attempts. Please wait a few minutes before trying again.');
        } else if (errorMsg.includes('invalid') || errorMsg.includes('not valid')) {
          setError('Invalid phone number format. Please check and try again.');
        } else if (errorMsg.includes('not found') || errorMsg.includes('no user')) {
          setError('No account found with this phone number. Please sign up first or use email login.');
        } else if (errorMsg.includes('provider') || errorMsg.includes('sms') || errorMsg.includes('twilio') || errorMsg.includes('configuration')) {
          setError('SMS service is temporarily unavailable. Please try signing in with email instead.');
        } else {
          setError('Unable to send verification code. Please try again or use email login.');
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Verification code sent!');
      setError(null);
      setStep('otp');
    } catch (err) {
      console.error('Unexpected OTP error:', err);
      setError('An unexpected error occurred. Please try again or use email login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);
    
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    const formattedPhone = getFullPhoneNumber();
    setIsLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        const errorMsg = verifyError.message.toLowerCase();
        
        if (errorMsg.includes('expired')) {
          setError('Code expired. Please request a new one.');
        } else if (errorMsg.includes('invalid') || errorMsg.includes('incorrect')) {
          setError('Invalid code. Please check and try again.');
        } else {
          setError('Verification failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        setSuccessMessage('Successfully signed in!');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Unexpected verification error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setError(null);
    setSuccessMessage(null);
    await handleSendOTP();
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError(null);
    setSuccessMessage(null);
  };

  const displayPhone = formatPhoneDisplay(phoneDigits, selectedCountry);

  if (step === 'otp') {
    return (
      <div className="space-y-5">
        <button
          onClick={handleBackToPhone}
          className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to phone number
        </button>

        <div className="text-center space-y-2">
          <p className="text-white/90">Enter the 6-digit code sent to</p>
          <p className="text-primary font-medium">{country.flag} {country.dialCode} {displayPhone}</p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isLoading || disabled}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="bg-white/5 border-white/20 text-white" />
              <InputOTPSlot index={1} className="bg-white/5 border-white/20 text-white" />
              <InputOTPSlot index={2} className="bg-white/5 border-white/20 text-white" />
              <InputOTPSlot index={3} className="bg-white/5 border-white/20 text-white" />
              <InputOTPSlot index={4} className="bg-white/5 border-white/20 text-white" />
              <InputOTPSlot index={5} className="bg-white/5 border-white/20 text-white" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {successMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
            {onSwitchToEmail && (
              <Button
                variant="outline"
                onClick={onSwitchToEmail}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Mail className="mr-2 h-4 w-4" />
                Try with Email Instead
              </Button>
            )}
          </div>
        )}

        <Button
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.length !== 6 || disabled}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Verify & Sign In'
          )}
        </Button>

        <p className="text-center text-sm text-white/50">
          Didn't receive the code?{' '}
          <button
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
          >
            Resend
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
        <div className="flex gap-2">
          {/* Country Selector */}
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white">
              <SelectValue>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.dialCode}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] bg-background border-border">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code} className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span>{c.name}</span>
                    <span className="text-muted-foreground ml-auto">{c.dialCode}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Phone Input */}
          <div className="relative flex-1">
            <Input
              id="phone"
              type="tel"
              placeholder={country.format.replace(/X/g, '0')}
              value={displayPhone}
              onChange={handlePhoneInput}
              disabled={isLoading || disabled}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
        </div>
        <p className="text-xs text-white/40">
          We'll send you a verification code via SMS
        </p>
      </div>

      {successMessage && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          {onSwitchToEmail && (
            <Button
              variant="outline"
              onClick={onSwitchToEmail}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <Mail className="mr-2 h-4 w-4" />
              Try with Email Instead
            </Button>
          )}
        </div>
      )}

      <Button
        onClick={handleSendOTP}
        disabled={isLoading || !phoneDigits || disabled}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Send Verification Code
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
