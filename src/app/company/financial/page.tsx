"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, CreditCard, TrendingUp, Calendar, Receipt, FileText, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/app/lib/services/paymentService';
import { Payment } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { COMPANY_ADMIN } from '@/app/lib/constants';

const QuickStatsCard = ({ title, value, icon: Icon, color, trend }: { 
    title: string, 
    value: string | number, 
    icon: any, 
    color: string,
    trend?: { value: string, isPositive: boolean }
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {trend.value}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm text-gray-600">{title}</p>
            </div>
        </div>
    );
};

const RecentPaymentRow = ({ payment }: { payment: Payment }) => {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">Project #{payment.projectId}</p>
                    <p className="text-xs text-gray-500">{payment.paymentType}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-green-600">${parseFloat(payment.paymentAmount || '0').toLocaleString()}</p>
                <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default function CompanyFinancialDashboard() {
    const router = useRouter();

    const { data: payments = [], isLoading } = useQuery<Payment[], Error>({
        queryKey: ['payments'],
        queryFn: paymentService.getAllPayments,
    });

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
    
    const recentPayments = payments
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
        .slice(0, 5);

    const activePayments = payments.filter(payment => payment.isActive).length;

    return (
        <ProtectedRoute allowedRoles={[COMPANY_ADMIN]}>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <DollarSign className="h-8 w-8 text-green-600" />
                                Financial Dashboard
                            </h1>
                            <p className="text-gray-600 mt-2">Overview of your financial performance and payment records</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => router.push('/company/payments')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <CreditCard className="h-5 w-5" />
                                View All Payments
                            </button>
                            {/* <button
                                onClick={() => router.push('/company/payments/add-payment')}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Add Payment
                            </button> */}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <QuickStatsCard
                            title="Total Revenue"
                            value={`$${totalRevenue.toLocaleString()}`}
                            icon={DollarSign}
                            color="bg-green-600"
                            trend={{
                                value: `${Math.abs(revenueGrowth).toFixed(1)}%`,
                                isPositive: revenueGrowth >= 0
                            }}
                        />
                        <QuickStatsCard
                            title="This Month"
                            value={`$${thisMonthRevenue.toLocaleString()}`}
                            icon={Calendar}
                            color="bg-blue-600"
                        />
                        <QuickStatsCard
                            title="Active Payments"
                            value={activePayments}
                            icon={CreditCard}
                            color="bg-purple-600"
                        />
                        <QuickStatsCard
                            title="Total Payments"
                            value={payments.length}
                            icon={Receipt}
                            color="bg-orange-600"
                        />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Payments */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
                                    <button
                                        onClick={() => router.push('/company/payments')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View All
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                                        <p className="mt-2 text-gray-600">Loading payments...</p>
                                    </div>
                                ) : recentPayments.length > 0 ? (
                                    <div className="space-y-1">
                                        {recentPayments.map((payment) => (
                                            <RecentPaymentRow key={payment.paymentId} payment={payment} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                                        <p className="text-gray-600 mb-4">Get started by adding your first payment.</p>
                                        <button
                                            onClick={() => router.push('/company/payments/add-payment')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Add Payment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Revenue Chart */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/company/payments/add-payment')}
                                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Plus className="h-5 w-5 text-green-600" />
                                        <span className="font-medium">Add Payment</span>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => router.push('/company/payments')}
                                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                        <span className="font-medium">View All Payments</span>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => router.push('/company/financial/add-invoice')}
                                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                        <span className="font-medium">Create Invoice</span>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Monthly Comparison */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">This Month</span>
                                        <span className="text-sm font-semibold text-gray-900">${thisMonthRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full" 
                                            style={{ width: `${Math.min((thisMonthRevenue / Math.max(thisMonthRevenue, lastMonthRevenue)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Last Month</span>
                                        <span className="text-sm font-semibold text-gray-900">${lastMonthRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${Math.min((lastMonthRevenue / Math.max(thisMonthRevenue, lastMonthRevenue)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
