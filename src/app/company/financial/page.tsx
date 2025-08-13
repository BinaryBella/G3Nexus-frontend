"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, CreditCard, TrendingUp, Calendar, Receipt, FileText, Plus, ArrowUpRight, ArrowDownRight, Eye, Search, Filter, Download, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/app/lib/services/paymentService';
import { projectService, Project } from '@/app/lib/services/projectService';
import { clientService, Client } from '@/app/lib/services/clientService';
import { companyService } from '@/app/lib/services/companyService';
import { Payment, Company } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

// Enhanced payment type with related data
interface EnhancedPayment extends Payment {
    projectName?: string;
    clientName?: string;
    companyName?: string;
}

const QuickStatsCard = ({ title, value, icon: Icon, color, trend }: { 
    title: string, 
    value: string | number, 
    icon: any, 
    color: string,
    trend?: { value: string, isPositive: boolean }
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-8 w-8 text-white" />
                </div>
            </div>
            {trend && (
                <div className={`flex items-center text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isPositive ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {trend.value}
                </div>
            )}
        </div>
    );
};

const PaymentAttachmentModal = ({ attachment, isOpen, onClose }: { 
    attachment: string, 
    isOpen: boolean, 
    onClose: () => void 
}) => {
    if (!isOpen) return null;

    const attachmentUrl = attachment ? `/uploads/${attachment}` : '';
    const isImage = attachment && (attachment.includes('.jpg') || attachment.includes('.jpeg') || attachment.includes('.png'));
    const isPdf = attachment && attachment.includes('.pdf');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Payment Attachment</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>
                <div className="p-4">
                    {!attachment ? (
                        <div className="text-center py-8">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No attachment available</p>
                        </div>
                    ) : isImage ? (
                        <div className="text-center">
                            <img 
                                src={attachmentUrl} 
                                alt="Payment attachment" 
                                className="max-w-full max-h-[60vh] object-contain mx-auto"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                                }}
                            />
                            <div style={{ display: 'none' }} className="text-center py-8">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Unable to load image</p>
                            </div>
                        </div>
                    ) : isPdf ? (
                        <div className="text-center py-8">
                            <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-700 mb-4">PDF Document</p>
                            <a 
                                href={attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open PDF
                            </a>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-700 mb-4">File: {attachment}</p>
                            <a 
                                href={attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PaymentTableRow = ({ payment, onViewAttachment }: { 
    payment: EnhancedPayment, 
    onViewAttachment: (attachment: string) => void 
}) => {
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {payment.projectName || `Project #${payment.projectId}`}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {payment.clientName || `Client #${payment.clientId}`}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {payment.companyName || 'N/A'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {payment.paymentType}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-green-600">
                    ${parseFloat(payment.paymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    onClick={() => onViewAttachment(payment.attachment)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    View More
                </button>
            </td>
        </tr>
    );
};

export default function CompanyFinancialDashboard() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPaymentType, setSelectedPaymentType] = useState('');
    const [selectedAttachment, setSelectedAttachment] = useState<string>('');
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

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
            const client = clients.find(c => c.id === payment.clientId);
            const company = client ? companies.find(comp => comp.companyId === client.companyId) : null;

            return {
                ...payment,
                projectName: project?.projectName,
                clientName: client?.name,
                companyName: company?.companyName
            } as EnhancedPayment;
        });
    }, [payments, projects, clients, companies]);

    // Filter payments based on search and filters
    const filteredPayments = useMemo(() => {
        return enhancedPayments.filter(payment => {
            const matchesSearch = searchTerm === '' || 
                payment.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.paymentDescription.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = selectedPaymentType === '' || payment.paymentType === selectedPaymentType;

            return matchesSearch && matchesType;
        });
    }, [enhancedPayments, searchTerm, selectedPaymentType]);

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

    const handleViewAttachment = (attachment: string) => {
        setSelectedAttachment(attachment);
        setIsAttachmentModalOpen(true);
    };

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading financial data...</p>
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
                                Financial Dashboard
                            </h1>
                            <p className="text-gray-600 mt-2">Overview of your financial performance and payment records</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <QuickStatsCard
                            title="Total Revenue"
                            value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            icon={DollarSign}
                            color="bg-green-500"
                        />
                        <QuickStatsCard
                            title="This Month"
                            value={`$${thisMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            icon={TrendingUp}
                            color="bg-blue-500"
                            trend={{
                                value: `${Math.abs(revenueGrowth).toFixed(1)}%`,
                                isPositive: revenueGrowth >= 0
                            }}
                        />
                        <QuickStatsCard
                            title="Active Payments"
                            value={activePayments}
                            icon={CreditCard}
                            color="bg-purple-500"
                        />
                        <QuickStatsCard
                            title="Total Transactions"
                            value={payments.length}
                            icon={Receipt}
                            color="bg-gray-500"
                        />
                    </div>
                </div>

                {/* Payment Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Table Header with Search and Filters */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Payment Records</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Showing {filteredPayments.length} of {payments.length} payments
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search payments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] w-full sm:w-64"
                                    />
                                </div>

                                {/* Payment Type Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <select
                                        value={selectedPaymentType}
                                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                                        className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] appearance-none bg-white"
                                    >
                                        <option value="">All Types</option>
                                        {paymentTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Project Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Company Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">No payments found</p>
                                                <p className="text-sm">Try adjusting your search or filter criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <PaymentTableRow
                                            key={payment.paymentId}
                                            payment={payment}
                                            onViewAttachment={handleViewAttachment}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Attachment Modal */}
                <PaymentAttachmentModal
                    attachment={selectedAttachment}
                    isOpen={isAttachmentModalOpen}
                    onClose={() => setIsAttachmentModalOpen(false)}
                />
            </div>
        </ProtectedRoute>
    );
}
