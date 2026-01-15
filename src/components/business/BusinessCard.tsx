import { Building2, Globe, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface BusinessCardProps {
  business: {
    id: string;
    business_name: string;
    logo_url: string | null;
    description: string | null;
    industry: string | null;
    category?: string | null;
    location: string | null;
    website: string | null;
    services: string[] | null;
    status: string;
  };
  onClick: () => void;
}

export function BusinessCard({ business, onClick }: BusinessCardProps) {
  const isFeatured = business.status === 'featured';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group bg-card border rounded-2xl p-6 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5 ${
        isFeatured ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/30'
      }`}
      onClick={onClick}
    >
      {isFeatured && (
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          Featured
        </Badge>
      )}
      
      <div className="flex items-start gap-4 mb-4">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.business_name}
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="w-16 h-16 rounded-xl object-contain bg-muted"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl text-foreground truncate group-hover:text-primary transition-colors">
            {business.business_name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {business.category && (
              <Badge variant="outline" className="text-xs">
                {business.category}
              </Badge>
            )}
            {business.industry && (
              <span className="text-sm text-muted-foreground">{business.industry}</span>
            )}
          </div>
        </div>
      </div>

      {business.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {business.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {business.services?.slice(0, 3).map((service, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {service}
          </Badge>
        ))}
        {business.services && business.services.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{business.services.length - 3} more
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {business.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {business.location}
            </span>
          )}
          {business.website && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Website
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-primary p-0 h-auto hover:bg-transparent group-hover:gap-2 transition-all">
          View <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
