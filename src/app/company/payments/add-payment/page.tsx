"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, X } from 'lucide-react';
import ProtectedRoute from '@/app/components/ProtectedRoute';

const PaymentForm = () => {
    const router = useRouter();
    const [paymentData, setPaymentData] = useState({
        projectName: '',
        paymentAmount: '',
        paymentDescription: '',
        paymentDate: '',
        paymentMethod: '',
        isActive: true
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setPaymentData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validate required fields
        if (!paymentData.projectName || !paymentData.paymentAmount || !paymentData.paymentDescription || !paymentData.paymentDate) {
            setError('Please fill in all required fields');
            return;
        }
        
        // Validate payment amount is positive
        if (parseFloat(paymentData.paymentAmount) <= 0) {
            setError('Payment amount must be greater than zero');
            return;
        }
        
        try {
            setIsSubmitting(true);
            // TODO: Add payment submission logic here
            console.log('Payment data:', paymentData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccess(true);
            
            setTimeout(() => {
                router.push('/company/payments');
            }, 1500);
        } catch (error) {
            setError('Failed to add payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/company/payments');
    };

    if (success) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Added Successfully!</h3>
                    <p className="text-gray-600">Redirecting to payments list...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleCancel}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Payments
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-[#3450A3]" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add New Payment</h1>
                            <p className="text-gray-600 mt-1">Create a new payment record</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex">
                                    <X className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <p className="mt-1 text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>

                            {/* Project Name */}
                            <div>
                                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name *
                                </label>
                                <select
                                    id="projectName"
                                    name="projectName"
                                    value={paymentData.projectName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    required
                                >
                                    <option value="">Select Project</option>
                                    <option value="project1">Project Alpha</option>
                                    <option value="project2">Project Beta</option>
                                    <option value="project3">Project Gamma</option>
                                    <option value="project4">E-commerce Platform</option>
                                    <option value="project5">Mobile App Development</option>
                                </select>
                            </div>

                            {/* Payment Amount */}
                            <div>
                                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Amount *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="paymentAmount"
                                        name="paymentAmount"
                                        value={paymentData.paymentAmount}
                                        onChange={handleChange}
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method *
                                </label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={paymentData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    required
                                >
                                    <option value="">Select Payment Method</option>
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Date *
                                </label>
                                <input
                                    type="date"
                                    id="paymentDate"
                                    name="paymentDate"
                                    value={paymentData.paymentDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    required
                                />
                            </div>

                            {/* Payment Description */}
                            <div>
                                <label htmlFor="paymentDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Description *
                                </label>
                                <textarea
                                    id="paymentDescription"
                                    name="paymentDescription"
                                    value={paymentData.paymentDescription}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    placeholder="Describe the payment details, purpose, or additional notes"
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={paymentData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-[#3450A3] focus:ring-[#3450A3] border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                                </label>
                                <p className="mt-1 text-sm text-gray-500">
                                    Inactive payments will be hidden from most views
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Adding Payment...' : 'Add Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default PaymentForm;
