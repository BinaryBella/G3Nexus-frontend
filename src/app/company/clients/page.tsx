"use client";

import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash, FileSearch, Users, Plus } from 'lucide-react';
import Link from "next/link";
import Navbar from '@/app/components/Navbar';
import { clientService, Client } from '@/app/lib/services/clientService';

const ClientTable = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        // Filter clients based on search text
        if (searchText.trim() === '') {
            setFilteredClients(clients);
        } else {
            const filtered = clients.filter(client =>
                client.name.toLowerCase().includes(searchText.toLowerCase()) ||
                client.email.toLowerCase().includes(searchText.toLowerCase()) ||
                client.role.toLowerCase().includes(searchText.toLowerCase()) ||
                client.contactNo.includes(searchText)
            );
            setFilteredClients(filtered);
        }
    }, [searchText, clients]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const clientsData = await clientService.getAllClients();
            setClients(clientsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        console.log(`Edit client with id: ${id}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await clientService.deleteClient(id);
                await fetchClients(); // Refresh the list
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete client');
            }
        }
    };

    const handleDetails = (id: number) => {
        console.log(`View more details for client with id: ${id}`);
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

    const getRoleBadge = (role: string) => {
        const roleColors = {
            'Admin': 'bg-purple-100 text-purple-800',
            'Manager': 'bg-blue-100 text-blue-800',
            'Client': 'bg-green-100 text-green-800',
            'Stakeholder': 'bg-orange-100 text-orange-800',
            'Contact': 'bg-gray-100 text-gray-800',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
            }`}>
                {role}
            </span>
        );
    };

    return (
        <div className="relative w-full min-h-screen">
            {/* Background Image with Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('/images/background-image.png')" }}
            ></div>

            {/* Content on Top of the Background */}
            <div className="relative z-10 w-full h-full">
                {/* Navbar */}
                <Navbar />

                {/* Page Content */}
                <section className="container mx-auto py-8 px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 mt-20">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-[#3450A3]" />
                            <h1 className="text-3xl font-bold text-[#3450A3]">
                                Client Management
                            </h1>
                        </div>
                        <Link href="/company/clients/add-client">
                            <button className="bg-[#3450A3] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                <Plus className="h-4 w-4" />
                                Add New Client
                            </button>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search clients by name, email, role, or contact..."
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
                                onClick={fetchClients}
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
                            <p className="text-gray-600">Loading clients...</p>
                        </div>
                    ) : (
                        /* Clients Table */
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {filteredClients.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchText ? 'No clients found' : 'No clients available'}
                                    </h3>
                                    <p className="text-gray-600">
                                        {searchText
                                            ? 'Try adjusting your search criteria.'
                                            : 'Get started by adding your first client.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Client
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact Information
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredClients.map((client) => (
                                                <tr key={client.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-[#3450A3] flex items-center justify-center text-white font-medium">
                                                                    {client.name.charAt(0).toUpperCase()}
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
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{client.email}</div>
                                                        <div className="text-sm text-gray-500">{client.contactNo}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getRoleBadge(client.role)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(client.isActive)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="max-w-xs truncate">
                                                            {client.address}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="View Details"
                                                                onClick={() => handleDetails(client.id)}
                                                            >
                                                                <FileSearch className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Edit Client"
                                                                onClick={() => handleEdit(client.id)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Client"
                                                                onClick={() => handleDelete(client.id)}
                                                            >
                                                                <Trash className="h-4 w-4" />
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
                            {!loading && filteredClients.length > 0 && (
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
                    )}
                </section>
            </div>
        </div>
    );
};

export default ClientTable;
