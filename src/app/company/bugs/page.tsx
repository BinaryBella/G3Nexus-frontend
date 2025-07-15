"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSearch, Search, Plus, Bug, AlertTriangle, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bugService } from '@/app/lib/services/bugService';
import { Bug as BugType } from '../../lib/types';
import Pagination from '@/app/components/Pagination';

const SeverityBadge = ({ severity }: { severity: string }) => {
    const colorMap: Record<string, string> = {
        Low: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Medium: "bg-orange-100 text-orange-800 border-orange-200",
        High: "bg-red-100 text-red-800 border-red-200"
    };

    const colorClass = colorMap[severity] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {severity}
        </span>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const colorMap: Record<string, string> = {
        Open: "bg-red-100 text-red-800 border-red-200",
        "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
        Resolved: "bg-green-100 text-green-800 border-green-200",
        Closed: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const colorClass = colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {status}
        </span>
    );
};

export default function CompanyBugsPage() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const { data: bugs = [], error, isLoading } = useQuery<BugType[], Error>({
        queryKey: ['bugs'],
        queryFn: bugService.getAllBugs,
    });

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    const filteredBugs = bugs.filter(bug =>
        bug.bugTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
        bug.bugDescription?.toLowerCase().includes(searchText.toLowerCase()) ||
        bug.severity?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredBugs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBugs = filteredBugs.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const stats = {
        total: bugs.length,
        open: bugs.filter(bug => bug.isActive).length,
        inProgress: Math.floor(bugs.length * 0.3), // Mock data - replace with actual status when available
        resolved: Math.floor(bugs.length * 0.4) // Mock data - replace with actual status when available
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading bugs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading bugs. Please try again.</p>
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
                            <Bug className="h-8 w-8 text-[#3450A3]" />
                            Bug Reports
                        </h1>
                        <p className="text-gray-600 mt-2">Manage and track bug reports</p>
                    </div>
                    <button
                        onClick={() => router.push('/company/bugs/add-bug-report')}
                        className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Bug Report
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Bug className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Open</p>
                                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Resolved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
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
                        placeholder="Search bugs by title, description, or status..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* Bugs Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredBugs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
                        <p className="text-gray-600">
                            {searchText ? 'Try adjusting your search criteria.' : 'Get started by adding your first bug report.'}
                        </p>
                        {!searchText && (
                            <button
                                onClick={() => router.push('/company/bugs/add-bug-report')}
                                className="mt-4 bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add Bug Report
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedBugs.map((bug) => (
                                    <tr key={bug.bugId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{bug.bugTitle}</p>
                                                <p className="text-sm text-gray-600 truncate max-w-xs">{bug.bugDescription}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={bug.isActive ? 'Open' : 'Closed'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <SeverityBadge severity={bug.severity || 'Medium'} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            Client {bug.clientId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date().toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => router.push(`/company/bugs/edit-bug-report?id=${bug.bugId}`)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => console.log(`Delete project ${bug.bugId}`)}
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
            {filteredBugs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredBugs.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}
        </div>
    );
}
