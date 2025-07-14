'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, FileText, Bug, DollarSign, FolderOpen, Settings, ClipboardList, File } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

interface MenuItem {
    title: string;
    path: string;
    icon: React.ElementType;
    allowedRoles: string[];
}

// Company menu items (visible to all company users)
const companyMenuItems: MenuItem[] = [
    { title: 'Companies', path: '/company/companies', icon: User, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Clients', path: '/company/clients', icon: User, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Employees', path: '/company/employees', icon: Users, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Projects', path: '/company/projects', icon: FolderOpen, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Requirements', path: '/company/requirements', icon: FileText, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Bug Reports', path: '/company/bugs', icon: Bug, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Financial Details', path: '/company/financial', icon: ClipboardList, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Payments', path: '/company/payments', icon: DollarSign, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
    { title: 'Terms & Conditions', path: '/company/terms', icon: File, allowedRoles: [COMPANY_ADMIN, COMPANY_DEVELOPER] },
];

// Client menu items (visible to client users)
const clientMenuItems: MenuItem[] = [
    { title: 'Dashboard', path: '/client/dashboard', icon: FolderOpen, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
    { title: 'Projects', path: '/client/projects', icon: FolderOpen, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
    { title: 'Requirements', path: '/client/requirements', icon: FileText, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
    { title: 'Bug Reports', path: '/client/bugs', icon: Bug, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
    { title: 'Financial Details', path: '/client/financial', icon: ClipboardList, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
    { title: 'Payments', path: '/client/payments', icon: DollarSign, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
];

const SideMenu = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    // Determine which menu items to show based on user role
    const getMenuItems = (): MenuItem[] => {
        if (!user) return [];

        const userRole = user.role;

        // Company users can see all company menu items
        if (userRole === COMPANY_ADMIN || userRole === COMPANY_DEVELOPER) {
            return companyMenuItems;
        }

        // Client users can only see specific menu items
        if (userRole === CLIENT_ADMIN || userRole === CLIENT_USER) {
            return clientMenuItems;
        }

        return [];
    };

    const menuItems = getMenuItems();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0">
            <div className="overflow-y-auto h-full py-6">
                <nav className="mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center px-7 py-4 text-gray-700 hover:bg-blue-50 transition-colors ${
                                    isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : ''
                                }`}
                            >
                                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                                <span className={isActive ? 'font-medium' : ''}>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default SideMenu;
