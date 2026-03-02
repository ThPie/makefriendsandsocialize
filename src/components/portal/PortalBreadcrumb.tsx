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
