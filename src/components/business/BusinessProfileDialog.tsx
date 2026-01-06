import { useState } from "react";
import { Building2, Globe, MapPin, Mail, ExternalLink, Handshake, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BusinessProfileDialogProps {
  business: {
    id: string;
    business_name: string;
    logo_url: string | null;
    description: string | null;
    industry: string | null;
    location: string | null;
    website: string | null;
    contact_email: string | null;
    services: string[] | null;
    status: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessProfileDialog({ business, open, onOpenChange }: BusinessProfileDialogProps) {
  const { user } = useAuth();
  const [introMessage, setIntroMessage] = useState("");
  const [showIntroForm, setShowIntroForm] = useState(false);

  // Check if user already requested an introduction
  const { data: existingRequest, refetch: refetchRequest } = useQuery({
    queryKey: ['intro-request', business?.id, user?.id],
    queryFn: async () => {
      if (!business || !user) return null;
      const { data, error } = await supabase
        .from('business_introduction_requests')
        .select('*')
        .eq('business_id', business.id)
        .eq('requester_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!business && !!user,
  });

  const requestIntroMutation = useMutation({
    mutationFn: async () => {
      if (!business || !user) throw new Error("Missing data");
      const { error } = await supabase
        .from('business_introduction_requests')
        .insert({
          business_id: business.id,
          requester_id: user.id,
          message: introMessage || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Introduction request sent! The business owner will be notified.");
      setShowIntroForm(false);
      setIntroMessage("");
      refetchRequest();
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate key')) {
        toast.error("You've already requested an introduction to this business");
      } else {
        toast.error("Failed to send introduction request");
      }
    },
  });

  if (!business) return null;

  const isFeatured = business.status === 'featured';

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setShowIntroForm(false);
        setIntroMessage("");
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.business_name}
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
                  {business.business_name}
                </DialogTitle>
                {isFeatured && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Featured
                  </Badge>
                )}
              </div>
              {business.industry && (
                <p className="text-muted-foreground">{business.industry}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Description */}
          {business.description && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
              <p className="text-muted-foreground leading-relaxed">{business.description}</p>
            </div>
          )}

          {/* Services */}
          {business.services && business.services.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Services</h4>
              <div className="flex flex-wrap gap-2">
                {business.services.map((service, index) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
            
            {business.location && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">{business.location}</span>
              </div>
            )}

            {business.website && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <a
                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {business.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {business.contact_email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <a
                  href={`mailto:${business.contact_email}`}
                  className="text-primary hover:underline"
                >
                  {business.contact_email}
                </a>
              </div>
            )}
          </div>

          {/* Introduction Request Section */}
          {user && (
            <div className="border-t border-border pt-6">
              {existingRequest ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Introduction Requested</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {existingRequest.status === 'pending' ? 'Pending response' : existingRequest.status}
                    </p>
                  </div>
                </div>
              ) : showIntroForm ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Request Introduction</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add a personal message to introduce yourself (optional)
                    </p>
                    <Textarea
                      value={introMessage}
                      onChange={(e) => setIntroMessage(e.target.value)}
                      placeholder="Hi, I'm interested in learning more about your services..."
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {introMessage.length}/500 characters
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => requestIntroMutation.mutate()}
                      disabled={requestIntroMutation.isPending}
                    >
                      {requestIntroMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Handshake className="h-4 w-4 mr-2" />
                      )}
                      Send Request
                    </Button>
                    <Button variant="outline" onClick={() => setShowIntroForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowIntroForm(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Request Introduction
                </Button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {business.website && (
              <Button asChild className="flex-1">
                <a
                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
            {business.contact_email && (
              <Button variant="outline" asChild className="flex-1">
                <a href={`mailto:${business.contact_email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
