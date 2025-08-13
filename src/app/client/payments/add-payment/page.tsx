'use client';

import React, { useState } from 'react';
import { CreditCard, Upload, X, ArrowLeft, DollarSign, Calendar, FileText, AlertCircle, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/app/lib/services/paymentService';
import { projectService } from '@/app/lib/services/projectService';
import { fileService } from '@/app/lib/services/fileService';
import { Payment } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { CLIENT_ADMIN, CLIENT_USER } from '@/app/lib/constants';
import { useAuth } from '@/app/contexts/AuthContext';

interface PaymentFormData {
    projectId: string;
    paymentAmount: string;
    paymentType: string;
    paymentDescription: string;
    paymentDate: string;
    attachment?: File;
}

const AddPaymentPage: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<PaymentFormData>({
        projectId: '',
        paymentAmount: '',
        paymentType: 'Milestone',
        paymentDescription: '',
        paymentDate: new Date().toISOString().split('T')[0],
    });

    const [attachment, setAttachment] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch client's projects
    const { data: projects = [], isLoading: projectsLoading } = useQuery({
        queryKey: ['projects', 'client', user?.email],
        queryFn: () => projectService.getProjectsByClient(user?.email || ''),
        enabled: !!user?.email,
    });

    const paymentTypes = [
        { value: 'Milestone', label: 'Milestone Payment' },
        { value: 'Final', label: 'Final Payment' },
        { value: 'Deposit', label: 'Deposit' },
        { value: 'Refund', label: 'Refund' },
    ];

    const createPaymentMutation = useMutation({
        mutationFn: async (data: { paymentData: Omit<Payment, 'paymentId'>; attachment?: File }) => {
            let attachmentFilename = '';

            // First upload the file if there's an attachment
            if (data.attachment) {
                attachmentFilename = await fileService.saveFile(data.attachment);
            }

            // Create payment data with the attachment filename
            const paymentDataWithAttachment = {
                ...data.paymentData,
                attachment: attachmentFilename
            };

            // Create the payment
            const payment = await paymentService.addPayment(paymentDataWithAttachment);
            return payment;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            router.push('/client/payments');
        },
        onError: (error) => {
            console.error('Error creating payment:', error);
            setErrors({ submit: 'Failed to create payment. Please try again.' });
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, attachment: 'Please upload a valid image (JPEG, PNG) or PDF file.' }));
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, attachment: 'File size must be less than 10MB.' }));
                return;
            }

            setAttachment(file);

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl('');
            }

            setErrors(prev => ({ ...prev, attachment: '' }));
        }
    };

    const removeFile = () => {
        setAttachment(null);
        setPreviewUrl('');
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.projectId) {
            newErrors.projectId = 'Please select a project';
        }

        if (!formData.paymentAmount.trim()) {
            newErrors.paymentAmount = 'Payment amount is required';
        } else if (isNaN(Number(formData.paymentAmount)) || Number(formData.paymentAmount) <= 0) {
            newErrors.paymentAmount = 'Please enter a valid amount';
        }

        if (!formData.paymentDescription.trim()) {
            newErrors.paymentDescription = 'Payment description is required';
        }

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const paymentData: Omit<Payment, 'paymentId'> = {
                projectId: parseInt(formData.projectId),
                paymentAmount: formData.paymentAmount,
                paymentType: formData.paymentType,
                paymentDescription: formData.paymentDescription,
                paymentDate: formData.paymentDate,
                attachment: '', // Will be set by the mutation function
                isActive: true
            };

            await createPaymentMutation.mutateAsync({
                paymentData,
                attachment: attachment || undefined
            });
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={[CLIENT_ADMIN, CLIENT_USER]}>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/client/payments')}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Payments
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">Make Payment</h1>
                    </div>
                    <p className="text-gray-600">Submit your payment information and upload proof of payment</p>
                </div>

                {/* Payment Form */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Alert */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>{errors.submit}</span>
                                </div>
                            )}

                            {/* Project Selection */}
                            <div>
                                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Project *
                                </label>
                                <div className="relative">
                                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <select
                                        id="projectId"
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleInputChange}
                                        className={`w-full text-black pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.projectId ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        disabled={projectsLoading}
                                    >
                                        <option value="">
                                            {projectsLoading ? 'Loading projects...' : 'Select a project'}
                                        </option>
                                        {projects.map(project => (
                                            <option key={project.projectId} value={project.projectId.toString()}>
                                                {project.projectName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.projectId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                                )}
                            </div>

                            {/* Payment Amount */}
                            <div>
                                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Amount *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="number"
                                        id="paymentAmount"
                                        name="paymentAmount"
                                        value={formData.paymentAmount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className={`w-full text-black pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.paymentAmount ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                                {errors.paymentAmount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
                                )}
                            </div>

                            {/* Payment Type */}
                            <div>
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Type *
                                </label>
                                <select
                                    id="paymentType"
                                    name="paymentType"
                                    value={formData.paymentType}
                                    onChange={handleInputChange}
                                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {paymentTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Description */}
                            <div>
                                <label htmlFor="paymentDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Description *
                                </label>
                                <textarea
                                    id="paymentDescription"
                                    name="paymentDescription"
                                    value={formData.paymentDescription}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Describe what this payment is for..."
                                    className={`w-full text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.paymentDescription ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                />
                                {errors.paymentDescription && (
                                    <p className="mt-1 text-sm text-red-600">{errors.paymentDescription}</p>
                                )}
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Date *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="date"
                                        id="paymentDate"
                                        name="paymentDate"
                                        value={formData.paymentDate}
                                        onChange={handleInputChange}
                                        className={`w-full text-black pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                                {errors.paymentDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
                                )}
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Proof (Receipt/Screenshot)
                                </label>

                                {!attachment ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <input
                                            type="file"
                                            id="attachment"
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="attachment" className="cursor-pointer">
                                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-2">
                                                Click to upload payment proof
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                PNG, JPG, or PDF up to 10MB
                                            </p>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="border border-gray-300 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                ) : (
                                                    <FileText className="h-16 w-16 text-gray-400" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{attachment.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {errors.attachment && (
                                    <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    type="button"
                                    onClick={() => router.push('/client/payments')}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AddPaymentPage;
