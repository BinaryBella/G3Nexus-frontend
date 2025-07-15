// src/app/client/profile/layout.tsx
import React from 'react';
import Navbar from '../../components/Navbar';
import SideMenu from '../../components/SideMenu';

interface ClientProfileLayoutProps {
    children: React.ReactNode;
}

const ClientProfileLayout: React.FC<ClientProfileLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <SideMenu />

            {/* Main content */}
            <div className="flex-1 ml-64 bg-gray-50">
                {/* Navbar */}
                <Navbar />

                {/* Page content */}
                <main className="pt-16 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ClientProfileLayout;
