import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle, Clock, XCircle, ExternalLink, Link2, Copy } from "lucide-react";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useUpgrade } from "@/contexts/UpgradeContext";
import { BusinessVerificationStatus } from "@/components/business/BusinessVerificationStatus";
import { BusinessProfileForm } from "@/components/portal/business/BusinessProfileForm";

const UpgradeButtonInline = () => {
  const { openUpgrade } = useUpgrade();
  return <Button onClick={openUpgrade}>Upgrade Membership</Button>;
};

const PortalBusiness = () => {
  const { user, membership } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [newService, setNewService] = useState("");

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
        const { error } = await supabase
          .from('business_profiles')
          .update(data)
          .eq('id', businessProfile.id);
        if (error) throw error;
      } else {
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
        return <Badge className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/20"><CheckCircle className="h-3 w-3 mr-1" />Featured</Badge>;
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

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 className="h-16 w-16 text-primary/50 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-foreground mb-4">
          Upgrade Required
        </h1>
        <p className="text-muted-foreground mb-8">
          The Founders Circle is available to Insider and Patron members.
          Upgrade your membership to list your company.
        </p>
        <UpgradeButtonInline />
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
                ? "Manage your company listing in the directory"
                : "Create your company listing for The Founders Circle"}
            </p>
          </div>
          {businessProfile && getStatusBadge(businessProfile.status)}
        </div>
      </div>

      {/* Preview Link / Landing Page URL */}
      {(businessProfile?.status === 'approved' || businessProfile?.status === 'featured') && (
        <div className="bg-[hsl(var(--accent-gold))]/5 border border-[hsl(var(--accent-gold))]/20 rounded-xl p-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <span className="text-sm text-foreground font-medium">Your company is live in the directory!</span>
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
            <Button variant="outline" size="sm" asChild>
              <TransitionLink to="/founders-circle/directory">
                View Directory <ExternalLink className="h-3 w-3 ml-2" />
              </TransitionLink>
            </Button>
          </div>
        </div>
      )}

      {/* Profile Form */}
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
    </div>
  );
};

export default PortalBusiness;
