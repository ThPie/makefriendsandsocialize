import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PhotoUpload } from '@/components/admin/PhotoUpload';
import { Plus, GripVertical, Pencil, Trash2, Star, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface EventPhoto {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  is_featured: boolean | null;
  display_order: number | null;
  event_id: string | null;
}

const categories = [
  'Galas',
  'Seasonal Soirées',
  'Cocktail Hours',
  'Art & Wine',
  'Networking',
  'Workshops',
  'Other',
];

// Sortable photo card component
const SortablePhotoCard = ({
  photo,
  onEdit,
  onDelete,
}: {
  photo: EventPhoto;
  onEdit: (photo: EventPhoto) => void;
  onDelete: (photo: EventPhoto) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1.5 rounded bg-black/50 text-white cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Featured badge */}
      {photo.is_featured && (
        <div className="absolute top-2 right-2 z-10 p-1.5 rounded bg-primary text-primary-foreground">
          <Star className="w-4 h-4 fill-current" />
        </div>
      )}

      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={photo.image_url}
          alt={photo.title || 'Event photo'}
          className="w-full h-full object-cover"
        />
        
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(photo)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(photo)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-medium text-sm truncate">
          {photo.title || 'Untitled'}
        </p>
        <p className="text-xs text-muted-foreground">
          {photo.category || 'No category'}
        </p>
      </div>
    </div>
  );
};

const AdminPhotos = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<EventPhoto | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<EventPhoto | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

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

  const featuredCount = photos?.filter((p) => p.is_featured).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-display">Photo Gallery</h1>
            <p className="text-muted-foreground text-sm">
              Manage event photos • {featuredCount}/8 featured on homepage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                      {categories.map((cat) => (
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
        </div>
      </div>

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
                  onEdit={openEditDialog}
                  onDelete={setDeletingPhoto}
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
                  {categories.map((cat) => (
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
    </div>
  );
};

export default AdminPhotos;
