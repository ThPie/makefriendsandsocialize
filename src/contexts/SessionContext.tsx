import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { InactivityWarningModal } from '@/components/auth/InactivityWarningModal';
import { useNavigate } from 'react-router-dom';

interface SessionContextType {
    remainingSeconds: number;
    resetTimer: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const { user, signOut } = useAuth();
    // We can't use useNavigate here directly if this is outside Router, but App.tsx puts AuthProvider INSIDE Router?
    // Let's check App.tsx again.
    // App.tsx: AuthProvider -> TooltipProvider -> BrowserRouter.
    // So AuthProvider is OUTSIDE Router. useNavigate won't work in SessionProvider if it's placed next to AuthProvider.
    // I need to place SessionProvider INSIDE BrowserRouter.

    // Alternatively, use window.location or accept a navigate prop? 
    // Better to place it inside BrowserRouter in App.tsx.

    // For now, let's assume it will be inside Router. 
    // I'll create the component expecting it to be used within a Router context.

    const navigate = useNavigate();

    const { showWarning, remainingSeconds, resetTimer, dismissWarning } = useInactivityLogout({
        timeoutMinutes: 30,
        warningMinutes: 2,
        onLogout: async () => {
            await signOut();
            navigate('/auth');
        },
        enabled: !!user, // Only track when user is logged in
    });

    return (
        <SessionContext.Provider value={{ remainingSeconds, resetTimer }}>
            {children}
            <InactivityWarningModal
                isOpen={showWarning}
                remainingSeconds={remainingSeconds}
                onStayLoggedIn={dismissWarning}
                onLogoutNow={async () => {
                    await signOut();
                    navigate('/');
                }}
            />
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
