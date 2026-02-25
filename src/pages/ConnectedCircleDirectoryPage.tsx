import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { BusinessCard } from "@/components/business/BusinessCard";
import { BusinessProfileDialog } from "@/components/business/BusinessProfileDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2, Filter, X, ArrowUpDown, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { TransitionLink } from "@/components/ui/TransitionLink";
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
  category: string | null;
  location: string | null;
  website: string | null;
  contact_email: string | null;
  services: string[] | null;
  status: string;
  connection_count: number | null;
  created_at: string;
}

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

type SortOption = 'newest' | 'alphabetical' | 'connections';

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ConnectedCircleDirectoryPage = () => {
  const { user, membership } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const canAccess = membership?.tier === 'fellow' || membership?.tier === 'founder';

  // Fetch all businesses for members, sample for non-members
  const { data: businesses, isLoading } = useQuery({
    queryKey: ['business-directory', canAccess],
    queryFn: async () => {
      let query = supabase
        .from('business_profiles')
        .select('*')
        .in('status', ['approved', 'featured'])
        .eq('is_visible', true)
        .order('status', { ascending: false })
        .order('business_name');

      // For non-members, only fetch 3 sample businesses
      if (!canAccess) {
        query = query.limit(3);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BusinessProfile[];
    },
    enabled: !!user || !user, // Fetch for both logged in and not
  });

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = businesses?.map(b => b.category).filter(Boolean) || [];
    return [...new Set(cats)];
  }, [businesses]);

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    
    let result = businesses.filter(business => {
      const query = debouncedSearch.toLowerCase();
      const matchesSearch = !query || 
        business.business_name.toLowerCase().includes(query) ||
        business.description?.toLowerCase().includes(query) ||
        business.services?.some(s => s.toLowerCase().includes(query)) ||
        business.industry?.toLowerCase().includes(query);
      
      const matchesCategory = categoryFilter === "all" || business.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.business_name.localeCompare(b.business_name));
        break;
      case 'connections':
        result.sort((a, b) => (b.connection_count || 0) - (a.connection_count || 0));
        break;
    }

    return result;
  }, [businesses, debouncedSearch, categoryFilter, sortOption]);

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
              The Founders Circle directory is available exclusively to our members.
              Sign in or apply for membership to access our founder network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <TransitionLink to="/auth">Sign In</TransitionLink>
              </Button>
              <Button variant="outline" asChild>
                <TransitionLink to="/membership">Apply for Membership</TransitionLink>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show preview for non-members with 3 sample businesses
  const showPreview = !canAccess && businesses && businesses.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12 md:py-20">
        <div className="container max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 glass border border-[hsl(var(--accent-gold))]/20 rounded-full px-5 py-2.5 mb-6"
            >
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Founders Directory</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-foreground mb-4"
            >
              The Founders Circle
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Discover and connect with verified founder-led companies across industries
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
                  disabled={!canAccess}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={!canAccess}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {BUSINESS_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)} disabled={!canAccess}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                  <SelectItem value="connections">Most Connections</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || categoryFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {(searchQuery || categoryFilter !== "all") && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    "{searchQuery}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {categoryFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("all")} />
                  </Badge>
                )}
              </div>
            )}
          </motion.div>

          {/* Preview Banner for Non-Members */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary/10 border border-[hsl(var(--accent-gold))]/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Preview Mode</h3>
                  <p className="text-muted-foreground text-sm">
                    You're viewing a preview. Upgrade to Fellow or Founder to access the full directory.
                  </p>
                </div>
              </div>
              <Button asChild>
                <TransitionLink to="/membership">Upgrade Now</TransitionLink>
              </Button>
            </motion.div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
            <div className="space-y-12">
              {/* Featured Companies */}
              {featuredBusinesses.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl text-foreground mb-6">
                    Featured Companies
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

              {/* All Companies */}
              {regularBusinesses.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl text-foreground mb-6">
                    {featuredBusinesses.length > 0 ? "All Companies" : "Directory"}
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
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to list your business!"}
              </p>
              {canAccess && (
                <Button asChild className="mt-6">
                  <TransitionLink to="/portal/business">List Your Business</TransitionLink>
                </Button>
              )}
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
