import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Check, X, Eye, FileText, Shield, AlertTriangle, Scan } from 'lucide-react';
import { format } from 'date-fns';

interface SecurityReport {
  id: string;
  status: string;
  severity: string | null;
  red_flags: string[] | null;
}

interface Application {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  interests: string[] | null;
  favorite_brands: string[] | null;
  style_description: string | null;
  values_in_partner: string | null;
  user_email?: string;
  security_report?: SecurityReport | null;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    const { data, error } = await supabase
      .from('application_waitlist')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch applications');
      return;
    }

    // Fetch security reports for each application
    const applicationsWithReports = await Promise.all(
      (data || []).map(async (app) => {
        const { data: report } = await supabase
          .from('member_security_reports')
          .select('id, status, severity, red_flags')
          .eq('user_id', app.user_id)
          .order('scanned_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        return { ...app, security_report: report };
      })
    );

    setApplications(applicationsWithReports);
    setIsLoading(false);
  }

  async function handleApprove(app: Application) {
    setIsProcessing(true);

    // Update application status
    const { error: appError } = await supabase
      .from('application_waitlist')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', app.id);

    if (appError) {
      toast.error('Failed to approve application');
      setIsProcessing(false);
      return;
    }

    // Activate membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('user_id', app.user_id);

    if (membershipError) {
      toast.error('Failed to activate membership');
      setIsProcessing(false);
      return;
    }

    toast.success('Application approved');
    setSelectedApp(null);
    setAdminNotes('');
    setIsProcessing(false);
    fetchApplications();
  }

  async function handleReject(app: Application) {
    setIsProcessing(true);

    const { error } = await supabase
      .from('application_waitlist')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', app.id);

    if (error) {
      toast.error('Failed to reject application');
      setIsProcessing(false);
      return;
    }

    toast.success('Application rejected');
    setSelectedApp(null);
    setAdminNotes('');
    setIsProcessing(false);
    fetchApplications();
  }

  async function handleRunScan(app: Application) {
    setIsScanning(true);
    
    try {
      // Fetch profile data for this user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, city, country, job_title, industry, bio')
        .eq('id', app.user_id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch profile data');
      }

      // Call the deep-osint-analysis edge function
      const { data, error } = await supabase.functions.invoke('deep-osint-analysis', {
        body: {
          userId: app.user_id,
          email: app.user_email || '',
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          city: profile?.city || '',
          country: profile?.country || '',
          jobTitle: profile?.job_title || '',
          industry: profile?.industry || '',
          bio: profile?.bio || '',
          scanType: 'manual',
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Security scan completed');
      fetchApplications();
      
      // Update the selected app with new security report
      if (data?.report) {
        setSelectedApp(prev => prev ? {
          ...prev,
          security_report: {
            id: data.report.id,
            status: data.report.status,
            severity: data.report.severity,
            red_flags: data.report.redFlags,
          }
        } : null);
      }
    } catch (error) {
      console.error('Error running security scan:', error);
      toast.error('Failed to run security scan');
    } finally {
      setIsScanning(false);
    }
  }

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const approvedApps = applications.filter((a) => a.status === 'approved');
  const rejectedApps = applications.filter((a) => a.status === 'rejected');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getSecurityBadge = (report: SecurityReport | null | undefined) => {
    if (!report) {
      return <Badge variant="outline" className="text-muted-foreground">No Scan</Badge>;
    }
    
    const severityColors: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    
    const statusIcons: Record<string, JSX.Element> = {
      clean: <Shield className="h-3 w-3 text-green-500" />,
      flagged: <AlertTriangle className="h-3 w-3 text-red-500" />,
      under_review: <AlertTriangle className="h-3 w-3 text-yellow-500" />,
      pending: <Loader2 className="h-3 w-3 animate-spin" />,
    };

    return (
      <Badge 
        variant="outline" 
        className={`gap-1 ${severityColors[report.severity || 'low'] || ''}`}
      >
        {statusIcons[report.status] || statusIcons.pending}
        {report.status === 'clean' ? 'Clean' : report.status === 'flagged' ? 'Flagged' : report.status}
      </Badge>
    );
  };

  const ApplicationRow = ({ app }: { app: Application }) => (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="font-medium text-foreground">
          Application #{app.id.slice(0, 8)}
        </p>
        <p className="text-sm text-muted-foreground">
          Submitted {format(new Date(app.submitted_at), 'MMM d, yyyy')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {getSecurityBadge(app.security_report)}
        {app.security_report?.id && (
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/admin/security?report=${app.security_report.id}`}>
              <Shield className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Badge
          variant={
            app.status === 'approved'
              ? 'default'
              : app.status === 'rejected'
              ? 'destructive'
              : 'secondary'
          }
        >
          {app.status}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedApp(app);
            setAdminNotes(app.admin_notes || '');
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Applications
        </h1>
        <p className="text-muted-foreground">
          Review and manage membership applications
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <FileText className="h-4 w-4" />
            Pending ({pendingApps.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <Check className="h-4 w-4" />
            Approved ({approvedApps.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <X className="h-4 w-4" />
            Rejected ({rejectedApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {pendingApps.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No pending applications
                </div>
              ) : (
                pendingApps.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {approvedApps.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No approved applications
                </div>
              ) : (
                approvedApps.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {rejectedApps.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No rejected applications
                </div>
              ) : (
                rejectedApps.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Application Details
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Application ID</p>
                  <p className="font-medium">{selectedApp.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedApp.status === 'approved'
                        ? 'default'
                        : selectedApp.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {selectedApp.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(selectedApp.submitted_at), 'MMM d, yyyy')}
                  </p>
                </div>
                {selectedApp.reviewed_at && (
                  <div>
                    <p className="text-muted-foreground">Reviewed</p>
                    <p className="font-medium">
                      {format(new Date(selectedApp.reviewed_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {selectedApp.style_description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Style Description
                  </p>
                  <p className="text-foreground">
                    {selectedApp.style_description}
                  </p>
                </div>
              )}

              {selectedApp.values_in_partner && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Values in a Partner
                  </p>
                  <p className="text-foreground">
                    {selectedApp.values_in_partner}
                  </p>
                </div>
              )}

              {selectedApp.favorite_brands &&
                selectedApp.favorite_brands.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Favorite Brands
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.favorite_brands.map((brand) => (
                        <Badge key={brand} variant="outline">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {selectedApp.interests && selectedApp.interests.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.interests.map((interest) => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Status Section */}
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Status
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunScan(selectedApp)}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Run Security Scan
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {getSecurityBadge(selectedApp.security_report)}
                  </div>
                  
                  {selectedApp.security_report?.severity && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Severity:</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedApp.security_report.severity}
                      </Badge>
                    </div>
                  )}
                  
                  {selectedApp.security_report?.red_flags && selectedApp.security_report.red_flags.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Red Flags:</span>
                      <ul className="mt-1 text-sm text-destructive list-disc list-inside">
                        {selectedApp.security_report.red_flags.slice(0, 3).map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                        {selectedApp.security_report.red_flags.length > 3 && (
                          <li className="text-muted-foreground">
                            +{selectedApp.security_report.red_flags.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {selectedApp.security_report?.id && (
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link to={`/admin/security?report=${selectedApp.security_report.id}`}>
                        View Full Report →
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this application..."
                  className="min-h-[100px]"
                  disabled={selectedApp.status !== 'pending'}
                />
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedApp)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedApp)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
