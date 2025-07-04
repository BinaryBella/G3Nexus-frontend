'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeeService } from '@/app/lib/services/employeeService';
import { Employee } from '@/app/lib/types';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

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

const EditEmployeeForm = () => {
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;

    const [employeeName, setEmployeeName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [designation, setDesignation] = useState('');
    const [address, setAddress] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Fetch employee data
    const { data: employee, isLoading, error: fetchError } = useQuery({
        queryKey: ['employee', employeeId],
        queryFn: () => employeeService.getEmployeeById(Number(employeeId)),
        enabled: !!employeeId,
    });

    // Populate form when employee data is loaded
    useEffect(() => {
        if (employee) {
            setEmployeeName(employee.name);
            setContactNo(employee.contactNo);
            setEmail(employee.email);
            setDesignation(employee.role);
            setAddress(employee.address);
            setIsActive(employee.isActive);
        }
    }, [employee]);

    const updateEmployeeMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Employee, 'employeeId'>> }) =>
            employeeService.updateEmployee(id, data),
        onSuccess: () => {
            setModalMessage('Employee updated successfully!');
            setIsModalOpen(true);
        },
        onError: (error: Error) => {
            setModalMessage(`Error: ${error.message}`);
            setIsModalOpen(true);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate all required fields
        if (!employeeName || !contactNo || !email || !address || !designation) {
            setError('Please fill in all required fields');
            return;
        }

        if (!employeeId) {
            setError('Employee ID is required');
            return;
        }

        const updatedEmployee: Partial<Omit<Employee, 'employeeId'>> = {
            name: employeeName,
            contactNo,
            address,
            isActive,
            role: designation,
            // Note: email is excluded from update as it's read-only
        };

        try {
            await updateEmployeeMutation.mutateAsync({
                id: Number(employeeId),
                data: updatedEmployee
            });
        } catch (error) {
            // Error handling is done in the mutation's onError callback
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (modalMessage.startsWith('Employee updated successfully')) {
            router.push('/company/employees'); // Redirect to employee list page after success
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white px-8 pt-6 h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading employee data...</div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="bg-white px-8 pt-6 h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-red-500">Error loading employee data</div>
                </div>
            </div>
        );
    }

    if (!employeeId) {
        return (
            <div className="bg-white px-8 pt-6 h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-red-500">Employee ID is required</div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 h-screen">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">
                Edit Employee Information
            </h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employeeName">
                    Employee Name
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="employeeName"
                    type="text"
                    placeholder="Employee Name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNo">
                    Contact No
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="contactNo"
                    type="text"
                    placeholder="Contact No"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email Address
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-500 leading-tight bg-gray-100 cursor-not-allowed"
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    readOnly
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                    Address
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="address"
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="designation">
                    Designation
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="designation"
                    type="text"
                    placeholder="Designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isActive">
                    Status
                </label>
                <select
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="isActive"
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div className="w-3/6 flex justify-end mt-16 gap-x-6">
                <button
                    className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={() => router.push('/company/employees')}
                >
                    Cancel
                </button>
                <button
                    className="w-28 bg-[#FFBF00] hover:bg-[#FFBF00] text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:bg-gray-300 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={updateEmployeeMutation.isPending}
                >
                    {updateEmployeeMutation.isPending ? 'Updating...' : 'Update'}
                </button>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block absolute bottom-0 right-0 mb-10 mr-10">
                <Image
                    src="/images/project.png"
                    alt="Employee illustration"
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

export default EditEmployeeForm;
