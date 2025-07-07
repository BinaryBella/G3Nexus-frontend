'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, FileText, Bug, DollarSign, FolderOpen, Settings, ClipboardList, File } from 'lucide-react'; // Add icons here

interface MenuItem {
    title: string;
    path: string;
    icon: React.ElementType;
}

// Expanded menu items based on the image
const menuItems: MenuItem[] = [
    { title: 'Companies', path: '/company/companies', icon: User },
    { title: 'Clients', path: '/company/clients', icon: User },
    { title: 'Employees', path: '/company/employees', icon: Users },
    { title: 'Projects', path: '/company/projects', icon: FolderOpen },
    { title: 'Requirements', path: '/company/requirements', icon: FileText },
    { title: 'Bug Reports', path: '/company/bugs', icon: Bug },
    { title: 'Financial Details', path: '/company/financial', icon: ClipboardList },
    { title: 'Payments', path: '/company/payments', icon: DollarSign },
    { title: 'Terms & Conditions', path: '/company/terms', icon: File },
];

const SideMenu = () => {
    const pathname = usePathname();

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
