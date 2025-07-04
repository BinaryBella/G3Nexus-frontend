'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeeService } from '@/app/lib/services/employeeService';
import { Employee } from '@/app/lib/types';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import FeedbackPopup from '@/app/components/FeedbackPopup';

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
    const [modalType, setModalType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

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
            setModalMessage('Employee updated successfully!');
            setModalType('success');
            setIsModalOpen(true);
        },
        onError: (error: Error) => {
            setModalMessage(`Error: ${error.message}`);
            setModalType('error');
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
                />
                {errors.employeeName && <p className="text-red-500 text-xs mt-2">{errors.employeeName}</p>}
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
                />
                {errors.contactNo && <p className="text-red-500 text-xs mt-2">{errors.contactNo}</p>}
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
                {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
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
                />
                {errors.address && <p className="text-red-500 text-xs mt-2">{errors.address}</p>}
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
                />
                {errors.designation && <p className="text-red-500 text-xs mt-2">{errors.designation}</p>}
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
            <FeedbackPopup isOpen={isModalOpen} onClose={closeModal} type={modalType}>
                {modalMessage}
            </FeedbackPopup>
        </form>
    );
};

export default EditEmployeeForm;
