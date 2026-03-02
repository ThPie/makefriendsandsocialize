import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Video, Upload, X, Loader2, Play, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VibeClipUploadProps {
    userId: string;
    existingUrl?: string | null;
    status?: string | null;
    onSuccess?: (url: string) => void;
}

export const VibeClipUpload = ({ userId, existingUrl, status, onSuccess }: VibeClipUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate video
        if (!file.type.startsWith('video/')) {
            toast.error('Please upload a valid video file.');
            return;
        }

        if (file.size > 20 * 1024 * 1024) { // 20MB limit
            toast.error('Video size must be less than 20MB.');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `vibe-clips/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('vibe-clips')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('vibe-clips')
                .getPublicUrl(filePath);

            // Update profile
            const { error: profileError } = await (supabase as any)
                .from('profiles')
                .update({
                    vibe_clip_url: publicUrl,
                    vibe_clip_status: 'pending_verification'
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            setPreviewUrl(publicUrl);
            onSuccess?.(publicUrl);
            toast.success('Vibe clip uploaded! ✨');

            // Trigger AI Verification
            setVerifying(true);
            try {
                const { data: verData, error: verError } = await supabase.functions.invoke('verify-vibe-clip', {
                    body: { userId, videoUrl: publicUrl },
                });

                if (verError) throw verError;

                if (verData?.is_verified) {
                    toast.success('Verified: ' + verData.reason);
                } else {
                    toast.warning('Verification Issue: ' + verData.reason);
                }
            } catch (err) {
                console.error('Verification trigger failed:', err);
                toast.error('Automated verification failed. Support will review manually.');
            } finally {
                setVerifying(false);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload video.');
        } finally {
            setUploading(false);
        }
    };

    const removeClip = async () => {
        setPreviewUrl(null);
        await (supabase as any).from('profiles').update({ vibe_clip_url: null, vibe_clip_status: null }).eq('id', userId);
        toast.info('Vibe clip removed.');
    };

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Vibe Clip
                </CardTitle>
                <CardDescription>
                    Share a 15-second "vibe" video to help others get to know you better.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {previewUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-primary/20 aspect-video bg-black">
                        <video
                            src={previewUrl}
                            className="w-full h-full object-cover"
                            controls
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={removeClip}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-2 left-2 flex gap-2">
                            {verifying ? (
                                <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                    VERIFYING...
                                </span>
                            ) : status === 'verified' ? (
                                <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                    <CheckCircle className="h-2.5 w-2.5" />
                                    VERIFIED
                                </span>
                            ) : (
                                <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                    PENDING VERIFICATION
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div
                        className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-10 w-10 text-primary/40 mb-4" />
                        <p className="text-sm font-medium text-foreground">Upload Video</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                            Max 20MB. Format: MP4, MOV.
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="video/*"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
