import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Search, Loader2, CheckCircle, Clock, XCircle, Star, ExternalLink, Globe, MapPin, Mail } from "lucide-react";
import { format } from "date-fns";

interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  description: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  contact_email: string | null;
  services: string[] | null;
  status: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

const AdminBusinesses = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessProfile[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, is_visible, business }: { id: string; status: 'pending' | 'approved' | 'featured' | 'rejected'; is_visible: boolean; business: BusinessProfile }) => {
      const { error } = await supabase
        .from('business_profiles')
        .update({ status, is_visible })
        .eq('id', id);
      if (error) throw error;

      // Send notification email if status changed to approved, featured, or rejected
      if (['approved', 'featured', 'rejected'].includes(status)) {
        // Get user email from auth
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', business.user_id)
          .single();

        // Get user email from auth.users via edge function
        const email = business.contact_email;
        if (email) {
          try {
            await supabase.functions.invoke('send-business-notification', {
              body: {
                email,
                businessName: business.business_name,
                status,
                firstName: profile?.first_name,
              },
            });
          } catch (e) {
            console.error('Failed to send notification:', e);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      toast.success("Business status updated and notification sent");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleApprove = (business: BusinessProfile) => {
    updateStatusMutation.mutate({ id: business.id, status: 'approved', is_visible: true, business });
  };

  const handleReject = (business: BusinessProfile) => {
    updateStatusMutation.mutate({ id: business.id, status: 'rejected', is_visible: false, business });
  };

  const handleFeature = (business: BusinessProfile) => {
    const newStatus = business.status === 'featured' ? 'approved' : 'featured';
    updateStatusMutation.mutate({ id: business.id, status: newStatus, is_visible: true, business });
  };

  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = 
      business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || business.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'featured':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><Star className="h-3 w-3 mr-1" />Featured</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = businesses?.filter(b => b.status === 'pending').length || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-2">Business Directory</h1>
        <p className="text-muted-foreground">Manage business listings for The Connected Circle</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Businesses</p>
          <p className="font-display text-2xl text-foreground">{businesses?.length || 0}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="font-display text-2xl text-yellow-500">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="font-display text-2xl text-green-500">
            {businesses?.filter(b => b.status === 'approved').length || 0}
          </p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Featured</p>
          <p className="font-display text-2xl text-primary">
            {businesses?.filter(b => b.status === 'featured').length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border/50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {business.logo_url ? (
                        <img
                          src={business.logo_url}
                          alt={business.business_name}
                          className="w-10 h-10 rounded-lg object-contain bg-muted"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{business.business_name}</p>
                        {business.website && (
                          <a
                            href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {business.industry || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {business.location || "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(business.status)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(business.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBusiness(business);
                          setDialogOpen(true);
                        }}
                      >
                        View
                      </Button>
                      {business.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(business)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(business)}
                            disabled={updateStatusMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {(business.status === 'approved' || business.status === 'featured') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeature(business)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Star className={`h-3 w-3 mr-1 ${business.status === 'featured' ? 'fill-primary text-primary' : ''}`} />
                          {business.status === 'featured' ? 'Unfeature' : 'Feature'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-border/50 rounded-xl">
          <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No businesses found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No businesses have been submitted yet"}
          </p>
        </div>
      )}

      {/* Business Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBusiness && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  {selectedBusiness.logo_url ? (
                    <img
                      src={selectedBusiness.logo_url}
                      alt={selectedBusiness.business_name}
                      className="w-20 h-20 rounded-xl object-contain bg-muted"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="font-display text-2xl">
                        {selectedBusiness.business_name}
                      </DialogTitle>
                      {getStatusBadge(selectedBusiness.status)}
                    </div>
                    {selectedBusiness.industry && (
                      <p className="text-muted-foreground">{selectedBusiness.industry}</p>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {selectedBusiness.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedBusiness.description}</p>
                  </div>
                )}

                {selectedBusiness.services && selectedBusiness.services.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBusiness.services.map((service, index) => (
                        <Badge key={index} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
                  
                  {selectedBusiness.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{selectedBusiness.location}</span>
                    </div>
                  )}

                  {selectedBusiness.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-primary" />
                      <a
                        href={selectedBusiness.website.startsWith('http') ? selectedBusiness.website : `https://${selectedBusiness.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {selectedBusiness.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {selectedBusiness.contact_email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href={`mailto:${selectedBusiness.contact_email}`} className="text-primary hover:underline">
                        {selectedBusiness.contact_email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  {selectedBusiness.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleApprove(selectedBusiness);
                          setDialogOpen(false);
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleReject(selectedBusiness);
                          setDialogOpen(false);
                        }}
                        disabled={updateStatusMutation.isPending}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {(selectedBusiness.status === 'approved' || selectedBusiness.status === 'featured') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleFeature(selectedBusiness);
                        setDialogOpen(false);
                      }}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Star className={`h-4 w-4 mr-2 ${selectedBusiness.status === 'featured' ? 'fill-primary text-primary' : ''}`} />
                      {selectedBusiness.status === 'featured' ? 'Remove from Featured' : 'Add to Featured'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBusinesses;
