'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Redirect to appropriate profile page based on user role
            if (user.role === 'CLIENT_ADMIN' || user.role === 'CLIENT_USER') {
                router.replace('/client/profile');
            } else if (user.role === 'COMPANY_ADMIN' || user.role === 'COMPANY_DEVELOPER') {
                router.replace('/company/profile');
            } else {
                // Fallback to login if role is unknown
                router.replace('/auth/login');
            }
        } else {
            // Redirect to login if not authenticated
            router.replace('/auth/login');
        }
    }, [user, router]);

    // Show loading while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3450A3]"></div>
        </div>
    );
}
