"use client";

import React, { useState } from 'react';
import {Edit, FileSearch, Search, Settings, Trash} from 'lucide-react';
import Link from "next/link";
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { COMPANY_ADMIN } from '@/app/lib/constants';

// Payment data
const payments = [
    {
        id: 1,
        projectName: "E-commerce Platform",
        amount: "$1500",
        description: "First milestone payment",
        date: "2024-09-15"
    },
    {
        id: 2,
        projectName: "Custom CRM System",
        amount: "$2000",
        description: "Final project payment",
        date: "2024-09-20"
    },
    {
        id: 3,
        projectName: "Mobile App Development",
        amount: "$1200",
        description: "Initial deposit",
        date: "2024-09-22"
    },
    {
        id: 4,
        projectName: "Inventory Management System",
        amount: "$500",
        description: "Consultation fee",
        date: "2024-09-30"
    },
    {
        id: 5,
        projectName: "Website Redesign",
        amount: "$1000",
        description: "Design phase",
        date: "2024-10-05"
    }
];

const PaymentTable = () => {
    const [searchText, setSearchText] = useState("");

    return (
        <ProtectedRoute allowedRoles={[COMPANY_ADMIN]}>
            <div className="p-4">
                <h1 className="text-4xl font-bold text-[#3450A3] mb-8">
                    Payments
                </h1>
                <div className="flex justify-between mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-8 pr-2 py-1 border rounded"
                        />
                        <Search className="absolute left-2 top-2 h-4 w-4 border rounded-lg text-gray-400"/>
                    </div>
                    <Link href="/company/payments/add-payment">
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
                            <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {payments
                        .filter((payment) =>
                            payment.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
                            payment.amount.includes(searchText) ||
                            payment.description.toLowerCase().includes(searchText.toLowerCase()) ||
                            payment.date.includes(searchText)
                        )
                        .map((payment) => (
                            <tr key={payment.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{payment.projectName}</td>
                                <td className="p-3">{payment.amount}</td>
                                <td className="p-3">{payment.description}</td>
                                <td className="p-3">{payment.date}</td>
                                <td className="p-3 flex space-x-4">
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="More Details"
                                    >
                                        <FileSearch className="h-5 w-5 text-[#3450A3]"/>
                                    </button>
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Edit"
                                    >
                                        <Edit className="h-5 w-5 text-[#3450A3]"/>
                                    </button>
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Delete"
                                    >
                                        <Trash className="h-5 w-5 text-red-600"/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-4 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((page) => (
                    <button
                        key={page}
                        className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                            page === 1 ? 'bg-[#3450A3] text-white' : ''
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
        </ProtectedRoute>
    );
};

export default PaymentTable;
