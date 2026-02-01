import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Instagram, RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InstagramPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  timestamp: string | null;
}

interface FetchResponse {
  success: boolean;
  error?: string;
  data?: {
    username: string;
    photos: InstagramPhoto[];
    profileUrl: string;
  };
}

const CATEGORIES = [
  'Galas',
  'Seasonal Soirées',
  'Cocktail Hours',
  'Art & Wine',
  'Networking',
  'Workshops',
];

interface InstagramSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPostIds: Set<string>;
  onImportComplete: () => void;
}

export function InstagramSyncDialog({ 
  open, 
  onOpenChange, 
  existingPostIds,
  onImportComplete 
}: InstagramSyncDialogProps) {
  const queryClient = useQueryClient();
  
  const [username, setUsername] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('Networking');
  const [autoSync, setAutoSync] = useState(false);
  const [fetchedPhotos, setFetchedPhotos] = useState<InstagramPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch existing settings
  const { data: settings } = useQuery({
    queryKey: ['instagram-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Load saved settings when dialog opens
  useEffect(() => {
    if (settings && open) {
      setUsername(settings.instagram_username || '');
      setDefaultCategory(settings.default_category || 'Networking');
      setAutoSync(settings.auto_sync_enabled || false);
    }
  }, [settings, open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setFetchedPhotos([]);
      setSelectedPhotos(new Set());
      setFetchError(null);
      setHasFetched(false);
    }
  }, [open]);

  const handleFetchPhotos = async () => {
    if (!username.trim()) {
      toast.error('Please enter an Instagram username');
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setFetchedPhotos([]);
    setSelectedPhotos(new Set());

    try {
      const { data, error } = await supabase.functions.invoke<FetchResponse>('fetch-instagram-photos', {
        body: { username: username.trim() },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch photos');
      }

      const photos = data.data?.photos || [];
      setFetchedPhotos(photos);
      
      // Auto-select photos that haven't been imported yet
      const newPhotoIds = new Set(
        photos
          .filter(p => !existingPostIds.has(p.id))
          .map(p => p.id)
      );
      setSelectedPhotos(newPhotoIds);
      setHasFetched(true);

      if (photos.length === 0) {
        toast.info('No photos found. Make sure the profile is public.');
      } else {
        toast.success(`Found ${photos.length} photos`);
      }
    } catch (error) {
      console.error('Error fetching Instagram photos:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch photos';
      setFetchError(message);
      toast.error(message);
    } finally {
      setIsFetching(false);
    }
  };

  const togglePhoto = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const newPhotoIds = fetchedPhotos
      .filter(p => !existingPostIds.has(p.id))
      .map(p => p.id);
    setSelectedPhotos(new Set(newPhotoIds));
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      // Check if settings exist
      if (settings?.id) {
        const { error } = await supabase
          .from('instagram_settings')
          .update({
            instagram_username: username.trim(),
            default_category: defaultCategory,
            auto_sync_enabled: autoSync,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('instagram_settings')
          .insert({
            instagram_username: username.trim(),
            default_category: defaultCategory,
            auto_sync_enabled: autoSync,
            last_synced_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-settings'] });
    },
  });

  // Import photos mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      const photosToImport = fetchedPhotos.filter(p => selectedPhotos.has(p.id));
      
      if (photosToImport.length === 0) {
        throw new Error('No photos selected');
      }

      // Get current max display order
      const { data: existingPhotos } = await supabase
        .from('event_photos')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      let currentOrder = existingPhotos?.[0]?.display_order || 0;

      // Insert photos in batches
      const photosData = photosToImport.map(photo => ({
        image_url: photo.imageUrl,
        title: photo.caption || `Instagram Photo`,
        category: defaultCategory || null,
        is_featured: false,
        display_order: ++currentOrder,
        instagram_post_id: photo.id,
        source: 'instagram',
      }));

      const { error } = await supabase.from('event_photos').insert(photosData);
      if (error) throw error;

      return photosToImport.length;
    },
    onSuccess: (count) => {
      // Also save settings
      saveSettingsMutation.mutate();
      
      queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
      queryClient.invalidateQueries({ queryKey: ['featured-event-photos'] });
      toast.success(`Imported ${count} photos from Instagram`);
      onOpenChange(false);
      onImportComplete();
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import photos');
    },
  });

  const handleImport = () => {
    if (selectedPhotos.size === 0) {
      toast.error('Please select at least one photo to import');
      return;
    }
    importMutation.mutate();
  };

  const newPhotosCount = fetchedPhotos.filter(p => !existingPostIds.has(p.id)).length;
  const alreadyImportedCount = fetchedPhotos.length - newPhotosCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Sync from Instagram
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Settings Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram-username">Instagram Username</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="instagram-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="makefriendsandsocialize"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Category</Label>
              <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="auto-sync" className="font-medium">Automatic Daily Sync</Label>
              <p className="text-xs text-muted-foreground">
                Automatically import new Instagram photos daily
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>

          <Button 
            onClick={handleFetchPhotos} 
            disabled={isFetching || !username.trim()}
            className="w-full"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching Photos...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Fetch Photos
              </>
            )}
          </Button>

          {/* Error State */}
          {fetchError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{fetchError}</p>
            </div>
          )}

          {/* Loading State */}
          {isFetching && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          )}

          {/* Photos Grid */}
          {hasFetched && !isFetching && fetchedPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {fetchedPhotos.length} photos found
                  </span>
                  {alreadyImportedCount > 0 && (
                    <Badge variant="secondary">
                      {alreadyImportedCount} already imported
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All New
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                {fetchedPhotos.map((photo) => {
                  const isAlreadyImported = existingPostIds.has(photo.id);
                  const isSelected = selectedPhotos.has(photo.id);

                  return (
                    <div
                      key={photo.id}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isAlreadyImported
                          ? 'opacity-50 cursor-not-allowed border-muted'
                          : isSelected
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => !isAlreadyImported && togglePhoto(photo.id)}
                    >
                      <img
                        src={photo.imageUrl}
                        alt="Instagram photo"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {isAlreadyImported ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Badge variant="secondary" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Imported
                          </Badge>
                        </div>
                      ) : isSelected ? (
                        <div className="absolute top-2 left-2">
                          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2">
                          <div className="w-5 h-5 border-2 border-white rounded bg-black/20" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {hasFetched && !isFetching && fetchedPhotos.length === 0 && !fetchError && (
            <div className="text-center py-8 text-muted-foreground">
              <Instagram className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No photos found</p>
              <p className="text-sm">Make sure the Instagram profile is public</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {selectedPhotos.size > 0 && `${selectedPhotos.size} selected`}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={selectedPhotos.size === 0 || importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>Import {selectedPhotos.size > 0 ? selectedPhotos.size : ''} Photos</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
