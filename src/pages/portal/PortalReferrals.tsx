import { ReferralDashboard } from '@/components/portal/ReferralDashboard';

export default function PortalReferrals() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Referrals & Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Share the experience, earn exclusive perks
        </p>
      </div>

      <ReferralDashboard />
    </div>
  );
}
