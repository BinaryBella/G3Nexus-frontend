'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { employeeService } from '@/app/lib/services/employeeService';
import { Employee } from '@/app/lib/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, X } from 'lucide-react';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

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
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="text-gray-700 text-left mt-6 mb-8">{children}</div>
                <div className="flex justify-end">
                    <button
                        className="bg-[#3450A3] hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3]"
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
    const { canManageEmployees } = useRoleAccess();
    
    // Redirect if user doesn't have permission to manage employees
    useEffect(() => {
        if (!canManageEmployees()) {
            router.push('/company/employees');
            return;
        }
    }, [canManageEmployees, router]);

    // Don't render if user doesn't have permission
    if (!canManageEmployees()) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600">You don't have permission to add employees.</p>
                </div>
            </div>
        );
    }

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
    const [success, setSuccess] = useState(false);

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
            setSuccess(true);
            setTimeout(() => {
                router.push('/company/employees');
            }, 1500);
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
    };

    const handleCancel = () => {
        router.push('/company/employees');
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Added Successfully!</h3>
                    <p className="text-gray-600">Redirecting to employees list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Employees
                </button>
                
                <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-[#3450A3]" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
                        <p className="text-gray-600 mt-1">Create a new employee record</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-8">
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <X className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Employee Information</h2>
                        
                        <div className="space-y-6">
                            {/* Employee Name */}
                            <div>
                                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee Name *
                                </label>
                                <input
                                    type="text"
                                    id="employeeName"
                                    placeholder="Enter employee name"
                                    value={employeeName}
                                    onChange={(e) => handleEmployeeNameChange(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.employeeName ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.employeeName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.employeeName}</p>
                                )}
                            </div>

                            {/* Contact No */}
                            <div>
                                <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Number *
                                </label>
                                <input
                                    type="tel"
                                    id="contactNo"
                                    placeholder="Enter contact number"
                                    value={contactNo}
                                    onChange={(e) => handleContactNoChange(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.contactNo ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.contactNo && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contactNo}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    id="address"
                                    rows={3}
                                    placeholder="Enter employee address"
                                    value={address}
                                    onChange={(e) => handleAddressChange(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.address ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                )}
                            </div>

                            {/* Designation */}
                            <div>
                                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Designation *
                                </label>
                                <input
                                    type="text"
                                    id="designation"
                                    placeholder="Enter designation"
                                    value={designation}
                                    onChange={(e) => handleDesignationChange(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.designation ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.designation && (
                                    <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter password (minimum 8 characters)"
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.password ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.confirmPassword ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addEmployeeMutation.isPending}
                                className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {modalMessage}
            </Modal>
        </div>
    );
};

export default EmployeeForm;
