'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { clientService } from '@/app/lib/services/clientService'; // Import clientService
import { companyService } from '@/app/lib/services/companyService'; // Import companyService
import { Client } from '../../../lib/types'; // Client type definition
import { useRouter } from 'next/navigation';
import Image from 'next/image';


// Modal Component
const Modal = ({ isOpen, onClose, children = 'Notice' }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto relative h-52">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="text-gray-700 text-left mt-10 mb-16">{children}</div>
                <div className="flex justify-end items-end">
                    <button
                        className="bg-[#FFBF00] hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg focus:outline-none"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Fetch companies data
    const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

    const addClientMutation = useMutation({
        mutationFn: clientService.addClient,
        onSuccess: () => {
            setModalMessage('Client added successfully!');
            setIsModalOpen(true);
        },
        onError: (error: Error) => {
            console.error('Error adding client:', error);
            setModalMessage(`Error: ${error.message}`);
            setIsModalOpen(true);
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
            await addClientMutation.mutateAsync(clientData);
        } catch (error) {
            // Error handling is done in the mutation's onError callback
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
        return true;
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (modalMessage.startsWith('Client added successfully')) {
            router.push('/company/clients');
        }
    };

    return (
        <div className="bg-white px-8 pt-6 min-h-screen">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">New Client Information</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <span>{error}</span>
                </div>
            )}

            <div className="flex mb-4">
                <button
                    className={`mr-4 py-2 px-4 font-semibold ${activeTab === 0 ? 'text-[#3450A3] border-b-2 border-[#3450A3]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab(0)}
                >
                    Personal Information
                </button>
                <button
                    className={`py-2 px-4 font-semibold ${activeTab === 1 ? 'text-[#3450A3] border-b-2 border-[#3450A3]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab(1)}
                >
                    Account Information
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {activeTab === 0 && (
                    <div className="w-2/4">
                        <h2 className="text-2xl font-semibold text-[#3450A3] mb-4">Personal Information</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Company</label>
                            {companiesLoading ? (
                                <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                                    Loading companies...
                                </div>
                            ) : companiesError ? (
                                <div className="shadow appearance-none border rounded w-full py-2 px-3 text-red-700 leading-tight">
                                    Error loading companies
                                </div>
                            ) : (
                                <select
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    name="companyId"
                                    value={clientData.companyId}
                                    onChange={handleChange}
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
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Client Name</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                name="name"
                                type="text"
                                placeholder="Client Name"
                                value={clientData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Contact No</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                name="contactNo"
                                type="text"
                                placeholder="Contact No"
                                value={clientData.contactNo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                name="address"
                                placeholder="Address"
                                rows={3}
                                value={clientData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex justify-end mt-8 gap-x-6">
                            <button
                                className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md"
                                type="button"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-28 bg-[#FFBF00] hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-md"
                                type="button"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 1 && (
                    <div className="w-2/4">
                        <h2 className="text-2xl font-semibold text-[#3450A3] mb-4">Account Information</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={clientData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={clientData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                            <select
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                name="role"
                                value={clientData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                                <option value="guest">Guest</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                <input
                                    className="mr-2 leading-tight"
                                    name="isActive"
                                    type="checkbox"
                                    checked={clientData.isActive}
                                    onChange={handleChange}
                                />
                                <span className="text-sm">Active</span>
                            </label>
                        </div>
                        <div className="flex justify-end mt-8 gap-x-6">
                            <button
                                className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md"
                                type="button"
                                onClick={() => setActiveTab(0)}
                            >
                                Back
                            </button>
                            <button
                                className="w-28 bg-[#FFBF00] hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={addClientMutation.isPending}
                            >
                                {addClientMutation.isPending ? 'Adding...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Illustration */}
            <div className="hidden lg:block absolute bottom-0 right-0 mb-10 mr-10">
                <Image
                    src="/images/project.png"
                    alt="Client illustration"
                    width={400}
                    height={320}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {modalMessage}
            </Modal>
        </div>
    );
};

export default ClientsPage;
