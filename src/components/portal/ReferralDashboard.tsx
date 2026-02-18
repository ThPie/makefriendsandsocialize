import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Copy, Mail, Share2, Users, Gift, Trophy, Check } from 'lucide-react';

interface Referral {
  id: string;
  referred_email: string | null;
  referred_user_id: string | null;
  status: string;
  created_at: string;
  converted_at: string | null;
}

export function ReferralDashboard() {
  const { user, profile } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = (profile as any)?.referral_code || 'Loading...';
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  // Fetch referral stats
  const { data: referrals = [], refetch } = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user?.id,
  });

  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const signedUpReferrals = referrals.filter(r => r.status === 'signed_up').length;
  const convertedReferrals = referrals.filter(r => r.status === 'converted').length;
  const totalReferrals = (profile as any)?.referral_count || signedUpReferrals + convertedReferrals;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join me on this exclusive club!");
    const body = encodeURIComponent(`I'd love for you to join this amazing community!\n\nSign up here: ${referralLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Join me on this exclusive club! Sign up here: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
  };

  const sendInvite = async () => {
    if (!inviteEmail || !user?.id) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-referral-invite', {
        body: {
          inviter_id: user.id,
          recipient_email: inviteEmail,
          personal_message: personalMessage || undefined,
        },
      });

      if (error) throw error;

      toast.success('Invitation sent successfully!');
      setInviteEmail('');
      setPersonalMessage('');
      refetch();
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  // Determine current reward tier
  const getRewardTier = () => {
    if (totalReferrals >= 10) return { tier: 'VIP', next: null, remaining: 0 };
    if (totalReferrals >= 5) return { tier: 'Ambassador', next: 'VIP', remaining: 10 - totalReferrals };
    if (totalReferrals >= 3) return { tier: 'Active', next: 'Ambassador', remaining: 5 - totalReferrals };
    if (totalReferrals >= 1) return { tier: 'Connector', next: 'Active', remaining: 3 - totalReferrals };
    return { tier: 'Starter', next: 'Connector', remaining: 1 };
  };

  const rewardTier = getRewardTier();

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#d4af37]" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your unique code with friends and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code Display */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg p-4 text-center">
              <span className="text-2xl font-mono font-bold tracking-wider">{referralCode}</span>
            </div>
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1 min-w-[120px]">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={shareViaEmail} className="flex-1 min-w-[120px]">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={shareViaWhatsApp} className="flex-1 min-w-[120px]">
              <Share2 className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={shareViaLinkedIn} className="flex-1 min-w-[120px]">
              <Share2 className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{totalReferrals}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-[#d4af37]" />
            <p className="text-3xl font-bold">{pendingReferrals}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <Check className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{signedUpReferrals}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Signed Up</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-[#d4af37]" />
            <p className="text-3xl font-bold">{convertedReferrals}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Reward Progress */}
      <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#d4af37]" />
            Reward Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge variant="secondary" className="text-sm">
                {rewardTier.tier}
              </Badge>
            </div>
            {rewardTier.next && (
              <p className="text-sm text-muted-foreground">
                {rewardTier.remaining} more to reach <strong>{rewardTier.next}</strong>
              </p>
            )}
          </div>

          {/* Tier Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 3, 5, 10].map((milestone, index) => (
              <div key={milestone} className="flex-1">
                <div className={`h-2 rounded-full ${totalReferrals >= milestone ? 'bg-primary' : 'bg-muted'}`} />
                <p className={`text-xs mt-1 text-center ${totalReferrals >= milestone ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {milestone}
                </p>
              </div>
            ))}
          </div>

          {/* Rewards List */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${totalReferrals >= 1 ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🤝</span>
                <div>
                  <p className="font-medium text-sm">Connector Badge</p>
                  <p className="text-xs text-muted-foreground">1 successful referral</p>
                </div>
              </div>
              {totalReferrals >= 1 && <Check className="h-5 w-5 text-green-500" />}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${totalReferrals >= 3 ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🎁</span>
                <div>
                  <p className="font-medium text-sm">1 Month Free</p>
                  <p className="text-xs text-muted-foreground">3 successful referrals</p>
                </div>
              </div>
              {totalReferrals >= 3 && <Check className="h-5 w-5 text-green-500" />}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${totalReferrals >= 5 ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🏆</span>
                <div>
                  <p className="font-medium text-sm">Ambassador Badge</p>
                  <p className="text-xs text-muted-foreground">5 successful referrals</p>
                </div>
              </div>
              {totalReferrals >= 5 && <Check className="h-5 w-5 text-green-500" />}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${totalReferrals >= 10 ? 'bg-[#d4af37]/10 border border-[#d4af37]/20' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">👑</span>
                <div>
                  <p className="font-medium text-sm">Lifetime VIP</p>
                  <p className="text-xs text-muted-foreground">10 successful referrals</p>
                </div>
              </div>
              {totalReferrals >= 10 && <Check className="h-5 w-5 text-green-500" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Invite Card */}
      <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Send Personal Invite</CardTitle>
          <CardDescription>
            Send a personalized invitation email to a friend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="friend@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Textarea
            placeholder="Add a personal message (optional)"
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            rows={3}
          />
          <Button
            onClick={sendInvite}
            disabled={!inviteEmail || isSending}
            className="w-full"
          >
            {isSending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/[0.08] rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {referral.referred_email || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={referral.status === 'converted' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {referral.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
