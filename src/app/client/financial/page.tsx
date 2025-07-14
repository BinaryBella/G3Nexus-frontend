"use client";

import React, { useState } from 'react';
import { Search, FileSearch, Edit, Trash } from 'lucide-react';
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/app/lib/services/paymentService';
import { Payment } from '@/app/lib/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { CLIENT_ADMIN } from '@/app/lib/constants';
import { useAuth } from '@/app/contexts/AuthContext';

const FinancialDetailsTable = () => {
    const [searchText, setSearchText] = useState("");
    const { user } = useAuth();
    // const queryClient = useQueryClient();

    const { data: payments = [], error, isLoading } = useQuery<Payment[], Error>({
        queryKey: ['payments', 'client', user?.email],
        queryFn: () => paymentService.getPaymentsByClient(user?.email || ''),
        enabled: !!user?.email,
    });

    // const deleteMutation = useMutation({
    //     // mutationFn: deletePayment,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['payments'] });
    //     },
    // });

    const handleEdit = (id: number) => {
        console.log(`Edit payment with id: ${id}`);
    };

    // const handleDelete = (id: number) => {
    //     if (window.confirm('Are you sure you want to delete this payment?')) {
    //         // deleteMutation.mutate(id);
    //     }
    // };

    const handleDetails = (id: number) => {
        console.log(`View more details for payment with id: ${id}`);
    };

    const filteredPayments = payments.filter((payment) => {
        if (!payment) return false;
        const searchFields = [
            // payment.projectName,
            payment.paymentAmount,
            payment.paymentDescription,
            payment.paymentType,
            payment.paymentDate
        ];
        return searchFields.some(field =>
            field && field.toString().toLowerCase().includes(searchText.toLowerCase())
        );
    });

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={[CLIENT_ADMIN]}>
                <div className="flex mt-48 justify-center h-screen">
                    <div className="text-center">
                        <div role="status">
                            <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) return (
        <ProtectedRoute allowedRoles={[CLIENT_ADMIN]}>
            <div>Error: {error.message}</div>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute allowedRoles={[CLIENT_ADMIN]}>
            <div className="p-4">
                <h1 className="text-4xl font-bold text-[#3450A3] mb-8">Financial Details</h1>
                <div className="flex justify-between mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search payments"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-8 pr-2 py-1 border rounded"
                        />
                        <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                    </div>
                    <Link href="/client/financial/add-payment">
                        <button className="bg-[#3450A3] text-white px-4 py-2 rounded-lg hover:bg-[#2a4084]">
                            ADD NEW PAYMENT
                        </button>
                    </Link>
                </div>
                <div className="bg-white rounded-lg overflow-hidden shadow">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-[#3450A3] text-white">
                            <th className="p-3 text-left">Project Name</th>
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-left">Payment Description</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Date and Time</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPayments.map((payment) => (
                            <tr key={payment.paymentId} className="border-b hover:bg-gray-50">
                                <td className="p-3">{payment.projectId || 'N/A'}</td>
                                <td className="p-3">{payment.paymentAmount || 'N/A'}</td>
                                <td className="p-3">{payment.paymentDescription || 'N/A'}</td>
                                <td className="p-3">{payment.paymentType || 'N/A'}</td>
                                <td className="p-3">{payment.paymentDate || 'N/A'}</td>
                                <td className="p-3 flex justify-center space-x-4">
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="More Details"
                                        onClick={() => handleDetails(payment.paymentId)}
                                    >
                                        <FileSearch className="h-5 w-5 text-[#3450A3]"/>
                                    </button>
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Edit"
                                        onClick={() => handleEdit(payment.paymentId)}
                                    >
                                        <Edit className="h-5 w-5 text-[#3450A3]"/>
                                    </button>
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Delete"
                                        // onClick={() => handleDelete(payment.id)}
                                    >
                                        <Trash className="h-5 w-5 text-red-600"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-4 gap-1">
                    {[1, 2, 3].map((page) => (
                        <button key={page} className="px-3 py-1 border rounded hover:bg-gray-100">
                            {page}
                        </button>
                    ))}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default FinancialDetailsTable;
