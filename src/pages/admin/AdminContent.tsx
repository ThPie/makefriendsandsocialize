import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Image, Plus, Edit, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';

interface JournalPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  event_id: string | null;
  order_index: number;
  created_at: string;
}

interface PostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  is_published: boolean;
}

interface GalleryForm {
  image_url: string;
  caption: string;
  order_index: string;
}

const initialPostForm: PostForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  cover_image: '',
  is_published: false,
};

const initialGalleryForm: GalleryForm = {
  image_url: '',
  caption: '',
  order_index: '0',
};

export default function AdminContent() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [postForm, setPostForm] = useState<PostForm>(initialPostForm);
  const [galleryForm, setGalleryForm] = useState<GalleryForm>(initialGalleryForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const [postsRes, galleryRes] = await Promise.all([
        supabase.from('journal_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('gallery_items').select('*').order('order_index', { ascending: true }),
      ]);

      if (postsRes.error) throw postsRes.error;
      if (galleryRes.error) throw galleryRes.error;

      setPosts(postsRes.data || []);
      setGalleryItems(galleryRes.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const postData = {
        title: postForm.title,
        slug: postForm.slug || generateSlug(postForm.title),
        content: postForm.content || null,
        excerpt: postForm.excerpt || null,
        cover_image: postForm.cover_image || null,
        is_published: postForm.is_published,
        published_at: postForm.is_published ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('journal_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        toast.success('Post updated successfully');
      } else {
        const { error } = await supabase
          .from('journal_posts')
          .insert(postData);
        if (error) throw error;
        toast.success('Post created successfully');
      }

      setIsPostDialogOpen(false);
      setEditingPost(null);
      setPostForm(initialPostForm);
      fetchContent();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(error.message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const galleryData = {
        image_url: galleryForm.image_url,
        caption: galleryForm.caption || null,
        order_index: parseInt(galleryForm.order_index) || 0,
      };

      if (editingGalleryItem) {
        const { error } = await supabase
          .from('gallery_items')
          .update(galleryData)
          .eq('id', editingGalleryItem.id);
        if (error) throw error;
        toast.success('Gallery item updated');
      } else {
        const { error } = await supabase
          .from('gallery_items')
          .insert(galleryData);
        if (error) throw error;
        toast.success('Gallery item added');
      }

      setIsGalleryDialogOpen(false);
      setEditingGalleryItem(null);
      setGalleryForm(initialGalleryForm);
      fetchContent();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      toast.error('Failed to save gallery item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = (post: JournalPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content || '',
      excerpt: post.excerpt || '',
      cover_image: post.cover_image || '',
      is_published: post.is_published,
    });
    setIsPostDialogOpen(true);
  };

  const handleEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryForm({
      image_url: item.image_url,
      caption: item.caption || '',
      order_index: item.order_index.toString(),
    });
    setIsGalleryDialogOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase.from('journal_posts').delete().eq('id', postId);
      if (error) throw error;
      toast.success('Post deleted');
      fetchContent();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;

    try {
      const { error } = await supabase.from('gallery_items').delete().eq('id', itemId);
      if (error) throw error;
      toast.success('Gallery item deleted');
      fetchContent();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast.error('Failed to delete gallery item');
    }
  };

  const togglePublish = async (post: JournalPost) => {
    try {
      const { error } = await supabase
        .from('journal_posts')
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq('id', post.id);
      if (error) throw error;
      toast.success(post.is_published ? 'Post unpublished' : 'Post published');
      fetchContent();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Failed to update post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Content</h1>
        <p className="text-muted-foreground mt-1">Manage journal posts and gallery</p>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Journal Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Gallery ({galleryItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Dialog open={isPostDialogOpen} onOpenChange={(open) => {
              if (!open) {
                setEditingPost(null);
                setPostForm(initialPostForm);
              }
              setIsPostDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePostSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-title">Title *</Label>
                    <Input
                      id="post-title"
                      value={postForm.title}
                      onChange={(e) => {
                        setPostForm({
                          ...postForm,
                          title: e.target.value,
                          slug: editingPost ? postForm.slug : generateSlug(e.target.value),
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-slug">Slug *</Label>
                    <Input
                      id="post-slug"
                      value={postForm.slug}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-excerpt">Excerpt</Label>
                    <Textarea
                      id="post-excerpt"
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                      rows={2}
                      placeholder="Brief summary of the post..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-content">Content</Label>
                    <Textarea
                      id="post-content"
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      rows={8}
                      placeholder="Full post content..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-cover">Cover Image URL</Label>
                    <Input
                      id="post-cover"
                      value={postForm.cover_image}
                      onChange={(e) => setPostForm({ ...postForm, cover_image: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      id="post-publish"
                      checked={postForm.is_published}
                      onCheckedChange={(checked) => setPostForm({ ...postForm, is_published: checked })}
                    />
                    <Label htmlFor="post-publish">Publish immediately</Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingPost ? 'Update Post' : 'Create Post'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No journal posts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                          <Badge className={post.is_published ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}>
                            {post.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          /{post.slug} • Created {format(new Date(post.created_at), 'PP')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => togglePublish(post)}>
                          {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Dialog open={isGalleryDialogOpen} onOpenChange={(open) => {
              if (!open) {
                setEditingGalleryItem(null);
                setGalleryForm(initialGalleryForm);
              }
              setIsGalleryDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGalleryItem ? 'Edit Gallery Item' : 'Add Gallery Image'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGallerySubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="gallery-url">Image URL *</Label>
                    <Input
                      id="gallery-url"
                      value={galleryForm.image_url}
                      onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gallery-caption">Caption</Label>
                    <Input
                      id="gallery-caption"
                      value={galleryForm.caption}
                      onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                      placeholder="Describe this image..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gallery-order">Order</Label>
                    <Input
                      id="gallery-order"
                      type="number"
                      value={galleryForm.order_index}
                      onChange={(e) => setGalleryForm({ ...galleryForm, order_index: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsGalleryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingGalleryItem ? 'Update' : 'Add'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {galleryItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No gallery images yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <img
                      src={item.image_url}
                      alt={item.caption || 'Gallery image'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => handleEditGalleryItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteGalleryItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {item.caption && (
                    <CardContent className="p-3">
                      <p className="text-sm text-muted-foreground truncate">{item.caption}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
