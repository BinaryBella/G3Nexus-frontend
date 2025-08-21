'use client';

import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// API Response interfaces
interface ApiResponse<T> {
    status: boolean;
    message: string;
    error: null | string;
    data: T;
}

interface ChartDataset {
    label?: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string | string[];
    borderWidth: number;
    fill?: boolean;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointBorderWidth?: number;
    pointRadius?: number;
    tension?: number;
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

const PerformanceCharts: React.FC = () => {
    const [projectsData, setProjectsData] = useState<ChartData | null>(null);
    const [requirementsData, setRequirementsData] = useState<ChartData | null>(null);
    const [bugsData, setBugsData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // API base URL
    const API_BASE_URL = 'https://localhost:7289/api';

    // Fetch projects data
    const fetchProjectsData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/PerformanceCharts/projects?monthsBack=6`);
            const result: ApiResponse<ChartData> = await response.json();
            
            if (result.status && result.data) {
                setProjectsData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch projects data');
            }
        } catch (err) {
            console.error('Error fetching projects data:', err);
            setError('Failed to load projects data');
        }
    };

    // Fetch requirements data
    const fetchRequirementsData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/PerformanceCharts/requirements`);
            const result: ApiResponse<ChartData> = await response.json();
            
            if (result.status && result.data) {
                setRequirementsData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch requirements data');
            }
        } catch (err) {
            console.error('Error fetching requirements data:', err);
            setError('Failed to load requirements data');
        }
    };

    // Fetch bugs data
    const fetchBugsData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/PerformanceCharts/bugs?weeksBack=6`);
            const result: ApiResponse<ChartData> = await response.json();
            
            if (result.status && result.data) {
                setBugsData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch bugs data');
            }
        } catch (err) {
            console.error('Error fetching bugs data:', err);
            setError('Failed to load bugs data');
        }
    };

    // Fetch all data on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                await Promise.all([
                    fetchProjectsData(),
                    fetchRequirementsData(),
                    fetchBugsData()
                ]);
            } catch (err) {
                console.error('Error fetching chart data:', err);
                setError('Failed to load chart data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Default fallback data
    const defaultProjectsData = {
        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
            {
                label: 'Completed Projects',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(52, 80, 163, 0.8)',
                borderColor: 'rgba(52, 80, 163, 1)',
                borderWidth: 2,
            },
            {
                label: 'Active Projects',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(255, 191, 0, 0.8)',
                borderColor: 'rgba(255, 191, 0, 1)',
                borderWidth: 2,
            },
        ],
    };

    const defaultRequirementsData = {
        labels: ['Pending', 'In Progress', 'Under Review', 'Completed'],
        datasets: [
            {
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const defaultBugsData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
            {
                label: 'Bugs Reported',
                data: [0, 0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 1)',
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                tension: 0.4,
            },
            {
                label: 'Bugs Resolved',
                data: [0, 0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 1)',
                pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
                padding: 12,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
                padding: 12,
            },
        },
        cutout: '60%',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Error State */}
            {error && (
                <div className="lg:col-span-2 xl:col-span-3 bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
                    <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Charts</p>
                    <p className="text-red-500 text-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <>
                    <div className="lg:col-span-2 xl:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg">
                        <div className="mb-6">
                            <div className="h-6 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                        <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                            <div className="text-gray-400">Loading Projects Chart...</div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg">
                        <div className="mb-6">
                            <div className="h-6 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                        <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                            <div className="text-gray-400">Loading Requirements Chart...</div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 xl:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg">
                        <div className="mb-6">
                            <div className="h-6 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                        <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                            <div className="text-gray-400">Loading Bugs Chart...</div>
                        </div>
                    </div>
                </>
            )}

            {/* Charts - Only show when data is loaded and no error */}
            {!loading && !error && (
                <>
                    {/* Projects Bar Chart */}
                    <div className="lg:col-span-2 xl:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Projects Overview</h3>
                            <p className="text-gray-600 text-sm">Monthly comparison of active and completed projects</p>
                        </div>
                        <div className="h-80">
                            <Bar data={projectsData || defaultProjectsData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Requirements Doughnut Chart */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Requirements Status</h3>
                            <p className="text-gray-600 text-sm">Current distribution of requirement statuses</p>
                        </div>
                        <div className="h-80 flex items-center justify-center">
                            <Doughnut data={requirementsData || defaultRequirementsData} options={doughnutOptions} />
                        </div>
                    </div>

                    {/* Bugs Line Chart */}
                    <div className="lg:col-span-2 xl:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Bug Tracking Trend</h3>
                            <p className="text-gray-600 text-sm">Weekly trend of bug reports and resolutions</p>
                        </div>
                        <div className="h-80">
                            <Line data={bugsData || defaultBugsData} options={chartOptions} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PerformanceCharts;
