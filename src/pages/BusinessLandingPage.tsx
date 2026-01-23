import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Building2, 
  Globe, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Send,
  Briefcase,
  Star
} from "lucide-react";

interface BusinessProfile {
  id: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  industry: string | null;
  category: string | null;
  location: string | null;
  website: string | null;
  services: string[] | null;
  status: string;
  slug: string;
}

export default function BusinessLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  
  // Capture UTM parameters
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");
  
  // Form state
  const [formData, setFormData] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companyName: "",
    message: "",
    honeypot: "" // Spam prevention
  });
  const [submitted, setSubmitted] = useState(false);

  // Fetch business profile
  const { data: business, isLoading, error } = useQuery({
    queryKey: ["business-landing", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "approved")
        .eq("is_visible", true)
        .single();
      
      if (error) throw error;
      return data as BusinessProfile;
    },
    enabled: !!slug
  });

  // Submit lead mutation
  const submitLead = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Check honeypot (spam prevention)
      if (data.honeypot) {
        throw new Error("Spam detected");
      }

      const { error } = await supabase.functions.invoke("submit-business-lead", {
        body: {
          businessId: business?.id,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          companyName: data.companyName || null,
          message: data.message || null,
          utmSource,
          utmMedium,
          utmCampaign,
          location: null,
          categoryInterest: business?.category || business?.industry
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Your inquiry has been sent!");
    },
    onError: (error) => {
      console.error("Lead submission error:", error);
      toast.error("Failed to send inquiry. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contactName || !formData.contactEmail) {
      toast.error("Please fill in required fields");
      return;
    }

    submitLead.mutate(formData);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <Skeleton className="h-32 w-32 rounded-full mx-auto mb-6" />
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !business) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-24 px-4 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="text-muted-foreground">
            The business you're looking for doesn't exist or is no longer available.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${business.business_name} | MakeFriends Directory`}
        description={business.description || `Connect with ${business.business_name} through the MakeFriends Founders Circle.`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              {/* Logo */}
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={`${business.business_name} logo`}
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover mx-auto mb-6 border-4 border-primary/20 shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-4 border-primary/20">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
              )}

              {/* Business Name & Badge */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">{business.business_name}</h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground mb-6">
                {business.industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {business.industry}
                  </span>
                )}
                {business.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {business.location}
                  </span>
                )}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>

              {/* Description */}
              {business.description && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {business.description}
                </p>
              )}
            </div>

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-center mb-4">Services</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {business.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="px-4 py-2">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Form */}
            <Card className="max-w-xl mx-auto shadow-xl border-2">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  Get in Touch
                </CardTitle>
                <CardDescription>
                  Send your inquiry to {business.business_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                    <p className="text-muted-foreground">
                      Your inquiry has been sent. {business.business_name} will get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot field - hidden from users */}
                    <input
                      type="text"
                      name="website"
                      value={formData.honeypot}
                      onChange={(e) => setFormData(prev => ({ ...prev, honeypot: e.target.value }))}
                      className="absolute -left-[9999px]"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Your Name *</Label>
                        <Input
                          id="contactName"
                          placeholder="John Doe"
                          value={formData.contactName}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.contactEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone (optional)</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.contactPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company (optional)</Label>
                        <Input
                          id="companyName"
                          placeholder="Acme Inc."
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message (optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell them about your needs..."
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={submitLead.isPending}
                    >
                      {submitLead.isPending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Inquiry
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting, you agree to our privacy policy.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}
