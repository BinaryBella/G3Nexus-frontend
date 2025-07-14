// src/app/components/Navbar.tsx
"use client"; // Add this at the top to make it a Client Component

import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

const Navbar = () => {
    const router = useRouter(); // Initialize useRouter

    const handleLogout = () => {
        // You can add additional logout logic here, such as clearing session data
        router.push('/auth/login'); // Redirect to login page after logout
    };

    return (
        <nav className="flex justify-between items-center p-5 px-10 mr-3 bg-white shadow-sm fixed top-0 left-0 right-0 z-10 h-16">
            {/* Logo Section */}
            <Link href="/client/dashboard" className="flex items-center">
                <Image src="/images/logo.png" alt="Logo" width={150} height={40} />
            </Link>

            {/* User and Logout Section */}
            <div className="flex items-center space-x-4">
                <Link
                    href="/profile"
                    className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                    <User className="w-6 h-6 text-[#3450A3] hover:text-blue-500 transition-colors duration-200" />
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
