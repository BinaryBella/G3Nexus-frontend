"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Trash2, Search, Clock, CheckCircle, AlertTriangle, Eye, X, Download, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { requirementService } from '@/app/lib/services/requirementService';
import { Requirement, RequirementListItem, QuotationRequest, BulkQuotationRequest } from '../../lib/types';
import Pagination from '@/app/components/Pagination';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import FeedbackPopup from '@/app/components/FeedbackPopup';
import { useAuth } from '@/app/contexts/AuthContext';

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
    const [submitAttempts, setSubmitAttempts] = useState(0);
    const [lastError, setLastError] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [fallbackMode, setFallbackMode] = useState(false);
    const [individualSendProgress, setIndividualSendProgress] = useState<{ [key: number]: 'pending' | 'sending' | 'success' | 'error' }>({});
    const [retryCount, setRetryCount] = useState(0);
    const [quotationStatus, setQuotationStatus] = useState<{ [key: number]: 'available' | 'quoted' | 'unavailable' }>({});
    const [statusCheckInProgress, setStatusCheckInProgress] = useState(false);
    const { user } = useAuth();

    // Enhanced quotation form state
    const [quotationData, setQuotationData] = useState<Record<number, {
        cost: string;
        duration: string;
        description: string;
        deliveryDate: string;
    }>>({});
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});

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

    const markRequirementAsRead = (requirement: Requirement, requirementId: number) => {
        requirement!.isNew = false; // Mark as viewed
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
        return requirement;
    }

    const handleViewMore = async (requirementId: number) => {
        try {
            const requirement = await requirementService.getRequirementById(requirementId);
            const markedRequirement = markRequirementAsRead(requirement!, requirementId);
            setSelectedRequirement(markedRequirement);
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

    // Function to check quotation status for selected requirements
    const checkQuotationStatus = async (requirementIds: number[]) => {
        setStatusCheckInProgress(true);
        try {
            // Check if requirements are already quoted or unavailable
            const statusMap: { [key: number]: 'available' | 'quoted' | 'unavailable' } = {};

            for (const id of requirementIds) {
                const requirement = filteredRequirements.find(r => r.requirementId === id);
                if (!requirement) {
                    statusMap[id] = 'unavailable';
                } else {
                    // In a real implementation, you would check if this requirement already has a quotation
                    // For now, we'll assume all found requirements are available
                    statusMap[id] = 'available';
                }
            }

            setQuotationStatus(statusMap);
            return statusMap;
        } catch (error) {
            console.error('Error checking quotation status:', error);
            // Set all as unavailable on error
            const statusMap: { [key: number]: 'available' | 'quoted' | 'unavailable' } = {};
            requirementIds.forEach((id: number) => {
                statusMap[id] = 'unavailable';
            });
            setQuotationStatus(statusMap);
            return statusMap;
        } finally {
            setStatusCheckInProgress(false);
        }
    };

    // Quotation modal handlers
    const openQuotationModal = async () => {
        // First check the status of selected requirements
        await checkQuotationStatus(selectedIds);

        // Initialize quotation data for selected requirements
        const initialData: Record<number, {
            cost: string;
            duration: string;
            description: string;
            deliveryDate: string;
        }> = {};

        selectedIds.forEach((id: number) => {
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
        setLastError(null);
        setSubmitAttempts(0);
        setIsRetrying(false);
        setIsQuotationModalOpen(true);
    };

    // Function to remove problematic requirements from selection
    const removeProblematicRequirements = () => {
        const validIds = selectedIds.filter(id => quotationStatus[id] === 'available');
        setSelectedIds(validIds);

        const removedCount = selectedIds.length - validIds.length;
        showFeedback(
            'success',
            'Requirements Cleaned',
            `Removed ${removedCount} problematic requirement${removedCount !== 1 ? 's' : ''} from selection. ${validIds.length} requirement${validIds.length !== 1 ? 's' : ''} remaining.`
        );
    };

    const closeQuotationModal = () => {
        setIsQuotationModalOpen(false);
        setQuotationData({});
        setAdditionalNotes('');
        setValidationErrors({});
        setLastError(null);
        setSubmitAttempts(0);
        setIsRetrying(false);
        setFallbackMode(false);
        setIndividualSendProgress({});
        setRetryCount(0);
    };

    const handleQuotationFieldChange = (requirementId: number, field: string, value: string) => {
        setQuotationData(prev => ({
            ...prev,
            [requirementId]: {
                ...prev[requirementId],
                [field]: value
            }
        }));

        // Clear validation error for this field
        setValidationErrors(prev => ({
            ...prev,
            [requirementId]: {
                ...prev[requirementId],
                [field]: ''
            }
        }));

        // Real-time validation
        if (field === 'cost' && value && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
            setValidationErrors(prev => ({
                ...prev,
                [requirementId]: {
                    ...prev[requirementId],
                    [field]: 'Cost must be a positive number'
                }
            }));
        }
    };

    const handleSendQuotation = async (retryAttempt = 0) => {
        try {
            setIsSendingQuotation(true);
            setIsRetrying(retryAttempt > 0);
            setLastError(null);
            setRetryCount(retryAttempt);

            // Validate all required fields
            const missingFields: string[] = [];
            selectedIds.forEach((id: number) => {
                const data = quotationData[id];
                if (!data?.cost || parseFloat(data.cost) <= 0) {
                    const requirement = filteredRequirements.find(r => r.requirementId === id);
                    missingFields.push(`${requirement?.requirementTitle}: Cost`);
                }
                if (!data?.duration?.trim()) {
                    const requirement = filteredRequirements.find(r => r.requirementId === id);
                    missingFields.push(`${requirement?.requirementTitle}: Duration`);
                }
                if (!data?.description?.trim()) {
                    const requirement = filteredRequirements.find(r => r.requirementId === id);
                    missingFields.push(`${requirement?.requirementTitle}: Description`);
                }
                if (!data?.deliveryDate) {
                    const requirement = filteredRequirements.find(r => r.requirementId === id);
                    missingFields.push(`${requirement?.requirementTitle}: Delivery Date`);
                }
            });

            if (missingFields.length > 0) {
                showFeedback(
                    'warning',
                    'Missing Required Fields',
                    `Please fill in all required fields:\n${missingFields.slice(0, 3).join('\n')}${missingFields.length > 3 ? `\n... and ${missingFields.length - 3} more` : ''}`
                );
                return;
            }

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
                employeeId: user!.userId, // Use current user's ID
                clientId: firstRequirement.clientId,
                projectId: firstRequirement.projectId,
                additionalNotes
            };

            console.log('Sending bulk quotation:', JSON.stringify(bulkQuotationRequest, null, 2));

            // Try bulk operation first, unless we're already in fallback mode
            if (!fallbackMode) {
                try {
                    await requirementService.sendBulkQuotation(bulkQuotationRequest);

                    // Show success message
                    showFeedback(
                        'success',
                        'Quotation Sent Successfully!',
                        `Your quotation for ${selectedIds.length} requirement${selectedIds.length !== 1 ? 's' : ''} has been sent to the client via email. Total value: $${Object.values(quotationData).map(data => parseFloat(data.cost) || 0).reduce((acc, curr) => acc + curr, 0).toFixed(2)}`
                    );

                    closeQuotationModal();
                    setSelectedIds([]);
                    setSubmitAttempts(0);
                    setRetryCount(0);
                    setFallbackMode(false);
                    return;

                } catch (bulkError: any) {
                    const errorMessage = bulkError?.response?.data?.message || bulkError?.message || 'Unknown error';
                    const isTransactionError = errorMessage.includes('SqlServerRetryingExecutionStrategy') ||
                        errorMessage.includes('execution strategy') ||
                        errorMessage.includes('user-initiated transactions');

                    const isRequirementError = errorMessage.includes('Requirements not found or already quoted') ||
                        errorMessage.includes('already quoted') ||
                        errorMessage.includes('not found');

                    // Handle requirement-specific errors
                    if (isRequirementError) {
                        // Extract requirement IDs from error message
                        const matches = errorMessage.match(/(\d+)/g);
                        const errorRequirementIds = matches ? matches.map(Number) : [];

                        if (errorRequirementIds.length > 0) {
                            // Update status for error requirements
                            const updatedStatus = { ...quotationStatus };
                            errorRequirementIds.forEach((id: number) => {
                                updatedStatus[id] = errorMessage.includes('already quoted') ? 'quoted' : 'unavailable';
                            });
                            setQuotationStatus(updatedStatus);

                            const quotedIds = errorRequirementIds.filter((id: number) => updatedStatus[id] === 'quoted');
                            const unavailableIds = errorRequirementIds.filter((id: number) => updatedStatus[id] === 'unavailable');

                            let detailMessage = '';
                            if (quotedIds.length > 0) {
                                const quotedTitles = quotedIds.map((id: number) => {
                                    const req = filteredRequirements.find(r => r.requirementId === id);
                                    return req ? req.requirementTitle : `ID ${id}`;
                                });
                                detailMessage += `Already quoted: ${quotedTitles.join(', ')}\n`;
                            }
                            if (unavailableIds.length > 0) {
                                const unavailableTitles = unavailableIds.map((id: number) => {
                                    const req = filteredRequirements.find(r => r.requirementId === id);
                                    return req ? req.requirementTitle : `ID ${id}`;
                                });
                                detailMessage += `Not found: ${unavailableTitles.join(', ')}`;
                            }

                            showFeedback(
                                'warning',
                                'Some Requirements Cannot Be Quoted',
                                `${detailMessage}\n\nPlease remove these requirements from your selection and try again.`
                            );

                            // Remove problematic requirements from selection
                            const validIds = selectedIds.filter(id => !errorRequirementIds.includes(id));
                            setSelectedIds(validIds);

                            return; // Don't proceed with fallback for this type of error
                        }
                    }

                    // If it's a transaction error, try fallback mode
                    if (isTransactionError) {
                        console.log('Database transaction error detected, switching to fallback mode...');
                        setFallbackMode(true);

                        showFeedback(
                            'warning',
                            'Switching to Individual Send Mode',
                            'Database transaction issue detected. Attempting to send quotations individually...'
                        );

                        // Continue to fallback mode below
                    } else {
                        // For non-transaction errors, retry the bulk operation
                        if (retryAttempt < 2) {
                            showFeedback(
                                'warning',
                                `Retry Attempt ${retryAttempt + 1}`,
                                'Retrying bulk quotation...'
                            );

                            setTimeout(() => {
                                handleSendQuotation(retryAttempt + 1);
                            }, 1000 + (retryAttempt * 500));
                            return;
                        } else {
                            throw bulkError; // Re-throw if max retries reached
                        }
                    }
                }
            }

            // Fallback mode: Send quotations individually
            if (fallbackMode || retryAttempt > 0) {
                console.log('Sending quotations individually...');

                // Initialize progress tracking
                const progress: { [key: number]: 'pending' | 'sending' | 'success' | 'error' } = {};
                selectedIds.forEach((id: number) => {
                    progress[id] = 'pending';
                });
                setIndividualSendProgress(progress);

                let successCount = 0;
                let failureCount = 0;
                const errors: string[] = [];

                // Send each quotation individually
                for (const requirement of selectedRequirements) {
                    try {
                        // Update progress
                        setIndividualSendProgress(prev => ({
                            ...prev,
                            [requirement.requirementId]: 'sending'
                        }));

                        // Send individual quotation
                        const individualRequest: BulkQuotationRequest = {
                            selectedRequirements: [requirement],
                            employeeId: user!.userId,
                            clientId: firstRequirement.clientId,
                            projectId: firstRequirement.projectId,
                            additionalNotes: `${additionalNotes}\n\n[Note: This quotation was sent individually due to a system issue]`
                        };

                        await requirementService.sendBulkQuotation(individualRequest);

                        // Update progress
                        setIndividualSendProgress(prev => ({
                            ...prev,
                            [requirement.requirementId]: 'success'
                        }));

                        successCount++;

                        // Small delay between sends to avoid overwhelming the server
                        if (selectedRequirements.length > 1) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }

                    } catch (individualError: any) {
                        console.error(`Failed to send quotation for requirement ${requirement.requirementId}:`, individualError);

                        setIndividualSendProgress(prev => ({
                            ...prev,
                            [requirement.requirementId]: 'error'
                        }));

                        failureCount++;
                        const reqTitle = filteredRequirements.find(r => r.requirementId === requirement.requirementId)?.requirementTitle || `ID ${requirement.requirementId}`;
                        errors.push(`${reqTitle}: ${individualError?.response?.data?.message || individualError?.message || 'Unknown error'}`);
                    }
                }

                // Show final results
                if (successCount === selectedIds.length) {
                    showFeedback(
                        'success',
                        'All Quotations Sent Successfully!',
                        `All ${successCount} quotations were sent individually to the client via email. Total value: $${Object.values(quotationData).map(data => parseFloat(data.cost) || 0).reduce((acc, curr) => acc + curr, 0).toFixed(2)}`
                    );

                    closeQuotationModal();
                    setSelectedIds([]);
                    setSubmitAttempts(0);
                    setRetryCount(0);
                    setFallbackMode(false);
                    setIndividualSendProgress({});

                    selectedRequirements.forEach(async requirementQ => {
                        const requirement = await requirementService.getRequirementById(requirementQ.requirementId);
                        markRequirementAsRead(requirement!, requirementQ.requirementId);
                    });

                } else if (successCount > 0) {
                    showFeedback(
                        'warning',
                        'Partial Success',
                        `${successCount} of ${selectedIds.length} quotations were sent successfully. ${failureCount} failed.\n\nFailed items:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n... and ${errors.length - 3} more` : ''}`
                    );
                } else {
                    showFeedback(
                        'error',
                        'All Quotations Failed',
                        `None of the quotations could be sent.\n\nErrors:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n... and ${errors.length - 3} more` : ''}`
                    );
                }

                return;
            }

        } catch (error: any) {
            console.error('Error sending quotation:', error);

            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
            setLastError(errorMessage);
            setSubmitAttempts(retryAttempt + 1);

            // Show appropriate error message
            let userFriendlyMessage = 'An unexpected error occurred while sending the quotation.';

            if (errorMessage.includes('SqlServerRetryingExecutionStrategy') ||
                errorMessage.includes('execution strategy') ||
                errorMessage.includes('user-initiated transactions')) {
                userFriendlyMessage = 'Database transaction issue detected. This is typically a temporary server-side issue.';
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                userFriendlyMessage = 'Network connection issue. Please check your internet connection and try again.';
            } else if (errorMessage.includes('validation')) {
                userFriendlyMessage = 'Data validation failed. Please check your input and try again.';
            }

            showFeedback(
                'error',
                `Failed to Send Quotation${retryAttempt > 0 ? ` (After ${retryAttempt + 1} attempts)` : ''}`,
                `${userFriendlyMessage}\n\nTechnical details: ${errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage}`
            );
        } finally {
            setIsSendingQuotation(false);
            setIsRetrying(false);
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

                    {/* Generate Quotation Button and Selection Info */}
                    <div className="flex justify-between items-center mt-4">

                        <button
                            className={`bg-[#2b4b93] text-white px-6 py-2 rounded-lg font-medium transition-all ${selectedIds.length === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
                                }`}
                            disabled={selectedIds.length === 0}
                            onClick={openQuotationModal}
                        >
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Generate Quotation {selectedIds.length > 0 && `(${selectedIds.length})`}
                            </div>
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
                                    {/* Warning for problematic requirements */}
                                    {Object.values(quotationStatus).some(status => status !== 'available') && (
                                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 17.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-yellow-800">Requirements Status Issues Detected</h4>
                                                    <div className="text-sm text-yellow-700 mt-1">
                                                        {Object.entries(quotationStatus).some(([_, status]) => status === 'quoted') && (
                                                            <p className="mb-1">• Some requirements are already quoted and cannot be quoted again</p>
                                                        )}
                                                        {Object.entries(quotationStatus).some(([_, status]) => status === 'unavailable') && (
                                                            <p className="mb-1">• Some requirements were not found in the system</p>
                                                        )}
                                                        <p className="font-medium">Please remove problematic requirements from your selection before proceeding.</p>
                                                    </div>
                                                    <div className="mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={removeProblematicRequirements}
                                                            className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Remove Problematic Requirements
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                                            <div className="text-right flex flex-col gap-2">
                                                                <PriorityBadge priority={requirement.priority || 'Medium'} />
                                                                {/* Status indicator */}
                                                                {statusCheckInProgress ? (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        <div className="animate-spin h-3 w-3 border border-blue-600 rounded-full border-t-transparent mr-1"></div>
                                                                        Checking...
                                                                    </span>
                                                                ) : (
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${quotationStatus[requirement.requirementId] === 'quoted'
                                                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                                            : quotationStatus[requirement.requirementId] === 'unavailable'
                                                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                                                : 'bg-green-100 text-green-800 border border-green-200'
                                                                        }`}>
                                                                        {quotationStatus[requirement.requirementId] === 'quoted'
                                                                            ? '⚠️ Already Quoted'
                                                                            : quotationStatus[requirement.requirementId] === 'unavailable'
                                                                                ? '❌ Not Found'
                                                                                : '✅ Available'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${quotationStatus[requirement.requirementId] !== 'available' ? 'opacity-50' : ''}`}>
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
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                    placeholder="Enter cost"
                                                                    value={quotationData[requirement.requirementId]?.cost || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'cost', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation || quotationStatus[requirement.requirementId] !== 'available'}
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
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                    placeholder="e.g., 2 weeks, 1 month"
                                                                    value={quotationData[requirement.requirementId]?.duration || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'duration', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation || quotationStatus[requirement.requirementId] !== 'available'}
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
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                    value={quotationData[requirement.requirementId]?.deliveryDate || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'deliveryDate', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation || quotationStatus[requirement.requirementId] !== 'available'}
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
                                                                    className="w-full border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2b4b93] focus:border-[#2b4b93] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                    placeholder="Brief description of the work"
                                                                    value={quotationData[requirement.requirementId]?.description || ''}
                                                                    onChange={(e) => handleQuotationFieldChange(requirement.requirementId, 'description', e.target.value)}
                                                                    required
                                                                    disabled={isSendingQuotation || quotationStatus[requirement.requirementId] !== 'available'}
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

                                        {/* Error Display */}
                                        {lastError && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-red-800 mb-1">
                                                            Submission Failed {submitAttempts > 0 && `(After ${submitAttempts} attempt${submitAttempts !== 1 ? 's' : ''})`}
                                                        </h4>
                                                        <div className="text-sm text-red-700">
                                                            {lastError.includes('SqlServerRetryingExecutionStrategy') ? (
                                                                <div>
                                                                    <p className="mb-2">Database transaction conflict detected. This usually resolves automatically.</p>
                                                                    <p className="text-xs bg-red-100 p-2 rounded border font-mono">
                                                                        Technical: {lastError.length > 150 ? lastError.substring(0, 150) + '...' : lastError}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p>{lastError}</p>
                                                            )}
                                                        </div>
                                                        {submitAttempts < 3 && lastError.includes('SqlServerRetryingExecutionStrategy') && (
                                                            <p className="text-xs text-red-600 mt-2">
                                                                💡 Tip: This error usually resolves with a retry. Click "Retry" or "Send Quotation" again.
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setLastError(null)}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress indicator for individual sends */}
                                        {fallbackMode && Object.keys(individualSendProgress).length > 0 && (
                                            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                                <h4 className="text-sm font-medium text-blue-900 mb-3">Individual Send Progress:</h4>
                                                <div className="space-y-2">
                                                    {selectedIds.map(id => {
                                                        const requirement = filteredRequirements.find(r => r.requirementId === id);
                                                        const status = individualSendProgress[id] || 'pending';
                                                        const statusConfig = {
                                                            pending: { color: 'text-gray-600', icon: '⏳', bgColor: 'bg-gray-100' },
                                                            sending: { color: 'text-blue-600', icon: '📤', bgColor: 'bg-blue-100' },
                                                            success: { color: 'text-green-600', icon: '✅', bgColor: 'bg-green-100' },
                                                            error: { color: 'text-red-600', icon: '❌', bgColor: 'bg-red-100' }
                                                        };

                                                        return (
                                                            <div key={id} className={`flex items-center justify-between p-2 rounded ${statusConfig[status].bgColor}`}>
                                                                <span className="text-sm font-medium">
                                                                    {requirement?.requirementTitle || `Requirement ${id}`}
                                                                </span>
                                                                <span className={`text-sm font-medium flex items-center gap-1 ${statusConfig[status].color}`}>
                                                                    <span>{statusConfig[status].icon}</span>
                                                                    <span className="capitalize">{status}</span>
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Error display */}
                                        {lastError && (
                                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-red-800">Last Error:</h4>
                                                        <p className="text-sm text-red-700 mt-1">{lastError}</p>
                                                        {retryCount > 0 && (
                                                            <p className="text-xs text-red-600 mt-1">After {retryCount} retry attempts</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

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

                                            {/* Try Individual Send button for transaction errors */}
                                            {lastError && !isSendingQuotation && !fallbackMode &&
                                                (lastError.includes('SqlServerRetryingExecutionStrategy') ||
                                                    lastError.includes('execution strategy') ||
                                                    lastError.includes('user-initiated transactions')) && (
                                                    <button
                                                        type="button"
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                                        onClick={() => {
                                                            setFallbackMode(true);
                                                            setLastError(null);
                                                            handleSendQuotation(0);
                                                        }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        Try Individual Send
                                                    </button>
                                                )}

                                            {/* Regular retry button for other errors */}
                                            {lastError && !isSendingQuotation && submitAttempts > 0 && !fallbackMode &&
                                                !(lastError.includes('SqlServerRetryingExecutionStrategy') ||
                                                    lastError.includes('execution strategy') ||
                                                    lastError.includes('user-initiated transactions')) && (
                                                    <button
                                                        type="button"
                                                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                                        onClick={() => handleSendQuotation(0)}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Retry
                                                    </button>
                                                )}

                                            <button
                                                type="submit"
                                                className="bg-[#2b4b93] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                                disabled={isSendingQuotation || Object.values(quotationStatus).some(status => status !== 'available')}
                                                title={Object.values(quotationStatus).some(status => status !== 'available') ? 'Please remove problematic requirements before sending' : ''}
                                            >
                                                {isSendingQuotation ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        {isRetrying ? `Retrying... (Attempt ${submitAttempts + 1})` : 'Sending...'}
                                                    </>
                                                ) : Object.values(quotationStatus).some(status => status !== 'available') ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 17.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        Cannot Send - Issues Detected
                                                    </>
                                                ) : (
                                                    <>
                                                        <DollarSign className="w-4 h-4" />
                                                        Send Quotation
                                                    </>
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
                                            className={`transition-all duration-200 ${selectedIds.includes(req.requirementId)
                                                    ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm'
                                                    : 'hover:bg-gray-50'
                                                } ${req.isNew ? 'bg-yellow-50 animate-highlight' : ''}`}
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
