import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Gift, Plus, Pencil, Trash2, Eye, Star } from 'lucide-react';
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
  is_active: boolean;
  redemption_count: number;
  created_at: string;
}

const perkSchema = z.object({
  partner_name: z.string().min(1, 'Partner name is required'),
  partner_logo_url: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  perk_title: z.string().min(1, 'Title is required'),
  perk_description: z.string().optional(),
  discount_value: z.string().optional(),
  redemption_code: z.string().optional(),
  redemption_instructions: z.string().optional(),
  min_tier: z.enum(['patron', 'fellow', 'founder']),
  valid_until: z.string().optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

type PerkFormData = z.infer<typeof perkSchema>;

const CATEGORIES = [
  { value: 'dining', label: 'Dining' },
  { value: 'travel', label: 'Travel' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'experiences', label: 'Experiences' },
];

export default function AdminPerks() {
  const queryClient = useQueryClient();
  const [editingPerk, setEditingPerk] = useState<Perk | null>(null);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<PerkFormData>({
    resolver: zodResolver(perkSchema),
    defaultValues: {
      partner_name: '',
      category: '',
      perk_title: '',
      min_tier: 'patron',
      is_featured: false,
      is_active: true,
    },
  });

  const { data: perks = [], isLoading } = useQuery({
    queryKey: ['admin-perks'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('partner_perks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Perk[];
    },
  });

  const createPerk = useMutation({
    mutationFn: async (data: PerkFormData) => {
      const { error } = await (supabase as any).from('partner_perks').insert({
        ...data,
        valid_until: data.valid_until || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perks'] });
      toast.success('Perk created');
      handleCloseForm();
    },
    onError: () => toast.error('Failed to create perk'),
  });

  const updatePerk = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PerkFormData }) => {
      const { error } = await (supabase as any)
        .from('partner_perks')
        .update({
          ...data,
          valid_until: data.valid_until || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perks'] });
      toast.success('Perk updated');
      handleCloseForm();
    },
    onError: () => toast.error('Failed to update perk'),
  });

  const deletePerk = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('partner_perks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perks'] });
      toast.success('Perk deleted');
    },
    onError: () => toast.error('Failed to delete perk'),
  });

  const handleOpenForm = (perk?: Perk) => {
    if (perk) {
      setEditingPerk(perk);
      form.reset({
        partner_name: perk.partner_name,
        partner_logo_url: perk.partner_logo_url || '',
        category: perk.category,
        perk_title: perk.perk_title,
        perk_description: perk.perk_description || '',
        discount_value: perk.discount_value || '',
        redemption_code: perk.redemption_code || '',
        redemption_instructions: perk.redemption_instructions || '',
        min_tier: perk.min_tier,
        valid_until: perk.valid_until || '',
        is_featured: perk.is_featured,
        is_active: perk.is_active,
      });
    } else {
      setEditingPerk(null);
      form.reset({
        partner_name: '',
        category: '',
        perk_title: '',
        min_tier: 'patron',
        is_featured: false,
        is_active: true,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPerk(null);
    form.reset();
  };

  const onSubmit = (data: PerkFormData) => {
    if (editingPerk) {
      updatePerk.mutate({ id: editingPerk.id, data });
    } else {
      createPerk.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-2">Partner Perks</h1>
          <p className="text-muted-foreground">Manage exclusive member discounts</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Perk
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Perks</p>
            <p className="text-2xl font-bold">{perks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {perks.filter((p) => p.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Featured</p>
            <p className="text-2xl font-bold text-primary">
              {perks.filter((p) => p.is_featured).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Redemptions</p>
            <p className="text-2xl font-bold">
              {perks.reduce((sum, p) => sum + p.redemption_count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Perks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Min Tier</TableHead>
                <TableHead>Redemptions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perks.map((perk) => (
                <TableRow key={perk.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {perk.partner_logo_url ? (
                        <img
                          src={perk.partner_logo_url}
                          alt={perk.partner_name}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                          <Gift className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{perk.partner_name}</p>
                        {perk.is_featured && (
                          <Star className="h-3 w-3 text-amber-500 inline" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{perk.perk_title}</p>
                    {perk.discount_value && (
                      <p className="text-sm text-primary">{perk.discount_value}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{perk.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {perk.min_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{perk.redemption_count}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        perk.is_active
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {perk.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(perk)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePerk.mutate(perk.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPerk ? 'Edit Perk' : 'Add New Perk'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="partner_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., The Ivy" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partner_logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Tier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="patron">Patron</SelectItem>
                          <SelectItem value="fellow">Fellow</SelectItem>
                          <SelectItem value="founder">Founder</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="perk_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Complimentary Welcome Cocktail" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 20% off, £50 credit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perk_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe the offer..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="redemption_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo Code (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., CLUBMEMBER" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="redemption_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redemption Instructions (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="How should members redeem this offer?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Featured</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={createPerk.isPending || updatePerk.isPending}>
                  {editingPerk ? 'Update Perk' : 'Create Perk'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
