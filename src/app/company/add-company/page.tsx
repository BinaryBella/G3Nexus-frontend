'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { companyService, Company } from '@/app/lib/services/companyService';

// Modal Component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
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

const AddCompanyForm = () => {
    const router = useRouter();
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate all required fields
        if (!companyName || !address) {
            setError('Please fill in all required fields');
            return;
        }

        const newCompany: Omit<Company, 'companyId'> = {
            companyName,
            address,
            isActive: true, // New companies are active by default
        };

        try {
            setIsSubmitting(true);
            await companyService.addCompany(newCompany);
            setModalMessage('Company added successfully!');
            setIsModalOpen(true);
        } catch (error) {
            setModalMessage(`Error: ${error instanceof Error ? error.message : 'Failed to add company'}`);
            setIsModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (modalMessage.startsWith('Company added successfully')) {
            router.push('/company/companies'); // Redirect to companies list page after success
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 h-screen">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">
                New Company Information
            </h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
                    Company Name
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="companyName"
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                />
            </div>
            
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                    Address
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 resize-none"
                    id="address"
                    placeholder="Company Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
            </div>
            
            <div className="w-3/6 flex justify-end mt-16 gap-x-6">
                <button
                    className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={() => router.push('/company/companies')}
                >
                    Cancel
                </button>
                <button
                    className="w-28 bg-[#FFBF00] hover:bg-[#FFBF00] text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:bg-gray-300 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding...' : 'Submit'}
                </button>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block absolute bottom-0 right-0 mb-10 mr-10">
                <Image
                    src="/images/project.png"
                    alt="Company illustration"
                    width={400}
                    height={320}
                />
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {modalMessage}
            </Modal>
        </form>
    );
};

export default AddCompanyForm;
