import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { BusinessCard } from "@/components/business/BusinessCard";
import { BusinessProfileDialog } from "@/components/business/BusinessProfileDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2, Filter, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessProfile {
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
}

const ConnectedCircleDirectoryPage = () => {
  const { user, membership } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canAccess = membership?.tier === 'fellow' || membership?.tier === 'founder';

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['business-directory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .in('status', ['approved', 'featured'])
        .eq('is_visible', true)
        .order('status', { ascending: false }) // Featured first
        .order('business_name');

      if (error) throw error;
      return data as BusinessProfile[];
    },
    enabled: !!user && canAccess,
  });

  // Get unique industries for filter
  const industries = [...new Set(businesses?.map(b => b.industry).filter(Boolean) || [])];

  // Filter businesses
  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = 
      business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.services?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIndustry = industryFilter === "all" || business.industry === industryFilter;

    return matchesSearch && matchesIndustry;
  });

  const featuredBusinesses = filteredBusinesses?.filter(b => b.status === 'featured') || [];
  const regularBusinesses = filteredBusinesses?.filter(b => b.status !== 'featured') || [];

  const handleViewBusiness = (business: BusinessProfile) => {
    setSelectedBusiness(business);
    setDialogOpen(true);
  };

  // Not logged in
  if (!user) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <Building2 className="h-16 w-16 text-primary/50 mx-auto mb-6" />
            <h1 className="font-display text-3xl text-foreground mb-4">
              Member Access Required
            </h1>
            <p className="text-muted-foreground mb-8">
              The Connected Circle directory is available exclusively to our members.
              Sign in or apply for membership to access our business network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/membership">Apply for Membership</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Access restricted (Patron tier)
  if (!canAccess) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <Building2 className="h-16 w-16 text-primary/50 mx-auto mb-6" />
            <h1 className="font-display text-3xl text-foreground mb-4">
              Upgrade Required
            </h1>
            <p className="text-muted-foreground mb-8">
              The Connected Circle is available to Fellow and Founder members.
              Upgrade your membership to access our exclusive business directory.
            </p>
            <Button asChild>
              <Link to="/membership">Upgrade Membership</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12 md:py-20">
        <div className="container max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-6"
            >
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Member Directory</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-foreground mb-4"
            >
              The Connected Circle
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Discover and connect with verified member businesses across industries
            </motion.p>
          </div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border/50 rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry!}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || industryFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                    setIndustryFilter("all");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {(searchQuery || industryFilter !== "all") && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    "{searchQuery}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {industryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {industryFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setIndustryFilter("all")} />
                  </Badge>
                )}
              </div>
            )}
          </motion.div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
            <div className="space-y-12">
              {/* Featured Businesses */}
              {featuredBusinesses.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl text-foreground mb-6">
                    Featured Businesses
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredBusinesses.map((business, index) => (
                      <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <BusinessCard
                          business={business}
                          onClick={() => handleViewBusiness(business)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* All Businesses */}
              {regularBusinesses.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl text-foreground mb-6">
                    {featuredBusinesses.length > 0 ? "All Businesses" : "Directory"}
                    <span className="text-muted-foreground font-normal text-lg ml-2">
                      ({regularBusinesses.length})
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularBusinesses.map((business, index) => (
                      <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <BusinessCard
                          business={business}
                          onClick={() => handleViewBusiness(business)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No businesses found</h3>
              <p className="text-muted-foreground">
                {searchQuery || industryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to list your business!"}
              </p>
              <Button asChild className="mt-6">
                <Link to="/portal/business">List Your Business</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Business Profile Dialog */}
      <BusinessProfileDialog
        business={selectedBusiness}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Layout>
  );
};

export default ConnectedCircleDirectoryPage;
