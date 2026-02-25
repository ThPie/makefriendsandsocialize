import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import {
  Shield,
  ShieldCheck,
  Clock,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  Scan,
  CheckCircle2,
} from 'lucide-react';
import { format, differenceInDays, subDays } from 'date-fns';

interface MemberDueForScan {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_urls: string[] | null;
  city: string | null;
  country: string | null;
  job_title: string | null;
  industry: string | null;
  bio: string | null;
  last_scanned_at: string | null;
  created_at: string;
  days_since_scan: number;
}

export default function AdminSecurityDashboard() {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();

  // Fetch members due for periodic scan (90+ days since last scan or never scanned)
  const { data: membersDueForScan, isLoading } = useQuery({
    queryKey: ['members-due-for-scan'],
    queryFn: async () => {
      const cutoffDate = subDays(new Date(), 90).toISOString();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_urls, city, country, job_title, industry, bio, last_scanned_at, created_at')
        .or(`last_scanned_at.is.null,last_scanned_at.lt.${cutoffDate}`)
        .order('last_scanned_at', { ascending: true, nullsFirst: true });

      if (error) throw error;

      return (data || []).map(member => ({
        ...member,
        days_since_scan: member.last_scanned_at
          ? differenceInDays(new Date(), new Date(member.last_scanned_at))
          : differenceInDays(new Date(), new Date(member.created_at)),
      })) as MemberDueForScan[];
    },
  });

  // Fetch recent scan stats
  const { data: recentScans } = useQuery({
    queryKey: ['recent-scan-stats'],
    queryFn: async () => {
      const last30Days = subDays(new Date(), 30).toISOString();

      const { data, error } = await supabase
        .from('member_security_reports')
        .select('id, status, severity, scanned_at')
        .gte('scanned_at', last30Days);

      if (error) throw error;
      return data || [];
    },
  });

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (membersDueForScan) {
      setSelectedMembers(new Set(membersDueForScan.map(m => m.id)));
    }
  };

  const deselectAll = () => {
    setSelectedMembers(new Set());
  };

  const runBulkScan = async () => {
    if (selectedMembers.size === 0) {
      toast.error('Please select at least one member to scan');
      return;
    }

    const membersToScan = membersDueForScan?.filter(m => selectedMembers.has(m.id)) || [];
    setIsBulkScanning(true);
    setScanProgress({ current: 0, total: membersToScan.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < membersToScan.length; i++) {
      const member = membersToScan[i];
      setScanProgress({ current: i + 1, total: membersToScan.length });

      try {
        const { error } = await supabase.functions.invoke('deep-osint-analysis', {
          body: {
            userId: member.id,
            firstName: member.first_name || '',
            lastName: member.last_name || '',
            city: member.city || '',
            country: member.country || '',
            jobTitle: member.job_title || '',
            industry: member.industry || '',
            bio: member.bio || '',
            scanType: 'manual',
          },
        });

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Failed to scan member ${member.id}:`, error);
        failCount++;
      }
    }

    setIsBulkScanning(false);
    setSelectedMembers(new Set());
    queryClient.invalidateQueries({ queryKey: ['members-due-for-scan'] });
    queryClient.invalidateQueries({ queryKey: ['recent-scan-stats'] });

    if (failCount === 0) {
      toast.success(`Successfully scanned ${successCount} members`);
    } else {
      toast.warning(`Scanned ${successCount} members, ${failCount} failed`);
    }
  };

  const stats = {
    dueForScan: membersDueForScan?.length || 0,
    neverScanned: membersDueForScan?.filter(m => !m.last_scanned_at).length || 0,
    overdue90Days: membersDueForScan?.filter(m => m.days_since_scan > 90).length || 0,
    scansLast30Days: recentScans?.length || 0,
    flaggedLast30Days: recentScans?.filter(s => s.status === 'flagged').length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl flex items-center gap-3">
            <Shield className="h-8 w-8 text-[hsl(var(--accent-gold))]" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage periodic security scans
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Clock, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500', value: stats.dueForScan, label: 'Due for Scan' },
          { icon: AlertCircle, iconBg: 'bg-destructive/10', iconColor: 'text-destructive', value: stats.neverScanned, label: 'Never Scanned' },
          { icon: Calendar, iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500', value: stats.overdue90Days, label: '90+ Days Overdue' },
          { icon: ShieldCheck, iconBg: 'bg-[hsl(var(--accent-gold))]/10', iconColor: 'text-primary', value: stats.scansLast30Days, label: 'Scans (30 days)' },
          { icon: AlertCircle, iconBg: 'bg-red-500/10', iconColor: 'text-red-500', value: stats.flaggedLast30Days, label: 'Flagged (30 days)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-display">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Members Due for Scan */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members Due for Periodic Scan
              </h3>
              <p className="text-sm text-muted-foreground">
                Members who haven't been scanned in 90+ days or never scanned
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedMembers.size > 0 && (
                <Badge variant="secondary">
                  {selectedMembers.size} selected
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="dark:border-white/[0.12]"
                onClick={selectedMembers.size === membersDueForScan?.length ? deselectAll : selectAll}
              >
                {selectedMembers.size === membersDueForScan?.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={runBulkScan}
                disabled={isBulkScanning || selectedMembers.size === 0}
              >
                {isBulkScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning {scanProgress.current}/{scanProgress.total}
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Run Bulk Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-white/[0.06]">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : membersDueForScan?.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All Members Up to Date"
              description="No members require a periodic security scan"
            />
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {membersDueForScan?.map((member) => {
                  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase() || 'M';
                  const isSelected = selectedMembers.has(member.id);

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${isSelected
                          ? 'border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold))]/5'
                          : 'border-white/[0.08] hover:bg-white/[0.04]'
                        }`}
                      onClick={() => toggleMemberSelection(member.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMemberSelection(member.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar_urls?.[0]} />
                        <AvatarFallback className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {member.first_name || ''} {member.last_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.job_title || 'No job title'} • {member.city || 'Unknown location'}
                        </p>
                      </div>
                      <div className="text-right">
                        {member.last_scanned_at ? (
                          <>
                            <Badge
                              variant="outline"
                              className={member.days_since_scan > 90 ? 'border-amber-500/50 text-amber-500' : ''}
                            >
                              {member.days_since_scan} days ago
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(member.last_scanned_at), 'MMM d, yyyy')}
                            </p>
                          </>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                            Never scanned
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </div>
    </div>
  );
}
