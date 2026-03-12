import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/common/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const hostSchema = z.object({
  full_name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  skill_topic: z.string().trim().min(2, 'Topic is required').max(200),
  experience_description: z.string().trim().max(1000).optional(),
  teaching_format: z.string().optional(),
  availability: z.string().trim().max(500).optional(),
});

const HostApplicationPage = () => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    skill_topic: '',
    experience_description: '',
    teaching_format: '',
    availability: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = hostSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }

    setLoading(true);
    const insertData: Record<string, unknown> = {
      ...parsed.data,
      user_id: user?.id || null,
    };
    const { error } = await supabase.from('host_applications').insert(insertData as any);
    setLoading(false);

    if (error) {
      toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'destructive' });
      return;
    }

    setSubmitted(true);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Layout>
      <SEO title="Become a Host — The Exchange" description="Apply to host a workshop, class, or demo and share your skills with our community." />
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="content-container max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            {submitted ? (
              <div className="text-center py-20">
                <CheckCircle className="w-16 h-16 text-[hsl(var(--accent-gold))] mx-auto mb-6" />
                <h1 className="font-display text-4xl text-foreground mb-4">Application Received!</h1>
                <p className="text-muted-foreground text-lg">Thank you for offering to share your skills. We'll review your application and get back to you soon.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 border border-[hsl(var(--accent-gold))]/30 rounded-full px-4 py-1.5 mb-6 bg-[hsl(var(--accent-gold))]/10">
                    <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--accent-gold))]" />
                    <span className="text-xs font-medium text-[hsl(var(--accent-gold))] tracking-wider uppercase">The Exchange</span>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                    Become a <span className="text-[hsl(var(--accent-gold))] italic">Host</span>
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                    Share your expertise with our community. Tell us what you'd like to teach.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input id="full_name" value={form.full_name} onChange={e => update('full_name', e.target.value)} required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} required maxLength={255} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill_topic">What would you like to teach? *</Label>
                    <Input id="skill_topic" placeholder="e.g. Python basics, Sourdough bread, Bike maintenance" value={form.skill_topic} onChange={e => update('skill_topic', e.target.value)} required maxLength={200} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_description">Tell us about your experience</Label>
                    <Textarea id="experience_description" placeholder="What's your background with this skill? How long have you been doing it?" value={form.experience_description} onChange={e => update('experience_description', e.target.value)} maxLength={1000} rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teaching_format">Preferred Format</Label>
                    <Select value={form.teaching_format} onValueChange={v => update('teaching_format', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Hands-on Workshop</SelectItem>
                        <SelectItem value="class">Class / Lecture</SelectItem>
                        <SelectItem value="demo">Live Demo</SelectItem>
                        <SelectItem value="mentoring">1-on-1 Mentoring</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Input id="availability" placeholder="e.g. Weekends, Tuesday evenings, Flexible" value={form.availability} onChange={e => update('availability', e.target.value)} maxLength={500} />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-12 gold-fill border-none text-white rounded-full text-base">
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default HostApplicationPage;
