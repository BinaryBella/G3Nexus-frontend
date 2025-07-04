// src/app/client/layout.tsx
'use client';

import React from 'react';
import Navbar from '@/app/components/Navbar';
import SideMenu from '@/app/components/SideMenu';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { CLIENT_ADMIN, CLIENT_USER } from '@/app/lib/constants';

interface ClientLayoutProps {
    children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
    return (
        <ProtectedRoute allowedRoles={[CLIENT_ADMIN, CLIENT_USER]}>
            <div className="min-h-screen flex">
                {/* Sidebar */}
                <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white">
                    <SideMenu />
                </div>

                {/* Main content */}
                <div className="flex-1 ml-64 bg-gray-50">
                    {/* Navbar */}
                    <div className="fixed top-0 left-64 right-0 h-16 bg-white shadow-md z-10">
                        <Navbar />
                    </div>

                    {/* Page content */}
                    <main className="pt-16 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ClientLayout;
