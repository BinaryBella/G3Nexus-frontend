'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { employeeService } from '@/app/lib/services/employeeService';
import { Employee } from '@/app/lib/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children = 'Notice' }: ModalProps) => {
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

// Validation types
interface FormErrors {
    employeeName?: string;
    contactNo?: string;
    email?: string;
    designation?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
}

const EmployeeForm = () => {
    const router = useRouter();
    const [employeeName, setEmployeeName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [designation, setDesignation] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateContactNo = (contactNo: string): boolean => {
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return phoneRegex.test(contactNo.replace(/\s/g, ''));
    };

    const validatePassword = (password: string): boolean => {
        return password.length >= 8;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Employee Name validation
        if (!employeeName.trim()) {
            newErrors.employeeName = 'Employee name is required';
        }

        // Contact No validation
        if (!contactNo.trim()) {
            newErrors.contactNo = 'Contact number is required';
        } else if (!validateContactNo(contactNo)) {
            newErrors.contactNo = 'Please enter a valid contact number';
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Designation validation
        if (!designation.trim()) {
            newErrors.designation = 'Designation is required';
        }

        // Address validation
        if (!address.trim()) {
            newErrors.address = 'Address is required';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm Password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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

    // Real-time validation handlers
    const handleEmployeeNameChange = (value: string) => {
        setEmployeeName(value);
        if (errors.employeeName && value.trim()) {
            const newErrors = { ...errors };
            delete newErrors.employeeName;
            setErrors(newErrors);
        }
    };

    const handleContactNoChange = (value: string) => {
        setContactNo(value);
        if (errors.contactNo) {
            const newErrors = { ...errors };
            if (value.trim() && validateContactNo(value)) {
                delete newErrors.contactNo;
                setErrors(newErrors);
            }
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (errors.email) {
            const newErrors = { ...errors };
            if (value.trim() && validateEmail(value)) {
                delete newErrors.email;
                setErrors(newErrors);
            }
        }
    };

    const handleDesignationChange = (value: string) => {
        setDesignation(value);
        if (errors.designation && value.trim()) {
            const newErrors = { ...errors };
            delete newErrors.designation;
            setErrors(newErrors);
        }
    };

    const handleAddressChange = (value: string) => {
        setAddress(value);
        if (errors.address && value.trim()) {
            const newErrors = { ...errors };
            delete newErrors.address;
            setErrors(newErrors);
        }
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (errors.password) {
            const newErrors = { ...errors };
            if (value && validatePassword(value)) {
                delete newErrors.password;
                setErrors(newErrors);
            }
        }

        // Re-validate confirm password if it exists
        if (confirmPassword && value !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else if (confirmPassword && value === confirmPassword) {
            const newErrors = { ...errors };
            delete newErrors.confirmPassword;
            setErrors(newErrors);
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (errors.confirmPassword) {
            const newErrors = { ...errors };
            if (value && password === value) {
                delete newErrors.confirmPassword;
                setErrors(newErrors);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        const newEmployee: Employee = {
            name: employeeName.trim(),
            contactNo: contactNo.trim(),
            email: email.trim().toLowerCase(),
            address: address.trim(),
            isActive: true,
            password: password,
            role: designation.trim(),
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
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employeeName">
                    Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.employeeName ? 'border-red-500' : ''
                    }`}
                    id="employeeName"
                    type="text"
                    placeholder="Employee Name"
                    value={employeeName}
                    onChange={(e) => handleEmployeeNameChange(e.target.value)}
                />
                {errors.employeeName && (
                    <p className="text-red-500 text-xs mt-2">
                        {errors.employeeName}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNo">
                    Contact No <span className="text-red-500">*</span>
                </label>
                <input
                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.contactNo ? 'border-red-500' : ''
                    }`}
                    id="contactNo"
                    type="tel"
                    placeholder="Contact No (e.g., 123-456-7890)"
                    value={contactNo}
                    onChange={(e) => handleContactNoChange(e.target.value)}
                />
                {errors.contactNo && (
                    <p className="text-red-500 text-xs mt-2">
                        {errors.contactNo}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <input
                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.email ? 'border-red-500' : ''
                    }`}
                    id="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-2">
                        {errors.email}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                    Address <span className="text-red-500">*</span>
                </label>
                <input
                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.address ? 'border-red-500' : ''
                    }`}
                    id="address"
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                />
                {errors.address && (
                    <p className="text-red-500 text-xs mt-2">
                        {errors.address}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="designation">
                    Designation <span className="text-red-500">*</span>
                </label>
                <input
                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.designation ? 'border-red-500' : ''
                    }`}
                    id="designation"
                    type="text"
                    placeholder="Designation"
                    value={designation}
                    onChange={(e) => handleDesignationChange(e.target.value)}
                />
                {errors.designation && (
                    <p className="text-red-500 text-xs mt-2">
                        {errors.designation}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password <span className="text-red-500">*</span>
                </label>
                <input
                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.password ? 'border-red-500' : ''
                    }`}
                    id="password"
                    type="password"
                    placeholder="Password (minimum 8 characters)"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                />
                {errors.password && (
                    <p className="text-red-500 text-xs mt-2">
                        {errors.password}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                />
                {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-2">
                        {errors.confirmPassword}
                    </p>
                )}
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
