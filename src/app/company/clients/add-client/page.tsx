'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, ArrowRight, X, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clientService } from '@/app/lib/services/clientService';
import { companyService } from '@/app/lib/services/companyService';
import { Client } from '@/app/lib/types';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

const ClientsPage: React.FC = () => {
    const router = useRouter();
    const { canManageClients } = useRoleAccess();
    const [activeTab, setActiveTab] = useState(0);
    const [clientData, setClientData] = useState<Omit<Client, 'id'>>({
        name: '',
        contactNo: '',
        address: '',
        email: '',
        password: '',
        role: '',
        isActive: true,
        companyId: 0,
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [emailValidationError, setEmailValidationError] = useState('');
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    // Fetch companies data
    const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

    // Debounced validation for email
    useEffect(() => {
        const checkClientEmail = async () => {
            if (!clientData.email.trim()) {
                setEmailValidationError('');
                return;
            }

            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(clientData.email.trim())) {
                setEmailValidationError('Please enter a valid email address');
                return;
            }

            setIsCheckingEmail(true);
            try {
                const exists = await clientService.checkClientExists(clientData.email.trim());
                if (exists) {
                    setEmailValidationError('A client with this email already exists');
                } else {
                    setEmailValidationError('');
                }
            } catch (error) {
                setEmailValidationError('');
            } finally {
                setIsCheckingEmail(false);
            }
        };

        const timeoutId = setTimeout(checkClientEmail, 500);
        return () => clearTimeout(timeoutId);
    }, [clientData.email]);

    const addClientMutation = useMutation({
        mutationFn: clientService.addClient,
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
                router.push('/company/clients');
            }, 1500);
        },
        onError: (error: Error) => {
            console.error('Error adding client:', error);
            setError(error.message || 'Failed to add client');
        },
    });

    // Redirect if user doesn't have permission to manage clients
    useEffect(() => {
        if (!canManageClients()) {
            router.push('/company/clients');
            return;
        }
    }, [canManageClients, router]);

    // Don't render if user doesn't have permission
    if (!canManageClients()) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600">You don&apos;t have permission to add clients.</p>
                </div>
            </div>
        );
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setClientData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                : name === 'companyId' 
                    ? parseInt(value, 10) || 0 
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validate all required fields
        if (!clientData.companyId || !clientData.name || !clientData.contactNo || !clientData.address) {
            setError('Please fill in all personal information fields');
            return;
        }
        
        if (!clientData.email || !clientData.password || !clientData.role) {
            setError('Please fill in all account information fields');
            return;
        }
        
        if (clientData.password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (emailValidationError) {
            setError('Please resolve the email issue before submitting');
            return;
        }
        
        try {
            setIsSubmitting(true);

            // Double-check email doesn't exist before submitting
            const emailExists = await clientService.checkClientExists(clientData.email.trim());
            if (emailExists) {
                setError('A client with this email already exists. Please choose a different email.');
                return;
            }

            await addClientMutation.mutateAsync(clientData);
        } catch (error) {
            // Error handling is done in the mutation's onError callback
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (validatePersonalInfo()) {
            setActiveTab(1);
        }
    };

    const handleCancel = () => {
        router.push('/company/clients');
    };

    const validatePersonalInfo = () => {
        if (!clientData.companyId || !clientData.name || !clientData.contactNo || !clientData.address) {
            setError('Please fill in all personal information fields');
            return false;
        }
        setError(null);
        return true;
    };

    if (success) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    {/* Success Icon and Message */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Client Added Successfully!</h3>

                    {/* Email Sent Icon and Message */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mt-4 mb-2">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4" />
                        </svg>
                    </div>
                    <p className="text-gray-600">The password has been sent to the client via email.</p>

                    {/* Redirect Message */}
                    <p className="text-gray-600 mt-2">Redirecting to client list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Clients
                </button>
                
                <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-[#3450A3]" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
                        <p className="text-gray-600 mt-1">Create a new client record</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab(0)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 0
                                    ? 'border-[#3450A3] text-[#3450A3]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Personal Information
                        </button>
                        <button
                            onClick={() => setActiveTab(1)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 1
                                    ? 'border-[#3450A3] text-[#3450A3]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Account Information
                        </button>
                    </nav>
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

                    <form onSubmit={handleSubmit}>
                        {activeTab === 0 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                                
                                {/* Company */}
                                <div>
                                    <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Company *
                                    </label>
                                    {companiesLoading ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-500">
                                            Loading companies...
                                        </div>
                                    ) : companiesError ? (
                                        <div className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm text-red-700">
                                            Error loading companies
                                        </div>
                                    ) : (
                                        <select
                                            id="companyId"
                                            name="companyId"
                                            value={clientData.companyId}
                                            onChange={handleChange}
                                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            required
                                        >
                                            <option value={0}>Select Company</option>
                                            {companies.map((company) => (
                                                <option key={company.companyId} value={company.companyId}>
                                                    {company.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Client Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Client Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={clientData.name}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter client name"
                                        required
                                    />
                                </div>

                                {/* Contact No */}
                                <div>
                                    <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="text"
                                        id="contactNo"
                                        name="contactNo"
                                        value={clientData.contactNo}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter contact number"
                                        required
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={clientData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter client address"
                                        required
                                    />
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
                                        type="button"
                                        onClick={handleNext}
                                        className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] flex items-center gap-2"
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
                                
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={clientData.email}
                                            onChange={handleChange}
                                            className={`text-black w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                                emailValidationError 
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Enter email address"
                                            required
                                        />
                                        {isCheckingEmail && (
                                            <div className="absolute right-3 top-2.5">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                            </div>
                                        )}
                                    </div>
                                    {emailValidationError && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <X className="h-4 w-4 mr-1" />
                                            {emailValidationError}
                                        </p>
                                    )}
                                    {clientData.email.trim() && !emailValidationError && !isCheckingEmail && (
                                        <p className="mt-1 text-sm text-green-600 flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Email is available
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={clientData.password}
                                            onChange={handleChange}
                                            className="text-black w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            placeholder="Enter password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="text-black w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            placeholder="Confirm password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={clientData.role}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="CLIENT_ADMIN">Admin</option>
                                        <option value="CLIENT_USER">User</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={clientData.isActive}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[#3450A3] focus:ring-[#3450A3] border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">
                                            Client is active
                                        </span>
                                    </label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Inactive clients will be hidden from most views
                                    </p>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(0)}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || addClientMutation.isPending || !!emailValidationError || isCheckingEmail}
                                        className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting || addClientMutation.isPending ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                Add Client
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientsPage;
