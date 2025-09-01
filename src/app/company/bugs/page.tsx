"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Trash2, Search, Clock, CheckCircle, AlertTriangle, Eye, X, Download, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bugService } from '@/app/lib/services/bugService';
import { Bug, BugListItem, BugQuotationRequest, BulkBugQuotationRequest } from '../../lib/types';
import Pagination from '@/app/components/Pagination';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import FeedbackPopup from '@/app/components/FeedbackPopup';
import BugStatusDropdown from '@/app/components/BugStatusDropdown';
import { useAuth } from '@/app/contexts/AuthContext';
import { normalizeStatus } from '@/app/lib/utils/statusUtils';
import { hasAccess } from "@/app/lib/utils/roleAccess";

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
    const [isSendingQuotation, setIsSendingQuotation] = useState(false);
    const { user } = useAuth();
    
    // Enhanced quotation form state
    const [quotationData, setQuotationData] = useState<Record<number, {
        cost: string;
        duration: string;
        description: string;
        deliveryDate: string;
    }>>({});
    const [additionalNotes, setAdditionalNotes] = useState("");
    
    // Feedback popup state
    const [feedbackPopup, setFeedbackPopup] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const { data: bugs = [], error, isLoading, refetch } = useQuery<BugListItem[], Error>({
        queryKey: ['bugs'],
        queryFn: bugService.getAllBugs,
    });

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    // Helper functions for feedback popup
    const showFeedback = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setFeedbackPopup({
            isOpen: true,
            type,
            title,
            message
        });
    };

    const closeFeedback = () => {
        setFeedbackPopup(prev => ({ ...prev, isOpen: false }));
    };

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

    const markBugAsRead = (bug: Bug, bugId: number) => {
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
        return bug;
    }

    const handleViewMore = async (bugId: number) => {
        try {
            const bug = await bugService.getBugById(bugId);
            const markedBug = markBugAsRead(bug!, bugId)
            setSelectedBug(markedBug);
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
            
            // Show success message
            showFeedback(
                'success',
                'Bug Deleted Successfully!',
                `The bug "${bugToDelete.bugTitle}" has been permanently deleted.`
            );
        } catch (error) {
            console.error('Error deleting bug:', error);
            // Show error message
            showFeedback(
                'error',
                'Failed to Delete Bug',
                error instanceof Error ? error.message : 'An unexpected error occurred while deleting the bug. Please try again.'
            );
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
        if (selectedIds.includes(id)) {
            // If unchecking, just remove the ID
            setSelectedIds((prev) => prev.filter(i => i !== id));
        } else {
            // If checking, validate client and project consistency
            if (selectedIds.length > 0) {
                const firstSelectedBug = filteredBugs.find(bug => bug.bugId === selectedIds[0]);
                const currentBug = filteredBugs.find(bug => bug.bugId === id);
                
                if (firstSelectedBug && currentBug) {
                    if (firstSelectedBug.clientId !== currentBug.clientId) {
                        showFeedback(
                            'error',
                            'Selection Error',
                            `Cannot select bugs from different clients. Please select bugs from the same client: ${firstSelectedBug.clientName}`
                        );
                        return;
                    }
                    
                    if (firstSelectedBug.projectId !== currentBug.projectId) {
                        showFeedback(
                            'error',
                            'Selection Error',
                            `Cannot select bugs from different projects. Please select bugs from the same project: ${firstSelectedBug.projectName}`
                        );
                        return;
                    }
                }
            }
            
            // If validation passes, add the ID
            setSelectedIds((prev) => [...prev, id]);
        }
    };
    
    const handleSelectAll = () => {
        const currentPageIds = paginatedBugs.map(r => r.bugId);
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));
        
        if (allSelected) {
            // If all are selected, unselect them
            setSelectedIds(selectedIds.filter(id => !currentPageIds.includes(id)));
        } else {
            // If not all are selected, validate consistency before selecting
            if (selectedIds.length > 0) {
                const firstSelectedBug = filteredBugs.find(bug => bug.bugId === selectedIds[0]);
                const pagesBugs = paginatedBugs.filter(bug => !selectedIds.includes(bug.bugId));
                
                if (firstSelectedBug && pagesBugs.length > 0) {
                    // Check if any bug on current page has different client or project
                    const differentClientBugs = pagesBugs.filter(bug => bug.clientId !== firstSelectedBug.clientId);
                    const differentProjectBugs = pagesBugs.filter(bug => bug.projectId !== firstSelectedBug.projectId);
                    
                    if (differentClientBugs.length > 0) {
                        showFeedback(
                            'error',
                            'Selection Error',
                            `Cannot select bugs from different clients. Some bugs on this page belong to different clients than your current selection.`
                        );
                        return;
                    }
                    
                    if (differentProjectBugs.length > 0) {
                        showFeedback(
                            'error',
                            'Selection Error',
                            `Cannot select bugs from different projects. Some bugs on this page belong to different projects than your current selection.`
                        );
                        return;
                    }
                }
            } else if (currentPageIds.length > 0) {
                // If no bugs are selected yet, check if all bugs on current page belong to same client and project
                const firstBug = paginatedBugs[0];
                const differentClientBugs = paginatedBugs.filter(bug => bug.clientId !== firstBug.clientId);
                const differentProjectBugs = paginatedBugs.filter(bug => bug.projectId !== firstBug.projectId);
                
                if (differentClientBugs.length > 0) {
                    showFeedback(
                        'error',
                        'Selection Error',
                        `Cannot select all bugs on this page as they belong to different clients. Please select bugs from the same client manually.`
                    );
                    return;
                }
                
                if (differentProjectBugs.length > 0) {
                    showFeedback(
                        'error',
                        'Selection Error',
                        `Cannot select all bugs on this page as they belong to different projects. Please select bugs from the same project manually.`
                    );
                    return;
                }
            }
            
            // If validation passes, select all on current page
            setSelectedIds([...selectedIds, ...currentPageIds.filter(id => !selectedIds.includes(id))]);
        }
    };

    // Quotation modal handlers
    const openQuotationModal = () => {
        // Initialize quotation data for selected bugs
        const initialData: Record<number, {
            cost: string;
            duration: string;
            description: string;
            deliveryDate: string;
        }> = {};
        
        selectedIds.forEach(id => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 7); // Default to 1 week from now
            initialData[id] = {
                cost: '',
                duration: '',
                description: '',
                deliveryDate: tomorrow.toISOString().split('T')[0]
            };
        });
        
        setQuotationData(initialData);
        setAdditionalNotes('');
        setIsQuotationModalOpen(true);
    };

    const closeQuotationModal = () => {
        setIsQuotationModalOpen(false);
        setQuotationData({});
        setAdditionalNotes('');
    };

    const handleQuotationFieldChange = (bugId: number, field: string, value: string) => {
        setQuotationData(prev => ({
            ...prev,
            [bugId]: {
                ...prev[bugId],
                [field]: value
            }
        }));
    };

    const handleSendQuotation = async () => {
        try {
            setIsSendingQuotation(true);
            
            // Get the first selected bug to determine client and project
            const firstBug = filteredBugs.find(r => selectedIds.includes(r.bugId));
            if (!firstBug) {
                throw new Error('No bugs selected');
            }

            // Validate that client and project IDs are valid
            if (!firstBug.clientId || firstBug.clientId <= 0) {
                throw new Error('Invalid client ID for selected bug');
            }
            if (!firstBug.projectId || firstBug.projectId <= 0) {
                throw new Error('Invalid project ID for selected bug');
            }

            // Validate that all selected bugs belong to the same client and project
            const selectedBugs = filteredBugs.filter(r => selectedIds.includes(r.bugId));
            const differentClientBugs = selectedBugs.filter(bug => bug.clientId !== firstBug.clientId);
            const differentProjectBugs = selectedBugs.filter(bug => bug.projectId !== firstBug.projectId);
            
            if (differentClientBugs.length > 0) {
                const bugTitles = differentClientBugs.map(bug => bug.bugTitle).join(', ');
                throw new Error(`All selected bugs must belong to the same client. The following bugs belong to different clients: ${bugTitles}`);
            }
            
            if (differentProjectBugs.length > 0) {
                const bugTitles = differentProjectBugs.map(bug => bug.bugTitle).join(', ');
                throw new Error(`All selected bugs must belong to the same project. The following bugs belong to different projects: ${bugTitles}`);
            }

            // Validate that all required fields are filled
            for (const id of selectedIds) {
                const data = quotationData[id];
                if (!data) {
                    throw new Error(`Missing quotation data for bug ID: ${id}`);
                }
                if (!data.cost || parseFloat(data.cost) <= 0) {
                    throw new Error(`Please enter a valid cost for bug: ${filteredBugs.find(b => b.bugId === id)?.bugTitle}`);
                }
                if (!data.duration.trim()) {
                    throw new Error(`Please enter estimated duration for bug: ${filteredBugs.find(b => b.bugId === id)?.bugTitle}`);
                }
                if (!data.description.trim()) {
                    throw new Error(`Please enter description for bug: ${filteredBugs.find(b => b.bugId === id)?.bugTitle}`);
                }
                if (!data.deliveryDate) {
                    throw new Error(`Please select delivery date for bug: ${filteredBugs.find(b => b.bugId === id)?.bugTitle}`);
                }
            }

            // Prepare quotation requests
            const quotationRequests: BugQuotationRequest[] = selectedIds.map(id => {
                const data = quotationData[id];
                // Ensure delivery date is properly formatted and in the future
                const deliveryDate = new Date(data.deliveryDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
                
                if (isNaN(deliveryDate.getTime())) {
                    throw new Error(`Invalid delivery date for bug ID: ${id}`);
                }
                if (deliveryDate < today) {
                    throw new Error(`Delivery date must be in the future for bug ID: ${id}`);
                }
                
                return {
                    bugId: parseInt(id.toString()), // Ensure it's a number
                    quotationCost: Math.round(parseFloat(data.cost) * 100) / 100, // Round to 2 decimal places
                    estimatedDuration: data.duration.trim(),
                    description: data.description.trim(),
                    deliveryDate: deliveryDate.toISOString()
                };
            });

            const bulkQuotationRequest: BulkBugQuotationRequest = {
                selectedBugs: quotationRequests,
                clientId: parseInt(firstBug.clientId.toString()), // Ensure it's a number
                employeeId: user!.userId, // Use current user's ID
                projectId: parseInt(firstBug.projectId.toString()), // Ensure it's a number
                additionalNotes: additionalNotes.trim() || ""
            };

            console.log('Sending bulk bug quotation request:', JSON.stringify(bulkQuotationRequest, null, 2));
            console.log('First bug data:', firstBug);
            console.log('Selected IDs:', selectedIds);

            console.log('Using bulk bug quotation endpoint');
                await bugService.sendBulkQuotation(bulkQuotationRequest);

            quotationRequests.forEach(async bugQ => {
                const bug = await bugService.getBugById(bugQ.bugId);
                markBugAsRead(bug!, bugQ.bugId);
            })
            
            // Show success message
            showFeedback(
                'success', 
                'Bug Quotation Sent Successfully!', 
                `Your quotation for ${selectedIds.length} bug${selectedIds.length !== 1 ? 's' : ''} has been sent to the client via email.`
            );
            
            closeQuotationModal();
            setSelectedIds([]);
            
        } catch (error) {
            console.error('Error sending bug quotation:', error);
            // Show error message
            showFeedback(
                'error', 
                'Failed to Send Bug Quotation', 
                error instanceof Error ? error.message : 'An unexpected error occurred while sending the bug quotation. Please try again.'
            );
        } finally {
            setIsSendingQuotation(false);
        }
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

                        {hasAccess(user!.role, "Bug", "SEND_QUOTATION") &&
                        <div className="flex justify-end mt-4">
                            <button
                                className={`bg-[#2b4b93] text-white px-6 py-2 rounded-lg font-medium transition-colors ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                disabled={selectedIds.length === 0}
                                onClick={openQuotationModal}
                            >
                                Generate Quotation ({selectedIds.length})
                            </button>
                        </div>}

                        {/* Enhanced Quotation Modal */}
                        {isQuotationModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                <DollarSign className="h-6 w-6 text-[#2b4b93]" />
                                                Generate Bug Quotation
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Enter quotation details for {selectedIds.length} selected bug{selectedIds.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={closeQuotationModal}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            disabled={isSendingQuotation}
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                        <form onSubmit={(e) => { e.preventDefault(); handleSendQuotation(); }} className="space-y-6">
                                            {/* Bugs Section */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Bug Details
                                                </h3>
                                                
                                                {filteredBugs
                                                    .filter(r => selectedIds.includes(r.bugId))
                                                    .map((bug, index) => (
                                                    <div key={bug.bugId} className="bg-gray-50 rounded-lg p-4 border">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    {index + 1}. {bug.bugTitle}
                                                                </h4>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-xs text-gray-600">Client: {bug.clientName}</span>
                                                                    <span className="text-xs text-gray-600">•</span>
                                                                    <span className="text-xs text-gray-600">Project: {bug.projectName}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <SeverityBadge severity={bug.severity || 'Medium'} />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Cost */}
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                    <DollarSign className="h-4 w-4" />
                                                                    Quotation Cost *
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93]"
                                                                    placeholder="Enter cost"
                                                                    value={quotationData[bug.bugId]?.cost || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(bug.bugId, 'cost', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation}
                                                                />
                                                            </div>

                                                            {/* Estimated Duration */}
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                    <Clock className="h-4 w-4" />
                                                                    Estimated Duration *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93]"
                                                                    placeholder="e.g., 2 weeks, 1 month"
                                                                    value={quotationData[bug.bugId]?.duration || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(bug.bugId, 'duration', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation}
                                                                />
                                                            </div>

                                                            {/* Delivery Date */}
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Expected Delivery Date *
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93]"
                                                                    value={quotationData[bug.bugId]?.deliveryDate || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(bug.bugId, 'deliveryDate', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation}
                                                                    min={new Date().toISOString().split('T')[0]}
                                                                />
                                                            </div>

                                                            {/* Description */}
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                    <FileText className="h-4 w-4" />
                                                                    Description *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93]"
                                                                    placeholder="Brief description of the fix"
                                                                    value={quotationData[bug.bugId]?.description || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(bug.bugId, 'description', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Additional Notes */}
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Additional Notes
                                                </label>
                                                <textarea
                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93]"
                                                    rows={3}
                                                    placeholder="Any additional information or terms..."
                                                    value={additionalNotes}
                                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                                    disabled={isSendingQuotation}
                                                />
                                            </div>

                                            {/* Total Cost Summary */}
                                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-medium text-gray-900">Total Quotation Cost:</span>
                                                    <span className="text-2xl font-bold text-[#2b4b93]">
                                                        ${Object.values(quotationData)
                                                            .map(data => parseFloat(data.cost) || 0)
                                                            .reduce((acc, curr) => acc + curr, 0)
                                                            .toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="flex justify-end gap-3 pt-4 border-t">
                                                <button 
                                                    type="button" 
                                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                                    onClick={closeQuotationModal}
                                                    disabled={isSendingQuotation}
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="bg-[#2b4b93] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                                    disabled={isSendingQuotation}
                                                >
                                                    {isSendingQuotation ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        'Send Quotation'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
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
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                                            <td className="px-6 py-4">
                                                <BugStatusDropdown
                                                    bugId={req.bugId}
                                                    currentStatus={normalizeStatus(req.status) || 'Pending'}
                                                    canManage={true}
                                                />
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
                                                        onClick={() => router.push(`/company/bugs/edit-bug-report/${req.bugId}`)}
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

            {/* Feedback Popup */}
            <FeedbackPopup
                isOpen={feedbackPopup.isOpen}
                onClose={closeFeedback}
                type={feedbackPopup.type}
                title={feedbackPopup.title}
            >
                {feedbackPopup.message}
            </FeedbackPopup>
        </div>
    );
}
