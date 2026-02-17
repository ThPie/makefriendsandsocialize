import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const RegisterSW = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            toast('Update Available', {
                description: 'A new version of the app is available. Please update to see the latest changes.',
                action: (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateServiceWorker(true)}
                    >
                        Update
                    </Button>
                ),
                duration: Infinity,
            });
        }
    }, [needRefresh, updateServiceWorker]);

    return null;
};
