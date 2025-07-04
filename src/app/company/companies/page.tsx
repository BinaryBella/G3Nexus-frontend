"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { Building2, Plus, Edit, Trash2, Search } from 'lucide-react';
import { companyService, Company } from '@/app/lib/services/companyService';

const CompaniesPage = () => {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        // Filter companies based on search text
        if (searchText.trim() === '') {
            setFilteredCompanies(companies);
        } else {
            const filtered = companies.filter(company =>
                company.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
                company.address.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredCompanies(filtered);
        }
    }, [searchText, companies]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const companiesData = await companyService.getAllCompanies();
            setCompanies(companiesData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/company/edit-company/${id}`);
    };

    const handleDelete = (id: number) => {
        const company = companies.find(comp => comp.companyId === id);
        if (company) {
            setSelectedCompany(company);
            setShowDeleteModal(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedCompany) return;

        try {
            setIsDeleting(true);
            await companyService.deleteCompany(selectedCompany.companyId);
            await fetchCompanies(); // Refresh the list
            setShowDeleteModal(false);
            setSelectedCompany(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete company');
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedCompany(null);
    };

    const getStatusBadge = (isActive: boolean) => {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <section className="container mx-auto py-8 px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-[#3450A3]" />
                            <h1 className="text-3xl font-bold text-[#3450A3]">
                                Company Management
                            </h1>
                        </div>
                        <button
                            className="bg-[#3450A3] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            onClick={() => router.push('/company/add-company')}
                        >
                            <Plus className="h-4 w-4" />
                            Add New Company
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search companies by name or address..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            <p>{error}</p>
                            <button
                                onClick={fetchCompanies}
                                className="mt-2 text-sm underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3450A3] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading companies...</p>
                        </div>
                    ) : (
                        /* Companies Table */
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {filteredCompanies.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchText ? 'No companies found' : 'No companies available'}
                                    </h3>
                                    <p className="text-gray-600">
                                        {searchText
                                            ? 'Try adjusting your search criteria.'
                                            : 'Get started by adding your first company.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Company
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredCompanies.map((company) => (
                                                <tr key={company.companyId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-[#3450A3] flex items-center justify-center text-white font-medium">
                                                                    {company.companyName.charAt(0).toUpperCase()}
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {company.companyName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    ID: {company.companyId}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="max-w-xs truncate">
                                                            {company.address}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(company.isActive)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Edit Company"
                                                                onClick={() => handleEdit(company.companyId)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Company"
                                                                onClick={() => handleDelete(company.companyId)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Results Summary */}
                            {!loading && filteredCompanies.length > 0 && (
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                    <div className="text-sm text-gray-700">
                                        Showing {filteredCompanies.length} of {companies.length} companies
                                        {searchText && (
                                            <span className="ml-2">
                                                (filtered by &quot;{searchText}&quot;)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                title="Delete Company"
                message="Are you sure you want to delete this company?"
                itemName={selectedCompany?.companyName}
                warningMessage="This action will set the company as inactive."
            />
        </div>
    );
};

export default CompaniesPage;
