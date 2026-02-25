import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Search,
  Loader2,
  Eye,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Globe,
  MapPin,
  Star,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  RefreshCw,
  ExternalLink,
  Bot,
  Clock,
} from 'lucide-react';

type LeadStatus = 'new' | 'contacted' | 'converted' | 'dismissed';

interface Lead {
  id: string;
  source_platform: string;
  source_url: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_location: string | null;
  lead_interests: string[];
  relevance_score: number;
  status: LeadStatus;
  outreach_suggestion: string | null;
  raw_content: string | null;
  notes: string | null;
  discovered_at: string;
  contacted_at: string | null;
  converted_at: string | null;
  audience_segment: string | null;
  is_automated: boolean | null;
  discovery_run_id: string | null;
}

const AUDIENCE_SEGMENTS: Record<string, { label: string; color: string }> = {
  singles: { label: 'Singles', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  couples: { label: 'Couples', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  new_in_town: { label: 'New in Town', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  professionals: { label: 'Professionals', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  expats: { label: 'Expats', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  empty_nesters: { label: 'Empty Nesters', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  newly_single: { label: 'Newly Single', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
};

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  new: { label: 'New', color: 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]', icon: Sparkles },
  contacted: { label: 'Contacted', color: 'bg-amber-500/10 text-amber-500', icon: MessageSquare },
  converted: { label: 'Converted', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

const platformConfig: Record<string, { color: string }> = {
  reddit: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  facebook: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  meetup: { color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  twitter: { color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  unknown: { color: 'bg-muted text-muted-foreground border-border' },
};

export default function AdminLeads() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [targetCities, setTargetCities] = useState('New York, Los Angeles, Miami');
  const [targetKeywords, setTargetKeywords] = useState('looking for friends, new to city, social events');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<LeadStatus | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch leads
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('relevance_score', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ 
      leadId, 
      status, 
      notes 
    }: { 
      leadId: string; 
      status: LeadStatus; 
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      if (status === 'contacted') {
        updateData.contacted_at = new Date().toISOString();
      } else if (status === 'converted') {
        updateData.converted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Lead updated');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(null);
    },
    onError: (error) => {
      toast.error('Failed to update lead');
      console.error(error);
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Lead deleted');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(null);
    },
    onError: (error) => {
      toast.error('Failed to delete lead');
      console.error(error);
    },
  });

  // Run lead discovery
  const runDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const cities = targetCities.split(',').map(c => c.trim()).filter(Boolean);
      const keywords = targetKeywords.split(',').map(k => k.trim()).filter(Boolean);

      const { data, error } = await supabase.functions.invoke('find-leads', {
        body: {
          targetCities: cities,
          targetKeywords: keywords,
          maxResults: 20,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Found ${data.summary.savedToDb} new leads!`);
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      } else {
        throw new Error(data.error || 'Discovery failed');
      }
    } catch (error) {
      console.error('Discovery error:', error);
      toast.error('Failed to run lead discovery', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleStatusChange = (status: LeadStatus) => {
    if (!selectedLead) return;
    updateLeadMutation.mutate({
      leadId: selectedLead.id,
      status,
      notes: notes || undefined,
    });
  };

  // Filter leads
  const filteredLeads = leads?.filter(lead => {
    const statusMatch = activeTab === 'all' || lead.status === activeTab;
    const segmentMatch = segmentFilter === 'all' || lead.audience_segment === segmentFilter;
    return statusMatch && segmentMatch;
  }) || [];

  // Segment stats
  const segmentStats = Object.keys(AUDIENCE_SEGMENTS).reduce((acc, key) => {
    acc[key] = leads?.filter(l => l.audience_segment === key).length || 0;
    return acc;
  }, {} as Record<string, number>);

  const automatedCount = leads?.filter(l => l.is_automated).length || 0;

  // Stats
  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0,
    avgScore: leads?.length 
      ? Math.round(leads.reduce((sum, l) => sum + (l.relevance_score || 0), 0) / leads.length) 
      : 0,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Lead Generation
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered lead discovery and outreach management
          </p>
        </div>
      </div>

      {/* Discovery Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Lead Discovery
          </CardTitle>
          <CardDescription>
            Search for potential leads across social platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Cities (comma-separated)</label>
              <Input
                value={targetCities}
                onChange={(e) => setTargetCities(e.target.value)}
                placeholder="New York, Los Angeles, Miami"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords (comma-separated)</label>
              <Input
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
                placeholder="looking for friends, new to city"
              />
            </div>
          </div>
          <Button onClick={runDiscovery} disabled={isDiscovering} className="gap-2">
            {isDiscovering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Discovering Leads...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find Leads
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--accent-gold))]/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--accent-gold))]/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.contacted}</p>
                <p className="text-sm text-muted-foreground">Contacted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.converted}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--accent-gold))]/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgScore}</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Stats */}
      <Card className="bg-[hsl(var(--accent-gold))]/5 border-[hsl(var(--accent-gold))]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Automated Discovery</p>
                <p className="text-sm text-muted-foreground">
                  Runs daily at 6:00 AM UTC • {automatedCount} leads discovered automatically
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Next run in ~24h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segment Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium">Filter by Audience:</span>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments ({stats.total})</SelectItem>
            {Object.entries(AUDIENCE_SEGMENTS).map(([key, segment]) => (
              <SelectItem key={key} value={key}>
                {segment.label} ({segmentStats[key] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Discovered Leads</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeadStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="new">New ({stats.new})</TabsTrigger>
              <TabsTrigger value="contacted">Contacted ({stats.contacted})</TabsTrigger>
              <TabsTrigger value="converted">Converted ({stats.converted})</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No leads found</p>
              <p className="text-sm">Run discovery to find new leads</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => {
                const StatusIcon = statusConfig[lead.status].icon;
                const platform = lead.source_platform?.toLowerCase() || 'unknown';

                return (
                  <div
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setNotes(lead.notes || '');
                    }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${statusConfig[lead.status].color}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">
                            {lead.lead_name || 'Anonymous Lead'}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={platformConfig[platform]?.color || platformConfig.unknown.color}
                          >
                            {lead.source_platform}
                          </Badge>
                          {lead.audience_segment && AUDIENCE_SEGMENTS[lead.audience_segment] && (
                            <Badge 
                              variant="outline" 
                              className={AUDIENCE_SEGMENTS[lead.audience_segment].color}
                            >
                              {AUDIENCE_SEGMENTS[lead.audience_segment].label}
                            </Badge>
                          )}
                          {lead.is_automated && (
                            <Badge variant="secondary" className="text-xs">
                              Auto
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {lead.lead_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lead.lead_location}
                            </span>
                          )}
                          {lead.lead_interests?.length > 0 && (
                            <span>{lead.lead_interests.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(lead.relevance_score)}`}>
                          {lead.relevance_score}
                        </p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-primary" />
              Lead Details
            </DialogTitle>
            <DialogDescription>
              {selectedLead?.lead_name || 'Anonymous'} • 
              Discovered {selectedLead && new Date(selectedLead.discovered_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {selectedLead && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(selectedLead.relevance_score)}`}>
                        {selectedLead.relevance_score}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Platform</p>
                      <Badge 
                        variant="outline" 
                        className={platformConfig[selectedLead.source_platform?.toLowerCase() || 'unknown']?.color}
                      >
                        {selectedLead.source_platform}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge className={statusConfig[selectedLead.status].color}>
                        {statusConfig[selectedLead.status].label}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Location & Interests */}
                {(selectedLead.lead_location || selectedLead.lead_interests?.length > 0) && (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      {selectedLead.lead_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.lead_location}</span>
                        </div>
                      )}
                      {selectedLead.lead_interests?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedLead.lead_interests.map((interest, i) => (
                            <Badge key={i} variant="secondary">{interest}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Source URL */}
                {selectedLead.source_url && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={selectedLead.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          View Source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Outreach Suggestion */}
                {selectedLead.outreach_suggestion && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        AI Outreach Suggestion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground italic">
                        "{selectedLead.outreach_suggestion}"
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Raw Content */}
                {selectedLead.raw_content && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Original Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedLead.raw_content}
                        </p>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedLead && deleteLeadMutation.mutate(selectedLead.id)}
              disabled={deleteLeadMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <div className="flex gap-2 flex-1 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('dismissed')}
                disabled={updateLeadMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('contacted')}
                disabled={updateLeadMutation.isPending}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Mark Contacted
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange('converted')}
                disabled={updateLeadMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Converted
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
