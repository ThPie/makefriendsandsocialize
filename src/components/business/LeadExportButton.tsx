import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Lead } from "./LeadCard";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface LeadExportButtonProps {
  leads: Lead[];
  businessName: string;
}

export function LeadExportButton({ leads, businessName }: LeadExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    setIsExporting(true);

    try {
      // CSV headers
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Company",
        "Message",
        "Status",
        "Source",
        "Location",
        "Category Interest",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "Created At",
        "Contacted At",
        "Converted At",
        "Notes"
      ];

      // CSV rows
      const rows = leads.map(lead => [
        lead.contact_name,
        lead.contact_email,
        lead.contact_phone || "",
        lead.company_name || "",
        lead.message ? `"${lead.message.replace(/"/g, '""')}"` : "",
        lead.status,
        lead.source,
        lead.location || "",
        lead.category_interest || "",
        lead.utm_source || "",
        lead.utm_medium || "",
        lead.utm_campaign || "",
        format(new Date(lead.created_at), "yyyy-MM-dd HH:mm"),
        lead.contacted_at ? format(new Date(lead.contacted_at), "yyyy-MM-dd HH:mm") : "",
        lead.converted_at ? format(new Date(lead.converted_at), "yyyy-MM-dd HH:mm") : "",
        lead.notes ? `"${lead.notes.replace(/"/g, '""')}"` : ""
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      // Sanitize business name for filename
      const sanitizedName = businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `leads_${sanitizedName}_${format(new Date(), "yyyy-MM-dd")}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${leads.length} leads to CSV`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={exportToCSV}
      disabled={isExporting || leads.length === 0}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Export CSV
    </Button>
  );
}
