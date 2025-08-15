"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit, Trash2, Search, FileSearch, AlertTriangle, UserCheck } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { clientService } from '@/app/lib/services/clientService';
import { companyService } from '@/app/lib/services/companyService';
import { Client, Company } from '@/app/lib/types';
import Pagination from '@/app/components/Pagination';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

const RoleBadge = ({ role }: { role: string }) => {
    const colorMap: Record<string, string> = {
        'Admin': 'bg-purple-100 text-purple-800 border-purple-200',
        'Manager': 'bg-blue-100 text-blue-800 border-blue-200',
        'Client': 'bg-green-100 text-green-800 border-green-200',
        'Stakeholder': 'bg-orange-100 text-orange-800 border-orange-200',
        'Contact': 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const colorClass = colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {role}
        </span>
    );
};

export default function CompanyClientsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { canManageClients } = useRoleAccess();
    const [searchText, setSearchText] = useState("");
    const [companySearchText, setCompanySearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { data: clients = [], error, isLoading } = useQuery<Client[], Error>({
        queryKey: ['clients'],
        queryFn: clientService.getAllClients,
    });

    const { data: companies = [] } = useQuery<Company[], Error>({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

    // Delete client mutation
    const deleteClientMutation = useMutation({
        mutationFn: (clientId: number) => clientService.deleteClient(clientId),
        onSuccess: () => {
            // Invalidate and refetch clients data
            queryClient.invalidateQueries({queryKey: ['clients']}).then();
            setShowDeleteModal(false);
            setSelectedClient(null);
            setDeleteError(null);
        },
        onError: (error: Error) => {
            console.error('Failed to delete client:', error);
            setDeleteError(error.message || 'Failed to delete client');
        },
    });

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, companySearchText]);

    const filteredClients = clients.filter(client => {
        // Helper function to check if search text matches beginning of any word
        const matchesWordBeginning = (text: string, searchTerm: string) => {
            if (!text || !searchTerm.trim()) return searchTerm.trim() === '';
            const words = text.toLowerCase().split(/\s+/);
            const searchLower = searchTerm.toLowerCase();
            return words.some(word => word.startsWith(searchLower));
        };

        // Main search filter
        const matchesMainSearch = searchText.trim() === '' || 
            matchesWordBeginning(client.name || '', searchText) ||
            matchesWordBeginning(client.email || '', searchText) ||
            matchesWordBeginning(client.role || '', searchText) ||
            matchesWordBeginning(client.contactNo || '', searchText) ||
            matchesWordBeginning(client.address || '', searchText);

        // Company search filter (using company name)
        const matchesCompanySearch = companySearchText.trim() === '' || (() => {
            const company = companies.find(comp => comp.companyId === client.companyId);
            return company ? matchesWordBeginning(company.companyName, companySearchText) : false;
        })();

        return matchesMainSearch && matchesCompanySearch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const stats = {
        total: clients.length,
        active: clients.filter(client => client.isActive).length,
        inactive: clients.filter(client => !client.isActive).length,
        admins: clients.filter(client => client.role === 'CLIENT_ADMIN').length
    };

    const handleEdit = (id: number) => {
        router.push(`/company/clients/edit-client/${id}`);
    };

    const handleDelete = async (id: number) => {
        const client = clients.find(cli => cli.clientId === id);
        if (client) {
            setSelectedClient(client);
            setDeleteError(null); // Clear any previous errors
            setShowDeleteModal(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedClient) return;
        
        try {
            await deleteClientMutation.mutateAsync(selectedClient.clientId);
        } catch (error) {
            // Error handling is done in the mutation's onError callback
            console.error('Delete failed:', error);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedClient(null);
        setDeleteError(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading clients...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading clients. Please try again.</p>
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
                            <Users className="h-8 w-8 text-[#3450A3]" />
                            Clients
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {canManageClients() ? 'Manage and track our clients' : 'View client information (read-only access)'}
                        </p>
                    </div>
                    {canManageClients() && (
                        <button
                            onClick={() => router.push('/company/clients/add-client')}
                            className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Add New Client
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admins</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Filter by company name..."
                            className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                            value={companySearchText}
                            onChange={(e) => setCompanySearchText(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email, role, or contact..."
                            className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                        <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                        <p className="text-gray-600">
                            {searchText 
                                ? 'Try adjusting your search criteria.' 
                                : canManageClients() 
                                    ? 'Get started by adding your first client.'
                                    : 'No clients found in the system.'
                            }
                        </p>
                        {!searchText && canManageClients() && (
                            <button
                                onClick={() => router.push('/company/clients/add-client')}
                                className="mt-4 bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add Client
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedClients.map((client) => (
                                    <tr key={client.clientId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-[#3450A3] flex items-center justify-center text-white font-medium">
                                                        {client.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {client.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {client.clientId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{client.email}</div>
                                            <div className="text-sm text-gray-500">{client.contactNo}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={client.role == "CLIENT_ADMIN" ? "Admin" : "User"} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {(() => {
                                                const company = companies.find(comp => comp.companyId === client.companyId);
                                                return company ? company.companyName : `Company ID: ${client.companyId}`;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-xs truncate">
                                                {client.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                {canManageClients() ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(client.clientId)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            title="Edit Client"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(client.clientId)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                            title="Delete Client"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">View Only</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredClients.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredClients.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                isDeleting={deleteClientMutation.isPending}
                title="Delete Client"
                message={`Are you sure you want to delete the client "${selectedClient?.name}"?`}
                itemName={selectedClient?.name}
                warningMessage={deleteError || "This action cannot be undone. All client data will be permanently removed."}
            />
        </div>
    );
};
