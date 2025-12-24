import { useEffect, useState } from 'react';
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
import { Loader2, Check, X, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

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
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

    setApplications(data || []);
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
