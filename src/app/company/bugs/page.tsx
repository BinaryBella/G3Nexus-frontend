"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Trash2, Search, Clock, CheckCircle, AlertTriangle, Eye, X, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bugService } from '@/app/lib/services/bugService';
import { Bug, BugListItem } from '../../lib/types';
import Pagination from '@/app/components/Pagination';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';

const SeverityBadge = ({ severity }: { severity: string }) => {
    const colorMap: Record<string, string> = {
        Low: "bg-green-100 text-green-800 border-green-200",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        High: "bg-red-100 text-red-800 border-red-200"
    };

    const colorClass = colorMap[severity] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {severity}
        </span>
    );
};

// Modal Component
const BugModal = ({ bug, isOpen, onClose}: { bug: Bug | null; isOpen: boolean; onClose: () => void; }) => {
    if (!isOpen || !bug) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">Bug Details</h2>
                    <p className="text-sm text-gray-600">Complete bug information</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
                {/* Bug Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bug Title
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900 font-medium">
                            {bug.bugTitle || 'No title provided'}
                        </p>
                    </div>
                </div>

                {/* Bug Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {bug.bugDescription || 'No description provided'}
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Severity
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <SeverityBadge severity={bug.severity || 'Medium'} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${bug.isActive
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {bug.isActive ? 'Active' : 'Inactive'}
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
                        {bug.attachment ? (
                            <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {typeof bug.attachment === 'string'
                                                ? bug.attachment.split('/').pop() || 'Attachment'
                                                : 'Attachment'
                                            }
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Click to download
                                        </p>
                                    </div>
                                </div>
                                <a
                                    download
                                    href={'/uploads/' + bug.attachment}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <Download className="h-5 w-5" />
                                </a>
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
                    className="bg-[#2b4b93] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bugToDelete, setBugToDelete] = useState<BugListItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 6;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [quotationCosts, setQuotationCosts] = useState<Record<number, string>>({});

    const { data: bugs = [], error, isLoading, refetch } = useQuery<BugListItem[], Error>({
        queryKey: ['bugs'],
        queryFn: bugService.getAllBugs,
    });

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    // Sort bugs so 'new' ones are at the top
    const sortedBugs = [...bugs].sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
    });

    const filteredBugs = sortedBugs.filter(req => {
        if (searchText.trim() === '') return true;
        // Helper function to check if search text matches beginning of any word
        const matchesWordBeginning = (text: string) => {
            if (!text) return false;
            const words = text.toLowerCase().split(/\s+/);
            const searchLower = searchText.toLowerCase();
            return words.some(word => word.startsWith(searchLower));
        };
        return matchesWordBeginning(req.bugTitle || '') || matchesWordBeginning(req.severity || '');
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredBugs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBugs = filteredBugs.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewMore = async (bugId: number) => {
        try {
            const bug = await bugService.getBugById(bugId);
            bug!.isNew = false; // Mark as viewed
            paginatedBugs.forEach(req => {
                if (req.bugId === bugId) {
                    req.isNew = false;
                }
            });

            filteredBugs.forEach(req => {
                if (req.bugId === bugId) {
                    req.isNew = false;
                }
            });

            sortedBugs.forEach(req => {
                if (req.bugId === bugId) {
                    req.isNew = false;
                }
            });
            setSelectedBug(bug);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching bug details:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBug(null);
    };

    const handleDeleteClick = (bug: BugListItem) => {
        setBugToDelete(bug);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!bugToDelete) return;

        setIsDeleting(true);
        try {
            await bugService.deleteBug(bugToDelete.bugId);
            // Refetch the bugs list to update the UI
            refetch();
            setDeleteModalOpen(false);
            setBugToDelete(null);
        } catch (error) {
            console.error('Error deleting bug:', error);
            // You might want to show an error toast here
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setBugToDelete(null);
    };

    const stats = {
        total: bugs.length,
        high: bugs.filter(req => req.severity === 'High').length,
        medium: bugs.filter(req => req.severity === 'Medium').length,
        low: bugs.filter(req => req.severity === 'Low').length
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

    // Checkbox handlers
    const handleSelect = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const handleSelectAll = () => {
        const currentPageIds = paginatedBugs.map(r => r.bugId);
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));
        setSelectedIds(allSelected ? selectedIds.filter(id => !currentPageIds.includes(id)) : [...selectedIds, ...currentPageIds.filter(id => !selectedIds.includes(id))]);
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
        setQuotationCosts((prev) => ({ ...prev, [id]: value }));
    };

    // Placeholder for sending email (to be implemented)
    const handleSendQuotation = async () => {
        // TODO: Call API to send email with selectedIds and quotationCosts
        closeQuotationModal();
        setSelectedIds([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#3450A3]" />
                            Bugs
                        </h1>
                        <p className="text-gray-600 mt-2">Manage project bugs and specifications</p>
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

                        {/* Quotation Modal */}
                        {isQuotationModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                                    <h2 className="text-xl text-black font-semibold mb-4">Enter Quotation Cost</h2>
                                    <form onSubmit={e => { e.preventDefault(); handleSendQuotation(); }}>
                                        <div className="space-y-4">
                                            {filteredBugs.filter(r => selectedIds.includes(r.bugId)).map(r => (
                                                <div key={r.bugId}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{r.bugTitle}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full border text-black border-gray-300 rounded-lg px-3 py-2"
                                                        value={quotationCosts[r.bugId] || ''}
                                                        onChange={e => handleCostChange(r.bugId, e.target.value)}
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
                                <p className="text-sm font-medium text-gray-600">High Severity</p>
                                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Medium Severity</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Severity</p>
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
                        placeholder="Search bugs by title, description, or severity..."
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
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
                        <p className="text-gray-600">
                            {searchText ? 'Try adjusting your search criteria.' : 'Get started by adding your first bug.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input type="checkbox" checked={paginatedBugs.length > 0 && paginatedBugs.every(r => selectedIds.includes(r.bugId))} onChange={handleSelectAll} />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedBugs.map((req) => (
                                        <tr
                                            key={req.bugId}
                                            className={`hover:bg-gray-50 ${req.isNew ? 'bg-blue-50 animate-highlight' : ''}`}
                                            style={req.isNew ? { transition: 'background-color 0.5s' } : {}}
                                        >
                                            <td className="px-4 py-4">
                                                <input type="checkbox" checked={selectedIds.includes(req.bugId)} onChange={() => handleSelect(req.bugId)} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        {req.bugTitle}
                                                        {req.isNew && (
                                                            <span className="bg-[#eca909] text-white text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-300">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <SeverityBadge severity={req.severity || 'Medium'} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {req.clientName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {req.projectName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewMore(req.bugId)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        title="View More Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/company/bugs/edit-bug/${req.bugId}`)}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                        title="Edit Bug"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(req)}
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

            {/* Modal */}
            <BugModal
                bug={selectedBug}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Bug"
                message="Are you sure you want to delete this bug?"
                warningMessage="This action cannot be undone and will permanently remove all bug data."
                isDeleting={isDeleting}
                itemName={bugToDelete?.bugTitle || 'this bug'}
                confirmButtonText="Delete Bug"
                cancelButtonText="Cancel"
            />
        </div>
    );
}