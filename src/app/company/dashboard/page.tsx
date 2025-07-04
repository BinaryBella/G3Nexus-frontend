'use client';

import React from 'react';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { Users, FileText, ClipboardList, Bug, DollarSign, User } from 'lucide-react';
import { COMPANY_ADMIN } from '@/app/lib/constants';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

// Titles and icons for the sections
const titlesWithIcons = [
    { title: 'Client Details', icon: Users },
    { title: 'Project Details', icon: FileText },
    { title: 'Requirement Details', icon: ClipboardList },
    { title: 'Bug Details', icon: Bug },
    { title: 'Financial Details', icon: DollarSign },
    { title: 'Employee Details', icon: User },
];

const ProjectsPage = () => {
    const { user } = useRoleAccess();

    return (
        <ProtectedRoute allowedRoles={[COMPANY_ADMIN]}>
            <div className="relative w-full min-h-screen">
                {/* Background Image with Opacity */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-70"
                    style={{ backgroundImage: "url('/images/background-image.png')" }}
                ></div>

                {/* Content on Top of the Background */}
                <div className="relative z-10 w-full h-full">
                    {/* Navbar */}
                    <Navbar />

                    {/* Page Content */}
                    <section className="container mx-auto py-8 px-4">
                        <div className="flex justify-center items-center mt-52 mb-16">
                            <h1 className="text-4xl md:text-6xl font-bold text-[#3450A3]">
                                Welcome, {user?.name || 'Admin'}
                            </h1>
                        </div>

                        {/* Titles Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {titlesWithIcons.map((item, index) => {
                                const Icon = item.icon; // Get the icon component

                                return (
                                    <div key={index} className="bg-white h-60 shadow-md p-8 rounded-lg flex flex-col justify-center items-center">
                                        <Icon className="h-12 w-12 text-[#3450A3] mb-4" /> {/* Display the icon */}
                                        <h2 className="text-3xl font-semibold text-[#3450A3] text-center">
                                            {item.title}
                                        </h2>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProjectsPage;
