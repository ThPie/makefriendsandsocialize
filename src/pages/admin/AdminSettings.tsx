import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Users, Link, Star, Loader2, Save, RefreshCw, Cloud, Calendar } from 'lucide-react';

interface MeetupStats {
  id: string;
  member_count: number;
  meetup_url: string | null;
  rating: number | null;
  avatar_urls: string[] | null;
  last_updated: string;
}

export default function AdminSettings() {
  const [meetupStats, setMeetupStats] = useState<MeetupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ lastSync: string | null; eventsCount: number }>({
    lastSync: null,
    eventsCount: 0
  });
  const [form, setForm] = useState({
    member_count: '',
    meetup_url: '',
    rating: '',
  });

  useEffect(() => {
    fetchSettings();
    fetchSyncStatus();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('meetup_stats')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMeetupStats(data);
        setForm({
          member_count: data.member_count?.toString() || '',
          meetup_url: data.meetup_url || '',
          rating: data.rating?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      // Get meetup events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'meetup');

      // Get last updated from meetup_stats
      const { data: stats } = await supabase
        .from('meetup_stats')
        .select('last_updated')
        .limit(1)
        .maybeSingle();

      setSyncStatus({
        lastSync: stats?.last_updated || null,
        eventsCount: eventsCount || 0
      });
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleSyncMeetup = async () => {
    setIsSyncing(true);
    toast.info('Starting Meetup sync...');

    try {
      // Call stats and events scrapers (no more reviews scraper)
      const statsResult = await supabase.functions.invoke('scrape-meetup');
      if (statsResult.error) throw new Error('Failed to sync stats: ' + statsResult.error.message);
      toast.success('Member stats synced');

      const eventsResult = await supabase.functions.invoke('scrape-meetup-events');
      if (eventsResult.error) throw new Error('Failed to sync events: ' + eventsResult.error.message);
      toast.success('Past events synced');

      toast.success('Meetup data sync complete!');
      fetchSettings();
      fetchSyncStatus();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveMeetupStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const statsData = {
        member_count: parseInt(form.member_count) || 0,
        meetup_url: form.meetup_url || null,
        rating: form.rating ? parseFloat(form.rating) : null,
        last_updated: new Date().toISOString(),
      };

      if (meetupStats) {
        const { error } = await supabase
          .from('meetup_stats')
          .update(statsData)
          .eq('id', meetupStats.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meetup_stats')
          .insert(statsData);
        if (error) throw error;
      }

      toast.success('Meetup stats saved');
      fetchSettings();
    } catch (error) {
      console.error('Error saving stats:', error);
      toast.error('Failed to save stats');
    } finally {
      setIsSaving(false);
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
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <h1 className="font-display text-3xl text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage site configuration and settings</p>
      </div>

      <div className="grid gap-6">
        {/* Meetup Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Meetup Data Sync
            </CardTitle>
            <CardDescription>
              Sync member stats, reviews, and past events from Meetup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Members</span>
                </div>
                <p className="text-2xl font-bold">{meetupStats?.member_count?.toLocaleString() || '—'}</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Imported Events</span>
                </div>
                <p className="text-2xl font-bold">{syncStatus.eventsCount}</p>
              </div>
            </div>

            {syncStatus.lastSync && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
              </p>
            )}

            <Button onClick={handleSyncMeetup} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Meetup Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meetup Statistics
            </CardTitle>
            <CardDescription>
              Configure the displayed Meetup community statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveMeetupStats} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member_count" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Member Count
                  </Label>
                  <Input
                    id="member_count"
                    type="number"
                    value={form.member_count}
                    onChange={(e) => setForm({ ...form, member_count: e.target.value })}
                    placeholder="e.g., 1500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetup_url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Meetup URL
                  </Label>
                  <Input
                    id="meetup_url"
                    value={form.meetup_url}
                    onChange={(e) => setForm({ ...form, meetup_url: e.target.value })}
                    placeholder="https://meetup.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating (out of 5)
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    placeholder="e.g., 4.8"
                  />
                </div>
              </div>

              {meetupStats?.last_updated && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-3 w-3" />
                  Last updated: {new Date(meetupStats.last_updated).toLocaleString()}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Membership Tiers Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Membership Tiers
            </CardTitle>
            <CardDescription>
              Overview of membership tier structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-2">Patron</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access to all events</li>
                  <li>• Community membership</li>
                  <li>• Basic profile</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <h3 className="font-semibold text-lg mb-2 text-primary">Fellow</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All Patron benefits</li>
                  <li>• Matchmaking access</li>
                  <li>• Priority event registration</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h3 className="font-semibold text-lg mb-2 text-amber-500">Founder</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All Fellow benefits</li>
                  <li>• Exclusive founder events</li>
                  <li>• Founding member badge</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Database Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage database statistics in the respective admin sections.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <a href="/admin/applications">Applications</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/members">Members</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/events">Events</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/connections">Connections</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
