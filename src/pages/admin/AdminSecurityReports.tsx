import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion,
  Search,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Globe,
  Users,
  TrendingUp,
  AlertOctagon,
} from 'lucide-react';
import { format } from 'date-fns';

type SecurityStatus = 'pending' | 'clean' | 'flagged' | 'under_review' | 'cleared' | 'suspended';
type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';
type SecurityRecommendation = 'approve' | 'investigate' | 'suspend' | 'remove';

interface SecurityReport {
  id: string;
  user_id: string;
  scan_type: string;
  status: SecurityStatus;
  severity: SecuritySeverity;
  findings: Record<string, unknown>;
  red_flags: string[];
  positive_signals: string[];
  identity_score: number;
  social_consistency_score: number;
  risk_assessment: string;
  ai_recommendation: SecurityRecommendation;
  admin_decision: string | null;
  admin_notes: string | null;
  sources_checked: string[];
  scanned_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_urls: string[] | null;
    city: string | null;
    country: string | null;
    job_title: string | null;
  };
}

interface MemberForScan {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  country: string | null;
  job_title: string | null;
  industry: string | null;
  bio: string | null;
}

const statusConfig: Record<SecurityStatus, { label: string; color: string; icon: typeof Shield }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  clean: { label: 'Clean', color: 'bg-green-500/10 text-green-500', icon: ShieldCheck },
  flagged: { label: 'Flagged', color: 'bg-destructive/10 text-destructive', icon: ShieldAlert },
  under_review: { label: 'Under Review', color: 'bg-amber-500/10 text-amber-500', icon: ShieldQuestion },
  cleared: { label: 'Cleared', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-500', icon: XCircle },
};

const severityConfig: Record<SecuritySeverity, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  high: { label: 'High', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  critical: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const recommendationConfig: Record<SecurityRecommendation, { label: string; color: string; icon: typeof UserCheck }> = {
  approve: { label: 'Approve', color: 'text-green-500', icon: UserCheck },
  investigate: { label: 'Investigate', color: 'text-amber-500', icon: Search },
  suspend: { label: 'Suspend', color: 'text-orange-500', icon: AlertTriangle },
  remove: { label: 'Remove', color: 'text-destructive', icon: UserX },
};

export default function AdminSecurityReports() {
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMemberId, setScanMemberId] = useState<string | null>(null);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all security reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['security-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_security_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each report
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_urls, city, country, job_title')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      return data.map(report => ({
        ...report,
        profile: profileMap.get(report.user_id),
      })) as SecurityReport[];
    },
  });

  // Fetch members for manual scan
  const { data: members } = useQuery({
    queryKey: ['members-for-scan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, city, country, job_title, industry, bio')
        .order('first_name');

      if (error) throw error;
      return data as MemberForScan[];
    },
    enabled: showMemberSelector,
  });

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ 
      reportId, 
      status, 
      adminDecision, 
      adminNotes 
    }: { 
      reportId: string; 
      status: SecurityStatus; 
      adminDecision: string; 
      adminNotes: string;
    }) => {
      const { error } = await supabase
        .from('member_security_reports')
        .update({
          status,
          admin_decision: adminDecision,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report updated successfully');
      queryClient.invalidateQueries({ queryKey: ['security-reports'] });
      setSelectedReport(null);
    },
    onError: (error) => {
      toast.error('Failed to update report');
      console.error(error);
    },
  });

  // Run OSINT scan
  const runScan = async (member: MemberForScan) => {
    setIsScanning(true);
    setScanMemberId(member.id);
    setShowMemberSelector(false);

    try {
      const { data, error } = await supabase.functions.invoke('deep-osint-analysis', {
        body: {
          userId: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          city: member.city,
          country: member.country,
          jobTitle: member.job_title,
          industry: member.industry,
          bio: member.bio,
          scanType: 'manual',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('OSINT scan completed', {
          description: `Status: ${data.summary.status}, Severity: ${data.summary.severity}`,
        });
        queryClient.invalidateQueries({ queryKey: ['security-reports'] });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to run OSINT scan', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsScanning(false);
      setScanMemberId(null);
    }
  };

  const handleAction = (action: 'clear' | 'review' | 'suspend') => {
    if (!selectedReport) return;

    const statusMap: Record<string, SecurityStatus> = {
      clear: 'cleared',
      review: 'under_review',
      suspend: 'suspended',
    };

    updateReportMutation.mutate({
      reportId: selectedReport.id,
      status: statusMap[action],
      adminDecision: action,
      adminNotes,
    });
  };

  // Stats
  const stats = {
    total: reports?.length || 0,
    flagged: reports?.filter(r => r.status === 'flagged').length || 0,
    underReview: reports?.filter(r => r.status === 'under_review').length || 0,
    critical: reports?.filter(r => r.severity === 'critical').length || 0,
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Security Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Deep OSINT analysis and member security vetting
            </p>
          </div>
          <Button 
            onClick={() => setShowMemberSelector(true)}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Run Manual Scan
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[hsl(var(--accent-gold))]/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.flagged}</p>
                  <p className="text-sm text-muted-foreground">Flagged</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <ShieldQuestion className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.underReview}</p>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertOctagon className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Security Reports</CardTitle>
            <CardDescription>
              Click on a report to view details and take action
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No security reports yet</p>
                <p className="text-sm">Run a manual scan to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports?.map((report) => {
                  const StatusIcon = statusConfig[report.status].icon;
                  const RecommendationIcon = report.ai_recommendation 
                    ? recommendationConfig[report.ai_recommendation].icon 
                    : Search;

                  return (
                    <div
                      key={report.id}
                      onClick={() => {
                        setSelectedReport(report);
                        setAdminNotes(report.admin_notes || '');
                      }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${statusConfig[report.status].color}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {report.profile?.first_name} {report.profile?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {report.profile?.job_title || 'No job title'} • {report.profile?.city || 'Unknown location'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={severityConfig[report.severity].color}>
                          {severityConfig[report.severity].label}
                        </Badge>
                        {report.ai_recommendation && (
                          <div className={`flex items-center gap-1 ${recommendationConfig[report.ai_recommendation].color}`}>
                            <RecommendationIcon className="h-4 w-4" />
                            <span className="text-sm">{recommendationConfig[report.ai_recommendation].label}</span>
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(report.scanned_at), 'MMM d, yyyy')}
                        </span>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                Security Report Details
              </DialogTitle>
              <DialogDescription>
                {selectedReport?.profile?.first_name} {selectedReport?.profile?.last_name} • 
                Scanned {selectedReport && format(new Date(selectedReport.scanned_at), 'PPP')}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              {selectedReport && (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="findings">Findings</TabsTrigger>
                    <TabsTrigger value="sources">Sources</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Status & Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Status</p>
                          <Badge className={statusConfig[selectedReport.status].color}>
                            {statusConfig[selectedReport.status].label}
                          </Badge>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Severity</p>
                          <Badge variant="outline" className={severityConfig[selectedReport.severity].color}>
                            {severityConfig[selectedReport.severity].label}
                          </Badge>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Identity Score</p>
                          <p className="text-2xl font-bold">{selectedReport.identity_score || 'N/A'}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Social Score</p>
                          <p className="text-2xl font-bold">{selectedReport.social_consistency_score || 'N/A'}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* AI Recommendation */}
                    {selectedReport.ai_recommendation && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            AI Recommendation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`flex items-center gap-2 mb-3 ${recommendationConfig[selectedReport.ai_recommendation].color}`}>
                            {(() => {
                              const Icon = recommendationConfig[selectedReport.ai_recommendation].icon;
                              return <Icon className="h-5 w-5" />;
                            })()}
                            <span className="font-semibold text-lg">
                              {recommendationConfig[selectedReport.ai_recommendation].label}
                            </span>
                          </div>
                          {selectedReport.risk_assessment && (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {selectedReport.risk_assessment}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Red Flags & Positive Signals */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Red Flags ({selectedReport.red_flags?.length || 0})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedReport.red_flags?.length > 0 ? (
                            <ul className="space-y-2">
                              {selectedReport.red_flags.map((flag, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No red flags detected</p>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                            Positive Signals ({selectedReport.positive_signals?.length || 0})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedReport.positive_signals?.length > 0 ? (
                            <ul className="space-y-2">
                              {selectedReport.positive_signals.map((signal, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                  {signal}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No positive signals recorded</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="findings" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Raw Findings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                          {JSON.stringify(selectedReport.findings, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sources" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Sources Checked ({selectedReport.sources_checked?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedReport.sources_checked?.length > 0 ? (
                          <ul className="space-y-2">
                            {selectedReport.sources_checked.map((source, i) => (
                              <li key={i} className="text-sm">
                                {source.startsWith('http') ? (
                                  <a 
                                    href={source} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline break-all"
                                  >
                                    {source}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">{source}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No sources recorded</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              <Separator className="my-4" />

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => handleAction('review')}
                disabled={updateReportMutation.isPending}
              >
                <ShieldQuestion className="h-4 w-4 mr-2" />
                Mark for Review
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction('suspend')}
                disabled={updateReportMutation.isPending}
              >
                <UserX className="h-4 w-4 mr-2" />
                Suspend Member
              </Button>
              <Button
                onClick={() => handleAction('clear')}
                disabled={updateReportMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Clear Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Member Selector Dialog */}
        <Dialog open={showMemberSelector} onOpenChange={setShowMemberSelector}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Member to Scan</DialogTitle>
              <DialogDescription>
                Choose a member to run a deep OSINT analysis on
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {members?.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => runScan(member)}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.job_title || 'No job title'} • {member.city || 'Unknown location'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
    </div>
  );
}
