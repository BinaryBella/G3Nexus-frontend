'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, ArrowLeft, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '@/app/lib/services/clientService';
import { companyService } from '@/app/lib/services/companyService';
import { ClientEditPayload } from '@/app/lib/types';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

const EditClientPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const { canManageClients } = useRoleAccess();
    const clientId = parseInt(params.id as string, 10);
    const [activeTab, setActiveTab] = useState(0);
    const [clientData, setClientData] = useState<ClientEditPayload>({
        name: '',
        contactNo: '',
        address: '',
        email: '',
        role: '',
        isActive: true,
        companyId: 0,
        id: clientId,
        profileImageUrl: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Fetch client data
    const { data: client, isLoading: clientLoading, error: clientError } = useQuery({
        queryKey: ['client', clientId],
        queryFn: () => clientService.getClientById(clientId),
        enabled: !!clientId && !isNaN(clientId),
    });

    // Fetch companies data
    const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

    // Update client mutation
    const updateClientMutation = useMutation({
        mutationFn: (data: ClientEditPayload) => clientService.updateClient(data),
        onSuccess: () => {
            setSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['client', clientId] });
            setTimeout(() => {
                router.push('/company/clients');
            }, 1500);
        },
        onError: (error: Error) => {
            console.error('Error updating client:', error);
            setError(error.message || 'Failed to update client');
        },
    });

    // Load client data when fetched and companies are loaded
    useEffect(() => {
        if (client && companies.length > 0) {
            setClientData({
                name: client.name || '',
                contactNo: client.contactNo || '',
                address: client.address || '',
                email: client.email || '',
                role: client.role || '',
                isActive: client.isActive,
                companyId: client.companyId || 0,
                id: clientId,
                profileImageUrl: ""
            });
        }
    }, [client, companies]);
    
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
                    <p className="text-gray-600">You don&apos;t have permission to edit clients.</p>
                </div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Prevent email changes
        if (name === 'email') {
            return;
        }
        
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
        
        if (!clientData.role) {
            setError('Please select a role');
            return;
        }

        try {
            setIsSubmitting(true);
            const updateData: ClientEditPayload = {
                ...clientData,
                id: clientId,
                profileImageUrl: ""

            };
            await updateClientMutation.mutateAsync(updateData);
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

    if (clientLoading || companiesLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">
                        {clientLoading && companiesLoading ? 'Loading client and company data...' :
                         clientLoading ? 'Loading client data...' : 'Loading company data...'}
                    </p>
                </div>
            </div>
        );
    }

    if (clientError || companiesError) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600">
                        {clientError ? 'Error loading client data.' : 'Error loading company data.'} Please try again.
                    </p>
                    <button
                        onClick={handleCancel}
                        className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Clients
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Client Updated Successfully!</h3>
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
                        <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
                        <p className="text-gray-600 mt-1">Update client information</p>
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
                                            <option value={0}>Select a company</option>
                                            {companies.map((company) => (
                                                <option key={company.companyId} value={company.companyId}>
                                                    {company.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {/* Show current company name for reference */}
                                    {client && companies.length > 0 && client.companyId > 0 && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Previous: {companies.find(c => c.companyId === client.companyId)?.companyName || 'Company not found'}
                                        </p>
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
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3450A3]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-[#2a3f8f] focus:outline-none focus:ring-2 focus:ring-[#3450A3]"
                                    >
                                        Next
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
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={clientData.email}
                                        readOnly
                                        disabled
                                        className="text-gray-600 w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                                        placeholder="Email address"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
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
                                        <option value="">Select a role</option>
                                        <option value="CLIENT_ADMIN">Admin</option>
                                        <option value="CLIENT_USER">User</option>
                                    </select>
                                    {/* Show current role for reference */}
                                    {client && client.role && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Previous: {client.role === 'CLIENT_ADMIN' ? 'Admin' : client.role === 'CLIENT_USER' ? 'User' : client.role}
                                        </p>
                                    )}
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
                                        <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">Uncheck to deactivate this client account</p>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(0)}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3450A3]"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3450A3]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-[#2a3f8f] focus:outline-none focus:ring-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Client'}
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

export default EditClientPage;
