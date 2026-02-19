/**
 * PhoneCapturePage - Lightweight page opened via QR code on phone
 * Takes a photo using native camera and relays it back to desktop via Supabase Realtime
 */
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Camera, CheckCircle, Upload, Loader2 } from 'lucide-react';

const PhoneCapturePage = () => {
    const { token } = useParams<{ token: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<'ready' | 'uploading' | 'done' | 'error'>('ready');
    const [errorMsg, setErrorMsg] = useState('');

    // Verify token exists
    useEffect(() => {
        if (!token || token.length < 10) {
            setStatus('error');
            setErrorMsg('Invalid or expired link. Please scan the QR code again.');
        }
    }, [token]);

    const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !token) return;

        setStatus('uploading');

        try {
            // Upload to Supabase storage in a temp folder keyed by token
            const fileExt = file.name.split('.').pop() || 'jpg';
            const filePath = `qr-uploads/${token}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filePath);

            // Broadcast the URL to the desktop via Realtime channel
            const channel = supabase.channel(`photo-upload-${token}`);

            await new Promise<void>((resolve, reject) => {
                channel.subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        channel.send({
                            type: 'broadcast',
                            event: 'photo-captured',
                            payload: { url: publicUrl },
                        }).then(() => {
                            // Short delay to ensure the desktop receives it
                            setTimeout(() => {
                                supabase.removeChannel(channel);
                                resolve();
                            }, 1000);
                        }).catch(reject);
                    }
                });

                // Timeout after 10 seconds
                setTimeout(() => reject(new Error('Broadcast timeout')), 10000);
            });

            setStatus('done');
        } catch (err: any) {
            console.error('Upload error:', err);
            setStatus('error');
            setErrorMsg(err.message || 'Upload failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f0b] flex items-center justify-center p-6">
            <div className="max-w-sm w-full space-y-8 text-center">
                {/* Logo / branding */}
                <div>
                    <h1 className="text-2xl font-display text-white mb-2">
                        Take Your Photo
                    </h1>
                    <p className="text-white/50 text-sm">
                        Make Friends & Socialize
                    </p>
                </div>

                {status === 'ready' && (
                    <div className="space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-full bg-white/5 border-2 border-dashed border-[#D4AF37]/50 flex items-center justify-center">
                            <Camera className="h-12 w-12 text-[#D4AF37]" />
                        </div>
                        <p className="text-white/70 text-sm">
                            Tap the button below to take a high-quality portrait photo with your camera.
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-4 px-6 bg-[#D4AF37] text-[#0a0f0b] font-medium text-lg rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 transition-transform"
                        >
                            <Camera className="h-5 w-5 inline mr-2" />
                            Open Camera
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleCapture}
                            className="hidden"
                        />
                    </div>
                )}

                {status === 'uploading' && (
                    <div className="space-y-6">
                        <Loader2 className="h-16 w-16 text-[#D4AF37] animate-spin mx-auto" />
                        <p className="text-white/70 text-lg">Uploading your photo...</p>
                        <p className="text-white/40 text-sm">This will sync to your desktop automatically.</p>
                    </div>
                )}

                {status === 'done' && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <div>
                            <p className="text-white text-xl font-medium">Photo Uploaded!</p>
                            <p className="text-white/50 text-sm mt-2">
                                Your photo has been synced to your desktop. You can close this page.
                            </p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center">
                            <Upload className="h-12 w-12 text-red-400" />
                        </div>
                        <div>
                            <p className="text-white text-xl font-medium">Something went wrong</p>
                            <p className="text-red-400 text-sm mt-2">{errorMsg}</p>
                        </div>
                        {token && (
                            <button
                                onClick={() => { setStatus('ready'); setErrorMsg(''); }}
                                className="px-6 py-3 border border-white/20 text-white rounded-full"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneCapturePage;
