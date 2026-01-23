import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lead } from "./LeadCard";
import {
  Mail,
  Phone,
  Building2,
  Globe,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  Link2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Send,
  StickyNote
} from "lucide-react";

const statusConfig = {
  new: { label: "New", className: "bg-blue-500 hover:bg-blue-600" },
  contacted: { label: "Contacted", className: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  converted: { label: "Converted", className: "bg-green-500 hover:bg-green-600" },
  lost: { label: "Lost", className: "bg-muted text-muted-foreground" }
};

const sourceConfig = {
  direct: { label: "Direct Contact", icon: Link2 },
  ai_matched: { label: "AI Matched", icon: Sparkles },
  referral: { label: "Referral", icon: ArrowRight }
};

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({ lead, open, onOpenChange }: LeadDetailSheetProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(lead?.notes || "");

  const updateStatus = useMutation({
    mutationFn: async ({ status, additionalUpdates }: { status: string; additionalUpdates?: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("business_leads")
        .update({ 
          status,
          ...additionalUpdates,
          updated_at: new Date().toISOString()
        })
        .eq("id", lead?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-leads"] });
      queryClient.invalidateQueries({ queryKey: ["business-lead-stats"] });
      toast.success("Lead updated");
    },
    onError: () => {
      toast.error("Failed to update lead");
    }
  });

  const saveNotes = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("business_leads")
        .update({ notes })
        .eq("id", lead?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-leads"] });
      toast.success("Notes saved");
    },
    onError: () => {
      toast.error("Failed to save notes");
    }
  });

  if (!lead) return null;

  const statusInfo = statusConfig[lead.status];
  const sourceInfo = sourceConfig[lead.source];
  const SourceIcon = sourceInfo.icon;

  const handleMarkContacted = () => {
    updateStatus.mutate({ 
      status: "contacted", 
      additionalUpdates: { contacted_at: new Date().toISOString() }
    });
  };

  const handleMarkConverted = () => {
    updateStatus.mutate({ 
      status: "converted", 
      additionalUpdates: { converted_at: new Date().toISOString() }
    });
  };

  const handleMarkLost = () => {
    updateStatus.mutate({ status: "lost" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{lead.contact_name}</SheetTitle>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>
          <SheetDescription className="flex items-center gap-1">
            <SourceIcon className="h-3 w-3" />
            {sourceInfo.label} • {format(new Date(lead.created_at), "PPP 'at' p")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
            <div className="space-y-3">
              <a 
                href={`mailto:${lead.contact_email}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                {lead.contact_email}
              </a>
              {lead.contact_phone && (
                <a 
                  href={`tel:${lead.contact_phone}`}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {lead.contact_phone}
                </a>
              )}
              {lead.company_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {lead.company_name}
                </div>
              )}
              {lead.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {lead.location}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Message */}
          {lead.message && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-lg">
                  {lead.message}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* UTM Tracking */}
          {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Tracking Data
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {lead.utm_source && (
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">Source</div>
                      <div className="text-muted-foreground">{lead.utm_source}</div>
                    </div>
                  )}
                  {lead.utm_medium && (
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">Medium</div>
                      <div className="text-muted-foreground">{lead.utm_medium}</div>
                    </div>
                  )}
                  {lead.utm_campaign && (
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">Campaign</div>
                      <div className="text-muted-foreground">{lead.utm_campaign}</div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(lead.created_at), "PPP")}</span>
              </div>
              {lead.contacted_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contacted</span>
                  <span>{format(new Date(lead.contacted_at), "PPP")}</span>
                </div>
              )}
              {lead.converted_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Converted</span>
                  <span>{format(new Date(lead.converted_at), "PPP")}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="flex items-center gap-2 mb-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this lead..."
              rows={3}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => saveNotes.mutate()}
              disabled={saveNotes.isPending}
            >
              {saveNotes.isPending ? "Saving..." : "Save Notes"}
            </Button>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {lead.status === "new" && (
                <Button 
                  onClick={handleMarkContacted}
                  disabled={updateStatus.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Mark Contacted
                </Button>
              )}
              {(lead.status === "new" || lead.status === "contacted") && (
                <>
                  <Button 
                    onClick={handleMarkConverted}
                    disabled={updateStatus.isPending}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Convert
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleMarkLost}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark Lost
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
