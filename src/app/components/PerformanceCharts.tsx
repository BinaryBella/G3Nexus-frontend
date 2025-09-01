'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
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
    borderDash?: number[]; // For dotted lines
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

const PerformanceCharts: React.FC = () => {
    const [projectsData, setProjectsData] = useState<ChartData | null>(null);
    const [requirementsData, setRequirementsData] = useState<ChartData | null>(null);
    const [bugsData, setBugsData] = useState<ChartData | null>(null);
    const [bugStatusData, setBugStatusData] = useState<ChartData | null>(null); // New state for bug status chart
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // API base URL
    const API_BASE_URL = 'https://localhost:7289/api';

    // Listen for storage events to refresh when data changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'requirementUpdated' || e.key === 'bugUpdated') {
                console.log('Data updated, refreshing charts...');
                retryLoadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            retryLoadData();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Fetch projects data
    const fetchProjectsData = async () => {
        try {
            // Try the performance chart endpoint first
            const performanceResponse = await fetch(`${API_BASE_URL}/PerformanceCharts/projects?monthsBack=6`);
            
            if (performanceResponse.ok) {
                const result: ApiResponse<ChartData> = await performanceResponse.json();
                if (result.status && result.data) {
                    setProjectsData(result.data);
                    return;
                }
            }
            
            // Fallback: Fetch actual projects and process them
            console.log('Performance chart endpoint not available, fetching projects directly');
            const projectsResponse = await fetch(`${API_BASE_URL}/Project`);
            const projectsResult: ApiResponse<any[]> = await projectsResponse.json();
            
            if (projectsResult.status && projectsResult.data) {
                const projects = projectsResult.data;
                
                // Get current date and create last 6 months labels
                const now = new Date();
                const months = [];
                const completedCounts = [];
                const activeCounts = [];
                
                for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                    months.push(monthName);
                    
                    // Count projects for this month
                    let completed = 0;
                    let active = 0;
                    
                    projects.forEach(project => {
                        const projectDate = new Date(project.createdDate || project.startDate);
                        if (projectDate.getMonth() === date.getMonth() && 
                            projectDate.getFullYear() === date.getFullYear()) {
                            if (project.isActive === false || project.status === 'Completed') {
                                completed++;
                            } else {
                                active++;
                            }
                        }
                    });
                    
                    completedCounts.push(completed);
                    activeCounts.push(active);
                }
                
                const chartData: ChartData = {
                    labels: months,
                    datasets: [
                        {
                            label: 'Completed Projects',
                            data: completedCounts,
                            backgroundColor: 'rgba(52, 80, 163, 0.8)',
                            borderColor: 'rgba(52, 80, 163, 1)',
                            borderWidth: 2,
                        },
                        {
                            label: 'Active Projects',
                            data: activeCounts,
                            backgroundColor: 'rgba(255, 191, 0, 0.8)',
                            borderColor: 'rgba(255, 191, 0, 1)',
                            borderWidth: 2,
                        },
                    ],
                };
                
                setProjectsData(chartData);
            } else {
                throw new Error('Failed to fetch projects data');
            }
        } catch (err) {
            console.error('Error fetching projects data:', err);
            setError('Failed to load projects data');
        }
    };

    // Fetch requirements data
    const fetchRequirementsData = async () => {
        try {
            // Try the performance chart endpoint first
            const performanceResponse = await fetch(`${API_BASE_URL}/PerformanceCharts/requirements`);
            
            if (performanceResponse.ok) {
                const result: ApiResponse<ChartData> = await performanceResponse.json();
                if (result.status && result.data) {
                    setRequirementsData(result.data);
                    return;
                }
            }
            
            // Fallback: Fetch actual requirements and process them
            console.log('Performance chart endpoint not available, fetching requirements directly');
            const requirementsResponse = await fetch(`${API_BASE_URL}/Requirement`);
            const requirementsResult: ApiResponse<any[]> = await requirementsResponse.json();
            
            if (requirementsResult.status && requirementsResult.data) {
                const requirements = requirementsResult.data;
                const statusCounts = { pending: 0, inProgress: 0, underReview: 0, complete: 0 };
                
                requirements.forEach(req => {
                    switch (req.status) {
                        case 0:
                        case 'Pending':
                            statusCounts.pending++;
                            break;
                        case 1:
                        case 'In Progress':
                            statusCounts.inProgress++;
                            break;
                        case 2:
                        case 'Under Review':
                            statusCounts.underReview++;
                            break;
                        case 3:
                        case 'Complete':
                            statusCounts.complete++;
                            break;
                    }
                });
                
                const chartData: ChartData = {
                    labels: ['Pending', 'In Progress', 'Under Review', 'Complete'],
                    datasets: [
                        {
                            data: [statusCounts.pending, statusCounts.inProgress, statusCounts.underReview, statusCounts.complete],
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
                
                setRequirementsData(chartData);
            } else {
                throw new Error('Failed to fetch requirements data');
            }
        } catch (err) {
            console.error('Error fetching requirements data:', err);
            setError('Failed to load requirements data');
        }
    };

    // Fetch bugs data
    const fetchBugsData = async () => {
        try {
            // Try the performance chart endpoint first
            const performanceResponse = await fetch(`${API_BASE_URL}/PerformanceCharts/bugs?weeksBack=6`);
            
            if (performanceResponse.ok) {
                const result: ApiResponse<ChartData> = await performanceResponse.json();
                if (result.status && result.data) {
                    setBugsData(result.data);
                    // If performance endpoint works, try to get status data separately
                    const statusResponse = await fetch(`${API_BASE_URL}/PerformanceCharts/bug-status`);
                    if (statusResponse.ok) {
                        const statusResult: ApiResponse<ChartData> = await statusResponse.json();
                        if (statusResult.status && statusResult.data) {
                            setBugStatusData(statusResult.data);
                        }
                    }
                    return;
                }
            }
            
            // Fallback: Fetch actual bugs and create timeline chart
            console.log('Performance chart endpoint not available, fetching bugs directly');
            const bugsResponse = await fetch(`${API_BASE_URL}/Bug`);
            const bugsResult: ApiResponse<any[]> = await bugsResponse.json();
            
            if (bugsResult.status && bugsResult.data) {
                const bugs = bugsResult.data;
                
                // Get current date and create last 6 weeks labels
                const now = new Date();
                const weeks = [];
                const reportedCounts = [];
                const resolvedCounts = [];
                
                for (let i = 5; i >= 0; i--) {
                    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
                    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
                    weeks.push(`Week ${6-i}`);
                    
                    // Count bugs for this week
                    let reported = 0;
                    let resolved = 0;
                    
                    bugs.forEach(bug => {
                        const bugDate = new Date(bug.createdDate || bug.reportedDate);
                        if (bugDate >= weekStart && bugDate <= weekEnd) {
                            reported++;
                            if (bug.status === 3 || bug.status === 'Complete') {
                                resolved++;
                            }
                        }
                    });
                    
                    reportedCounts.push(reported);
                    resolvedCounts.push(resolved);
                }
                
                // Create a timeline chart with dotted lines
                const chartData: ChartData = {
                    labels: weeks,
                    datasets: [
                        {
                            label: 'Bugs Reported',
                            data: reportedCounts,
                            fill: false,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderDash: [5, 5], // Dotted line
                            pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            tension: 0.4,
                            borderWidth: 3,
                        },
                        {
                            label: 'Bugs Resolved',
                            data: resolvedCounts,
                            fill: false,
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            borderColor: 'rgba(34, 197, 94, 1)',
                            borderDash: [10, 5], // Different dotted pattern
                            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            tension: 0.4,
                            borderWidth: 3,
                        },
                    ],
                };
                
                setBugsData(chartData);
                
                // Also create status distribution chart
                const statusCounts = { pending: 0, inProgress: 0, underReview: 0, complete: 0 };
                
                bugs.forEach(bug => {
                    switch (bug.status) {
                        case 0:
                        case 'Pending':
                            statusCounts.pending++;
                            break;
                        case 1:
                        case 'In Progress':
                            statusCounts.inProgress++;
                            break;
                        case 2:
                        case 'Under Review':
                            statusCounts.underReview++;
                            break;
                        case 3:
                        case 'Complete':
                            statusCounts.complete++;
                            break;
                    }
                });
                
                const statusChartData: ChartData = {
                    labels: ['Pending', 'In Progress', 'Under Review', 'Complete'],
                    datasets: [
                        {
                            data: [statusCounts.pending, statusCounts.inProgress, statusCounts.underReview, statusCounts.complete],
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
                
                setBugStatusData(statusChartData);
            } else {
                throw new Error('Failed to fetch bugs data');
            }
        } catch (err) {
            console.error('Error fetching bugs data:', err);
            setError('Failed to load bugs data');
        }
    };

    // Function to retry loading data
    const retryLoadData = () => {
        setError(null);
        setLastRefresh(new Date());
        const fetchAllData = async () => {
            setLoading(true);
            
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
    };

    // Fetch all data on component mount
    useEffect(() => {
        retryLoadData();
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
                fill: false,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderDash: [5, 5],
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                tension: 0.4,
                borderWidth: 3,
            },
            {
                label: 'Bugs Resolved',
                data: [0, 0, 0, 0, 0, 0],
                fill: false,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderDash: [10, 5],
                pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                tension: 0.4,
                borderWidth: 3,
            },
        ],
    };

    const defaultBugStatusData = {
        labels: ['Pending', 'In Progress', 'Under Review', 'Complete'],
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
        <div className="space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                    <p className="text-gray-600 text-sm">
                        Real-time insights into project progress and status
                        {lastRefresh && (
                            <span className="ml-2 text-xs text-gray-500">
                                • Last updated: {lastRefresh.toLocaleTimeString()}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={retryLoadData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Error State */}
            {error && (
                <div className="lg:col-span-2 xl:col-span-4 bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
                    <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Charts</p>
                    <p className="text-red-500 text-sm">{error}</p>
                    <button 
                        onClick={retryLoadData} 
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

                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg">
                        <div className="mb-6">
                            <div className="h-6 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                        <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                            <div className="text-gray-400">Loading Bug Status Chart...</div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 xl:col-span-4 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg">
                        <div className="mb-6">
                            <div className="h-6 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                        <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                            <div className="text-gray-400">Loading Bug Trend Chart...</div>
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

                    {/* Bug Tracking Line Chart */}
                    <div className="lg:col-span-2 xl:col-span-4 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Bug Tracking Trend</h3>
                            <p className="text-gray-600 text-sm">Weekly trend of bug reports and resolutions with dotted line visualization</p>
                        </div>
                        <div className="h-80">
                            <Line data={bugsData || defaultBugsData} options={chartOptions} />
                        </div>
                    </div>
                </>
            )}
            </div>
        </div>
    );
};

export default PerformanceCharts;
