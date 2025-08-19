"use client";

import React, { useState, useMemo } from 'react';
import { Receipt, DollarSign, User, Calendar, Search, Filter, Eye, X, FileText, Bug, Paperclip } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { quotationService } from '@/app/lib/services/quotationService';
import { QuotationHistory, QuotationItem } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';
import Pagination from '@/app/components/Pagination';

// Quotation Type Badge Component
const QuotationTypeBadge = ({ type }: { type: string }) => {
    const colorMap: Record<string, string> = {
        'Bug': "bg-red-100 text-red-800 border-red-200",
        'Requirement': "bg-blue-100 text-blue-800 border-blue-200",
        'Feature': "bg-green-100 text-green-800 border-green-200",
        'Enhancement': "bg-purple-100 text-purple-800 border-purple-200",
        'Advanced': "bg-indigo-100 text-indigo-800 border-indigo-200",
        'Final': "bg-green-100 text-green-800 border-green-200"
    };

    const colorClass = colorMap[type] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {type}
        </span>
    );
};

// Priority Badge Component for Items
const PriorityBadge = ({ priority }: { priority: string }) => {
    const colorMap: Record<string, string> = {
        'High': "bg-red-100 text-red-800 border-red-200",
        'Medium': "bg-yellow-100 text-yellow-800 border-yellow-200",
        'Low': "bg-green-100 text-green-800 border-green-200"
    };

    const colorClass = colorMap[priority] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-2 py-1 rounded text-xs font-medium border ${colorClass}`}>
            {priority}
        </span>
    );
};

// Quotation Item Component
const QuotationItemCard = ({ item }: { item: QuotationItem }) => {
    const isRequirement = item.itemType === 'Requirement';
    const isBug = item.itemType === 'Bug';
    
    return (
        <div className={`border rounded-lg p-4 ${
            isRequirement ? 'bg-blue-50 border-blue-200' :
            isBug ? 'bg-red-50 border-red-200' :
            'bg-gray-50 border-gray-200'
        }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isRequirement ? <FileText className="h-4 w-4 text-blue-600" /> :
                     isBug ? <Bug className="h-4 w-4 text-red-600" /> :
                     <Receipt className="h-4 w-4 text-gray-600" />}
                    <span className={`text-sm font-medium ${
                        isRequirement ? 'text-blue-800' :
                        isBug ? 'text-red-800' :
                        'text-gray-800'
                    }`}>
                        {item.itemType}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <PriorityBadge priority={item.priority} />
                    <span className="text-sm font-semibold text-green-600">
                        {item.formattedCost}
                    </span>
                </div>
            </div>
            
            <div className="space-y-2">
                <div>
                    <p className={`font-medium ${
                        isRequirement ? 'text-blue-900' :
                        isBug ? 'text-red-900' :
                        'text-gray-900'
                    }`}>
                        {item.title}
                    </p>
                    <p className={`text-sm ${
                        isRequirement ? 'text-blue-700' :
                        isBug ? 'text-red-700' :
                        'text-gray-700'
                    }`}>
                        Category: {item.category}
                    </p>
                </div>
                
                <div className="mt-2">
                    <p className={`text-sm whitespace-pre-wrap ${
                        isRequirement ? 'text-blue-800' :
                        isBug ? 'text-red-800' :
                        'text-gray-800'
                    }`}>
                        {item.description}
                    </p>
                </div>

                {item.attachment && (
                    <div className="mt-2 flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-600">
                            Attachment: {item.attachment}
                        </span>
                    </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                    Created: {item.formattedCreatedAt}
                </div>
            </div>
        </div>
    );
};

// Quotation Details Modal Component
const QuotationModal = ({ quotation, isOpen, onClose }: { 
    quotation: QuotationHistory | null; 
    isOpen: boolean; 
    onClose: () => void; 
}) => {
    if (!isOpen || !quotation) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-900">Quotation Details</h2>
                        <p className="text-sm text-gray-600">Complete quotation information</p>
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
                    {/* Project Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Information
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <p className="text-gray-900 font-medium">{quotation.projectName}</p>
                            <p className="text-sm text-gray-600">{quotation.projectDescription}</p>
                        </div>
                    </div>

                    {/* Quotation Items */}
                    {quotation.items && quotation.items.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                                {quotation.type === 'Requirement' ? (
                                    <FileText className="h-4 w-4" />
                                ) : quotation.type === 'Bug' ? (
                                    <Bug className="h-4 w-4" />
                                ) : (
                                    <Receipt className="h-4 w-4" />
                                )}
                                {quotation.type} Items ({quotation.items.length})
                            </label>
                            <div className="space-y-3">
                                {quotation.items.map((item, index) => (
                                    <QuotationItemCard key={`${item.itemId}-${index}`} item={item} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Items Message */}
                    {(!quotation.items || quotation.items.length === 0) && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                {quotation.type === 'Requirement' ? (
                                    <FileText className="h-4 w-4" />
                                ) : quotation.type === 'Bug' ? (
                                    <Bug className="h-4 w-4" />
                                ) : (
                                    <Receipt className="h-4 w-4" />
                                )}
                                {quotation.type} Details
                            </label>
                            <div className={`rounded-lg p-4 border ${
                                quotation.type === 'Requirement' ? 'bg-blue-50 border-blue-200' :
                                quotation.type === 'Bug' ? 'bg-red-50 border-red-200' :
                                'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <QuotationTypeBadge type={quotation.type} />
                                        <span className={`text-sm font-medium ${
                                            quotation.type === 'Requirement' ? 'text-blue-800' :
                                            quotation.type === 'Bug' ? 'text-red-800' :
                                            'text-gray-800'
                                        }`}>
                                            {quotation.type === 'Requirement' ? 'Requirement Quotation' :
                                             quotation.type === 'Bug' ? 'Bug Fix Quotation' :
                                             `${quotation.type} Quotation`}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className={`text-sm ${
                                        quotation.type === 'Requirement' ? 'text-blue-700' :
                                        quotation.type === 'Bug' ? 'text-red-700' :
                                        'text-gray-700'
                                    }`}>
                                        {quotation.type === 'Requirement' ? 
                                            'This quotation is for implementing project requirements.' :
                                         quotation.type === 'Bug' ? 
                                            'This quotation is for fixing reported bugs.' :
                                            `This is a ${quotation.type.toLowerCase()} quotation for the project.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quotation Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Cost
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <span className="text-lg font-semibold text-green-600">
                                    {quotation.formattedTotalCost}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Created Date
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">{quotation.formattedCreatedDate}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900 font-medium">{quotation.clientName}</p>
                                <p className="text-sm text-gray-600">{quotation.clientEmail}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900 font-medium">{quotation.employeeName}</p>
                                <p className="text-sm text-gray-600">{quotation.employeeEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quotation ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quotation ID
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 font-mono">#{quotation.quotationId}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuotationHistoryPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedQuotation, setSelectedQuotation] = useState<QuotationHistory | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 10;

    // Fetch quotations data
    const { data: quotations = [], isLoading, error } = useQuery({
        queryKey: ['quotations'],
        queryFn: quotationService.getAllQuotations,
        retry: 2,
        retryDelay: 1000,
    });

    // Get unique quotation types for filter
    const quotationTypes = useMemo(() => {
        const typeSet = new Set(quotations.map(q => q.type).filter(Boolean));
        const types = Array.from(typeSet);
        return types.sort();
    }, [quotations]);

    // Filter quotations based on search and type
    const filteredQuotations = useMemo(() => {
        return quotations.filter(quotation => {
            const matchesSearch = !searchText || 
                quotation.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
                quotation.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
                quotation.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
                quotation.type.toLowerCase().includes(searchText.toLowerCase()) ||
                quotation.quotationId.toString().includes(searchText);
            
            const matchesType = !selectedType || quotation.type === selectedType;
            
            return matchesSearch && matchesType;
        });
    }, [quotations, searchText, selectedType]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuotations = filteredQuotations.slice(startIndex, startIndex + itemsPerPage);

    // Calculate statistics
    const totalQuotations = quotations.length;
    const totalValue = quotations.reduce((sum, q) => sum + q.totalCost, 0);
    const avgValue = totalQuotations > 0 ? totalValue / totalQuotations : 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewMore = (quotation: QuotationHistory) => {
        setSelectedQuotation(quotation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedQuotation(null);
    };

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
                <div className="min-h-screen bg-gray-50">
                    <div className="p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="h-24 bg-gray-200 rounded"></div>
                                <div className="h-24 bg-gray-200 rounded"></div>
                                <div className="h-24 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-96 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
                <div className="min-h-screen bg-gray-50">
                    <div className="p-6">
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading quotations</h3>
                            <p className="text-gray-600 mb-4">
                                {error instanceof Error ? error.message : 'There was an error loading the quotation data.'}
                            </p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotation History</h1>
                        <p className="text-gray-600">Manage and track all quotations</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalQuotations}</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Receipt className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${avgValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search quotations by client, project, employee, type, or ID..."
                                className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="text-black pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] appearance-none bg-white w-full sm:w-48"
                            >
                                <option value="">All Types</option>
                                {quotationTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Quotations Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden ml-7 mr-7">
                    {filteredQuotations.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
                            <p className="text-gray-600">
                                {searchText ? 'Try adjusting your search criteria.' : 'No quotation records available.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedQuotations.map((quotation) => (
                                            <tr key={quotation.quotationId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {quotation.clientName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {quotation.clientEmail}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {quotation.projectName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate max-w-xs">
                                                            {quotation.projectDescription}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {quotation.employeeName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {quotation.employeeEmail}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <QuotationTypeBadge type={quotation.type} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-green-600">
                                                        {quotation.formattedTotalCost}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {new Date(quotation.createdDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewMore(quotation)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                            title="View More Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
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
                {filteredQuotations.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border mt-4 mr-7 ml-7">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={filteredQuotations.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}

                {/* Quotation Modal */}
                <QuotationModal
                    quotation={selectedQuotation}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            </div>
        </ProtectedRoute>
    );
};

export default QuotationHistoryPage;
