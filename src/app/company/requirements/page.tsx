"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Trash2, Search, Clock, CheckCircle, AlertTriangle, Eye, X, Download, Calendar, DollarSign, FileTextIcon, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { requirementService } from '@/app/lib/services/requirementService';
import { Requirement, RequirementListItem, QuotationRequest, BulkQuotationRequest } from '../../lib/types';
import Pagination from '@/app/components/Pagination';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import FeedbackPopup from '@/app/components/FeedbackPopup';

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
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">Requirement Details</h2>
                    <p className="text-sm text-gray-600">Complete requirement information</p>
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
                                <a
                                    download
                                    href={'/uploads/' + requirement.attachment}
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

export default function CompanyRequirementsPage() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [requirementToDelete, setRequirementToDelete] = useState<RequirementListItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 6;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [isSendingQuotation, setIsSendingQuotation] = useState(false);
    
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

    const { data: requirements = [], error, isLoading, refetch } = useQuery<RequirementListItem[], Error>({
        queryKey: ['requirements'],
        queryFn: requirementService.getAllRequirements,
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
        return matchesWordBeginning(req.requirementTitle || '') || matchesWordBeginning(req.priority || '');
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequirements = filteredRequirements.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewMore = async (requirementId: number) => {
        try {
            const requirement = await requirementService.getRequirementById(requirementId);
            requirement.isNew = false; // Mark as viewed
            paginatedRequirements.forEach(req => {
                if (req.requirementId === requirementId) {
                    req.isNew = false;
                }
            });

            filteredRequirements.forEach(req => {
                if (req.requirementId === requirementId) {
                    req.isNew = false;
                }
            });

            sortedRequirements.forEach(req => {
                if (req.requirementId === requirementId) {
                    req.isNew = false;
                }
            });
            setSelectedRequirement(requirement);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching requirement details:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequirement(null);
    };

    const handleDeleteClick = (requirement: RequirementListItem) => {
        setRequirementToDelete(requirement);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!requirementToDelete) return;

        setIsDeleting(true);
        try {
            await requirementService.deleteRequirement(requirementToDelete.requirementId);
            // Refetch the requirements list to update the UI
            refetch();
            setDeleteModalOpen(false);
            setRequirementToDelete(null);
            
            // Show success message
            showFeedback(
                'success',
                'Requirement Deleted Successfully!',
                `The requirement "${requirementToDelete.requirementTitle}" has been permanently deleted.`
            );
        } catch (error) {
            console.error('Error deleting requirement:', error);
            // Show error message
            showFeedback(
                'error',
                'Failed to Delete Requirement',
                error instanceof Error ? error.message : 'An unexpected error occurred while deleting the requirement. Please try again.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setRequirementToDelete(null);
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

    // Checkbox handlers
    const handleSelect = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const handleSelectAll = () => {
        const currentPageIds = paginatedRequirements.map(r => r.requirementId);
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));
        setSelectedIds(allSelected ? selectedIds.filter(id => !currentPageIds.includes(id)) : [...selectedIds, ...currentPageIds.filter(id => !selectedIds.includes(id))]);
    };

    // Quotation modal handlers
    const openQuotationModal = () => {
        // Initialize quotation data for selected requirements
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

    const handleQuotationFieldChange = (requirementId: number, field: string, value: string) => {
        setQuotationData(prev => ({
            ...prev,
            [requirementId]: {
                ...prev[requirementId],
                [field]: value
            }
        }));
    };

    const handleSendQuotation = async () => {
        try {
            setIsSendingQuotation(true);
            
            // Get the first selected requirement to determine client and project
            const firstRequirement = filteredRequirements.find(r => selectedIds.includes(r.requirementId));
            if (!firstRequirement) {
                throw new Error('No requirements selected');
            }

            // Prepare quotation requests
            const selectedRequirements: QuotationRequest[] = selectedIds.map(id => {
                const data = quotationData[id];
                return {
                    requirementId: id,
                    quotationCost: parseFloat(data.cost) || 0,
                    estimatedDuration: data.duration,
                    description: data.description,
                    deliveryDate: new Date(data.deliveryDate).toISOString()
                };
            });

            const bulkQuotationRequest: BulkQuotationRequest = {
                selectedRequirements,
                clientId: firstRequirement.clientId,
                projectId: firstRequirement.projectId,
                additionalNotes
            };

            await requirementService.sendBulkQuotation(bulkQuotationRequest);
            
            // Show success message
            showFeedback(
                'success', 
                'Quotation Sent Successfully!', 
                `Your quotation for ${selectedIds.length} requirement${selectedIds.length !== 1 ? 's' : ''} has been sent to the client via email.`
            );
            
            closeQuotationModal();
            setSelectedIds([]);
            
        } catch (error) {
            console.error('Error sending quotation:', error);
            // Show error message
            showFeedback(
                'error', 
                'Failed to Send Quotation', 
                error instanceof Error ? error.message : 'An unexpected error occurred while sending the quotation. Please try again.'
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
                            Requirements
                        </h1>
                        <p className="text-gray-600 mt-2">Manage project requirements and specifications</p>
                    </div>

                        {/* Generate Quotation Button */}
                        <div className="flex justify-end mt-4">
                            <button
                                className={`bg-[#2b4b93] text-white px-6 py-2 rounded-lg font-medium transition-colors ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                disabled={selectedIds.length === 0}
                                onClick={openQuotationModal}
                            >
                                Generate Quotation ({selectedIds.length})
                            </button>
                        </div>

                        {/* Enhanced Quotation Modal */}
                        {isQuotationModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                <DollarSign className="h-6 w-6 text-[#2b4b93]" />
                                                Generate Quotation
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Enter quotation details for {selectedIds.length} selected requirement{selectedIds.length !== 1 ? 's' : ''}
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
                                            {/* Requirements Section */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Requirement Details
                                                </h3>
                                                
                                                {filteredRequirements
                                                    .filter(r => selectedIds.includes(r.requirementId))
                                                    .map((requirement, index) => (
                                                    <div key={requirement.requirementId} className="bg-gray-50 rounded-lg p-4 border">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    {index + 1}. {requirement.requirementTitle}
                                                                </h4>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-xs text-gray-600">Client: {requirement.clientName}</span>
                                                                    <span className="text-xs text-gray-600">•</span>
                                                                    <span className="text-xs text-gray-600">Project: {requirement.projectName}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <PriorityBadge priority={requirement.priority || 'Medium'} />
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
                                                                    value={quotationData[requirement.requirementId]?.cost || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'cost', e.target.value)}
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
                                                                    value={quotationData[requirement.requirementId]?.duration || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'duration', e.target.value)}
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
                                                                    value={quotationData[requirement.requirementId]?.deliveryDate || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'deliveryDate', e.target.value)}
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
                                                                    placeholder="Brief description of the work"
                                                                    value={quotationData[requirement.requirementId]?.description || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'description', e.target.value)}
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
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input type="checkbox" checked={paginatedRequirements.length > 0 && paginatedRequirements.every(r => selectedIds.includes(r.requirementId))} onChange={handleSelectAll} />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
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
                                            <td className="px-4 py-4">
                                                <input type="checkbox" checked={selectedIds.includes(req.requirementId)} onChange={() => handleSelect(req.requirementId)} />
                                            </td>
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
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <PriorityBadge priority={req.priority || 'Medium'} />
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
                                                        onClick={() => handleViewMore(req.requirementId)}
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
                                                        onClick={() => handleDeleteClick(req)}
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

                    </>
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Requirement"
                message="Are you sure you want to delete this requirement?"
                warningMessage="This action cannot be undone and will permanently remove all requirement data."
                isDeleting={isDeleting}
                itemName={requirementToDelete?.requirementTitle || 'this requirement'}
                confirmButtonText="Delete Requirement"
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