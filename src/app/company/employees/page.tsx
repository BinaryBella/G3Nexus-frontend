"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/app/components/Pagination';
import { Users, Plus, Edit, Trash2, Search, UserCheck, UserX, AlertTriangle, FileSearch } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/app/lib/services/employeeService';
import { Employee } from '@/app/lib/types';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

const RoleBadge = ({ role }: { role: string }) => {
    const colorMap: Record<string, string> = {
        'Admin': 'bg-purple-100 text-purple-800 border-purple-200',
        'Manager': 'bg-blue-100 text-blue-800 border-blue-200',
        'Developer': 'bg-green-100 text-green-800 border-green-200',
        'Designer': 'bg-pink-100 text-pink-800 border-pink-200',
        'QA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'HR': 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const colorClass = colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {role}
        </span>
    );
};

const EmployeesPage = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { canManageEmployees } = useRoleAccess();
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const { data: employees = [], error, isLoading } = useQuery<Employee[], Error>({
        queryKey: ['employees'],
        queryFn: employeeService.getAllEmployees,
    });

    // Clear deleteError when employee's data changes (after successful delete)
    useEffect(() => {
        setDeleteError(null);
    }, [employees]);

    // Reset to the first page when a search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    const filteredEmployees = employees.filter(employee =>
        employee.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.role?.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.contactNo?.includes(searchText)
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const stats = {
        total: employees.length,
        active: employees.filter(employee => employee.isActive).length,
        inactive: employees.filter(employee => !employee.isActive).length,
        admins: employees.filter(employee => employee.role === 'COMPANY_ADMIN').length
    };

    const handleEdit = (id: number | undefined) => {
        if (id) {
            router.push(`/company/employees/edit-employee/${id}`);
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        const employee = employees.find(emp => emp.employeeId === id);
        if (employee) {
            setSelectedEmployee(employee);
            setShowDeleteModal(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedEmployee || !selectedEmployee.employeeId) return;

        try {
            setIsDeleting(true);
            await employeeService.deleteEmployee(selectedEmployee.employeeId);
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setShowDeleteModal(false);
            setSelectedEmployee(null);
            setDeleteError(null);
        } catch (err) {
            setDeleteError('Failed to delete employee. Please try again.');
            console.error('Failed to delete employee:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedEmployee(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading employees...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading employees. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {deleteError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                        <p className="text-sm text-red-700">{deleteError}</p>
                        <button
                            onClick={() => setDeleteError(null)}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <UserX className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="h-8 w-8 text-[#3450A3]" />
                            Employees
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {canManageEmployees() ? 'Manage and track your employees' : 'View employee information (read-only access)'}
                        </p>
                    </div>
                    {canManageEmployees() && (
                        <button
                            onClick={() => router.push('/company/employees/add-employee')}
                            className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Add New Employee
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admins</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search employees by name, email, role, or contact..."
                        className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                        <p className="text-gray-600">
                            {searchText 
                                ? 'Try adjusting your search criteria.' 
                                : canManageEmployees() 
                                    ? 'Get started by adding your first employee.'
                                    : 'No employees found in the system.'
                            }
                        </p>
                        {!searchText && canManageEmployees() && (
                            <button
                                onClick={() => router.push('/company/employees/add-employee')}
                                className="mt-4 bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add Employee
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedEmployees.map((employee) => (
                                    <tr key={employee.employeeId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-[#3450A3] flex items-center justify-center text-white font-medium">
                                                        {employee.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {employee.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {employee.employeeId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{employee.email}</div>
                                            <div className="text-sm text-gray-500">{employee.contactNo}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={employee.role == "COMPANY_ADMIN" ? "Admin" : "Developer"} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-xs truncate">
                                                {employee.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                {canManageEmployees() ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(employee.employeeId)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            title="Edit Employee"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(employee.employeeId)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                            title="Delete Employee"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">View Only</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredEmployees.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredEmployees.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                title="Delete Employee"
                message="Are you sure you want to delete this employee?"
                itemName={selectedEmployee?.name}
                warningMessage="This action cannot be undone."
            />
        </div>
    );
};

export default EmployeesPage;
