import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Users,
  Shield,
  Heart,
  Calendar,
  Mail,
  RefreshCw,
  History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

type StatusHistoryItem = {
  id: string;
  appeal_id: string;
  old_status: string | null;
  new_status: string;
  admin_notes: string | null;
  created_at: string;
};

type AppealPayload = {
  full_name: string;
  email: string;
  appeal_type: "membership" | "suspension" | "match" | "event";
  reference_id?: string;
  subject: string;
  description: string;
  supporting_info?: string;
  submitted_at: string;
  admin_response?: string;
  resolved_at?: string;
};

type Appeal = {
  id: string;
  user_id: string;
  notification_type: string;
  payload: AppealPayload;
  status: string;
  created_at: string;
  is_read: boolean;
};

const appealTypeIcons = {
  membership: Users,
  suspension: Shield,
  match: Heart,
  event: Calendar,
};

const appealTypeLabels = {
  membership: "Membership",
  suspension: "Suspension",
  match: "Match",
  event: "Event",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-500 border-green-500/20",
  denied: "bg-red-500/10 text-red-500 border-red-500/20",
  under_review: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const AdminAppeals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: appeals, isLoading, refetch } = useQuery({
    queryKey: ["admin-appeals", typeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("notification_queue")
        .select("*")
        .eq("notification_type", "appeal_submission")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by type if needed
      let filtered = (data || []) as unknown as Appeal[];
      if (typeFilter !== "all") {
        filtered = filtered.filter(
          (a) => (a.payload as AppealPayload).appeal_type === typeFilter
        );
      }

      // Filter by search query
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter((a) => {
          const payload = a.payload as AppealPayload;
          return (
            payload.full_name?.toLowerCase().includes(lowerQuery) ||
            payload.email?.toLowerCase().includes(lowerQuery) ||
            payload.subject?.toLowerCase().includes(lowerQuery)
          );
        });
      }

      return filtered;
    },
  });

  // Fetch status history for selected appeal
  const { data: statusHistory } = useQuery({
    queryKey: ["appeal-history", selectedAppeal?.id],
    queryFn: async () => {
      if (!selectedAppeal) return [];
      const { data, error } = await supabase
        .from("appeal_status_history")
        .select("*")
        .eq("appeal_id", selectedAppeal.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StatusHistoryItem[];
    },
    enabled: !!selectedAppeal,
  });

  const updateAppealMutation = useMutation({
    mutationFn: async ({ id, status, response }: { id: string; status: string; response: string }) => {
      const appeal = appeals?.find((a) => a.id === id);
      if (!appeal) throw new Error("Appeal not found");

      const oldStatus = appeal.status;
      const payload = appeal.payload as AppealPayload;
      const updatedPayload = {
        ...payload,
        admin_response: response,
        resolved_at: status !== "pending" && status !== "under_review" ? new Date().toISOString() : undefined,
      };

      // Update the appeal status
      const { error } = await supabase
        .from("notification_queue")
        .update({
          status,
          payload: updatedPayload,
          is_read: true,
        })
        .eq("id", id);

      if (error) throw error;

      // Record status change in history
      if (oldStatus !== status) {
        await supabase.from("appeal_status_history").insert({
          appeal_id: id,
          old_status: oldStatus,
          new_status: status,
          changed_by: user?.id,
          admin_notes: response,
        });
      }

      // Send email notification to the user
      try {
        await supabase.functions.invoke("send-appeal-notification", {
          body: {
            email: payload.email,
            name: payload.full_name,
            subject: payload.subject,
            appealType: payload.appeal_type,
            status,
            adminResponse: response,
          },
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appeals"] });
      queryClient.invalidateQueries({ queryKey: ["appeal-history"] });
      toast({
        title: "Appeal Updated",
        description: "The appeal status has been updated and the user has been notified.",
      });
      setSelectedAppeal(null);
      setAdminResponse("");
      setNewStatus("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update appeal. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating appeal:", error);
    },
  });

  const handleViewAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setAdminResponse((appeal.payload as AppealPayload).admin_response || "");
    setNewStatus(appeal.status);
  };

  const handleUpdateAppeal = () => {
    if (!selectedAppeal || !newStatus) return;
    updateAppealMutation.mutate({
      id: selectedAppeal.id,
      status: newStatus,
      response: adminResponse,
    });
  };

  const stats = {
    total: appeals?.length || 0,
    pending: appeals?.filter((a) => a.status === "pending").length || 0,
    underReview: appeals?.filter((a) => a.status === "under_review").length || 0,
    resolved: appeals?.filter((a) => a.status === "approved" || a.status === "denied").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Appeals</h1>
          <p className="text-muted-foreground">Review and manage member appeals</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Appeals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.underReview}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Appeal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="membership">Membership</SelectItem>
                <SelectItem value="suspension">Suspension</SelectItem>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appeals List */}
      <Card>
        <CardHeader>
          <CardTitle>Appeals List</CardTitle>
          <CardDescription>
            {appeals?.length || 0} appeals found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : appeals?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No appeals found</h3>
              <p className="text-muted-foreground">
                There are no appeals matching your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appeals?.map((appeal) => {
                const payload = appeal.payload as AppealPayload;
                const TypeIcon = appealTypeIcons[payload.appeal_type] || FileText;
                
                return (
                  <div
                    key={appeal.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewAppeal(appeal)}
                  >
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium truncate">{payload.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {payload.full_name} • {payload.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="capitalize">
                            {appealTypeLabels[payload.appeal_type]}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`capitalize ${statusColors[appeal.status] || ""}`}
                          >
                            {appeal.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {payload.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted {format(new Date(appeal.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appeal Detail Dialog */}
      <Dialog open={!!selectedAppeal} onOpenChange={() => setSelectedAppeal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAppeal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const TypeIcon = appealTypeIcons[(selectedAppeal.payload as AppealPayload).appeal_type] || FileText;
                    return <TypeIcon className="w-5 h-5" />;
                  })()}
                  {(selectedAppeal.payload as AppealPayload).subject}
                </DialogTitle>
                <DialogDescription>
                  Submitted by {(selectedAppeal.payload as AppealPayload).full_name} on{" "}
                  {format(new Date(selectedAppeal.created_at), "MMMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{(selectedAppeal.payload as AppealPayload).full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{(selectedAppeal.payload as AppealPayload).email}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${(selectedAppeal.payload as AppealPayload).email}`)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Appeal Type & Reference */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Appeal Type</Label>
                    <Badge variant="outline" className="capitalize mt-1">
                      {appealTypeLabels[(selectedAppeal.payload as AppealPayload).appeal_type]}
                    </Badge>
                  </div>
                  {(selectedAppeal.payload as AppealPayload).reference_id && (
                    <div>
                      <Label className="text-muted-foreground">Reference ID</Label>
                      <p className="font-mono text-sm">{(selectedAppeal.payload as AppealPayload).reference_id}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg text-sm">
                    {(selectedAppeal.payload as AppealPayload).description}
                  </p>
                </div>

                {/* Supporting Info */}
                {(selectedAppeal.payload as AppealPayload).supporting_info && (
                  <div>
                    <Label className="text-muted-foreground">Supporting Information</Label>
                    <p className="mt-1 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg text-sm">
                      {(selectedAppeal.payload as AppealPayload).supporting_info}
                    </p>
                  </div>
                )}

                {/* Status History Timeline */}
                {statusHistory && statusHistory.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4" />
                      Status History
                    </Label>
                    <div className="space-y-3">
                      {statusHistory.map((item, index) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              item.new_status === "approved" ? "bg-green-500" :
                              item.new_status === "denied" ? "bg-red-500" :
                              item.new_status === "under_review" ? "bg-blue-500" :
                              "bg-yellow-500"
                            }`} />
                            {index < statusHistory.length - 1 && (
                              <div className="w-0.5 h-full bg-border flex-1 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`capitalize text-xs ${statusColors[item.new_status] || ""}`}
                              >
                                {item.new_status.replace("_", " ")}
                              </Badge>
                              {item.old_status && (
                                <span className="text-xs text-muted-foreground">
                                  from {item.old_status.replace("_", " ")}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                            {item.admin_notes && (
                              <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                                {item.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Response */}
                <div className="border-t pt-4">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="response">Admin Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Add notes or response for this appeal..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAppeal(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateAppeal}
                  disabled={updateAppealMutation.isPending}
                >
                  {updateAppealMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppeals;
