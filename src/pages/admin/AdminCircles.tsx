import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Filter,
  RefreshCw,
} from "lucide-react";

interface CircleApplication {
  id: string;
  user_id: string | null;
  circle_name: string;
  full_name: string;
  email: string;
  french_level: string | null;
  improvement_goals: string | null;
  comfortable_speaking: boolean | null;
  dress_code_commitment: boolean | null;
  instagram_linkedin: string | null;
  reason_to_join: string | null;
  style_preference: string | null;
  membership_tier: string;
  status: string;
  admin_notes: string | null;
  created_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const AdminCircles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [circleFilter, setCircleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<CircleApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ["circle-applications", circleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("circle_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (circleFilter !== "all") {
        query = query.eq("circle_name", circleFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CircleApplication[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("circle_applications")
        .update({
          status,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circle-applications"] });
      toast({
        title: "Application Updated",
        description: "The application status has been updated successfully.",
      });
      setSelectedApplication(null);
      setAdminNotes("");
    },
    onError: (error) => {
      console.error("Error updating application:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the application.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: "approved", notes: adminNotes });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: "rejected", notes: adminNotes });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
    }
  };

  const getCircleBadge = (circleName: string) => {
    switch (circleName) {
      case "the-gentlemen":
        return <Badge variant="outline" className="border-primary/50 text-primary">The Gentlemen</Badge>;
      case "les-amis":
        return <Badge variant="outline" className="border-blue-500/50 text-blue-500">Les Amis</Badge>;
      default:
        return <Badge variant="outline">{circleName}</Badge>;
    }
  };

  const pendingCount = applications?.filter((a) => a.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Circle Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage applications for The Gentlemen and Les Amis circles
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              {pendingCount} Pending
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card border border-border/50 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <Select value={circleFilter} onValueChange={setCircleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Circles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Circles</SelectItem>
            <SelectItem value="the-gentlemen">The Gentlemen</SelectItem>
            <SelectItem value="les-amis">Les Amis</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p>No applications found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Circle</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications?.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{app.full_name}</p>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getCircleBadge(app.circle_name)}</TableCell>
                  <TableCell>
                    <span className="capitalize text-sm">{app.membership_tier}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {app.created_at ? format(new Date(app.created_at), "MMM d, yyyy") : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(app);
                          setAdminNotes(app.admin_notes || "");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {app.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
                            onClick={() => handleApprove(app.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => handleReject(app.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the full application for {selectedApplication?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedApplication.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Circle</p>
                  <p className="font-medium capitalize">
                    {selectedApplication.circle_name.replace("-", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membership Tier</p>
                  <p className="font-medium capitalize">{selectedApplication.membership_tier}</p>
                </div>
              </div>

              {/* Circle-specific fields */}
              {selectedApplication.circle_name === "les-amis" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">French Level</p>
                    <p className="font-medium capitalize">{selectedApplication.french_level || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comfortable Speaking in Groups</p>
                    <p className="font-medium">
                      {selectedApplication.comfortable_speaking ? "Yes" : "No, but willing to try"}
                    </p>
                  </div>
                  {selectedApplication.improvement_goals && (
                    <div>
                      <p className="text-sm text-muted-foreground">Improvement Goals</p>
                      <p className="font-medium">{selectedApplication.improvement_goals}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedApplication.circle_name === "the-gentlemen" && (
                <div className="space-y-4">
                  {selectedApplication.style_preference && (
                    <div>
                      <p className="text-sm text-muted-foreground">Style Preference</p>
                      <p className="font-medium">{selectedApplication.style_preference}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Dress Code Commitment</p>
                    <p className="font-medium">
                      {selectedApplication.dress_code_commitment ? "Yes" : "No"}
                    </p>
                  </div>
                  {selectedApplication.instagram_linkedin && (
                    <div>
                      <p className="text-sm text-muted-foreground">Social Profile</p>
                      <p className="font-medium">{selectedApplication.instagram_linkedin}</p>
                    </div>
                  )}
                  {selectedApplication.reason_to_join && (
                    <div>
                      <p className="text-sm text-muted-foreground">Reason to Join</p>
                      <p className="font-medium">{selectedApplication.reason_to_join}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this application..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === "pending" && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600/50 hover:bg-red-500/10"
                    onClick={() => handleReject(selectedApplication.id)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}

              {selectedApplication.status !== "pending" && (
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge(selectedApplication.status)}
                  {selectedApplication.reviewed_at && (
                    <span className="text-sm text-muted-foreground ml-2">
                      on {format(new Date(selectedApplication.reviewed_at), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCircles;
