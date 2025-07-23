"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Trash2, Search, Plus, Clock, CheckCircle, AlertTriangle, Eye, X, Download } from 'lucide-react';
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

// Modal Component
const RequirementModal = ({
    requirement,
    isOpen,
    onClose
}: {
    requirement: Requirement | null;
    isOpen: boolean;
    onClose: () => void;
}) => {
    if (!isOpen || !requirement) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-[#3450A3]" />
                        Requirement Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    {/* Requirement Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Requirement Title
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 font-medium">
                                {requirement.requirementTitle || 'No title provided'}
                            </p>
                        </div>
                    </div>

                    {/* Requirement Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                            <p className="text-gray-900 whitespace-pre-wrap">
                                {requirement.requirementDescription || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <PriorityBadge priority={requirement.priority || 'Medium'} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${requirement.isActive
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}>
                                    {requirement.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Attachment Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attachment
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            {requirement.attachment ? (
                                <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {typeof requirement.attachment === 'string'
                                                    ? requirement.attachment.split('/').pop() || 'Attachment'
                                                    : 'Attachment'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Click to download
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Handle attachment download
                                            if (typeof requirement.attachment === 'string') {
                                                window.open(requirement.attachment, '_blank');
                                            }
                                        }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <Download className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No attachment available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CompanyRequirementsPage() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 6;

    const { data: requirements = [], error, isLoading, refetch } = useQuery<Requirement[], Error>({
        queryKey: ['requirements'],
        queryFn: requirementService.getAllRequirements,
    });

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    // Sort requirements so 'new' ones are at the top
    const sortedRequirements = [...requirements].sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
    });

    const filteredRequirements = sortedRequirements.filter(req => {
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

    const handleViewMore = async (requirement: Requirement) => {
        // If requirement is new, update its status locally and on the backend
        if (requirement.isNew) {
            // Optimistically update local requirements
            const updatedRequirements = requirements.map((r) =>
                r.requirementId === requirement.requirementId ? { ...r, isNew: false } : r
            );
            // This will update the UI instantly
            setSelectedRequirement({ ...requirement, isNew: false });
            // Optionally, you can use a state for requirements if you want instant UI update for the table
            // If you want to keep using react-query, you can use queryClient.setQueryData
            // But for now, refetch will update from backend
            try {
                if (requirementService.markAsViewed) {
                    await requirementService.markAsViewed(requirement.requirementId);
                    refetch();
                }
            } catch (e) {
                // Optionally handle error
            }
        } else {
            setSelectedRequirement(requirement);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequirement(null);
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
<tr
                                        key={req.requirementId}
                                        className={`hover:bg-gray-50 ${req.isNew ? 'bg-blue-50 animate-highlight' : ''}`}
                                        style={req.isNew ? { transition: 'background-color 0.5s' } : {}}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                    {req.requirementTitle}
                                                    {req.isNew && (
                                                        <span className="bg-[#eca909] text-white text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-300">
                                                            NEW
                                                        </span>
                                                    )}
                                                </p>
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
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${req.isActive
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                                }`}>
                                                {req.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewMore(req)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                    title="View More Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/company/requirements/edit-requirement/${req.requirementId}`)}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                    title="Edit Requirement"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => console.log(`Delete requirement ${req.requirementId}`)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    title="Delete Requirement"
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

            {/* Modal */}
            <RequirementModal
                requirement={selectedRequirement}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}