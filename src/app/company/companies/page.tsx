"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { Building2, Plus, Edit, Trash2, Search, FileSearch, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { companyService } from '@/app/lib/services/companyService';
import { Company } from '@/app/lib/types';
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
        router.push(`/company/companies/edit-company/${id}`);
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                isActive 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
            }`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    const stats = {
        total: companies.length,
        active: companies.filter(company => company.isActive).length,
        inactive: companies.filter(company => !company.isActive).length,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading companies...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading companies. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-[#3450A3]" />
                            Company Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage and oversee all company records</p>
                    </div>
                    <button
                        onClick={() => router.push('/company/companies/add-company')}
                        className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Company
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search companies by name or address..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>
            {/* Companies Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredCompanies.length === 0 ? (
                    <div className="text-center py-12">
                        <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchText ? 'No companies found' : 'No companies available'}
                        </h3>
                        <p className="text-gray-600">
                            {searchText
                                ? 'Try adjusting your search criteria.'
                                : 'Get started by adding your first company.'
                            }
                        </p>
                        {!searchText && (
                            <button
                                onClick={() => router.push('/company/companies/add-company')}
                                className="mt-4 bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add New Company
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCompanies.map((company) => (
                                    <tr key={company.companyId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="max-w-xs truncate">
                                                {company.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(company.isActive)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleEdit(company.companyId)}
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                    title="Edit Company"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company.companyId)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                                                    title="Delete Company"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
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
