'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CreditCard, DollarSign, Calendar, FileText, Search, AlertTriangle, CheckCircle, Eye, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/app/lib/services/paymentService';
import { projectService } from '@/app/lib/services/projectService';
import { Payment } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { CLIENT_ADMIN, CLIENT_USER, ADVANCE_PAYMENT, BUG_PAYMENT, REQUIREMENT_PAYMENT, FINAL_PAYMENT } from '@/app/lib/constants';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

const getReadablePaymentType = (paymentType: string): string => {
    const paymentTypeMap = {
        [ADVANCE_PAYMENT]: 'Advance',
        [FINAL_PAYMENT]: 'Final',
        [REQUIREMENT_PAYMENT]: 'Requirement',
        [BUG_PAYMENT]: 'Bug Fix',
    };
    return paymentTypeMap[paymentType as keyof typeof paymentTypeMap] || paymentType;
};

const PaymentTypeBadge = ({ type }: { type: string }) => {
    const colorMap: Record<string, string> = {
        [ADVANCE_PAYMENT]: "bg-blue-100 text-blue-800 border-blue-200",
        [FINAL_PAYMENT]: "bg-green-100 text-green-800 border-green-200",
        [REQUIREMENT_PAYMENT]: "bg-yellow-100 text-yellow-800 border-yellow-200",
        [BUG_PAYMENT]: "bg-red-100 text-red-800 border-red-200",
    };

    const colorClass = colorMap[type] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {getReadablePaymentType(type)}
        </span>
    );
};

// Modal component for viewing payment attachments
const AttachmentModal = ({ isOpen, onClose, payment, projectNames }: {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    projectNames: Record<number, string>;
}) => {
    if (!isOpen || !payment) return null;

    const hasAttachment = payment.attachment && payment.attachment.trim() !== '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {projectNames[payment.projectId] || `Project #${payment.projectId}`}
                        </h2>
                        <p className="text-sm text-gray-600">Payment Details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Attachments Section */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-3 block">Payment Slip / Receipt</label>
                        {hasAttachment ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <Image
                                            src={payment.attachment.startsWith('http') ? payment.attachment : `/uploads/${payment.attachment}`}
                                            alt="Payment slip"
                                            width={400}
                                            height={300}
                                            className="rounded-lg object-cover max-w-full h-auto"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (nextElement) {
                                                    nextElement.style.display = 'block';
                                                }
                                            }}
                                        />
                                        <div className="hidden text-gray-500">
                                            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                                            <p>Unable to load image</p>
                                            <p className="text-sm mt-1">File: {payment.attachment}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No payment slip available for this payment</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientPaymentsPage: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [projectNames, setProjectNames] = useState<Record<number, string>>({});
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');

    const { data: payments = [], error, isLoading } = useQuery<Payment[], Error>({
        queryKey: ['payments', 'client', user?.email],
        queryFn: () => paymentService.getPaymentsByClient(user?.email || ''),
        enabled: !!user?.email,
    });

    // Fetch project data when projectId is available
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectService.getProjectById(Number(projectId)),
        enabled: !!projectId,
    });

    // Fetch project names for all payments
    useEffect(() => {
        const fetchProjectNames = async () => {
            if (payments.length > 0) {
                const projectIds = Array.from(new Set(payments.map(payment => payment.projectId)));
                const projectNamesMap: Record<number, string> = {};

                try {
                    await Promise.all(
                        projectIds.map(async (projectId) => {
                            try {
                                const project = await projectService.getProjectById(projectId);
                                projectNamesMap[projectId] = project.projectName;
                            } catch (error) {
                                console.error(`Failed to fetch project ${projectId}:`, error);
                                projectNamesMap[projectId] = `Project #${projectId}`;
                            }
                        })
                    );
                    setProjectNames(projectNamesMap);
                } catch (error) {
                    console.error('Error fetching project names:', error);
                }
            }
        };

        fetchProjectNames();
    }, [payments]);

    const filteredPayments = payments.filter(payment => {
        const projectName = projectNames[payment.projectId] || '';
        return payment.paymentDescription?.toLowerCase().includes(searchText.toLowerCase()) ||
            payment.paymentType?.toLowerCase().includes(searchText.toLowerCase()) ||
            payment.paymentAmount?.toString().includes(searchText.toLowerCase()) ||
            projectName.toLowerCase().includes(searchText.toLowerCase());
    });

    const stats = {
        total: payments.length,
        totalAmount: payments.reduce((sum, payment) => sum + parseFloat(payment.paymentAmount || '0'), 0),
        active: payments.filter(payment => payment.isActive).length,
        thisMonth: payments.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            const currentDate = new Date();
            return paymentDate.getMonth() === currentDate.getMonth() &&
                paymentDate.getFullYear() === currentDate.getFullYear();
        }).length
    };

    const openModal = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={[CLIENT_ADMIN, CLIENT_USER]}>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading payments...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute allowedRoles={[CLIENT_ADMIN, CLIENT_USER]}>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">Error loading payments. Please try again.</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={[CLIENT_ADMIN, CLIENT_USER]}>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    {/* Breadcrumb for project-specific view */}
                    {projectId && (
                        <div className="mb-4">
                            <button
                                onClick={() => router.push(`/client/projects/${projectId}`)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
                            >
                                ← Back to Project
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FileText className="h-8 w-8 text-[#3450A3]" />
                                {projectId
                                    ? (project?.projectName || 'Project Payments')
                                    : 'Payments'
                                }
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {projectId
                                    ? 'Project payments and specifications'
                                    : 'Manage project payments and specifications'
                                }
                            </p>
                        </div>
                        {/* Add Payment Button (visible when payments exist) */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => {
                                    const addPaymentUrl = projectId
                                        ? `/client/payments/add-payment?projectId=${projectId}`
                                        : '/client/payments/add-payment';
                                    router.push(addPaymentUrl);
                                }}
                                className="bg-[#2b4b93] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add Payment
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                    <p className="text-2xl font-bold text-green-600">${stats.totalAmount.toLocaleString()}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-400" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-blue-400" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search payments by project name, description, type, or amount..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {filteredPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-600">
                                {searchText ? 'Try adjusting your search criteria.' : 'Payment information will appear here when available.'}
                            </p>
                            {!searchText && (
                            <button
                                onClick={() => {
                                    const addPaymentUrl = projectId
                                        ? `/client/payments/add-payment?projectId=${projectId}`
                                        : '/client/payments/add-payment';
                                    router.push(addPaymentUrl);
                                }}
                                className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Payment
                            </button>
                        )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.paymentId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {projectNames[payment.projectId] || `Project #${payment.projectId}`}
                                                    </p>
                                                    <p className="text-sm text-gray-600 truncate max-w-xs">{payment.paymentDescription}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-green-600">${parseFloat(payment.paymentAmount || '0').toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <PaymentTypeBadge type={payment.paymentType || 'Other'} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openModal(payment)}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="text-sm font-medium">View More</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Attachment Modal */}
                <AttachmentModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    payment={selectedPayment}
                    projectNames={projectNames}
                />
            </div>
        </ProtectedRoute>
    );
};

export default ClientPaymentsPage;
