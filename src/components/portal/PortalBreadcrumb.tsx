import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ADMIN_BASE } from '@/lib/route-paths';

const portalRouteLabels: Record<string, string> = {
  '/portal': 'Dashboard',
  '/portal/profile': 'My Profile',
  '/portal/network': 'The Network',
  '/portal/connections': 'Connections',
  '/portal/slow-dating': 'Slow Dating',
  '/portal/match': 'Match Details',
  '/portal/events': 'Events',
  '/portal/perks': 'Perks',
  '/portal/concierge': 'Concierge',
  '/portal/referrals': 'Referrals',
  '/portal/business': 'Founder Profile',
  '/portal/onboarding': 'Onboarding',
  '/portal/billing': 'Billing',
  '/portal/security': 'Security',
};

const adminRouteLabels: Record<string, string> = {
  [ADMIN_BASE]: 'Overview',
  [`${ADMIN_BASE}/applications`]: 'Applications',
  [`${ADMIN_BASE}/circles`]: 'Circle Applications',
  [`${ADMIN_BASE}/members`]: 'Members',
  [`${ADMIN_BASE}/appeals`]: 'Appeals',
  [`${ADMIN_BASE}/referrals`]: 'Referrals',
  [`${ADMIN_BASE}/businesses`]: 'Founder Companies',
  [`${ADMIN_BASE}/leads`]: 'Lead Generation',
  [`${ADMIN_BASE}/security`]: 'Security Reports',
  [`${ADMIN_BASE}/security-dashboard`]: 'Security Dashboard',
  [`${ADMIN_BASE}/dating`]: 'Introductions',
  [`${ADMIN_BASE}/matches`]: 'Matches',
  [`${ADMIN_BASE}/analytics`]: 'Analytics',
  [`${ADMIN_BASE}/events`]: 'Events',
  [`${ADMIN_BASE}/event-analytics`]: 'Event Analytics',
  [`${ADMIN_BASE}/photos`]: 'Event Photos',
  [`${ADMIN_BASE}/connections`]: 'Connections',
  [`${ADMIN_BASE}/testimonials`]: 'Testimonials',
  [`${ADMIN_BASE}/content`]: 'Content',
  [`${ADMIN_BASE}/roles`]: 'Roles',
  [`${ADMIN_BASE}/settings`]: 'Settings',
};

interface PortalBreadcrumbProps {
  type: 'portal' | 'admin';
}

export function PortalBreadcrumb({ type }: PortalBreadcrumbProps) {
  const location = useLocation();
  const routeLabels = type === 'portal' ? portalRouteLabels : adminRouteLabels;
  const basePath = type === 'portal' ? '/portal' : ADMIN_BASE;
  const baseLabel = type === 'portal' ? 'Portal' : 'Admin';
  
  // Get the current page label - handle dynamic routes like /portal/match/:id
  const getLabel = () => {
    if (routeLabels[location.pathname]) return routeLabels[location.pathname];
    // Check parent path for dynamic routes (e.g., /portal/match/123 -> /portal/match)
    const segments = location.pathname.split('/');
    if (segments.length > 3) {
      const parentPath = segments.slice(0, 3).join('/');
      if (routeLabels[parentPath]) return routeLabels[parentPath];
    }
    // Fallback: capitalize last segment
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };
  const currentLabel = getLabel();
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
