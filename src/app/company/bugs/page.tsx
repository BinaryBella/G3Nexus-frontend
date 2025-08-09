"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSearch, Search, Plus, Bug, AlertTriangle, CheckCircle, Clock, Trash2, Edit, Eye, X, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Bug Details Modal Component
const BugDetailsModal = ({ bug, isOpen, onClose }: { 
    bug: BugType | null; 
    isOpen: boolean; 
    onClose: () => void; 
}) => {
    if (!isOpen || !bug) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Bug className="h-5 w-5 text-[#3450A3]" />
                        Bug Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                    {/* Bug Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bug Title
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                            <p className="text-gray-900 font-medium">{bug.bugTitle}</p>
                        </div>
                    </div>

                    {/* Bug Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bug Description
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg border min-h-[100px]">
                            <p className="text-gray-900 whitespace-pre-wrap">
                                {bug.bugDescription || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    {/* Status and Severity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <StatusBadge status={bug.isActive ? 'Open' : 'Closed'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Severity
                            </label>
                            <SeverityBadge severity={bug.severity || 'Medium'} />
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reporter
                            </label>
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-gray-900">Client {bug.clientId}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project ID
                            </label>
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-gray-900">{bug.projectId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attachments
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            {bug.attachment ? (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Download className="h-4 w-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Bug Attachment
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Click to download
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={bug.attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Download
                                    </a>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No attachments available
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CompanyBugsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBug, setSelectedBug] = useState<BugType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 6;

    // Selection and quotation modal state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [quotationCosts, setQuotationCosts] = useState<Record<number, string>>({});

    const { data: bugs = [], error, isLoading } = useQuery<BugType[], Error>({
        queryKey: ['bugs'],
        queryFn: bugService.getAllBugs,
    });

    const markAsViewedMutation = useMutation({
        mutationFn: (bugId: number) => bugService.markAsViewed(bugId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bugs'] });
        },
    });

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    const filteredBugs = bugs
        .filter(bug => {
            if (searchText.trim() === '') return true;
            const searchLower = searchText.toLowerCase();
            const matchesWordBeginning = (text: string) => {
                if (!text) return false;
                const words = text.toLowerCase().split(/\s+/);
                return words.some(word => word.startsWith(searchLower));
            };
            return matchesWordBeginning(bug.bugTitle || '') ||
                   matchesWordBeginning(bug.bugDescription || '') ||
                   matchesWordBeginning(bug.severity || '');
        })
        .sort((a, b) => ((b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))); // Sort new bugs first

    // Pagination calculations
    const totalPages = Math.ceil(filteredBugs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBugs = filteredBugs.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewMore = (bug: BugType) => {
        setSelectedBug(bug);
        setIsModalOpen(true);
        if (bug.isNew) {
            markAsViewedMutation.mutate(bug.bugId);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBug(null);
    };

    const stats = {
        total: bugs.length,
        open: bugs.filter(bug => bug.isActive).length,
        inProgress: Math.floor(bugs.length * 0.3), // Mock data - replace with actual status when available
        resolved: Math.floor(bugs.length * 0.4) // Mock data - replace with actual status when available
    };

    // Selection and quotation modal handlers
    const handleSelect = (id: number) => {
        setSelectedIds((prev: number[]) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const handleSelectAll = () => {
        const currentPageIds = paginatedBugs.map((b: BugType) => b.bugId);
        const allSelected = currentPageIds.every((id: number) => selectedIds.includes(id));
        setSelectedIds(allSelected ? selectedIds.filter((id: number) => !currentPageIds.includes(id)) : [...selectedIds, ...currentPageIds.filter((id: number) => !selectedIds.includes(id))]);
    };

    // Quotation modal handlers
    const openQuotationModal = () => {
        setQuotationCosts({});
        setIsQuotationModalOpen(true);
    };
    const closeQuotationModal = () => {
        setIsQuotationModalOpen(false);
    };
    const handleCostChange = (id: number, value: string) => {
        setQuotationCosts((prev: Record<number, string>) => ({ ...prev, [id]: value }));
    };
    const handleSendQuotation = async () => {
        // TODO: Call API to send email with selectedIds and quotationCosts
        closeQuotationModal();
        setSelectedIds([]);
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

                                            {/* Generate Quotation Button */}
                        <div className="flex justify-end mt-4">
                            <button
                                className={`bg-[#2b4b93] text-white px-6 py-2 rounded-lg font-medium transition-colors ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                disabled={selectedIds.length === 0}
                                onClick={openQuotationModal}
                            >
                                Generate Quotation
                            </button>
                        </div>
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
                        className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
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
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input type="checkbox" checked={paginatedBugs.length > 0 && paginatedBugs.every(b => selectedIds.includes(b.bugId))} onChange={handleSelectAll} />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedBugs.map((bug) => (
                                        <tr key={bug.bugId} className={bug.isNew ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"}>
                                            <td className="px-4 py-4">
                                                <input type="checkbox" checked={selectedIds.includes(bug.bugId)} onChange={() => handleSelect(bug.bugId)} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        {bug.bugTitle}
                                                        {bug.isNew && (
                                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-300">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </p>    
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
                                                        onClick={() => handleViewMore(bug)}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                        title="View More Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/company/bugs/edit-bug-report?id=${bug.bugId}`)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        title="Edit Bug"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => console.log(`Delete project ${bug.bugId}`)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                        title="Delete Bug"
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


                        {/* Quotation Modal */}
                        {isQuotationModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                                    <h2 className="text-xl text-black font-semibold mb-4">Enter Quotation Cost</h2>
                                    <form onSubmit={e => { e.preventDefault(); handleSendQuotation(); }}>
                                        <div className="space-y-4">
                                            {filteredBugs.filter(b => selectedIds.includes(b.bugId)).map(b => (
                                                <div key={b.bugId}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{b.bugTitle}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full text-black border border-gray-300 rounded-lg px-3 py-2"
                                                        value={quotationCosts[b.bugId] || ''}
                                                        onChange={e => handleCostChange(b.bugId, e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Total Cost Calculation */}
                                        <div className="mt-6 text-right">
                                            <span className="text-lg text-black">Total Cost: </span>
                                            <span className="text-lg font-bold text-black">
                                                {Object.values(quotationCosts)
                                                    .map(val => parseFloat(val) || 0)
                                                    .reduce((acc, curr) => acc + curr, 0)
                                                    .toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button type="button" className="bg-gray-500 px-4 py-2 rounded-lg" onClick={closeQuotationModal}>Cancel</button>
                                            <button type="submit" className="bg-[#2b4b93] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">Send Quotation</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
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

            {/* Bug Details Modal */}
            <BugDetailsModal
                bug={selectedBug}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}