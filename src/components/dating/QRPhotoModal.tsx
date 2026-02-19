/**
 * QRPhotoModal - Shows a QR code on desktop for users to scan with their phone
 * and take a high-quality photo that syncs back via Supabase Realtime
 */
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, X, Loader2, CheckCircle } from 'lucide-react';

interface QRPhotoModalProps {
    open: boolean;
    onClose: () => void;
    onPhotoReceived: (url: string) => void;
}

function generateToken(): string {
    return crypto.randomUUID().replace(/-/g, '');
}

export const QRPhotoModal = ({ open, onClose, onPhotoReceived }: QRPhotoModalProps) => {
    const [token] = useState(() => generateToken());
    const [status, setStatus] = useState<'waiting' | 'received'>('waiting');
    const [receivedUrl, setReceivedUrl] = useState<string | null>(null);

    const siteUrl = window.location.origin;
    const captureUrl = `${siteUrl}/photo-capture/${token}`;

    useEffect(() => {
        if (!open) return;

        const channel = supabase.channel(`photo-upload-${token}`);

        channel
            .on('broadcast', { event: 'photo-captured' }, (payload) => {
                const url = payload.payload?.url;
                if (url) {
                    setReceivedUrl(url);
                    setStatus('received');
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [open, token]);

    const handleUsePhoto = useCallback(() => {
        if (receivedUrl) {
            onPhotoReceived(receivedUrl);
            onClose();
        }
    }, [receivedUrl, onPhotoReceived, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1a231b] border border-white/10 rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {status === 'waiting' ? (
                    <div className="text-center space-y-6">
                        <div className="space-y-2">
                            <Smartphone className="h-8 w-8 text-[#D4AF37] mx-auto" />
                            <h3 className="text-white text-xl font-display">
                                Take Photo with Your Phone
                            </h3>
                            <p className="text-white/50 text-sm">
                                Scan this QR code with your phone camera to take a high-quality portrait photo.
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white rounded-2xl p-4 inline-block mx-auto">
                            <QRCodeSVG
                                value={captureUrl}
                                size={200}
                                level="M"
                                includeMargin={false}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Waiting for photo...
                        </div>

                        <p className="text-white/30 text-xs">
                            Your phone must be connected to the internet. The photo will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white text-xl font-display">
                                Photo Received!
                            </h3>
                            <p className="text-white/50 text-sm">
                                Your phone photo has been captured successfully.
                            </p>
                        </div>

                        {receivedUrl && (
                            <img
                                src={receivedUrl}
                                alt="Captured"
                                className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-[#D4AF37]"
                            />
                        )}

                        <Button
                            onClick={handleUsePhoto}
                            className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 px-8 font-medium rounded-full"
                        >
                            Use This Photo
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
