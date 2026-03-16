import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Crown, Check, Loader2 } from 'lucide-react';
import { useMatchReveal } from '@/hooks/useMatchReveal';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { REVEAL_PURCHASE, TIER_BENEFITS } from '@/lib/stripe-products';

interface MatchRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  compatibilityScore: number;
  onRevealSuccess: () => void;
}

export const MatchRevealModal = ({
  isOpen,
  onClose,
  matchId,
  compatibilityScore,
  onRevealSuccess,
}: MatchRevealModalProps) => {
  const { availableReveals, revealMatch, openRevealCheckout, isRevealing } = useMatchReveal();
  const { openCheckout } = useSubscription();
  const [selectedOption, setSelectedOption] = useState<'single' | 'membership' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRevealWithCredits = async () => {
    if (availableReveals <= 0) return;
    
    const result = await revealMatch(matchId);
    if (result.success) {
      onRevealSuccess();
      onClose();
    }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      await openRevealCheckout('single', matchId);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMembershipUpgrade = async () => {
    setIsProcessing(true);
    try {
      await openCheckout('member', 'monthly', true);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="h-5 w-5 text-primary" />
            Reveal Your Match
          </DialogTitle>
          <DialogDescription>
            This match has a <span className="font-semibold text-primary">{compatibilityScore}%</span> compatibility score!
            Choose how you'd like to see their full profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Compatibility explanation */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              What's This Score?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our AI matchmaker analyzed {compatibilityScore}% compatibility based on your shared values, communication styles, life goals, and relationship expectations using Gottman Institute research. This score indicates potential for a meaningful connection, but real chemistry happens in conversation!
            </p>
          </div>

          <div className="space-y-3">
          {/* Use existing credits */}
          {availableReveals > 0 && (
            <button
              onClick={handleRevealWithCredits}
              disabled={isRevealing}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                "border-primary bg-primary/5 hover:bg-primary/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Use a Reveal Credit</p>
                    <p className="text-sm text-muted-foreground">
                      You have {availableReveals} credit{availableReveals !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">Free</Badge>
              </div>
              {isRevealing && (
                <div className="flex items-center justify-center mt-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </button>
          )}

          {/* Single reveal purchase */}
          <button
            onClick={() => setSelectedOption('single')}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all",
              selectedOption === 'single'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{REVEAL_PURCHASE.name}</p>
                  <p className="text-sm text-muted-foreground">{REVEAL_PURCHASE.description}</p>
                </div>
              </div>
              <span className="font-bold text-lg">${REVEAL_PURCHASE.price}</span>
            </div>
          </button>

          {/* Membership upgrade */}
          <button
            onClick={() => setSelectedOption('membership')}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden",
              selectedOption === 'membership'
                ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white">
              {TIER_BENEFITS.insider.features[0]}
            </Badge>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Become an Insider</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">3 reveals/month included</span> + Slow Dating access
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">${TIER_BENEFITS.insider.monthlyPrice}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">14-day free trial</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Cancel anytime</span>
            </div>
          </button>
          </div>
        </div>

        {/* Transparency footer */}
        <div className="bg-muted/30 rounded-lg p-3 mt-2">
          <p className="text-xs text-muted-foreground text-center">
            💡 <strong>Pro tip:</strong> High scores don't guarantee chemistry—they just mean our algorithm thinks you'd have great conversations. The real magic happens when you meet!
          </p>
        </div>

        {/* Action button */}
        {selectedOption && (
          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                if (selectedOption === 'single') {
                  handlePurchase();
                } else if (selectedOption === 'membership') {
                  handleMembershipUpgrade();
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {selectedOption === 'single' && `Purchase Reveal — $${REVEAL_PURCHASE.price}`}
              {selectedOption === 'membership' && 'Start Free Trial'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};