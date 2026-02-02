import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle, Clock, XCircle, ExternalLink, Users, Link2, Copy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { BusinessVerificationStatus } from "@/components/business/BusinessVerificationStatus";
import { Lead } from "@/components/business/LeadCard";
import { LeadDetailSheet } from "@/components/business/LeadDetailSheet";
import { useLeadRealtime } from "@/hooks/useLeadRealtime";
import { BusinessProfileForm } from "@/components/portal/business/BusinessProfileForm";
import { BusinessLeadsSection } from "@/components/portal/business/BusinessLeadsSection";
import { BusinessSynergySection } from "@/components/portal/business/BusinessSynergySection";

type LeadStatus = "new" | "contacted" | "converted" | "lost";

const PortalBusiness = () => {
  const { user, membership } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [newService, setNewService] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadSheetOpen, setLeadSheetOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const canAccess = membership?.tier === 'fellow' || membership?.tier === 'founder';

  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ['my-business-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch leads for this business
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['business-leads', businessProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_leads')
        .select('*')
        .eq('business_id', businessProfile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!businessProfile?.id,
  });

  // Fetch lead stats
  const { data: leadStats } = useQuery({
    queryKey: ['business-lead-stats', businessProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_business_lead_stats', { p_business_id: businessProfile?.id });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!businessProfile?.id,
  });

  // Fetch usage for current month
  const { data: leadUsage } = useQuery({
    queryKey: ['business-lead-usage', businessProfile?.id],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data, error } = await supabase
        .from('business_lead_usage')
        .select('*')
        .eq('business_id', businessProfile?.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data || { leads_received: 0, leads_allocated: 5 };
    },
    enabled: !!businessProfile?.id,
  });

  // Enable real-time lead updates
  useLeadRealtime(businessProfile?.id);

  const [formData, setFormData] = useState({
    business_name: "",
    description: "",
    industry: "",
    category: "Other",
    website: "",
    contact_email: "",
    location: "",
    services: [] as string[],
    logo_url: "",
  });

  // Update form data when business profile loads
  useEffect(() => {
    if (businessProfile) {
      setFormData({
        business_name: businessProfile.business_name || "",
        description: businessProfile.description || "",
        industry: businessProfile.industry || "",
        category: businessProfile.category || "Other",
        website: businessProfile.website || "",
        contact_email: businessProfile.contact_email || "",
        location: businessProfile.location || "",
        services: businessProfile.services || [],
        logo_url: businessProfile.logo_url || "",
      });
    }
  }, [businessProfile]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (businessProfile) {
        // Update existing
        const { error } = await supabase
          .from('business_profiles')
          .update(data)
          .eq('id', businessProfile.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('business_profiles')
          .insert({
            ...data,
            user_id: user?.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-business-profile'] });
      toast.success(businessProfile ? "Business profile updated!" : "Business profile created! It will be reviewed by our team.");
    },
    onError: (error) => {
      toast.error("Failed to save business profile");
      console.error(error);
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success("Logo uploaded!");
    } catch (error) {
      toast.error("Failed to upload logo");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name) {
      toast.error("Business name is required");
      return;
    }
    saveMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'featured':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle className="h-3 w-3 mr-1" />Featured</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const copyLandingPageUrl = () => {
    if (businessProfile?.slug) {
      const url = `${window.location.origin}/directory/${businessProfile.slug}`;
      navigator.clipboard.writeText(url);
      toast.success("Landing page URL copied!");
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadSheetOpen(true);
  };

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 className="h-16 w-16 text-primary/50 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-foreground mb-4">
          Upgrade Required
        </h1>
        <p className="text-muted-foreground mb-8">
          The Founders Circle is available to Fellow and Founder members.
          Upgrade your membership to list your company.
        </p>
        <Button asChild>
          <Link to="/membership">Upgrade Membership</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-2">Founder Profile</h1>
            <p className="text-muted-foreground">
              {businessProfile
                ? "Manage your company listing and leads"
                : "Create your company listing for The Founders Circle"}
            </p>
          </div>
          {businessProfile && getStatusBadge(businessProfile.status)}
        </div>
      </div>

      {/* Preview Link / Landing Page URL */}
      {(businessProfile?.status === 'approved' || businessProfile?.status === 'featured') && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <span className="text-sm text-foreground font-medium">Your company is live!</span>
                {businessProfile.slug && (
                  <div className="flex items-center gap-2 mt-1">
                    <Link2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                      /directory/{businessProfile.slug}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={copyLandingPageUrl}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {businessProfile.slug && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/directory/${businessProfile.slug}`}>
                    View Landing Page <ExternalLink className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to="/founders-circle/directory">
                  Directory <ExternalLink className="h-3 w-3 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="synergy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="synergy" className="flex items-center gap-2" disabled={!businessProfile}>
            <Zap className="h-4 w-4" />
            Synergy
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2" disabled={!businessProfile}>
            <Users className="h-4 w-4" />
            Leads
            {(leadStats?.new_leads ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {leadStats?.new_leads}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Synergy Tab */}
        <TabsContent value="synergy" className="space-y-6">
          {businessProfile && <BusinessSynergySection businessId={businessProfile.id} />}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Verification Status */}
          {businessProfile && (
            <BusinessVerificationStatus
              businessId={businessProfile.id}
              className="mb-8"
            />
          )}

          <BusinessProfileForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isSaving={saveMutation.isPending}
            isUploading={isUploading}
            handleLogoUpload={handleLogoUpload}
            newService={newService}
            setNewService={setNewService}
            addService={addService}
            removeService={removeService}
            isEdit={!!businessProfile}
          />
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <BusinessLeadsSection
            businessProfile={businessProfile}
            leads={leads}
            leadsLoading={leadsLoading}
            leadStats={leadStats}
            leadUsage={leadUsage}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
            copyLandingPageUrl={copyLandingPageUrl}
            handleSelectLead={handleSelectLead}
          />
        </TabsContent>
      </Tabs>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet
        lead={selectedLead}
        open={leadSheetOpen}
        onOpenChange={setLeadSheetOpen}
      />
    </div>
  );
};

export default PortalBusiness;
