// src/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    requireAuth?: boolean;
}

export default function ProtectedRoute({ 
    children, 
    allowedRoles = [], 
    requireAuth = true 
}: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();
    const { canAccessRoute, getRedirectUrl } = useRoleAccess();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            // If authentication is required but user is not authenticated
            if (requireAuth && !isAuthenticated) {
                router.push('/auth/login');
                return;
            }

            // If user is authenticated, check route access
            if (isAuthenticated && user) {
                // If specific roles are required for this route
                if (allowedRoles.length > 0) {
                    const hasPermission = allowedRoles.includes(user.role);
                    if (!hasPermission) {
                        // Redirect to appropriate dashboard based on user role
                        const redirectUrl = getRedirectUrl();
                        router.push(redirectUrl);
                        return;
                    }
                } else {
                    // Use general route access check if no specific roles defined
                    const canAccess = canAccessRoute(pathname);
                    if (!canAccess) {
                        const redirectUrl = getRedirectUrl();
                        router.push(redirectUrl);
                        return;
                    }
                }
            }
        }
    }, [isAuthenticated, user, loading, allowedRoles, requireAuth, router, pathname, canAccessRoute, getRedirectUrl]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return null;
    }

    if (isAuthenticated && user && allowedRoles.length === 0 && !canAccessRoute(pathname)) {
        return null;
    }

    return <>{children}</>;
}
