import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, Copy } from "lucide-react";
import { LeadStatsCards } from "@/components/business/LeadStatsCards";
import { LeadCard, Lead } from "@/components/business/LeadCard";
import { LeadAnalyticsCharts } from "@/components/business/LeadAnalyticsCharts";
import { LeadExportButton } from "@/components/business/LeadExportButton";

type LeadStatus = "new" | "contacted" | "converted" | "lost";

interface BusinessLeadsSectionProps {
    businessProfile: any;
    leads: Lead[] | undefined;
    leadsLoading: boolean;
    leadStats: any;
    leadUsage: any;
    statusFilter: LeadStatus | "all";
    setStatusFilter: (status: LeadStatus | "all") => void;
    showAnalytics: boolean;
    setShowAnalytics: (show: boolean) => void;
    copyLandingPageUrl: () => void;
    handleSelectLead: (lead: Lead) => void;
}

export const BusinessLeadsSection = ({
    businessProfile,
    leads,
    leadsLoading,
    leadStats,
    leadUsage,
    statusFilter,
    setStatusFilter,
    showAnalytics,
    setShowAnalytics,
    copyLandingPageUrl,
    handleSelectLead,
}: BusinessLeadsSectionProps) => {
    const filteredLeads = leads?.filter(lead =>
        statusFilter === "all" ? true : lead.status === statusFilter
    ) || [];

    if (!businessProfile) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Create your business profile first to start receiving leads.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <LeadStatsCards
                stats={leadStats}
                usage={leadUsage}
                isLoading={leadsLoading}
            />

            {/* Filters & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {(["all", "new", "contacted", "converted", "lost"] as const).map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                            {status !== "all" && leads && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                    {leads.filter(l => l.status === status).length}
                                </Badge>
                            )}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={showAnalytics ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                    </Button>
                    <LeadExportButton
                        leads={leads || []}
                        businessName={businessProfile?.business_name || "business"}
                    />
                </div>
            </div>

            {/* Analytics Charts (collapsible) */}
            {showAnalytics && (
                <LeadAnalyticsCharts
                    leads={leads || []}
                    isLoading={leadsLoading}
                />
            )}

            {/* Leads List */}
            {leadsLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No leads yet</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        {statusFilter === "all"
                            ? "Share your landing page to start receiving leads from potential clients."
                            : `No ${statusFilter} leads to show.`}
                    </p>
                    {statusFilter === "all" && businessProfile.slug && (
                        <Button variant="outline" className="mt-4" onClick={copyLandingPageUrl}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Landing Page URL
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredLeads.map((lead) => (
                        <LeadCard
                            key={lead.id}
                            lead={lead}
                            onSelect={handleSelectLead}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
