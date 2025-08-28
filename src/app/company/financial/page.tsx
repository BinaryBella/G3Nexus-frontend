"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, CreditCard, TrendingUp, Receipt, FileText, ArrowUpRight, ArrowDownRight, Eye, Search, Filter, Download, ExternalLink, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/app/lib/services/paymentService';
import { projectService, Project } from '@/app/lib/services/projectService';
import { clientService, Client } from '@/app/lib/services/clientService';
import { companyService } from '@/app/lib/services/companyService';
import { Payment, Company } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';
import Pagination from '@/app/components/Pagination';
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { hasAccess } from "@/app/lib/utils/roleAccess";

// Enhanced payment type with related data
interface EnhancedPayment extends Payment {
    projectName?: string;
    clientName?: string;
    companyName?: string;
}

const PaymentTypeBadge = ({ type }: { type: string }) => {
    const colorMap: Record<string, string> = {
        'Initial Payment': "bg-blue-100 text-blue-800 border-blue-200",
        'Milestone Payment': "bg-green-100 text-green-800 border-green-200",
        'Final Payment': "bg-purple-100 text-purple-800 border-purple-200",
        'Partial Payment': "bg-yellow-100 text-yellow-800 border-yellow-200"
    };

    const colorClass = colorMap[type] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {type}
        </span>
    );
};

// Payment Details Modal Component (matching Bug modal structure)
const PaymentModal = ({ payment, isOpen, onClose }: { 
    payment: EnhancedPayment | null; 
    isOpen: boolean; 
    onClose: () => void; 
}) => {
    if (!isOpen || !payment) return null;

    const attachmentUrl = payment.attachment ? `/uploads/${payment.attachment}` : '';
    const isImage = payment.attachment && (payment.attachment.includes('.jpg') || payment.attachment.includes('.jpeg') || payment.attachment.includes('.png'));
    const isPdf = payment.attachment && payment.attachment.includes('.pdf');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                        <p className="text-sm text-gray-600">Complete payment information</p>
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
                    {/* Payment Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Description
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 font-medium">
                                {payment.paymentDescription || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    {/* Payment Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Type
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <PaymentTypeBadge type={payment.paymentType || 'Payment'} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <span className="text-lg font-semibold text-green-600">
                                    ${parseFloat(payment.paymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Date
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">
                                    {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    payment.isActive
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                    {payment.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Project and Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">
                                    {payment.projectName || `Project #${payment.projectId}`}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">
                                    {payment.clientName || `Client #${payment.clientId}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Company Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900">
                                {payment.companyName || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Attachment Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attachment
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            {payment.attachment ? (
                                <div>
                                    {isImage ? (
                                        <div className="text-center mb-4">
                                            <img 
                                                src={attachmentUrl} 
                                                alt="Payment attachment" 
                                                className="max-w-full max-h-64 object-contain mx-auto rounded-lg border"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-8 w-8 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {payment.attachment.split('/').pop() || 'Attachment'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {isPdf ? 'PDF Document' : 'Click to download'}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                {isPdf ? <ExternalLink className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                                            </a>
                                        </div>
                                    )}
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

export default function CompanyFinancialDashboard() {
    const [searchText, setSearchText] = useState('');
    const [selectedPaymentType, setSelectedPaymentType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState<EnhancedPayment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 6;
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || !hasAccess(user.role, "Quotation", "VIEW")) {
                router.push("/access-denied");
            }
        }
    }, [user, loading, router]);

    // Fetch all required data
    const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[], Error>({
        queryKey: ['payments'],
        queryFn: paymentService.getAllPayments,
    });

    const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[], Error>({
        queryKey: ['projects'],
        queryFn: projectService.getAllProjects,
    });

    const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[], Error>({
        queryKey: ['clients'],
        queryFn: clientService.getAllClients,
    });

    const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[], Error>({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

    const isLoading = paymentsLoading || projectsLoading || clientsLoading || companiesLoading;

    // Enhanced payments with related data
    const enhancedPayments = useMemo(() => {
        return payments.map(payment => {
            const project = projects.find(p => p.projectId === payment.projectId);
            const client = clients.find(c => c.clientId === payment.clientId);
            const company = client ? companies.find(comp => comp.companyId === client.companyId) : null;

            return {
                ...payment,
                projectName: project?.projectName,
                clientName: client?.name,
                companyName: company?.companyName
            } as EnhancedPayment;
        });
    }, [payments, projects, clients, companies]);

    // Reset to first page when search text changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    // Filter payments based on search and filters
    const filteredPayments = useMemo(() => {
        return enhancedPayments.filter(payment => {
            if (searchText.trim() === '') {
                const matchesType = selectedPaymentType === '' || payment.paymentType === selectedPaymentType;
                return matchesType;
            }

            // Helper function to check if search text matches beginning of any word
            const matchesWordBeginning = (text: string) => {
                if (!text) return false;
                const words = text.toLowerCase().split(/\s+/);
                const searchLower = searchText.toLowerCase();
                return words.some(word => word.startsWith(searchLower));
            };

            const matchesSearch = matchesWordBeginning(payment.projectName || '') || 
                matchesWordBeginning(payment.clientName || '') ||
                matchesWordBeginning(payment.companyName || '') ||
                matchesWordBeginning(payment.paymentDescription) ||
                matchesWordBeginning(payment.paymentType);

            const matchesType = selectedPaymentType === '' || payment.paymentType === selectedPaymentType;

            return matchesSearch && matchesType;
        });
    }, [enhancedPayments, searchText, selectedPaymentType]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewMore = (payment: EnhancedPayment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    // Calculate financial metrics
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.paymentAmount || '0'), 0);
    
    const thisMonthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    
    const lastMonthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear;
    });

    const thisMonthRevenue = thisMonthPayments.reduce((sum, payment) => sum + parseFloat(payment.paymentAmount || '0'), 0);
    const lastMonthRevenue = lastMonthPayments.reduce((sum, payment) => sum + parseFloat(payment.paymentAmount || '0'), 0);
    
    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;
    const activePayments = payments.filter(payment => payment.isActive).length;

    // Get unique payment types for filter
    const paymentTypes = Array.from(new Set(payments.map(p => p.paymentType)));

    const stats = {
        totalRevenue,
        thisMonthRevenue,
        revenueGrowth,
        activePayments,
        totalTransactions: payments.length
    };

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading financial data...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <DollarSign className="h-8 w-8 text-[#3450A3]" />
                                Financial Details
                            </h1>
                            <p className="text-gray-600 mt-2">Overview of your financial performance and payment records</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${stats.thisMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-400" />
                            </div>
                            <div className={`flex items-center text-sm mt-2 ${
                                stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {stats.revenueGrowth >= 0 ? (
                                    <ArrowUpRight className="h-4 w-4 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 mr-1" />
                                )}
                                {Math.abs(stats.revenueGrowth).toFixed(1)}%
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Payments</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.activePayments}</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-blue-400" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                                </div>
                                <Receipt className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search payments by project, client, company, or description..."
                                className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                value={selectedPaymentType}
                                onChange={(e) => setSelectedPaymentType(e.target.value)}
                                className="text-black pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] appearance-none bg-white w-full sm:w-48"
                            >
                                <option value="">All Types</option>
                                {paymentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {filteredPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-600">
                                {searchText ? 'Try adjusting your search criteria.' : 'No payment records available.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedPayments.map((payment) => (
                                            <tr key={payment.paymentId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {payment.projectName || `Project #${payment.projectId}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {payment.companyName || 'N/A'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {payment.clientName || `Client #${payment.clientId}`}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <PaymentTypeBadge type={payment.paymentType || 'Payment'} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-green-600">
                                                        ${parseFloat(payment.paymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewMore(payment)}
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
                {filteredPayments.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={filteredPayments.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}

                {/* Payment Modal */}
                <PaymentModal
                    payment={selectedPayment}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            </div>
        </ProtectedRoute>
    );
}
