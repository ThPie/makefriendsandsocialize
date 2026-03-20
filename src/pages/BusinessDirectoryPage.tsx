import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessProfileDialog } from '@/components/business/BusinessProfileDialog';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry: string | null;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  contact_email: string | null;
  location: string | null;
  services: string[] | null;
  status: string;
  is_visible: boolean;
  connection_count: number;
  created_at: string;
}

const INDUSTRIES = [
  'All Industries',
  'Technology',
  'Finance',
  'Healthcare',
  'Real Estate',
  'Legal',
  'Marketing',
  'Consulting',
  'Hospitality',
  'Retail',
  'Manufacturing',
  'Other',
];

export default function BusinessDirectoryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch approved businesses
  const { data: businesses, isLoading } = useQuery({
    queryKey: ['business-directory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .in('status', ['approved', 'featured'])
        .order('status', { ascending: true }) // 'featured' comes before 'approved' alphabetically
        .order('business_name', { ascending: true });

      if (error) throw error;
      return data as BusinessProfile[];
    },
  });

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];

    return businesses.filter((business) => {
      const matchesSearch =
        searchQuery === '' ||
        business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.services?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesIndustry =
        industryFilter === 'All Industries' || business.industry === industryFilter;

      return matchesSearch && matchesIndustry;
    });
  }, [businesses, searchQuery, industryFilter]);

  const featuredBusinesses = filteredBusinesses.filter((b) => b.status === 'featured');
  const regularBusinesses = filteredBusinesses.filter((b) => b.status !== 'featured');

  const handleBusinessClick = (business: BusinessProfile) => {
    setSelectedBusiness(business);
    setDialogOpen(true);
  };

  return (
    <>
      <SEOHead
        title="Business Directory | The Connected Circle"
        description="Discover and connect with trusted businesses in our exclusive professional network. Request introductions to fellow members."
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Building2 className="w-3 h-3 mr-1" />
              The Connected Circle
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Business Directory
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover member businesses and reach out directly to connect.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search businesses, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={industryFilter}
              onValueChange={setIndustryFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          )}

          {/* Featured Businesses */}
          {!isLoading && featuredBusinesses.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold text-foreground">Featured Businesses</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBusinesses.map((business, index) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BusinessCard
                      business={business}
                      onClick={() => handleBusinessClick(business)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Businesses */}
          {!isLoading && regularBusinesses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">All Businesses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularBusinesses.map((business, index) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <BusinessCard
                      business={business}
                      onClick={() => handleBusinessClick(business)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredBusinesses.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No businesses found</h3>
              <p className="text-muted-foreground">
                {searchQuery || industryFilter !== 'All Industries'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to list your business in the directory'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Business Profile Dialog */}
      {selectedBusiness && (
        <BusinessProfileDialog
          business={selectedBusiness}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}
