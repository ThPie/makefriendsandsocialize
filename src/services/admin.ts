/**
 * Admin service — centralized Supabase queries for admin dashboards.
 * Replaces direct calls in AdminDashboard, AdminMembers, AdminApplications, etc.
 */
import { supabase } from '@/integrations/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SecurityReport {
    id: string;
    status: string;
    severity: string | null;
    red_flags: string[] | null;
}

export interface AdminStats {
    pendingApplications: number;
    totalMembers: number;
    activeConnections: number;
    tierBreakdown: {
        patron: number;
        fellow: number;
        founder: number;
    };
}

export interface ApplicationWithReport {
    id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    reviewed_at: string | null;
    admin_notes: string | null;
    interests: string[] | null;
    favorite_brands: string[] | null;
    style_description: string | null;
    values_in_partner: string | null;
    user_email?: string;
    security_report?: SecurityReport | null;
}

// ── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Fetch aggregated stats for the admin dashboard.
 */
export async function getAdminStats(): Promise<AdminStats> {
    const [
        { count: pendingCount },
        { count: activeMembers },
        { count: acceptedConnections },
        { data: memberships },
    ] = await Promise.all([
        supabase
            .from('application_waitlist')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
        supabase
            .from('memberships')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
        supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'accepted'),
        supabase
            .from('memberships')
            .select('tier')
            .eq('status', 'active'),
    ]);

    const tierBreakdown = { patron: 0, fellow: 0, founder: 0 };
    memberships?.forEach((m) => {
        if (m.tier === 'patron') tierBreakdown.patron++;
        else if (m.tier === 'fellow') tierBreakdown.fellow++;
        else if (m.tier === 'founder') tierBreakdown.founder++;
    });

    return {
        pendingApplications: pendingCount ?? 0,
        totalMembers: activeMembers ?? 0,
        activeConnections: acceptedConnections ?? 0,
        tierBreakdown,
    };
}

// ── Applications ─────────────────────────────────────────────────────────────

/**
 * Fetch applications with security reports.
 */
export async function getApplications(limit = 200): Promise<ApplicationWithReport[]> {
    const { data, error } = await supabase
        .from('application_waitlist')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    const appsWithReports = await Promise.all(
        (data ?? []).map(async (app) => {
            const { data: report } = await supabase
                .from('member_security_reports')
                .select('id, status, severity, red_flags')
                .eq('user_id', app.user_id)
                .order('scanned_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            return { ...app, security_report: report } as ApplicationWithReport;
        }),
    );

    return appsWithReports;
}

/**
 * Approve an application and activate membership.
 */
export async function approveApplication(appId: string, userId: string, adminNotes?: string) {
    // 1. Update application status
    const { error: appError } = await supabase
        .from('application_waitlist')
        .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            admin_notes: adminNotes ?? null,
        })
        .eq('id', appId);

    if (appError) throw appError;

    // 2. Activate membership
    const { error: membershipError } = await supabase
        .from('memberships')
        .update({
            status: 'active',
            started_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    if (membershipError) throw membershipError;
}

/**
 * Reject an application.
 */
export async function rejectApplication(appId: string, adminNotes?: string) {
    const { error } = await supabase
        .from('application_waitlist')
        .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            admin_notes: adminNotes ?? null,
        })
        .eq('id', appId);

    if (error) throw error;
}

// ── Members ──────────────────────────────────────────────────────────────────

/**
 * Fetch members with their membership data.
 */
export async function getMembersWithMembership(limit = 200) {
    const [
        { data: profiles, error: profilesError },
        { data: memberships, error: membershipsError },
    ] = await Promise.all([
        supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit),
        supabase
            .from('memberships')
            .select('*')
            .limit(500),
    ]);

    if (profilesError) throw profilesError;
    if (membershipsError) throw membershipsError;

    return (profiles ?? []).map((profile) => ({
        ...profile,
        membership: memberships?.find((m) => m.user_id === profile.id),
    }));
}

/**
 * Update a member's tier.
 */
export async function updateMemberTier(
    memberId: string,
    newTier: 'patron' | 'fellow' | 'founder',
) {
    const { error } = await supabase
        .from('memberships')
        .update({ tier: newTier })
        .eq('user_id', memberId);

    if (error) throw error;
}

// ── Leads ────────────────────────────────────────────────────────────────────

export interface Lead {
    id: string;
    source_platform: string;
    source_url: string | null;
    lead_name: string | null;
    lead_email: string | null;
    lead_location: string | null;
    lead_interests: string[];
    relevance_score: number;
    status: 'new' | 'contacted' | 'converted' | 'dismissed';
    outreach_suggestion: string | null;
    raw_content: string | null;
    notes: string | null;
    discovered_at: string;
    contacted_at: string | null;
    converted_at: string | null;
    audience_segment: string | null;
    is_automated: boolean | null;
    discovery_run_id: string | null;
}

/**
 * Fetch leads with a limit.
 */
export async function getLeads(limit = 200): Promise<Lead[]> {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('relevance_score', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as Lead[];
}

/**
 * Update a lead's status or notes.
 */
export async function updateLead(
    leadId: string,
    updates: {
        status?: Lead['status'];
        notes?: string | null;
        contacted_at?: string | null;
        converted_at?: string | null;
    }
) {
    const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

    if (error) throw error;
}

/**
 * Delete a lead.
 */
export async function deleteLead(leadId: string) {
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

    if (error) throw error;
}
