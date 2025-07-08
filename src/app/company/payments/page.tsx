"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSearch, Search, Plus, CreditCard, AlertTriangle, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/app/lib/services/paymentService';
import { Payment } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

const PaymentTypeBadge = ({ type }: { type: string }) => {
    const colorMap: Record<string, string> = {
        'Milestone': "bg-blue-100 text-blue-800 border-blue-200",
        'Final': "bg-green-100 text-green-800 border-green-200",
        'Deposit': "bg-yellow-100 text-yellow-800 border-yellow-200",
        'Consultation': "bg-purple-100 text-purple-800 border-purple-200",
        'Maintenance': "bg-orange-100 text-orange-800 border-orange-200"
    };

    const colorClass = colorMap[type] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {type}
        </span>
    );
};

const StatusBadge = ({ status }: { status: boolean }) => {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            status 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-red-100 text-red-800 border-red-200"
        }`}>
            {status ? 'Active' : 'Inactive'}
        </span>
    );
};

export default function CompanyPaymentsPage() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");

    const { data: payments = [], error, isLoading } = useQuery<Payment[], Error>({
        queryKey: ['payments'],
        queryFn: paymentService.getAllPayments,
    });

    const filteredPayments = payments.filter(payment =>
        payment.paymentDescription?.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.paymentType?.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.paymentAmount?.toString().includes(searchText.toLowerCase())
    );

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

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
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
            <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
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
        <ProtectedRoute allowedRoles={[COMPANY_ADMIN, COMPANY_DEVELOPER]}>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <CreditCard className="h-8 w-8 text-[#3450A3]" />
                                Payments
                            </h1>
                            <p className="text-gray-600 mt-2">Manage and track payment records</p>
                        </div>
                        <button
                            onClick={() => router.push('/company/payments/add-payment')}
                            className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Add Payment
                        </button>
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
                                <TrendingUp className="h-8 w-8 text-blue-400" />
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
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search payments by description, type, or amount..."
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
                            <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-600">
                                {searchText ? 'Try adjusting your search criteria.' : 'Get started by adding your first payment.'}
                            </p>
                            {!searchText && (
                                <button
                                    onClick={() => router.push('/company/payments/add-payment')}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.paymentId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Project #{payment.projectId}</p>
                                                    <p className="text-sm text-gray-600 truncate max-w-xs">{payment.paymentDescription}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-green-600">${parseFloat(payment.paymentAmount || '0').toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <PaymentTypeBadge type={payment.paymentType || 'Other'} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={payment.isActive} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/company/payments/edit-payment?id=${payment.paymentId}`)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => console.log(`View details for payment ${payment.paymentId}`)}
                                                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                                    >
                                                        View
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
            </div>
        </ProtectedRoute>
    );
}
