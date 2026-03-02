import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  Link2
} from "lucide-react";

export interface Lead {
  id: string;
  business_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_name: string | null;
  message: string | null;
  status: "new" | "contacted" | "converted" | "lost";
  source: "direct" | "ai_matched" | "referral";
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  location: string | null;
  category_interest: string | null;
  notes: string | null;
  created_at: string;
  contacted_at: string | null;
  converted_at: string | null;
}

const statusConfig = {
  new: { label: "New", variant: "default" as const, className: "bg-blue-500 hover:bg-blue-600" },
  contacted: { label: "Contacted", variant: "secondary" as const, className: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  converted: { label: "Converted", variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
  lost: { label: "Lost", variant: "outline" as const, className: "text-muted-foreground" }
};

const sourceConfig = {
  direct: { label: "Direct", icon: Link2 },
  ai_matched: { label: "Smart Matched", icon: Sparkles },
  referral: { label: "Referral", icon: ArrowRight }
};

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export function LeadCard({ lead, onSelect }: LeadCardProps) {
  const statusInfo = statusConfig[lead.status];
  const sourceInfo = sourceConfig[lead.source];
  const SourceIcon = sourceInfo.icon;

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onSelect(lead)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Name & Company */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{lead.contact_name}</h3>
              <Badge className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            </div>
            
            {lead.company_name && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{lead.company_name}</span>
              </div>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{lead.contact_email}</span>
              </span>
              {lead.contact_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lead.contact_phone}
                </span>
              )}
            </div>

            {/* Message Preview */}
            {lead.message && (
              <div className="flex items-start gap-1 mt-2 text-sm text-muted-foreground">
                <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{lead.message}</span>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <SourceIcon className="h-3 w-3" />
              {sourceInfo.label}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
