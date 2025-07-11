'use client';

import React from 'react';

const ClientPaymentsPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
                    <p className="mt-2 text-gray-600">
                        View and manage payment information for your projects.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M28 16a4 4 0 11-8 0 4 4 0 018 0zm-8 8a6 6 0 016 6v4H14v-4a6 6 0 016-6z" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payment data available</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Payment information will be displayed here when available.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientPaymentsPage;
