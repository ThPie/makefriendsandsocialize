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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Download,
  RefreshCw,
  ExternalLink,
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

interface ImportedReview {
  name: string;
  role: string;
  quote: string;
  rating: number;
  source: string;
  date?: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');

  // Form state for adding external testimonial
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newSource, setNewSource] = useState<'internal' | 'trustpilot' | 'google' | 'meetup'>('meetup');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Bulk import state
  const [bulkReviews, setBulkReviews] = useState('');
  const [parsedReviews, setParsedReviews] = useState<ImportedReview[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<Set<number>>(new Set());

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
          is_approved: true,
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
    setNewSource('meetup');
    setNewImageUrl('');
    setBulkReviews('');
    setParsedReviews([]);
    setSelectedReviews(new Set());
  };

  const parseBulkReviews = () => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(bulkReviews);
      if (Array.isArray(parsed)) {
        setParsedReviews(parsed.map((r: any) => ({
          name: r.name || r.author || 'Anonymous',
          role: r.role || r.title || 'Member',
          quote: r.quote || r.text || r.review || r.content || '',
          rating: r.rating || r.stars || 5,
          source: r.source || 'google',
          date: r.date,
        })));
        setSelectedReviews(new Set(parsed.map((_, i) => i)));
        toast.success(`Parsed ${parsed.length} reviews`);
      }
    } catch {
      // Try line-by-line parsing
      const lines = bulkReviews.split('\n').filter(l => l.trim());
      const reviews: ImportedReview[] = [];
      
      for (const line of lines) {
        // Format: "Quote text" - Author Name (Rating stars)
        const match = line.match(/"([^"]+)"\s*-\s*([^(]+)(?:\((\d)\s*(?:stars?|★)?\))?/i);
        if (match) {
          reviews.push({
            name: match[2].trim(),
            role: 'Member',
            quote: match[1],
            rating: parseInt(match[3]) || 5,
            source: 'google',
          });
        }
      }
      
      if (reviews.length > 0) {
        setParsedReviews(reviews);
        setSelectedReviews(new Set(reviews.map((_, i) => i)));
        toast.success(`Parsed ${reviews.length} reviews`);
      } else {
        toast.error('Could not parse reviews. Try JSON format: [{"name": "...", "quote": "...", "rating": 5}]');
      }
    }
  };

  const handleBulkImport = async () => {
    const reviewsToImport = parsedReviews.filter((_, i) => selectedReviews.has(i));
    
    if (reviewsToImport.length === 0) {
      toast.error('Please select reviews to import');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert(reviewsToImport.map(r => ({
          name: r.name,
          role: r.role,
          quote: r.quote,
          rating: r.rating,
          source: r.source,
          is_approved: true,
          is_featured: false,
        })));

      if (error) throw error;
      toast.success(`Imported ${reviewsToImport.length} reviews successfully`);
      setIsAddDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to import reviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncMeetup = async () => {
    setIsSyncing(true);
    try {
      // Trigger Meetup stats sync
      const { data, error } = await supabase.functions.invoke('scrape-meetup', {
        body: { meetupUrl: 'https://www.meetup.com/makefriendsandsocialize/' }
      });

      if (error) throw error;
      toast.success('Meetup data synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync Meetup data');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleReviewSelection = (index: number) => {
    const newSelection = new Set(selectedReviews);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedReviews(newSelection);
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === 'pending') return !t.is_approved;
    if (filter === 'approved') return t.is_approved;
    if (filter === 'featured') return t.is_featured;
    return true;
  });

  const pendingCount = testimonials.filter((t) => !t.is_approved).length;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google':
        return '🌐';
      case 'trustpilot':
        return '⭐';
      case 'meetup':
        return '📍';
      default:
        return '💬';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage member reviews and import from external sources
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSyncMeetup}
            disabled={isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync Meetup
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Testimonials</DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'import')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="import">Bulk Import</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4 pt-4">
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
                      <Select value={newSource} onValueChange={(v: 'internal' | 'trustpilot' | 'google' | 'meetup') => setNewSource(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meetup">📍 Meetup</SelectItem>
                          <SelectItem value="google">🌐 Google</SelectItem>
                          <SelectItem value="trustpilot">⭐ Trustpilot</SelectItem>
                          <SelectItem value="internal">💬 Internal</SelectItem>
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
                </TabsContent>

                <TabsContent value="import" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Paste Reviews (JSON or Line Format)</Label>
                    <Textarea
                      value={bulkReviews}
                      onChange={(e) => setBulkReviews(e.target.value)}
                      placeholder={`Paste JSON array:
[{"name": "Jane Doe", "quote": "Amazing community!", "rating": 5, "source": "google"}]

Or line format:
"Great experience" - John Smith (5 stars)`}
                      className="min-h-[150px] font-mono text-sm"
                    />
                    <Button variant="secondary" onClick={parseBulkReviews} className="gap-2">
                      <Download className="h-4 w-4" />
                      Parse Reviews
                    </Button>
                  </div>

                  {parsedReviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Select Reviews to Import ({selectedReviews.size}/{parsedReviews.length})</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (selectedReviews.size === parsedReviews.length) {
                              setSelectedReviews(new Set());
                            } else {
                              setSelectedReviews(new Set(parsedReviews.map((_, i) => i)));
                            }
                          }}
                        >
                          {selectedReviews.size === parsedReviews.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {parsedReviews.map((review, index) => (
                          <div
                            key={index}
                            onClick={() => toggleReviewSelection(index)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedReviews.has(index)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{review.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {getSourceIcon(review.source)} {review.source}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  "{review.quote}"
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkImport} 
                      disabled={isSubmitting || selectedReviews.size === 0}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        `Import ${selectedReviews.size} Reviews`
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          How to Import Reviews
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Google Reviews:</strong> Copy reviews from Google Maps and paste in the bulk import</li>
          <li>• <strong>Trustpilot:</strong> Export reviews from Trustpilot and paste the JSON data</li>
          <li>• <strong>Meetup:</strong> Click "Sync Meetup" to refresh member stats and event data</li>
          <li>• <strong>Manual:</strong> Use the manual entry tab for individual testimonials</li>
        </ul>
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
          <p className="text-sm mt-2">Import reviews from Google, Trustpilot, or add them manually</p>
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
                    {getSourceIcon(testimonial.source)} {testimonial.source}
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
