// src/app/client/layout.tsx
import React from 'react';
import Navbar from '@/app/components/Navbar';
import SideMenu from '@/app/components/SideMenu';

interface ClientLayoutProps {
    children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <SideMenu className ="fixed inset-y-0 left-0 w-full-64 bg-gray-800 text-white" />

            {/* Main content */}
            <div className="flex-1 ml-64 bg-gray-50">
                {/* Navbar */}
                <Navbar className="fixed top-0 left-64 right-0 h-16 bg-white shadow-md z-10" />

                {/* Page content */}
                <main className="pt-16 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ClientLayout;
