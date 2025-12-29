import { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useConfetti } from '@/hooks/useConfetti';

interface BadgeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  unlockedFeatures?: string[];
}

export function BadgeUnlockModal({
  isOpen,
  onClose,
  badgeName,
  badgeIcon,
  badgeDescription,
  unlockedFeatures,
}: BadgeUnlockModalProps) {
  const { fireConfetti } = useConfetti();

  useEffect(() => {
    if (isOpen) {
      // Delay confetti slightly for better effect
      const timer = setTimeout(() => {
        fireConfetti();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fireConfetti]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="text-7xl mb-6"
        >
          {badgeIcon}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-2xl text-primary mb-2">Badge Unlocked!</h2>
          <h3 className="font-display text-xl text-foreground mb-4">{badgeName}</h3>
          <p className="text-muted-foreground mb-6">{badgeDescription}</p>

          {unlockedFeatures && unlockedFeatures.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="font-medium text-foreground mb-3">You've unlocked:</p>
              <ul className="space-y-2 text-left">
                {unlockedFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✨</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={onClose} className="w-full">
            Awesome!
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
