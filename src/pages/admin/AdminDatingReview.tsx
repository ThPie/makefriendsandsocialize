/**
 * AdminDatingReview — Focused review queue for pending dating applications.
 * Shows one application at a time (or a list) with full profile details,
 * all form answers, and actions: Approve, Reject, Schedule Call.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Phone,
  User,
  Heart,
  MapPin,
  Briefcase,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Calendar,
  Users,
  Wine,
  MessageSquare,
  Star,
  Shield,
  AlertTriangle,
  Eye,
  Inbox,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  target_gender: string;
  age_range_min: number;
  age_range_max: number;
  location: string | null;
  occupation: string | null;
  bio: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
  relationship_type: string | null;
  marriage_timeline: string | null;
  has_children: boolean | null;
  children_details: string | null;
  wants_children: string | null;
  been_married: boolean | null;
  marriage_history: string | null;
  family_relationship: string | null;
  family_involvement_expectation: string | null;
  smoking_status: string | null;
  drinking_status: string | null;
  drug_use: string | null;
  exercise_frequency: string | null;
  diet_preference: string | null;
  screen_time_habits: string | null;
  tuesday_night_test: string | null;
  financial_philosophy: string | null;
  current_curiosity: string | null;
  debt_status: string | null;
  career_ambition: string | null;
  conflict_resolution: string | null;
  emotional_connection: string | null;
  support_style: string | null;
  vulnerability_check: string | null;
  core_values: string | null;
  core_values_ranked: string[] | null;
  love_language: string | null;
  attachment_style: string | null;
  introvert_extrovert: string | null;
  morning_night_person: string | null;
  communication_style: string | null;
  repair_attempt_response: string | null;
  stress_response: string | null;
  past_relationship_learning: string | null;
  dealbreakers: string | null;
  politics_stance: string | null;
  religion_stance: string | null;
  future_goals: string | null;
  trust_fidelity_views: string | null;
  religious_practice: string | null;
  raise_children_faith: string | null;
  geographic_flexibility: string | null;
  ten_year_vision: string | null;
  accountability_reflection: string | null;
  ex_admiration: string | null;
  growth_work: string | null;
  intimacy_expectations: string | null;
  finding_love_fear: string | null;
  social_verification_status: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: string | null | undefined) {
  if (!val) return null;
  return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function QA({ q, a }: { q: string; a: string | null | undefined }) {
  if (!a) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-[hsl(var(--accent-gold))]/80 uppercase tracking-wider">{q}</p>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{a}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] text-xs px-2.5 py-1 rounded-full border border-[hsl(var(--accent-gold))]/20">
      {label}
    </span>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  profile: PendingProfile;
  onClose: () => void;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
  onScheduleCall: (datetime: string, notes: string) => void;
  isActing: boolean;
  queueIndex: number;
  queueTotal: number;
  onPrev: () => void;
  onNext: () => void;
}

function ReviewModal({
  profile,
  onClose,
  onApprove,
  onReject,
  onScheduleCall,
  isActing,
  queueIndex,
  queueTotal,
  onPrev,
  onNext,
}: ReviewModalProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [callDatetime, setCallDatetime] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | "call" | null>(null);

  const handleConfirm = () => {
    if (action === "approve") onApprove(adminNotes);
    else if (action === "reject") onReject(adminNotes);
    else if (action === "call") onScheduleCall(callDatetime, adminNotes);
  };

  const coreValues = profile.core_values_ranked?.length
    ? profile.core_values_ranked
    : profile.core_values
    ? profile.core_values.split(",").map((v) => v.trim())
    : [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[92vh] flex flex-col p-0 gap-0 bg-background border-border/60">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="h-14 w-14 shrink-0 border-2 border-[hsl(var(--accent-gold))]/30">
                <AvatarImage src={profile.photo_url || ""} alt={profile.display_name} />
                <AvatarFallback className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] font-display text-xl">
                  {profile.display_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <DialogTitle className="font-display text-xl truncate">
                  {profile.display_name}
                </DialogTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mt-0.5">
                  <span>{profile.age} · {fmt(profile.gender)}</span>
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {profile.location}
                    </span>
                  )}
                  {profile.occupation && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {profile.occupation}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Queue navigation */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {queueIndex + 1} / {queueTotal}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrev} disabled={queueIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNext} disabled={queueIndex === queueTotal - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Submitted {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
            {profile.social_verification_status === "flagged" && (
              <Badge className="ml-2 bg-red-500/10 text-red-500 border-red-500/20 gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" />
                Social verification flagged
              </Badge>
            )}
            {profile.social_verification_status === "clean" && (
              <Badge className="ml-2 bg-green-500/10 text-green-500 border-green-500/20 gap-1 text-xs">
                <Shield className="h-3 w-3" />
                Socials verified
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 grid md:grid-cols-[220px_1fr] gap-8">
            {/* Left: photo + basics */}
            <div className="space-y-5">
              {profile.photo_url ? (
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border/30">
                  <img
                    src={profile.photo_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-xl border border-border/30 bg-muted/20 flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}

              <div className="space-y-2 text-sm">
                {profile.relationship_type && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                    <span>{fmt(profile.relationship_type)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>Seeking {fmt(profile.target_gender)}, {profile.age_range_min}–{profile.age_range_max}</span>
                </div>
                {profile.marriage_timeline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{fmt(profile.marriage_timeline)}</span>
                  </div>
                )}
              </div>

              {coreValues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core Values</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coreValues.map((v) => <Chip key={v} label={v} />)}
                  </div>
                </div>
              )}

              {/* Lifestyle snapshot */}
              <div className="space-y-1.5 text-sm">
                {profile.smoking_status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Smoking</span>
                    <span>{fmt(profile.smoking_status)}</span>
                  </div>
                )}
                {profile.drinking_status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Drinking</span>
                    <span>{fmt(profile.drinking_status)}</span>
                  </div>
                )}
                {profile.exercise_frequency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exercise</span>
                    <span>{fmt(profile.exercise_frequency)}</span>
                  </div>
                )}
                {profile.diet_preference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diet</span>
                    <span>{fmt(profile.diet_preference)}</span>
                  </div>
                )}
                {profile.love_language && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Love language</span>
                    <span>{fmt(profile.love_language)}</span>
                  </div>
                )}
                {profile.attachment_style && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attachment</span>
                    <span>{fmt(profile.attachment_style)}</span>
                  </div>
                )}
                {profile.introvert_extrovert && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy</span>
                    <span>{fmt(profile.introvert_extrovert)}</span>
                  </div>
                )}
                {profile.morning_night_person && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rhythm</span>
                    <span>{fmt(profile.morning_night_person)}</span>
                  </div>
                )}
              </div>

              {/* Family */}
              <div className="space-y-1.5 text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Family</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has children</span>
                  <span>{profile.has_children ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wants children</span>
                  <span>{fmt(profile.wants_children) || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previously married</span>
                  <span>{profile.been_married ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            {/* Right: all answers */}
            <div className="space-y-7">
              {/* Bio */}
              {profile.bio && (
                <Section title="About">
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </Section>
              )}

              <Section title="Daily Life">
                <QA q="Tuesday Night Test — Ideal quiet evening" a={profile.tuesday_night_test} />
                <QA q="Financial Philosophy" a={profile.financial_philosophy} />
                <QA q="What are you currently curious about?" a={profile.current_curiosity} />
                <QA q="Career Ambition" a={profile.career_ambition} />
                <QA q="Debt Status" a={fmt(profile.debt_status)} />
              </Section>

              <Section title="Emotional Intelligence & Connection">
                <QA q="How do you handle conflict?" a={profile.conflict_resolution} />
                <QA q="What does emotional connection mean to you?" a={profile.emotional_connection} />
                <QA q="How do you like to be supported?" a={profile.support_style} />
                <QA q="What makes you feel most vulnerable in dating?" a={profile.vulnerability_check} />
                <QA q="Communication Style" a={fmt(profile.communication_style)} />
                <QA q="When your partner tries to repair a conflict, you..." a={profile.repair_attempt_response} />
                <QA q="How do you typically respond to stress?" a={profile.stress_response} />
              </Section>

              <Section title="Values & Worldview">
                <QA q="Dealbreakers" a={profile.dealbreakers} />
                <QA q="Political alignment" a={fmt(profile.politics_stance)} />
                <QA q="Religious / Spiritual views" a={fmt(profile.religion_stance)} />
                <QA q="Religious practice" a={fmt(profile.religious_practice)} />
                <QA q="Would you raise children in a faith tradition?" a={profile.raise_children_faith} />
                <QA q="10-year vision" a={profile.ten_year_vision} />
                <QA q="Future Goals" a={profile.future_goals} />
                <QA q="Trust & fidelity views" a={profile.trust_fidelity_views} />
                <QA q="Geographic flexibility" a={fmt(profile.geographic_flexibility)} />
              </Section>

              <Section title="Self-Awareness & Growth">
                <QA q="What you learned from past relationships" a={profile.past_relationship_learning} />
                <QA q="Accountability — how do you handle being wrong?" a={profile.accountability_reflection} />
                <QA q="What do you most admire about an ex?" a={profile.ex_admiration} />
                <QA q="What inner work are you doing right now?" a={profile.growth_work} />
                <QA q="Deep fear about finding love" a={profile.finding_love_fear} />
              </Section>

              {profile.intimacy_expectations && (
                <Section title="Intimacy">
                  <QA q="Expectations beyond the honeymoon phase" a={profile.intimacy_expectations} />
                </Section>
              )}

              {(profile.family_relationship || profile.family_involvement_expectation || profile.marriage_history) && (
                <Section title="Family Context">
                  <QA q="Your relationship with your family" a={profile.family_relationship} />
                  <QA q="Expected family involvement in your relationship" a={fmt(profile.family_involvement_expectation)} />
                  <QA q="Marriage / divorce history" a={profile.marriage_history} />
                  {profile.children_details && <QA q="Children details" a={profile.children_details} />}
                </Section>
              )}

              {profile.drug_use && profile.drug_use !== "never" && (
                <Section title="Substance Use (Additional)">
                  <QA q="Drug use" a={fmt(profile.drug_use)} />
                  {profile.screen_time_habits && <QA q="Screen time habits" a={profile.screen_time_habits} />}
                </Section>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* ── Action panel ── */}
        <div className="shrink-0 border-t border-border/40 px-6 py-4 space-y-4 bg-card/50">
          {/* Action selector */}
          {!action && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => setAction("approve")}
              >
                <Check className="h-4 w-4" />
                Approve Application
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/40 hover:bg-[hsl(var(--accent-gold))]/10"
                onClick={() => setAction("call")}
              >
                <Phone className="h-4 w-4" />
                Schedule Call
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10"
                onClick={() => setAction("reject")}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {/* Confirm panel */}
          {action && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {action === "approve" && <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approving</Badge>}
                {action === "reject" && <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejecting</Badge>}
                {action === "call" && <Badge className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/20">Scheduling Call</Badge>}
                <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>

              {action === "call" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Call Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={callDatetime}
                    onChange={(e) => setCallDatetime(e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Admin Notes {action !== "reject" ? "(optional)" : "(required — explain reason to applicant)"}
                </Label>
                <Textarea
                  placeholder={
                    action === "approve"
                      ? "Any notes for the team about this applicant..."
                      : action === "reject"
                      ? "Reason for rejection (will inform communication to applicant)..."
                      : "Notes for the call or any context..."
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="bg-background resize-none"
                />
              </div>

              <Button
                className={
                  action === "approve"
                    ? "w-full bg-green-600 hover:bg-green-700 text-white"
                    : action === "reject"
                    ? "w-full bg-red-600 hover:bg-red-700 text-white"
                    : "w-full bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black"
                }
                disabled={isActing || (action === "reject" && !adminNotes.trim()) || (action === "call" && !callDatetime)}
                onClick={handleConfirm}
              >
                {isActing ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</>
                ) : action === "approve" ? (
                  <><Check className="h-4 w-4 mr-2" />Confirm Approval</>
                ) : action === "reject" ? (
                  <><X className="h-4 w-4 mr-2" />Confirm Rejection</>
                ) : (
                  <><Phone className="h-4 w-4 mr-2" />Confirm Schedule Call</>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminDatingReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"pending" | "all">("pending");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["dating-review-queue", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("dating_profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (statusFilter === "pending") {
        query = query.in("status", ["pending", "new"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PendingProfile[];
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
      callDatetime,
    }: {
      id: string;
      status: string;
      adminNotes?: string;
      callDatetime?: string;
    }) => {
      const updatePayload: Record<string, unknown> = { status };

      // Store admin notes and scheduled call in social_verification_notes field
      // (re-using available column for admin communication; no migration needed)
      const noteLines: string[] = [];
      if (adminNotes) noteLines.push(`Admin notes: ${adminNotes}`);
      if (callDatetime) noteLines.push(`Call scheduled: ${format(new Date(callDatetime), "PPPp")}`);
      if (noteLines.length) updatePayload.social_verification_notes = noteLines.join("\n");

      const { error } = await supabase
        .from("dating_profiles")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["dating-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dating-profiles"] });
      toast({
        title:
          vars.status === "vetted"
            ? "✓ Application approved"
            : vars.status === "rejected"
            ? "Application rejected"
            : "Call scheduled",
        description:
          vars.status === "vetted"
            ? "Profile is now active for matchmaking."
            : vars.status === "rejected"
            ? "The applicant has been notified."
            : "A call has been scheduled.",
      });
      // Move to next in queue
      setSelectedIndex((prev) => {
        if (prev === null) return null;
        const nextLen = (profiles?.length ?? 1) - 1;
        return prev >= nextLen ? (nextLen > 0 ? nextLen - 1 : null) : prev;
      });
    },
    onError: (err: Error) => {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    },
  });

  const selectedProfile = selectedIndex !== null ? profiles?.[selectedIndex] : null;

  const handleApprove = (notes: string) => {
    if (!selectedProfile) return;
    actionMutation.mutate({ id: selectedProfile.id, status: "vetted", adminNotes: notes });
  };
  const handleReject = (notes: string) => {
    if (!selectedProfile) return;
    actionMutation.mutate({ id: selectedProfile.id, status: "rejected", adminNotes: notes });
  };
  const handleScheduleCall = (datetime: string, notes: string) => {
    if (!selectedProfile) return;
    actionMutation.mutate({ id: selectedProfile.id, status: "call_scheduled", adminNotes: notes, callDatetime: datetime });
  };

  const pendingCount = profiles?.filter((p) => p.status === "pending" || p.status === "new").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Application Review Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review pending dating applications and take action
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-sm px-3 py-1.5 gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {pendingCount} pending
            </Badge>
          )}
          <div className="flex gap-1 p-1 bg-muted/40 rounded-lg">
            {(["pending", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setSelectedIndex(null); }}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  statusFilter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "pending" ? "Pending Only" : "All Applications"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !profiles?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-display text-foreground">All caught up!</p>
          <p className="text-muted-foreground text-sm mt-1">No pending applications to review.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {/* Start review button */}
          {statusFilter === "pending" && pendingCount > 0 && (
            <button
              onClick={() => setSelectedIndex(0)}
              className="w-full py-3.5 rounded-xl border border-dashed border-[hsl(var(--accent-gold))]/40 bg-[hsl(var(--accent-gold))]/5 text-[hsl(var(--accent-gold))] text-sm font-medium hover:bg-[hsl(var(--accent-gold))]/10 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Start Review Session — {pendingCount} pending
            </button>
          )}

          {profiles.map((profile, index) => {
            const isPending = profile.status === "pending" || profile.status === "new";
            return (
              <div
                key={profile.id}
                onClick={() => setSelectedIndex(index)}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/30 hover:bg-card/60 hover:border-[hsl(var(--accent-gold))]/30 transition-all cursor-pointer group"
              >
                {/* Photo */}
                <Avatar className="h-14 w-14 shrink-0 border border-border/30">
                  <AvatarImage src={profile.photo_url || ""} alt={profile.display_name} />
                  <AvatarFallback className="bg-muted/40 text-muted-foreground font-display text-lg">
                    {profile.display_name[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{profile.display_name}</p>
                    <StatusBadge status={profile.status} />
                    {profile.social_verification_status === "flagged" && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {profile.age} · {fmt(profile.gender)} · {profile.location || "No location"}
                    {profile.occupation && ` · ${profile.occupation}`}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Quick actions (only for pending) */}
                {isPending && (
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 border-green-500/30 hover:bg-green-500/10 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        actionMutation.mutate({ id: profile.id, status: "vetted" });
                      }}
                      disabled={actionMutation.isPending}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-500/30 hover:bg-red-500/10 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(index);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Review
                    </Button>
                  </div>
                )}

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
              </div>
            );
          })}
        </div>
      )}

      {/* Review modal */}
      {selectedProfile && (
        <ReviewModal
          profile={selectedProfile}
          onClose={() => setSelectedIndex(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onScheduleCall={handleScheduleCall}
          isActing={actionMutation.isPending}
          queueIndex={selectedIndex!}
          queueTotal={profiles?.length ?? 0}
          onPrev={() => setSelectedIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setSelectedIndex((i) => Math.min((profiles?.length ?? 1) - 1, (i ?? 0) + 1))}
        />
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "vetted":
    case "approved":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">Rejected</Badge>;
    case "matched":
      return <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/20 text-xs">Matched</Badge>;
    case "call_scheduled":
      return <Badge className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/20 text-xs gap-1"><Phone className="h-3 w-3" />Call Scheduled</Badge>;
    default:
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">Pending Review</Badge>;
  }
}

export default AdminDatingReview;
