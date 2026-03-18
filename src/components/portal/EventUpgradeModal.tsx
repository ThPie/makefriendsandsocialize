import { getTierDisplayName } from '@/lib/tier-utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useUpgrade } from '@/contexts/UpgradeContext';

interface EventUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventTitle?: string;
    eventTier?: string;
}

export const EventUpgradeModal = ({
    isOpen,
    onClose,
    eventTitle,
    eventTier,
}: EventUpgradeModalProps) => {
    const { openUpgrade } = useUpgrade();

    const handleUpgrade = () => {
        onClose();
        openUpgrade();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Upgrade Required</DialogTitle>
                    <DialogDescription>
                        {eventTitle && eventTier && (
                            <>
                                <strong>{eventTitle}</strong> is exclusive to{' '}
                                {getTierDisplayName(eventTier)} members and above.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-muted-foreground">
                        Upgrade your membership to unlock access to exclusive events,
                        curated introductions, and more.
                    </p>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={onClose}>
                            Maybe Later
                        </Button>
                        <Button onClick={handleUpgrade}>
                            View Membership Options
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
