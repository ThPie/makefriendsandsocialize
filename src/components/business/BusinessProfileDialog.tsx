import { Building2, Globe, MapPin, Mail, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  if (!business) return null;

  const isFeatured = business.status === 'featured';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
