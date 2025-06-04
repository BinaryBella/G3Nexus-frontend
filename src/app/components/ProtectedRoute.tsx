// src/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

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
                    if (user.role === 'client') {
                        router.push('/client/projects');
                    } else if (user.role === 'employee') {
                        router.push('/employee/dashboard');
                    } else {
                        router.push('/dashboard');
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
