import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Globe, MapPin, Mail, Upload, Loader2, CheckCircle, Clock, XCircle, Plus, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { BusinessVerificationStatus } from "@/components/business/BusinessVerificationStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BUSINESS_CATEGORIES = [
  'Technology',
  'Finance',
  'Fashion',
  'Health',
  'Food & Beverage',
  'Professional Services',
  'Real Estate',
  'Other'
];

const PortalBusiness = () => {
  const { user, membership } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 className="h-16 w-16 text-primary/50 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-foreground mb-4">
          Upgrade Required
        </h1>
        <p className="text-muted-foreground mb-8">
          The Connected Circle is available to Fellow and Founder members.
          Upgrade your membership to list your business.
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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-2">My Business</h1>
            <p className="text-muted-foreground">
              {businessProfile 
                ? "Manage your business listing in The Connected Circle"
                : "Create your business listing for The Connected Circle"}
            </p>
          </div>
          {businessProfile && getStatusBadge(businessProfile.status)}
        </div>
      </div>

      {/* Preview Link */}
      {businessProfile?.status === 'approved' || businessProfile?.status === 'featured' ? (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm text-foreground">Your business is live in the directory!</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/connected-circle/directory">
              View Directory <ExternalLink className="h-3 w-3 ml-2" />
            </Link>
          </Button>
        </div>
      ) : null}

      {/* Verification Status */}
      {businessProfile && (
        <BusinessVerificationStatus 
          businessId={businessProfile.id} 
          className="mb-8"
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="font-display text-xl text-foreground mb-4">Business Logo</h2>
          <div className="flex items-center gap-6">
            {formData.logo_url ? (
              <img
                src={formData.logo_url}
                alt="Business logo"
                className="w-24 h-24 rounded-xl object-contain bg-muted"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="font-display text-xl text-foreground mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="Your Business Name"
                required
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Technology, Consulting, Design"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell us about your business..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="font-display text-xl text-foreground mb-4">Services</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.services.map((service, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {service}
                <button
                  type="button"
                  onClick={() => removeService(service)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add a service..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
            />
            <Button type="button" variant="outline" onClick={addService}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="font-display text-xl text-foreground mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.example.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="business@example.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="min-w-[150px]"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {businessProfile ? "Save Changes" : "Submit for Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PortalBusiness;
