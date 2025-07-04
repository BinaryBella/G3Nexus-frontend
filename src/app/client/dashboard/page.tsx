'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { FileText, ClipboardList, Bug, DollarSign, Bell, User } from 'lucide-react';
import { CLIENT_ADMIN, CLIENT_USER } from '@/app/lib/constants';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import { useAuth } from '@/app/contexts/AuthContext';

// Sections available to clients
const clientSectionsConfig = [
    { 
        title: 'My Projects', 
        icon: FileText, 
        route: '/client/projects',
        description: 'View and track your projects'
    },
    { 
        title: 'Requirements', 
        icon: ClipboardList, 
        route: '/client/requirements',
        description: 'Manage project requirements',
        isActive: true // Highlight this tile
    },
    { 
        title: 'Bug Reports', 
        icon: Bug, 
        route: '/client/bugs',
        description: 'Report and track issues'
    },
    { 
        title: 'Financial', 
        icon: DollarSign, 
        route: '/client/financial',
        description: 'View invoices and payments'
    },
];

const ClientDashboard = () => {
    const { user } = useRoleAccess();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <ProtectedRoute allowedRoles={[CLIENT_ADMIN, CLIENT_USER]}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            {/* Logo */}
                            <div className="flex items-center">
                                <Link href="/client/dashboard">
                                    <img 
                                        src="/images/logo.png" 
                                        alt="G3NEXUS" 
                                        className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                </Link>
                            </div>
                            
                            {/* Right side - Notifications and Logout */}
                            <div className="flex items-center space-x-4">
                                {/* Notification Bell */}
                                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200">
                                    <Bell className="h-6 w-6" />
                                    {/* Notification badge */}
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white font-semibold">2</span>
                                    </span>
                                </button>
                                
                                {/* User Profile Link */}
                                <Link 
                                    href="/profile" 
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#3450A3] hover:bg-gray-100 rounded-lg transition-all duration-200"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="text-sm font-medium">{user?.name || 'Profile'}</span>
                                </Link>
                                
                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout}
                                    className="bg-[#3450A3] text-white px-6 py-2 rounded-lg hover:bg-[#2a4084] transition-colors font-medium shadow-sm hover:shadow-md"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section with Background Image */}
                <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: "url('/images/background-image.png')" }}>
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    
                    {/* Centered Content */}
                    <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="text-center px-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                Track Your Projects Seamlessly
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                                Stay connected with your project progress and team collaboration
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {clientSectionsConfig.map((section, index) => {
                            const Icon = section.icon;
                            const isActive = section.isActive || false;

                            return (
                                <Link 
                                    key={index} 
                                    href={section.route}
                                    className="block h-full"
                                >
                                    <div 
                                        className={`
                                            group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                                            ${isActive 
                                                ? 'bg-gradient-to-br from-[#3450A3] to-[#2a4084] text-white shadow-lg border-2 border-[#3450A3]' 
                                                : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 shadow-md hover:shadow-lg border-2 border-transparent hover:border-[#3450A3]/20'
                                            }
                                            h-48 rounded-xl p-8 flex flex-col justify-center items-center relative overflow-hidden
                                        `}
                                    >
                                        {/* Background pattern for active tile */}
                                        {isActive && (
                                            <div className="absolute inset-0 opacity-10">
                                                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white"></div>
                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-white"></div>
                                            </div>
                                        )}
                                        
                                        {/* Icon */}
                                        <Icon 
                                            className={`
                                                h-12 w-12 mb-4 transition-all duration-300 z-10 relative
                                                ${isActive 
                                                    ? 'text-white' 
                                                    : 'text-[#3450A3] group-hover:text-[#2a4084] group-hover:scale-110'
                                                }
                                            `} 
                                        />
                                        
                                        {/* Title */}
                                        <h2 
                                            className={`
                                                text-xl font-semibold text-center leading-tight mb-2 z-10 relative
                                                ${isActive 
                                                    ? 'text-white' 
                                                    : 'text-[#3450A3] group-hover:text-[#2a4084]'
                                                }
                                            `}
                                        >
                                            {section.title}
                                        </h2>
                                        
                                        {/* Description */}
                                        <p 
                                            className={`
                                                text-sm text-center z-10 relative transition-all duration-300
                                                ${isActive 
                                                    ? 'text-gray-100' 
                                                    : 'text-gray-500 group-hover:text-gray-600'
                                                }
                                            `}
                                        >
                                            {section.description}
                                        </p>
                                        
                                        {/* Hover indicator */}
                                        {!isActive && (
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <svg className="w-5 h-5 text-[#3450A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Welcome Message and Quick Stats */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="bg-white rounded-xl shadow-sm p-8 border">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                Welcome back, <span className="text-[#3450A3]">{user?.name || 'Client'}</span>
                            </h3>
                            <p className="text-gray-600">
                                Here's your project overview and recent activity
                            </p>
                        </div>
                        
                        {/* Quick Stats for Clients */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#3450A3] mb-1">3</div>
                                <div className="text-sm text-gray-600">Active Projects</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">15</div>
                                <div className="text-sm text-gray-600">Completed Tasks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-600 mb-1">2</div>
                                <div className="text-sm text-gray-600">Open Issues</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-1">8</div>
                                <div className="text-sm text-gray-600">Requirements</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ClientDashboard;
