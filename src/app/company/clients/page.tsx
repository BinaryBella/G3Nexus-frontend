"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, FileSearch, Users, Plus, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientService, Client } from '@/app/lib/services/clientService';

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
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
    const [searchText, setSearchText] = useState("");

    const { data: clients = [], error, isLoading } = useQuery<Client[], Error>({
        queryKey: ['clients'],
        queryFn: clientService.getAllClients,
    });

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        client.role?.toLowerCase().includes(searchText.toLowerCase()) ||
        client.contactNo?.includes(searchText)
    );

    const stats = {
        total: clients.length,
        active: clients.filter(client => client.isActive).length,
        inactive: clients.filter(client => !client.isActive).length,
        admins: clients.filter(client => client.role === 'Admin').length
    };

    const handleEdit = (id: number) => {
        router.push(`/company/clients/edit-client/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await clientService.deleteClient(id);
                // The query will automatically refetch due to React Query
            } catch (err) {
                console.error('Failed to delete client:', err);
            }
        }
    };

    const handleDetails = (id: number) => {
        console.log(`View more details for client with id: ${id}`);
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
                            Client Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage and track your clients</p>
                    </div>
                    <button
                        onClick={() => router.push('/company/clients/add-client')}
                        className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Client
                    </button>
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
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search clients by name, email, role, or contact..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                        <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                        <p className="text-gray-600">
                            {searchText ? 'Try adjusting your search criteria.' : 'Get started by adding your first client.'}
                        </p>
                        {!searchText && (
                            <button
                                onClick={() => router.push('/company/clients/add-client')}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
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
                                                        ID: {client.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{client.email}</div>
                                            <div className="text-sm text-gray-500">{client.contactNo}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={client.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge isActive={client.isActive} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-xs truncate">
                                                {client.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(client.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
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
                {!isLoading && filteredClients.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            Showing {filteredClients.length} of {clients.length} clients
                            {searchText && (
                                <span className="ml-2">
                                    (filtered by &quot;{searchText}&quot;)
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
