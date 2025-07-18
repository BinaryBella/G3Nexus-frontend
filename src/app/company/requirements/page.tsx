"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Trash2, Search, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { requirementService } from '@/app/lib/services/requirementService';
import { Requirement } from '../../lib/types';
import Pagination from '@/app/components/Pagination';

const PriorityBadge = ({ priority }: { priority: string }) => {
    const colorMap: Record<string, string> = {
        Low: "bg-green-100 text-green-800 border-green-200",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        High: "bg-red-100 text-red-800 border-red-200"
    };

    const colorClass = colorMap[priority] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {priority}
        </span>
    );
};

export default function CompanyRequirementsPage() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const { data: requirements = [], error, isLoading } = useQuery<Requirement[], Error>({
        queryKey: ['requirements'],
        queryFn: requirementService.getAllRequirements,
    });

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    const filteredRequirements = requirements.filter(req => {
        if (searchText.trim() === '') return true;
        
        // Helper function to check if search text matches beginning of any word
        const matchesWordBeginning = (text: string) => {
            if (!text) return false;
            const words = text.toLowerCase().split(/\s+/);
            const searchLower = searchText.toLowerCase();
            return words.some(word => word.startsWith(searchLower));
        };
        
        return matchesWordBeginning(req.requirementTitle || '') ||
               matchesWordBeginning(req.requirementDescription || '') ||
               matchesWordBeginning(req.priority || '');
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequirements = filteredRequirements.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const stats = {
        total: requirements.length,
        high: requirements.filter(req => req.priority === 'High').length,
        medium: requirements.filter(req => req.priority === 'Medium').length,
        low: requirements.filter(req => req.priority === 'Low').length
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading requirements...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading requirements. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#3450A3]" />
                            Requirements
                        </h1>
                        <p className="text-gray-600 mt-2">Manage project requirements and specifications</p>
                    </div>
                    {/* <button
                        onClick={() => router.push('/company/requirements/add-requirement')}
                        className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Requirement
                    </button> */}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">High Priority</p>
                                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Priority</p>
                                <p className="text-2xl font-bold text-green-600">{stats.low}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search requirements by title, description, or priority..."
                        className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* Requirements Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredRequirements.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No requirements found</h3>
                        <p className="text-gray-600">
                            {searchText ? 'Try adjusting your search criteria.' : 'Get started by adding your first requirement.'}
                        </p>
                        {!searchText && (
                            <button
                                onClick={() => router.push('/company/requirements/add-requirement')}
                                className="mt-4 bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add Requirement
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedRequirements.map((req) => (
                                    <tr key={req.requirementId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{req.requirementTitle}</p>
                                                <p className="text-sm text-gray-600 truncate max-w-xs">{req.requirementDescription}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <PriorityBadge priority={req.priority || 'Medium'} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            Client {req.clientId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            Project {req.projectId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                req.isActive 
                                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}>
                                                {req.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => router.push(`/company/requirements/edit-requirement/${req.requirementId}`)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => console.log(`Delete project ${req.requirementId}`)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredRequirements.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredRequirements.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}
        </div>
    );
}
