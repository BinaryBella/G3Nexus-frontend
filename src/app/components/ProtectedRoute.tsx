"use client";

import {ReactNode, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import {useAuth} from "@/app/contexts/AuthContext";

export default function ProtectedRoute({ children, requiredRoles = [] } :{children: ReactNode, requiredRoles : string[]}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login');
            } else if (requiredRoles.length > 0) {
                // Check if user has required roles
                const hasRequiredRole = requiredRoles.includes(user.role);

                if (!hasRequiredRole) {
                    router.push('/auth/login');
                }
            }
        }
    }, [user, loading, requiredRoles, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
}
