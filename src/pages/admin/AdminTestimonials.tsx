import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Star,
  Check,
  X,
  Loader2,
  Plus,
  Quote,
  Eye,
  EyeOff,
  Award,
} from 'lucide-react';

interface Testimonial {
  id: string;
  user_id: string | null;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
  rating: number | null;
  is_approved: boolean;
  is_featured: boolean;
  source: string;
  created_at: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding external testimonial
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newSource, setNewSource] = useState<'internal' | 'trustpilot' | 'google'>('internal');
  const [newImageUrl, setNewImageUrl] = useState('');

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Testimonial approved');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to approve testimonial');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Testimonial rejected and removed');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to reject testimonial');
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentFeatured ? 'Removed from featured' : 'Added to featured');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleAddTestimonial = async () => {
    if (!newName || !newQuote) {
      toast.error('Please fill in name and quote');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          name: newName,
          role: newRole || null,
          quote: newQuote,
          rating: newRating,
          source: newSource,
          image_url: newImageUrl || null,
          is_approved: true, // Admin-added testimonials are auto-approved
          is_featured: false,
        });

      if (error) throw error;
      toast.success('Testimonial added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to add testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewRole('');
    setNewQuote('');
    setNewRating(5);
    setNewSource('internal');
    setNewImageUrl('');
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === 'pending') return !t.is_approved;
    if (filter === 'approved') return t.is_approved;
    if (filter === 'featured') return t.is_featured;
    return true;
  });

  const pendingCount = testimonials.filter((t) => !t.is_approved).length;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-foreground">Testimonials</h1>
            <p className="text-muted-foreground">
              Manage member reviews and testimonials
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add External Testimonial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="Fellow Member"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quote">Quote *</Label>
                  <Textarea
                    id="quote"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    placeholder="Their testimonial..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= newRating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select value={newSource} onValueChange={(v: 'internal' | 'trustpilot' | 'google') => setNewSource(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="trustpilot">Trustpilot</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTestimonial} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add Testimonial'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'featured'] as const).map((tab) => (
            <Button
              key={tab}
              variant={filter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab)}
              className="capitalize"
            >
              {tab}
              {tab === 'pending' && pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Testimonials List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No testimonials found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card border border-border rounded-xl p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                        <span className="text-primary font-semibold text-xl">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                      {testimonial.role && (
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      )}
                      {testimonial.image_url && (
                        <a 
                          href={testimonial.image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View full photo
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={testimonial.source === 'internal' ? 'secondary' : 'outline'}
                      className="capitalize"
                    >
                      {testimonial.source}
                    </Badge>
                    {testimonial.is_featured && (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        <Award className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {!testimonial.is_approved && (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>

                {testimonial.rating && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= testimonial.rating!
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {!testimonial.is_approved && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(testimonial.id)}
                        className="gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(testimonial.id)}
                        className="gap-1"
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </>
                  )}
                  {testimonial.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                      className="gap-1"
                    >
                      {testimonial.is_featured ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Remove from Featured
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          Add to Featured
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
