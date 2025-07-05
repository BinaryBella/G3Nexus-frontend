'use client';

import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    // Simple pass-through layout since the parent company layout handles the conditional rendering
    return <>{children}</>;
};

export default DashboardLayout;
