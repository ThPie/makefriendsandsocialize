import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { PhotoUpload } from '@/components/admin/PhotoUpload';
import { InstagramSyncDialog } from '@/components/admin/InstagramSyncDialog';
import { Plus, Pencil, Trash2, Star, GripVertical, Camera, CheckSquare, Square, X, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EventPhoto {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  is_featured: boolean | null;
  display_order: number | null;
  event_id: string | null;
  instagram_post_id: string | null;
  source: string;
}

const CATEGORIES = [
  'Galas',
  'Seasonal Soirées',
  'Cocktail Hours',
  'Art & Wine',
  'Networking',
  'Workshops',
];

interface SortablePhotoCardProps {
  photo: EventPhoto;
  onEdit: () => void;
  onDelete: () => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const SortablePhotoCard = ({
  photo,
  onEdit,
  onDelete,
  isSelectionMode,
  isSelected,
  onToggleSelect
}: SortablePhotoCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: isSelectionMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.stopPropagation();
      onToggleSelect();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
        } ${isSelectionMode ? 'cursor-pointer' : ''}`}
    >
      <img
        src={photo.image_url}
        alt={photo.title || 'Event photo'}
        className="w-full h-full object-cover"
      />

      {/* Selection overlay */}
      {isSelectionMode && (
        <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-primary/20' : 'bg-transparent hover:bg-black/10'}`}>
          <div className="absolute top-2 left-2">
            {isSelected ? (
              <CheckSquare className="w-6 h-6 text-primary drop-shadow-lg" />
            ) : (
              <Square className="w-6 h-6 text-white drop-shadow-lg" />
            )}
          </div>
        </div>
      )}

      {/* Featured badge */}
      {photo.is_featured && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-yellow-500/90 text-yellow-950 gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      {/* Hover overlay (only in normal mode) */}
      {!isSelectionMode && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Drag handle */}
          <div
            {...listeners}
            {...attributes}
            className="absolute top-2 left-2 p-1.5 rounded bg-white/90 text-gray-700 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Actions */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Edit photo"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete photo"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="absolute bottom-2 left-2 text-white">
            <p className="text-sm font-medium truncate max-w-[120px]">
              {photo.title || 'Untitled'}
            </p>
            {photo.category && (
              <p className="text-xs text-white/70">{photo.category}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPhotos = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<EventPhoto | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<EventPhoto | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    category: '',
    is_featured: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch photos
  const { data: photos, isLoading } = useQuery({
    queryKey: ['admin-event-photos', filterCategory],
    queryFn: async () => {
      let query = supabase
        .from('event_photos')
        .select('*')
        .order('display_order', { ascending: true });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EventPhoto[];
    },
  });

  // Add photo mutation
  const addMutation = useMutation({
    mutationFn: async (data: Partial<EventPhoto>) => {
      const maxOrder = photos?.reduce((max, p) => Math.max(max, p.display_order || 0), 0) || 0;

      const { error } = await supabase.from('event_photos').insert([{
        image_url: data.image_url!,
        title: data.title || null,
        category: data.category || null,
        is_featured: data.is_featured || false,
        display_order: maxOrder + 1,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
      queryClient.invalidateQueries({ queryKey: ['featured-event-photos'] });
      setIsAddOpen(false);
      resetForm();
      toast.success('Photo added successfully');
    },
    onError: () => {
      toast.error('Failed to add photo');
    },
  });

  // Update photo mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventPhoto> }) => {
      const { error } = await supabase.from('event_photos').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
      queryClient.invalidateQueries({ queryKey: ['featured-event-photos'] });
      setEditingPhoto(null);
      resetForm();
      toast.success('Photo updated');
    },
    onError: () => {
      toast.error('Failed to update photo');
    },
  });

  // Delete photo mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('event_photos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
      queryClient.invalidateQueries({ queryKey: ['featured-event-photos'] });
      setDeletingPhoto(null);
      toast.success('Photo deleted');
    },
    onError: () => {
      toast.error('Failed to delete photo');
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('event_photos').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
      queryClient.invalidateQueries({ queryKey: ['featured-event-photos'] });
      setSelectedPhotos(new Set());
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);
      toast.success(`${selectedPhotos.size} photos deleted`);
    },
    onError: () => {
      toast.error('Failed to delete photos');
    },
  });

  // Bulk feature toggle mutation
  const bulkFeatureMutation = useMutation({
    mutationFn: async ({ ids, featured }: { ids: string[]; featured: boolean }) => {
      const { error } = await supabase.from('event_photos').update({ is_featured: featured }).in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
      queryClient.invalidateQueries({ queryKey: ['featured-event-photos'] });
      setSelectedPhotos(new Set());
      setIsSelectionMode(false);
      toast.success(`${variables.ids.length} photos ${variables.featured ? 'featured' : 'unfeatured'}`);
    },
    onError: () => {
      toast.error('Failed to update photos');
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedPhotos: { id: string; display_order: number }[]) => {
      const updates = reorderedPhotos.map(({ id, display_order }) =>
        supabase.from('event_photos').update({ display_order }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-event-photos'] });
    },
    onError: () => {
      toast.error('Failed to reorder photos');
      queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
    },
  });

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      category: '',
      is_featured: false,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !photos) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);

    const reordered = arrayMove(photos, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(['admin-event-photos', filterCategory], reordered);

    // Persist to database
    const updates = reordered.map((photo, index) => ({
      id: photo.id,
      display_order: index + 1,
    }));
    reorderMutation.mutate(updates);
  };

  const handleAddPhoto = () => {
    if (!formData.image_url) {
      toast.error('Please add an image');
      return;
    }
    addMutation.mutate(formData);
  };

  const handleEditPhoto = () => {
    if (!editingPhoto) return;
    updateMutation.mutate({
      id: editingPhoto.id,
      data: formData,
    });
  };

  const openEditDialog = (photo: EventPhoto) => {
    setFormData({
      image_url: photo.image_url,
      title: photo.title || '',
      category: photo.category || '',
      is_featured: photo.is_featured || false,
    });
    setEditingPhoto(photo);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
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
    if (photos) {
      setSelectedPhotos(new Set(photos.map((p) => p.id)));
    }
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedPhotos(new Set());
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedPhotos));
  };

  const handleBulkFeature = (featured: boolean) => {
    bulkFeatureMutation.mutate({ ids: Array.from(selectedPhotos), featured });
  };

  const featuredCount = photos?.filter((p) => p.is_featured).length || 0;
  const selectedCount = selectedPhotos.size;

  // Create set of existing Instagram post IDs for deduplication
  const existingInstagramPostIds = useMemo(() => {
    const ids = new Set<string>();
    photos?.forEach(p => {
      if (p.instagram_post_id) {
        ids.add(p.instagram_post_id);
      }
    });
    return ids;
  }, [photos]);

  const isAllSelected = photos && photos.length > 0 && selectedPhotos.size === photos.length;
  const isIndeterminate = selectedPhotos.size > 0 && selectedPhotos.size < (photos?.length || 0);

  const handleSelectAllChange = (checked: boolean | 'indeterminate') => {
    if (checked === true || checked === 'indeterminate') {
      selectAll();
      setIsSelectionMode(true);
    } else {
      deselectAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Select All Checkbox */}
          <div className="flex items-center">
            <Checkbox
              id="select-all-photos"
              checked={isIndeterminate ? 'indeterminate' : isAllSelected}
              onCheckedChange={handleSelectAllChange}
              className="h-5 w-5"
            />
          </div>
          <Camera className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-display">Photo Gallery</h1>
            <p className="text-muted-foreground text-sm">
              Manage event photos • {featuredCount}/8 featured on homepage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isSelectionMode ? (
            <>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setIsInstagramDialogOpen(true)}>
                <Instagram className="w-4 h-4 mr-2" />
                Sync Instagram
              </Button>

              <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                <CheckSquare className="w-4 h-4 mr-2" />
                Select
              </Button>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Photo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <PhotoUpload
                      onUpload={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                    />

                    {formData.image_url && (
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="Photo title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) =>
                          setFormData((prev) => ({ ...prev, category: val }))
                        }
                      >
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

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="featured">Featured on Homepage</Label>
                        <p className="text-xs text-muted-foreground">
                          {featuredCount >= 8 && !formData.is_featured
                            ? 'Max 8 featured photos reached'
                            : 'Show on the homepage gallery'}
                        </p>
                      </div>
                      <Switch
                        id="featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, is_featured: checked }))
                        }
                        disabled={featuredCount >= 8 && !formData.is_featured}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPhoto} disabled={addMutation.isPending}>
                        Add Photo
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {isSelectionMode && selectedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">
            {selectedCount} photo{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkFeature(true)}
            disabled={bulkFeatureMutation.isPending}
          >
            <Star className="w-4 h-4 mr-2" />
            Feature Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkFeature(false)}
            disabled={bulkFeatureMutation.isPending}
          >
            Unfeature Selected
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDeleteDialog(true)}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Photo Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : photos && photos.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo) => (
                <SortablePhotoCard
                  key={photo.id}
                  photo={photo}
                  onEdit={() => openEditDialog(photo)}
                  onDelete={() => setDeletingPhoto(photo)}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedPhotos.has(photo.id)}
                  onToggleSelect={() => togglePhotoSelection(photo.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No photos found</p>
          <p className="text-sm">Add your first photo to get started</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formData.image_url && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Photo title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, category: val }))
                }
              >
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

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="edit-featured">Featured on Homepage</Label>
                <p className="text-xs text-muted-foreground">
                  {featuredCount >= 8 && !formData.is_featured
                    ? 'Max 8 featured photos reached'
                    : 'Show on the homepage gallery'}
                </p>
              </div>
              <Switch
                id="edit-featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_featured: checked }))
                }
                disabled={featuredCount >= 8 && !formData.is_featured}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditPhoto} disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPhoto} onOpenChange={() => setDeletingPhoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPhoto && deleteMutation.mutate(deletingPhoto.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} Photos</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} photo{selectedCount !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedCount} Photos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Instagram Sync Dialog */}
      <InstagramSyncDialog
        open={isInstagramDialogOpen}
        onOpenChange={setIsInstagramDialogOpen}
        existingPostIds={existingInstagramPostIds}
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-event-photos'] });
        }}
      />
    </div>
  );
};

export default AdminPhotos;
