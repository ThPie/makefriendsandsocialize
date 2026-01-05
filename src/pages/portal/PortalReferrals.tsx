import { PortalLayout } from '@/components/portal/PortalLayout';
import { ReferralDashboard } from '@/components/portal/ReferralDashboard';

export default function PortalReferrals() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-light">Referral Program</h1>
          <p className="text-muted-foreground mt-2">
            Invite friends and earn exclusive rewards
          </p>
        </div>
        
        <ReferralDashboard />
      </div>
    </PortalLayout>
  );
}
