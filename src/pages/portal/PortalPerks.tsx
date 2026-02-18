import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Gift,
  Search,
  Utensils,
  Plane,
  Heart,
  ShoppingBag,
  Sparkles,
  Copy,
  Check,
  Crown,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface Perk {
  id: string;
  partner_name: string;
  partner_logo_url: string | null;
  category: string;
  perk_title: string;
  perk_description: string | null;
  discount_value: string | null;
  redemption_code: string | null;
  redemption_instructions: string | null;
  min_tier: 'patron' | 'fellow' | 'founder';
  valid_until: string | null;
  is_featured: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Gift; label: string }> = {
  dining: { icon: Utensils, label: 'Dining' },
  travel: { icon: Plane, label: 'Travel' },
  wellness: { icon: Heart, label: 'Wellness' },
  shopping: { icon: ShoppingBag, label: 'Shopping' },
  experiences: { icon: Sparkles, label: 'Experiences' },
};

const TIER_ORDER = { patron: 0, fellow: 1, founder: 2 };

export default function PortalPerks() {
  const { membership } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const userTier = membership?.tier || 'patron';
  const userTierOrder = TIER_ORDER[userTier as keyof typeof TIER_ORDER];

  // Note: partner_perks table may not exist yet - gracefully handle with empty array
  const { data: perks = [], isLoading, isError } = useQuery({
    queryKey: ['partner-perks'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('partner_perks')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          // Table doesn't exist or other error - return empty array
          console.warn('Partner perks not available:', error.message);
          return [];
        }
        return (data || []) as Perk[];
      } catch {
        return [];
      }
    },
    retry: false, // Don't retry if table doesn't exist
  });

  const filteredPerks = perks.filter((perk) => {
    const matchesSearch =
      !searchTerm ||
      perk.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perk.perk_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || perk.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPerks = filteredPerks.filter((p) => p.is_featured);
  const regularPerks = filteredPerks.filter((p) => !p.is_featured);

  const canAccessPerk = (perk: Perk) => {
    const perkTierOrder = TIER_ORDER[perk.min_tier as keyof typeof TIER_ORDER];
    return userTierOrder >= perkTierOrder;
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRevealPerk = async (perk: Perk) => {
    if (!canAccessPerk(perk)) {
      toast.error(`Upgrade to ${perk.min_tier} to access this perk`);
      return;
    }
    setSelectedPerk(perk);

    // Track redemption click - increment counter
    try {
      await (supabase as any)
        .from('partner_perks')
        .update({ redemption_count: ((perk as any).redemption_count || 0) + 1 })
        .eq('id', perk.id);
    } catch {
      // Silently fail - tracking is non-critical
    }
  };

  const categories = Object.keys(CATEGORY_CONFIG);

  // Show empty state instead of infinite loading
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            Partner Perks
          </h1>
          <p className="text-muted-foreground">
            Exclusive discounts and benefits from our partner network
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Exclusive Perks
        </h1>
        <p className="text-muted-foreground">
          Premium benefits from our curated partner network
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search perks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => {
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                <Icon className="h-4 w-4 mr-1" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Featured Perks */}
      {featuredPerks.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#d4af37]" />
            Featured Offers
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredPerks.map((perk) => (
              <PerkCard
                key={perk.id}
                perk={perk}
                canAccess={canAccessPerk(perk)}
                onReveal={() => handleRevealPerk(perk)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* All Perks */}
      {regularPerks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularPerks.map((perk) => (
            <PerkCard
              key={perk.id}
              perk={perk}
              canAccess={canAccessPerk(perk)}
              onReveal={() => handleRevealPerk(perk)}
            />
          ))}
        </div>
      ) : filteredPerks.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No Perks Found"
          description={
            searchTerm || selectedCategory
              ? 'Try adjusting your filters or search terms to find available partner offers.'
              : 'Check back soon for new exclusive partner offers!'
          }
        />
      ) : null}

      {/* Perk Detail Modal */}
      <Dialog open={!!selectedPerk} onOpenChange={() => setSelectedPerk(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-3">
              {selectedPerk?.partner_logo_url && (
                <img
                  src={selectedPerk.partner_logo_url}
                  alt={selectedPerk.partner_name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              {selectedPerk?.partner_name}
            </DialogTitle>
            <DialogDescription>{selectedPerk?.perk_title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedPerk?.discount_value && (
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {selectedPerk.discount_value}
                </p>
              </div>
            )}

            {selectedPerk?.perk_description && (
              <p className="text-sm text-muted-foreground">
                {selectedPerk.perk_description}
              </p>
            )}

            {selectedPerk?.redemption_code && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Code</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-white/[0.06] border border-white/[0.08] rounded-lg font-mono text-center font-bold tracking-wider">
                    {selectedPerk.redemption_code}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyCode(selectedPerk.redemption_code!)}
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {selectedPerk?.redemption_instructions && (
              <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-lg">
                <p className="text-sm font-medium mb-1">How to redeem</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPerk.redemption_instructions}
                </p>
              </div>
            )}

            {selectedPerk?.valid_until && (
              <p className="text-xs text-muted-foreground text-center">
                Valid until{' '}
                {new Date(selectedPerk.valid_until).toLocaleDateString()}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PerkCardProps {
  perk: Perk;
  canAccess: boolean;
  onReveal: () => void;
  featured?: boolean;
}

function PerkCard({ perk, canAccess, onReveal, featured }: PerkCardProps) {
  const config = CATEGORY_CONFIG[perk.category] || { icon: Gift, label: perk.category };
  const Icon = config.icon;

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 border-white/[0.08] bg-white/[0.04] backdrop-blur-sm ${featured ? 'border-[#d4af37]/20 bg-gradient-to-br from-[#d4af37]/5 to-transparent' : ''
        } ${!canAccess ? 'opacity-75' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {perk.partner_logo_url ? (
              <img
                src={perk.partner_logo_url}
                alt={perk.partner_name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{perk.partner_name}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>
          {!canAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium text-foreground mb-1">{perk.perk_title}</h4>
        {perk.discount_value && (
          <p className="text-lg font-bold text-[#d4af37] mb-2">{perk.discount_value}</p>
        )}
        {perk.perk_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {perk.perk_description}
          </p>
        )}

        <Button
          onClick={onReveal}
          className="w-full uppercase tracking-wider text-xs font-bold"
          variant={canAccess ? 'default' : 'outline'}
          disabled={!canAccess}
        >
          {canAccess ? (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Reveal Offer
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {perk.min_tier}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
