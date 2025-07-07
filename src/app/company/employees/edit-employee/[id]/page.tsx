'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeeService } from '@/app/lib/services/employeeService';
import { Employee } from '@/app/lib/types';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, X } from 'lucide-react';

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
    const [success, setSuccess] = useState(false);

    // Form validation states
    const [errors, setErrors] = useState({
        employeeName: '',
        contactNo: '',
        email: '',
        designation: '',
        address: ''
    });

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
        mutationFn: ({ data }: { data: Employee }) =>
            employeeService.updateEmployee(data),
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

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            employeeName: '',
            contactNo: '',
            email: '',
            designation: '',
            address: ''
        };

        // Validate employee name
        if (!employeeName.trim()) {
            newErrors.employeeName = 'Employee name is required';
            isValid = false;
        }

        // Validate contact number
        if (!contactNo.trim()) {
            newErrors.contactNo = 'Contact number is required';
            isValid = false;
        } else if (!/^\d{10,15}$/.test(contactNo.replace(/[-()\s]/g, ''))) {
            newErrors.contactNo = 'Please enter a valid contact number';
            isValid = false;
        }

        // Validate email (even though it's read-only in this form)
        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Validate designation
        if (!designation.trim()) {
            newErrors.designation = 'Designation is required';
            isValid = false;
        }

        // Validate address
        if (!address.trim()) {
            newErrors.address = 'Address is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        if (!validateForm()) {
            return;
        }

        if (!employeeId) {
            setError('Employee ID is required');
            return;
        }

        const updatedEmployee:Employee = {
            name: employeeName,
            contactNo,
            address,
            isActive,
            email,
            employeeId: Number(employeeId),
            password: employee!.password,
            role: designation,
        };

        try {
            await updateEmployeeMutation.mutateAsync({
                data: updatedEmployee
            });
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Updated Successfully!</h3>
                    <p className="text-gray-600">Redirecting to employees list...</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="text-lg text-gray-600">Loading employee data...</div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="text-lg text-red-500">Error loading employee data</div>
                </div>
            </div>
        );
    }

    if (!employeeId) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="text-lg text-red-500">Employee ID is required</div>
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
                        <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
                        <p className="text-gray-600 mt-1">Update employee information</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-8">
                    {(error || Object.values(errors).some(err => err)) && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <X className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                        {error && <li>{error}</li>}
                                        {Object.values(errors).filter(err => err).map((errorMsg, index) => (
                                            <li key={index}>{errorMsg}</li>
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
                                    onChange={(e) => setEmployeeName(e.target.value)}
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
                                    onChange={(e) => setContactNo(e.target.value)}
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
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
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
                                    onChange={(e) => setAddress(e.target.value)}
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
                                    onChange={(e) => setDesignation(e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] ${
                                        errors.designation ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.designation && (
                                    <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status *
                                </label>
                                <select
                                    id="isActive"
                                    value={isActive ? 'active' : 'inactive'}
                                    onChange={(e) => setIsActive(e.target.value === 'active')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Inactive employees will be hidden from most views
                                </p>
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
                                disabled={updateEmployeeMutation.isPending}
                                className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
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

export default EditEmployeeForm;
