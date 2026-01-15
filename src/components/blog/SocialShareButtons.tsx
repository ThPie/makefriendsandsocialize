import { Twitter, Linkedin, Facebook, Link as LinkIcon, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  title: string;
  excerpt?: string;
  url?: string;
}

export const SocialShareButtons = ({ title, excerpt, url }: SocialShareButtonsProps) => {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt || '');

  const handleShare = async (platform: 'copy' | 'email' | 'twitter' | 'linkedin' | 'facebook') => {
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodedTitle}&body=${encodedExcerpt}%0A%0A${encodedUrl}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        onClick={() => handleShare('copy')}
        aria-label="Copy link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        onClick={() => handleShare('twitter')}
        aria-label="Share on X/Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        onClick={() => handleShare('linkedin')}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        onClick={() => handleShare('facebook')}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        onClick={() => handleShare('email')}
        aria-label="Share via email"
      >
        <Mail className="h-4 w-4" />
      </Button>
    </div>
  );
};
