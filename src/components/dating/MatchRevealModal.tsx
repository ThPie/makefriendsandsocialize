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
import { Sparkles, Heart, Zap, Crown, Check, Loader2, Star } from 'lucide-react';
import { useMatchReveal } from '@/hooks/useMatchReveal';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { REVEAL_PACKS, TIER_BENEFITS } from '@/lib/stripe-products';

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
  const [selectedOption, setSelectedOption] = useState<'single' | 'pack_3' | 'pack_5' | 'membership' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRevealWithCredits = async () => {
    if (availableReveals <= 0) return;
    
    const result = await revealMatch(matchId);
    if (result.success) {
      onRevealSuccess();
      onClose();
    }
  };

  const handlePurchase = async (option: 'single' | 'pack_3' | 'pack_5') => {
    setIsProcessing(true);
    try {
      await openRevealCheckout(option, matchId);
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

        <div className="space-y-3 pt-4">
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
                  <p className="font-semibold text-foreground">{REVEAL_PACKS.single.name}</p>
                  <p className="text-sm text-muted-foreground">{REVEAL_PACKS.single.description}</p>
                </div>
              </div>
              <span className="font-bold text-lg">${REVEAL_PACKS.single.price}</span>
            </div>
          </button>

          {/* 3-pack purchase */}
          <button
            onClick={() => setSelectedOption('pack_3')}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all relative",
              selectedOption === 'pack_3'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
              Save {REVEAL_PACKS.pack_3.savings}
            </Badge>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{REVEAL_PACKS.pack_3.name}</p>
                  <p className="text-sm text-muted-foreground">{REVEAL_PACKS.pack_3.description}</p>
                </div>
              </div>
              <span className="font-bold text-lg">${REVEAL_PACKS.pack_3.price}</span>
            </div>
          </button>

          {/* 5-pack purchase - Best Value */}
          <button
            onClick={() => setSelectedOption('pack_5')}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all relative",
              selectedOption === 'pack_5'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
              Best Value - Save {REVEAL_PACKS.pack_5.savings}
            </Badge>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{REVEAL_PACKS.pack_5.name}</p>
                  <p className="text-sm text-muted-foreground">{REVEAL_PACKS.pack_5.description}</p>
                </div>
              </div>
              <span className="font-bold text-lg">${REVEAL_PACKS.pack_5.price}</span>
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
              Unlimited
            </Badge>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Become a Member</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">Unlimited reveals</span> + 20% off events
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">${TIER_BENEFITS.member.monthlyPrice}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">7-day free trial</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Cancel anytime</span>
            </div>
          </button>
        </div>

        {/* Action button */}
        {selectedOption && (
          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                if (selectedOption === 'single') {
                  handlePurchase('single');
                } else if (selectedOption === 'pack_3') {
                  handlePurchase('pack_3');
                } else if (selectedOption === 'pack_5') {
                  handlePurchase('pack_5');
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
              {selectedOption === 'single' && 'Purchase Single Reveal'}
              {selectedOption === 'pack_3' && 'Purchase 3-Pack'}
              {selectedOption === 'pack_5' && 'Purchase 5-Pack'}
              {selectedOption === 'membership' && 'Start Free Trial'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
