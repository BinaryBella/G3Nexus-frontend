// src/app/components/Navbar.tsx
"use client"; // Add this at the top to make it a Client Component

import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout(); // Use the logout method from AuthContext which handles token clearing and redirection
    };

    // Determine the profile link based on user role
    const getProfileLink = () => {
        if (!user) return '/profile';
        
        // Route to the appropriate profile page based on user type
        if (user.role === 'CLIENT_ADMIN' || user.role === 'CLIENT_USER') {
            return '/client/profile';
        } else if (user.role === 'COMPANY_ADMIN' || user.role === 'COMPANY_DEVELOPER') {
            return '/company/profile';
        }
        
        // Default fallback
        return '/profile';
    };

    return (
        <nav className="flex justify-between items-center p-5 px-10 mr-3 bg-white shadow-sm fixed top-0 left-0 right-0 z-40 h-16">
            {/* Logo Section */}
            <Link href="/client/dashboard" className="flex items-center">
                <Image src="/images/logo.png" alt="Logo" width={150} height={40} />
            </Link>

            {/* User and Logout Section */}
            <div className="flex items-center space-x-4">
                <Link
                    href={getProfileLink()}
                    className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                    {user?.profileImageUrl ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#3450A3]">
                            <Image
                                src={user.profileImageUrl}
                                alt="Profile"
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ) : (
                        <User className="w-6 h-6 text-[#3450A3] hover:text-blue-500 transition-colors duration-200" />
                    )}
                </Link>

                {/* Logout Button */}
                <button
                    type="button"
                    className="w-28 bg-[#3450A3] h-10 text-white py-2 rounded-md font-medium hover:bg-[#2a4086] transition-colors"
                    onClick={handleLogout} // Call the logout function
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
