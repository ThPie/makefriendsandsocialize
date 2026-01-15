import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Check, X } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
  disabled?: boolean;
}

function generateCaptcha(): { question: string; answer: number } {
  const operations = [
    () => {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      return { question: `${a} + ${b} = ?`, answer: a + b };
    },
    () => {
      const a = Math.floor(Math.random() * 10) + 10;
      const b = Math.floor(Math.random() * 10) + 1;
      return { question: `${a} - ${b} = ?`, answer: a - b };
    },
    () => {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      return { question: `${a} × ${b} = ?`, answer: a * b };
    },
  ];

  const selectedOp = operations[Math.floor(Math.random() * operations.length)];
  return selectedOp();
}

export function SimpleCaptcha({ onVerify, disabled }: SimpleCaptchaProps) {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userAnswer, setUserAnswer] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setUserAnswer('');
    setVerified(false);
    setError(false);
    onVerify(false);
  }, [onVerify]);

  const handleVerify = useCallback(() => {
    const isCorrect = parseInt(userAnswer, 10) === captcha.answer;
    setVerified(isCorrect);
    setError(!isCorrect);
    onVerify(isCorrect);

    if (!isCorrect) {
      // Generate new captcha after failed attempt
      setTimeout(() => {
        refreshCaptcha();
      }, 1500);
    }
  }, [userAnswer, captcha.answer, onVerify, refreshCaptcha]);

  // Auto-verify when correct answer is typed
  useEffect(() => {
    if (userAnswer && parseInt(userAnswer, 10) === captcha.answer && !verified) {
      handleVerify();
    }
  }, [userAnswer, captcha.answer, verified, handleVerify]);

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Security Check</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={refreshCaptcha}
          disabled={disabled || verified}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-lg font-mono bg-background px-3 py-2 rounded border select-none">
            {captcha.question}
          </span>
          <Input
            type="number"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              setError(false);
            }}
            placeholder="?"
            disabled={disabled || verified}
            className={`w-20 text-center ${
              error ? 'border-destructive' : verified ? 'border-green-500' : ''
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleVerify();
              }
            }}
          />
        </div>

        {verified ? (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="h-5 w-5" />
            <span className="text-sm">Verified</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-1 text-destructive">
            <X className="h-5 w-5" />
            <span className="text-sm">Try again</span>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Solve the math problem to verify you're human
      </p>
    </div>
  );
}
