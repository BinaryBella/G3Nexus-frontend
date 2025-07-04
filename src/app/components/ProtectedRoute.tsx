// src/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // If not authenticated, redirect to login
            if (!isAuthenticated) {
                router.push('/auth/login');
                return;
            }

            // If role-based access control is enabled
            if (allowedRoles && allowedRoles.length > 0 && user) {
                // Check if user's role is allowed
                if (!allowedRoles.includes(user.role)) {
                    // Redirect based on role if not authorized
                    switch (user.role) {
                        case CLIENT_ADMIN:
                        case CLIENT_USER:
                            router.push('/client/projects');
                            break;
                        case COMPANY_ADMIN:
                            router.push('/company/dashboard');
                            break;
                        case COMPANY_DEVELOPER:
                            router.push('/company/projects');
                            break;
                        default:
                            router.push('/');
                            break;
                    }
                }
            }
        }
    }, [isAuthenticated, loading, router, user, allowedRoles]);

    // Show loading state
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    // If not authenticated, return null (will redirect in useEffect)
    if (!isAuthenticated) {
        return null;
    }

    // If role checking is enabled but user doesn't have the right role, return null
    if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return null;
    }

    // If all checks pass, render the children
    return <>{children}</>;
}
