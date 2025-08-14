'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, X } from 'lucide-react';
import { companyService } from '@/app/lib/services/companyService';
import { Company } from '@/app/lib/types';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

const AddCompanyForm = () => {
    const router = useRouter();
    const { canManageCompanies } = useRoleAccess();

    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [nameValidationError, setNameValidationError] = useState('');
    const [isCheckingName, setIsCheckingName] = useState(false);

    // Debounced validation for company name
    useEffect(() => {
        const checkCompanyName = async () => {
            if (!companyName.trim()) {
                setNameValidationError('');
                return;
            }

            setIsCheckingName(true);
            try {
                const exists = await companyService.checkCompanyExists(companyName.trim());
                if (exists) {
                    setNameValidationError('A company with this name already exists');
                } else {
                    setNameValidationError('');
                }
            } catch (error) {
                setNameValidationError('');
            } finally {
                setIsCheckingName(false);
            }
        };

        const timeoutId = setTimeout(checkCompanyName, 500);
        return () => clearTimeout(timeoutId);
    }, [companyName]);
    
    // Redirect if user doesn't have permission to manage companies
    useEffect(() => {
        if (!canManageCompanies()) {
            router.push('/company/companies');
            return;
        }
    }, [canManageCompanies, router]);

    // Don't render if user doesn't have permission
    if (!canManageCompanies()) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600">You don&apos;t have permission to add companies.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!companyName || !address) {
            setError('Please fill in all required fields');
            return;
        }

        const trimmedCompanyName = companyName.trim();
        const trimmedAddress = address.trim();

        if (!trimmedCompanyName || !trimmedAddress) {
            setError('Please fill in all required fields');
            return;
        }

        if (nameValidationError) {
            setError('Please resolve the company name issue before submitting');
            return;
        }

        try {
            setIsSubmitting(true);
            
            const companyExists = await companyService.checkCompanyExists(trimmedCompanyName);
            if (companyExists) {
                setError('A company with this name already exists. Please choose a different name.');
                return;
            }

            const newCompany: Omit<Company, 'companyId'> = {
                companyName: trimmedCompanyName,
                address: trimmedAddress,
                isActive,
            };

            await companyService.addCompany(newCompany);
            setSuccess(true);
            setTimeout(() => {
                router.push('/company/companies');
            }, 1500);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add company');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/company/companies');
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Company Added Successfully!</h3>
                    <p className="text-gray-600">Redirecting to companies list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-8">
                <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Companies
                </button>
                
                <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-[#3450A3]" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Company</h1>
                        <p className="text-gray-600 mt-1">Create a new company record</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
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
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className={`text-black w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        nameValidationError 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter company name"
                                    required
                                />
                                {isCheckingName && (
                                    <div className="absolute right-3 top-2.5">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                    </div>
                                )}
                            </div>
                            {nameValidationError && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <X className="h-4 w-4 mr-1" />
                                    {nameValidationError}
                                </p>
                            )}
                            {companyName.trim() && !nameValidationError && !isCheckingName && (
                                <p className="mt-1 text-sm text-green-600 flex items-center">
                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Company name is available
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                placeholder="Enter company address"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 text-[#3450A3] focus:ring-[#3450A3] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                    Company is active
                                </span>
                            </label>
                            <p className="mt-1 text-sm text-gray-500">
                                Inactive companies will be hidden from most views
                            </p>
                        </div>

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
                                disabled={isSubmitting || !!nameValidationError || isCheckingName}
                                className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        Add Company
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCompanyForm;
