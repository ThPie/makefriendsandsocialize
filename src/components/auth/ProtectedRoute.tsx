import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BrandedLoader } from '@/components/ui/branded-loader';

interface ProtectedRouteProps {
    children: ReactNode;
    /** If true, also requires the user to have admin privileges */
    requireAdmin?: boolean;
}

/**
 * Route-level auth guard that prevents rendering of protected content
 * until authentication is confirmed. This eliminates the flash of
 * protected content that occurs when checks are done via useEffect
 * inside layout components.
 *
 * Usage in App.tsx:
 *   <Route path="/portal" element={<ProtectedRoute><PortalLayout>...</PortalLayout></ProtectedRoute>} />
 *   <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout>...</AdminLayout></ProtectedRoute>} />
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, profile, isAdmin, applicationStatus, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state while auth is being determined — never flash content
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <BrandedLoader />
            </div>
        );
    }

    // Not authenticated → redirect to auth, preserving the intended destination
    if (!user) {
        return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }

    // Admin routes
    if (requireAdmin) {
        if (!isAdmin) {
            return <Navigate to="/portal" replace />;
        }
        return <>{children}</>;
    }

    // User Portal Logic
    if (location.pathname.startsWith('/portal')) {
        // 1. Enforce Onboarding Completion
        if (profile && !profile.onboarding_completed) {
            // Allow access to the onboarding page itself
            if (location.pathname === '/portal/onboarding') {
                return <>{children}</>;
            }
            // Redirect all other portal traffic to onboarding
            return <Navigate to="/portal/onboarding" replace />;
        }

        // 2. Enforce Application Approval (for completed profiles)
        // If profile is complete but application is pending/rejected, force waiting screen
        if (profile?.onboarding_completed && (applicationStatus === 'pending' || applicationStatus === 'rejected')) {
            return <Navigate to="/auth/waiting" replace />;
        }
    }

    // All checks passed — render children
    return <>{children}</>;
}
