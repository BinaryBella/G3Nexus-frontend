'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { employeeService } from '@/app/lib/services/employeeService'; // Import employeeService
import { Employee } from '../../../lib/types'; // Employee type definition
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

const EmployeeForm = () => {
    const router = useRouter();
    const [employeeName, setEmployeeName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [designation, setDesignation] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const addEmployeeMutation = useMutation({
        mutationFn: employeeService.addEmployee,
        onSuccess: () => {
            setModalMessage('Employee added successfully!');
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
        if (!employeeName || !contactNo || !email || !address || !designation || !password) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        const newEmployee: Omit<Employee, 'employeeId'> = {
            name: employeeName,
            contactNo,
            email,
            address,
            isActive: true, // Assuming new employees are active by default
            password,
            role: designation, // Using designation as the role
        };

        try {
            await addEmployeeMutation.mutateAsync(newEmployee);
        } catch (error) {
            // Error handling is done in the mutation's onError callback
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (modalMessage.startsWith('Employee added successfully')) {
            router.push('/company/employees'); // Redirect to employee list page after success
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 h-screen">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">
                New Employee Information
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
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <div className="w-3/6 flex justify-end mt-16 gap-x-6">
                <button
                    className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={() => router.push('/company/employees')} // Navigate to employees page on cancel
                >
                    Cancel
                </button>
                <button
                    className="w-28 bg-[#FFBF00] hover:bg-[#FFBF00] text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:bg-gray-300 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={addEmployeeMutation.isPending}
                >
                    {addEmployeeMutation.isPending ? 'Adding...' : 'Submit'}
                </button>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block absolute bottom-0 right-0 mb-10 mr-10">
                <Image
                    src="/images/project.png" // Use an appropriate image for employees
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

export default EmployeeForm;
