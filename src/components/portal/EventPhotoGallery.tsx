import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Lightbox } from '@/components/ui/lightbox';

interface EventPhoto {
  id: string;
  event_id: string;
  uploaded_by: string;
  photo_url: string;
  caption: string | null;
  is_approved: boolean;
  created_at: string;
  uploader?: {
    first_name: string | null;
    avatar_urls: string[] | null;
  };
}

interface EventPhotoGalleryProps {
  eventId: string;
  eventTitle: string;
  isPastEvent: boolean;
}

export function EventPhotoGallery({ eventId, eventTitle, isPastEvent }: EventPhotoGalleryProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['event-photos', eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('event_member_photos')
        .select('id, event_id, uploaded_by, photo_url, caption, is_approved, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uploaderIds = [...new Set((data || []).map((p: any) => p.uploaded_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_urls')
        .in('id', uploaderIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return (data || []).map((photo: any) => ({
        ...photo,
        uploader: profileMap.get(photo.uploaded_by),
      })) as EventPhoto[];
    },
    enabled: isPastEvent,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${eventId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('event-member-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-member-photos')
        .getPublicUrl(fileName);

      // Create database record
      const { error: dbError } = await (supabase as any).from('event_member_photos').insert({
        event_id: eventId,
        uploaded_by: user.id,
        photo_url: urlData.publicUrl,
        caption: caption || null,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-photos', eventId] });
      toast.success('Photo uploaded! It will appear after moderation.');
      setShowUpload(false);
      setSelectedFile(null);
      setCaption('');
      setUploading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload photo');
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await (supabase as any)
        .from('event_member_photos')
        .delete()
        .eq('id', photoId)
        .eq('uploaded_by', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-photos', eventId] });
      toast.success('Photo deleted');
    },
    onError: () => {
      toast.error('Failed to delete photo');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be smaller than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  // Filter to show only approved photos (or own photos)
  const visiblePhotos = photos.filter((p) => p.is_approved || p.uploaded_by === user?.id);
  const lightboxImages = visiblePhotos.map((p) => ({
    url: p.photo_url,
    alt: p.caption || 'Event photo',
  }));

  if (!isPastEvent) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Event Photos
          {visiblePhotos.length > 0 && (
            <span className="text-sm text-muted-foreground">({visiblePhotos.length})</span>
          )}
        </h3>

        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Photos</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Photo</Label>
                {selectedFile ? (
                  <div className="relative mt-2">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload (max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>

              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Photos are reviewed before appearing publicly
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : visiblePhotos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-1">No Photos Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to share your photos from {eventTitle}
            </p>
            <Button variant="outline" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload First Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visiblePhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Event photo'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Pending badge */}
                {!photo.is_approved && photo.uploaded_by === user?.id && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-white text-xs rounded-full">
                    Pending Review
                  </div>
                )}

                {/* Delete button for own photos */}
                {photo.uploaded_by === user?.id && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(photo.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                {/* Caption overlay */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Lightbox
            images={lightboxImages}
            currentIndex={lightboxIndex ?? 0}
            isOpen={lightboxIndex !== null}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        </>
      )}
    </div>
  );
}
