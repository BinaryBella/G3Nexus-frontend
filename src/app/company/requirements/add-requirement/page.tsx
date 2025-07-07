'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { addRequirement } from '@/app/lib/services/requirementService'; 
import { Requirement } from '../../../lib/types';
import { useRouter } from 'next/navigation';

// Modal Component for Notifications
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

const RequirementForm = () => {
    const router = useRouter();

    // State variables for form fields and error handling
    const [requirementTitle, setRequirementTitle] = useState('');
    const [priority, setPriority] = useState('');
    const [requirementDescription, setRequirementDescription] = useState('');
    const [attachment, setAttachment] = useState('');
    const [clientId, setClientId] = useState<number | null>(null);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(true); // Default value for isActive
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Mutation for adding requirement
    const addRequirementMutation = useMutation({
        mutationFn: addRequirement,
        onSuccess: () => {
            setModalMessage('Requirement added successfully!');
            setIsModalOpen(true);
        },
        onError: (error: Error) => {
            setModalMessage(`Error: ${error.message}`);
            setIsModalOpen(true);
        },
    });

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!requirementTitle || !priority || !requirementDescription || clientId === null || projectId === null) {
            setError('Please fill in all the required fields.');
            return;
        }

        const newRequirement: Omit<Requirement, 'requirementId'> = {
            requirementTitle,
            priority,
            requirementDescription,
            attachment,
            isActive,
            clientId,
            projectId,
        };

        try {
            await addRequirementMutation.mutateAsync(newRequirement);
        } catch (error) {
            // Error handling is done in mutation's onError callback
        }
    };

    // Closing the modal
    const closeModal = () => {
        setIsModalOpen(false);
        if (modalMessage.startsWith('Requirement added successfully')) {
            router.push('/requirements'); // Redirect after successful addition
        }
    };

    return (
        <div className="bg-white px-8 pt-6 h-screen">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">New Requirement</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirementTitle">
                        Requirement Title
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="requirementTitle"
                        type="text"
                        placeholder="Enter requirement title"
                        value={requirementTitle}
                        onChange={(e) => setRequirementTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                        Priority
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        required
                    >
                        <option value="">Select Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirementDescription">
                        Requirement Description
                    </label>
                    <textarea
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="requirementDescription"
                        placeholder="Describe the requirement"
                        value={requirementDescription}
                        onChange={(e) => setRequirementDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachment">
                        Attachment (Optional)
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="attachment"
                        type="text"
                        placeholder="Link to attachment"
                        value={attachment}
                        onChange={(e) => setAttachment(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clientId">
                        Client ID
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="clientId"
                        type="number"
                        placeholder="Enter Client ID"
                        value={clientId ?? ''}
                        onChange={(e) => setClientId(Number(e.target.value))}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectId">
                        Project ID
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="projectId"
                        type="number"
                        placeholder="Enter Project ID"
                        value={projectId ?? ''}
                        onChange={(e) => setProjectId(Number(e.target.value))}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        <input
                            className="mr-2 leading-tight"
                            type="checkbox"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                        />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div className="w-3/6 flex justify-end mt-16 gap-x-6">
                    <button
                        className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={() => router.push('/requirements')}
                    >
                        Cancel
                    </button>
                    <button
                        className="w-28 bg-[#FFBF00] hover:bg-[#FFBF00] text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Submit
                    </button>
                </div>
            </form>

            {/* Illustration */}
            <div className="hidden lg:block absolute bottom-0 right-0 mb-10 mr-10">
                <Image
                    src="/images/add-requirement.jpg" // Use an appropriate image for requirements
                    alt="Requirement illustration"
                    width={500}
                    height={420}
                />
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {modalMessage}
            </Modal>
        </div>
    );
};

export default RequirementForm;
