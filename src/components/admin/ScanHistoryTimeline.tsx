import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

type SecurityStatus = 'pending' | 'clean' | 'flagged' | 'under_review' | 'cleared' | 'suspended';
type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface ScanHistoryEntry {
  id: string;
  scan_type: string;
  status: SecurityStatus;
  severity: SecuritySeverity | null;
  red_flags: string[] | null;
  positive_signals: string[] | null;
  identity_score: number | null;
  social_consistency_score: number | null;
  ai_recommendation: string | null;
  admin_decision: string | null;
  scanned_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface ScanHistoryTimelineProps {
  userId: string;
}

const statusConfig: Record<SecurityStatus, { label: string; color: string; icon: typeof Shield }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  clean: { label: 'Clean', color: 'bg-green-500/10 text-green-500', icon: ShieldCheck },
  flagged: { label: 'Flagged', color: 'bg-destructive/10 text-destructive', icon: ShieldAlert },
  under_review: { label: 'Under Review', color: 'bg-amber-500/10 text-amber-500', icon: ShieldQuestion },
  cleared: { label: 'Cleared', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-500', icon: XCircle },
};

const severityConfig: Record<SecuritySeverity, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  high: { label: 'High', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  critical: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const scanTypeLabels: Record<string, string> = {
  automatic: 'Automatic',
  manual: 'Manual',
  periodic: 'Periodic',
};

export function ScanHistoryTimeline({ userId }: ScanHistoryTimelineProps) {
  const { data: scanHistory, isLoading } = useQuery({
    queryKey: ['scan-history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_security_reports')
        .select('id, scan_type, status, severity, red_flags, positive_signals, identity_score, social_consistency_score, ai_recommendation, admin_decision, scanned_at, reviewed_at, created_at')
        .eq('user_id', userId)
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      return data as ScanHistoryEntry[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!scanHistory || scanHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No security scans recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Scan History
        </CardTitle>
        <CardDescription>
          {scanHistory.length} security scan{scanHistory.length !== 1 ? 's' : ''} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {scanHistory.map((entry, index) => {
                const StatusIcon = statusConfig[entry.status].icon;
                const scanDate = entry.scanned_at ? new Date(entry.scanned_at) : new Date(entry.created_at);

                return (
                  <div key={entry.id} className="relative pl-12">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${statusConfig[entry.status].color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={statusConfig[entry.status].color}>
                              {statusConfig[entry.status].label}
                            </Badge>
                            {entry.severity && (
                              <Badge variant="outline" className={severityConfig[entry.severity].color}>
                                {severityConfig[entry.severity].label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {scanTypeLabels[entry.scan_type] || entry.scan_type} scan
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{format(scanDate, 'MMM d, yyyy')}</p>
                          <p className="text-muted-foreground">{format(scanDate, 'h:mm a')}</p>
                        </div>
                      </div>

                      {/* Scores */}
                      {(entry.identity_score !== null || entry.social_consistency_score !== null) && (
                        <div className="flex gap-4 mb-3 text-sm">
                          {entry.identity_score !== null && (
                            <div>
                              <span className="text-muted-foreground">Identity: </span>
                              <span className={`font-medium ${entry.identity_score >= 70 ? 'text-green-500' : entry.identity_score >= 40 ? 'text-amber-500' : 'text-destructive'}`}>
                                {entry.identity_score}%
                              </span>
                            </div>
                          )}
                          {entry.social_consistency_score !== null && (
                            <div>
                              <span className="text-muted-foreground">Consistency: </span>
                              <span className={`font-medium ${entry.social_consistency_score >= 70 ? 'text-green-500' : entry.social_consistency_score >= 40 ? 'text-amber-500' : 'text-destructive'}`}>
                                {entry.social_consistency_score}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Red flags */}
                      {entry.red_flags && entry.red_flags.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-destructive flex items-center gap-1 mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            Red Flags ({entry.red_flags.length})
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {entry.red_flags.slice(0, 3).map((flag, i) => (
                              <li key={i} className="truncate">{flag}</li>
                            ))}
                            {entry.red_flags.length > 3 && (
                              <li className="text-xs">+{entry.red_flags.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Positive signals */}
                      {entry.positive_signals && entry.positive_signals.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-green-500 flex items-center gap-1 mb-1">
                            <CheckCircle className="h-3 w-3" />
                            Positive Signals ({entry.positive_signals.length})
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {entry.positive_signals.slice(0, 2).map((signal, i) => (
                              <li key={i} className="truncate">{signal}</li>
                            ))}
                            {entry.positive_signals.length > 2 && (
                              <li className="text-xs">+{entry.positive_signals.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Admin decision */}
                      {entry.admin_decision && (
                        <div className="pt-2 border-t border-border mt-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Admin decision: </span>
                            <span className="font-medium capitalize">{entry.admin_decision}</span>
                            {entry.reviewed_at && (
                              <span className="text-muted-foreground"> on {format(new Date(entry.reviewed_at), 'MMM d, yyyy')}</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
