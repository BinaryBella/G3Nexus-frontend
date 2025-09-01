'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import SideMenu from '@/app/components/SideMenu';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { CLIENT_ADMIN, CLIENT_USER } from '@/app/lib/constants';

interface ClientLayoutProps {
    children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const isProjectsPage = pathname === '/client/projects';
    const isDashboardPage = pathname === '/client/dashboard';

    return (
        <ProtectedRoute allowedRoles={[CLIENT_ADMIN, CLIENT_USER]}>
            {isProjectsPage || isDashboardPage ? (
                // Projects and Dashboard pages layout without side menu
                <div className="min-h-screen bg-gray-50">
                    {/* Navbar - full width without side menu */}
                    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-40">
                        <Navbar />
                    </div>
                    
                    {/* Main content with top padding for fixed navbar */}
                    <div className="pt-16">
                        {children}
                    </div>
                </div>
            ) : (
                // Regular client layout with side menu
                <div className="min-h-screen flex">
                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white">
                        <SideMenu />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 ml-64 bg-gray-50">
                        {/* Navbar */}
                        <div className="fixed top-0 left-64 right-0 h-16 bg-white shadow-md z-40">
                            <Navbar />
                        </div>

                        {/* Page content */}
                        <main className="pt-16 p-6">
                            {children}
                        </main>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
};

export default ClientLayout;
