import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BlogLikeBookmarkProps {
  postId: string;
}

export const BlogLikeBookmark = ({ postId }: BlogLikeBookmarkProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(false);

  useEffect(() => {
    fetchLikeStatus();
    fetchBookmarkStatus();
  }, [postId, user]);

  const fetchLikeStatus = async () => {
    try {
      // Get like count
      const { count } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      setLikeCount(count || 0);

      // Check if user has liked
      if (user) {
        const { data } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        setIsLiked(!!data);
      }
    } catch (error) {
      // Ignore not found errors
    }
  };

  const fetchBookmarkStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('blog_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      setIsBookmarked(!!data);
    } catch (error) {
      // Ignore not found errors
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    setIsLoadingLike(true);
    try {
      if (isLiked) {
        await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('blog_likes')
          .insert({ post_id: postId, user_id: user.id });

        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark posts');
      return;
    }

    setIsLoadingBookmark(true);
    try {
      if (isBookmarked) {
        await supabase
          .from('blog_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await supabase
          .from('blog_bookmarks')
          .insert({ post_id: postId, user_id: user.id });

        setIsBookmarked(true);
        toast.success('Added to bookmarks');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setIsLoadingBookmark(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 transition-colors",
          isLiked && "text-red-500 hover:text-red-600"
        )}
        onClick={handleLike}
        disabled={isLoadingLike}
      >
        {isLoadingLike ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <motion.div
            whileTap={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </motion.div>
        )}
        <span>{likeCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 transition-colors",
          isBookmarked && "text-primary"
        )}
        onClick={handleBookmark}
        disabled={isLoadingBookmark}
      >
        {isLoadingBookmark ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <motion.div
            whileTap={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
          </motion.div>
        )}
        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      </Button>
    </div>
  );
};
