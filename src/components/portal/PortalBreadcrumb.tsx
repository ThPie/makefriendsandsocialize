import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const portalRouteLabels: Record<string, string> = {
  '/portal': 'Dashboard',
  '/portal/profile': 'My Profile',
  '/portal/network': 'The Network',
  '/portal/connections': 'Connections',
  '/portal/slow-dating': 'Intentional Connections',
  '/portal/events': 'Events',
  '/portal/perks': 'Perks',
  '/portal/concierge': 'Concierge',
  '/portal/referrals': 'Referrals',
  '/portal/business': 'Founder Profile',
  '/portal/onboarding': 'Onboarding',
  '/portal/billing': 'Billing',
};

const adminRouteLabels: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/applications': 'Applications',
  '/admin/circles': 'Circle Applications',
  '/admin/members': 'Members',
  '/admin/appeals': 'Appeals',
  '/admin/referrals': 'Referrals',
  '/admin/businesses': 'Founder Companies',
  '/admin/leads': 'Lead Generation',
  '/admin/security': 'Security Reports',
  '/admin/security-dashboard': 'Security Dashboard',
  '/admin/dating': 'Introductions',
  '/admin/matches': 'Matches',
  '/admin/analytics': 'Analytics',
  '/admin/events': 'Events',
  '/admin/event-analytics': 'Event Analytics',
  '/admin/photos': 'Event Photos',
  '/admin/connections': 'Connections',
  '/admin/testimonials': 'Testimonials',
  '/admin/content': 'Content',
  '/admin/roles': 'Roles',
  '/admin/settings': 'Settings',
};

interface PortalBreadcrumbProps {
  type: 'portal' | 'admin';
}

export function PortalBreadcrumb({ type }: PortalBreadcrumbProps) {
  const location = useLocation();
  const routeLabels = type === 'portal' ? portalRouteLabels : adminRouteLabels;
  const basePath = type === 'portal' ? '/portal' : '/admin';
  const baseLabel = type === 'portal' ? 'Portal' : 'Admin';
  
  // Get the current page label
  const currentLabel = routeLabels[location.pathname] || 'Page';
  const isBasePage = location.pathname === basePath;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          {isBasePage ? (
            <BreadcrumbPage>{baseLabel}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to={basePath} className="text-muted-foreground hover:text-foreground">
                {baseLabel}
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        
        {!isBasePage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
