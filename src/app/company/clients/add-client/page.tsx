'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { clientService } from '@/app/lib/services/clientService'; // Import clientService
import { companyService } from '@/app/lib/services/companyService'; // Import companyService
import { Client } from '../../../lib/types'; // Client type definition
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, ArrowLeft, Save, X, ArrowRight } from 'lucide-react';


const ClientsPage: React.FC = () => {
    const router = useRouter();
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
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Fetch companies data
    const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

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
        
        try {
            setIsSubmitting(true);
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Client Added Successfully!</h3>
                    <p className="text-gray-600">Redirecting to clients list...</p>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
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
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={clientData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={clientData.password}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Confirm password"
                                        required
                                    />
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                        <option value="guest">Guest</option>
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
                                        disabled={isSubmitting || addClientMutation.isPending}
                                        className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting || addClientMutation.isPending ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
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
