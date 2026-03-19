import { useState } from 'react';
import { Download, Share2, Link2, Check, Mail, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { type AttachmentStyle, type ResultProfile, resultProfiles } from './quizData';
import { generateResultsPDF } from './generateResultsPDF';
import { generateSocialCard } from './generateSocialCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ResultsShareActionsProps {
  scores: Record<AttachmentStyle, number>;
  winningStyle: AttachmentStyle;
  profile: ResultProfile;
}

const styleOrder: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized'];

export const ResultsShareActions = ({ scores, winningStyle, profile }: ResultsShareActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const { user } = useAuth();

  const handleShare = async () => {
    const shareData = {
      title: `My Attachment Style: ${profile.title}`,
      text: `I just discovered I'm ${profile.title} — "${profile.subtitle}". Take the quiz to find yours!`,
      url: window.location.origin + '/soul-maps/attachment-style',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.origin + '/soul-maps/attachment-style';
    await navigator.clipboard.writeText(
      `I'm "${profile.title}" — ${profile.subtitle}. Take the Attachment Style quiz: ${url}`
    );
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    toast.loading('Generating your PDF…', { id: 'pdf' });
    try {
      const blob = await generateResultsPDF(scores, winningStyle, profile);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attachment-style-results.pdf';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  const handleDownloadImage = async () => {
    toast.loading('Creating social card…', { id: 'img' });
    try {
      const blob = await generateSocialCard(scores, winningStyle, profile);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attachment-style-card.png';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Social card saved!', { id: 'img' });
    } catch {
      toast.error('Failed to create image', { id: 'img' });
    }
  };

  const handleEmailResults = async () => {
    if (!user?.email) {
      toast.error('Please sign in to email your results.');
      return;
    }
    setEmailing(true);
    try {
      const { error } = await supabase.functions.invoke('send-quiz-results-email', {
        body: {
          email: user.email,
          winningStyle,
          scores,
          profileTitle: profile.title,
          profileSubtitle: profile.subtitle,
          profileDescription: profile.description,
          traits: profile.traits,
          growthEdge: profile.growthEdge,
        },
      });
      if (error) throw error;
      toast.success('Results emailed to you!');
    } catch {
      toast.error('Failed to send email. Try again.');
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">Save & Share</p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          className="rounded-full gap-2 text-xs uppercase tracking-widest"
        >
          <Download className="w-3.5 h-3.5" /> PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadImage}
          className="rounded-full gap-2 text-xs uppercase tracking-widest"
        >
          <Image className="w-3.5 h-3.5" /> Social Card
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="rounded-full gap-2 text-xs uppercase tracking-widest"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="rounded-full gap-2 text-xs uppercase tracking-widest"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailResults}
            disabled={emailing}
            className="rounded-full gap-2 text-xs uppercase tracking-widest"
          >
            <Mail className="w-3.5 h-3.5" /> {emailing ? 'Sending…' : 'Email Me'}
          </Button>
        )}
      </div>
    </div>
  );
};
