import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface PhoneOTPLoginProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

export function PhoneOTPLogin({ onSuccess, disabled }: PhoneOTPLoginProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Basic E.164 format validation
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
    return phoneRegex.test(cleanNumber);
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    // Ensure phone number has country code
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+1' + formattedPhone; // Default to US
    }

    if (!validatePhoneNumber(formattedPhone)) {
      toast.error('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        console.error('OTP send error:', error);
        if (error.message.includes('rate limit')) {
          toast.error('Too many attempts. Please wait a few minutes and try again.');
        } else if (error.message.includes('invalid')) {
          toast.error('Invalid phone number. Please check and try again.');
        } else {
          toast.error('Failed to send verification code. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      toast.success('Verification code sent!');
      setStep('otp');
    } catch (err) {
      console.error('Unexpected OTP error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+1' + formattedPhone;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        console.error('OTP verification error:', error);
        if (error.message.includes('expired')) {
          toast.error('Code expired. Please request a new one.');
        } else if (error.message.includes('invalid')) {
          toast.error('Invalid code. Please check and try again.');
        } else {
          toast.error('Verification failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        toast.success('Successfully signed in!');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Unexpected verification error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  if (step === 'otp') {
    return (
      <div className="space-y-5">
        <button
          onClick={() => {
            setStep('phone');
            setOtp('');
          }}
          className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to phone number
        </button>

        <div className="text-center space-y-2">
          <p className="text-white/90">Enter the 6-digit code sent to</p>
          <p className="text-primary font-medium">{phone.startsWith('+') ? phone : '+1' + phone}</p>
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
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            id="phone"
            type="tel"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={handlePhoneChange}
            disabled={isLoading || disabled}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
        <p className="text-xs text-white/40">
          Include country code (e.g., +1 for US)
        </p>
      </div>

      <Button
        onClick={handleSendOTP}
        disabled={isLoading || !phone || disabled}
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
