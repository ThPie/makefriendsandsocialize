import { ReferralDashboard } from '@/components/portal/ReferralDashboard';

export default function PortalReferrals() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">Referrals & Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share the experience, earn exclusive perks
        </p>
      </div>

      <ReferralDashboard />
    </div>
  );
}
