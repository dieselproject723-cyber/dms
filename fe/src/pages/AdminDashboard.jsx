import React, { useEffect, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { toast } from 'react-toastify';
import MainContainerEntry from '../components/worker/MainContainerEntry';
import TransferFuel from '../components/worker/TransferFuel';
import AddWorker from '../components/worker/AddWorker';
import MainContainerManager from '../components/worker/MainContainerManager';
import GeneratorManager from '../components/worker/GeneratorManager';
import GeneratorsList from '../components/worker/GeneratorsList';
import ProfileButton from '../components/ProfileButton';
import { getApiUrl } from '../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import WorkersList from '../components/worker/WorkersList';
import GeneratorReports from '../components/reports/GeneratorReports';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [editingGenerator, setEditingGenerator] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const [fuelStatsResponse, workersResponse] = await Promise.all([
                axios.get(getApiUrl('/api/fuel/stats')),
                axios.get(getApiUrl('/api/auth/workers'))
            ]);
            setStats(fuelStatsResponse.data);
            setWorkers(workersResponse.data);
        } catch (error) {
            toast.error('Error fetching dashboard data. Please check backend and console.');
            setStats(null);
            setWorkers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 300000); // Refresh every 5 minutes
        return () => clearInterval(interval);
    }, [fetchStats]);

    const handleSuccess = () => {
        fetchStats(); // Re-fetch all stats and workers on success of an action
    };

    const handleEditGenerator = (generator) => {
        setEditingGenerator(generator);
        setActiveTab('generators');
    };

    const handleCancelEdit = () => {
        setEditingGenerator(null);
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'container', label: 'Main Container', icon: '🛢️' },
        { id: 'generators', label: 'Generators', icon: '⚡' },
        { id: 'workers', label: 'Workers', icon: '👥' },
        { id: 'reports', label: 'Reports', icon: '📈' },
    ];

    if (loading) return <div className="p-6 text-center text-xl">Loading dashboard data...</div>;

    const safeGenerators = Array.isArray(stats?.generators) ? stats.generators : [];
    const safeMainContainer = stats?.mainContainer || {};
    const safeRecentTransactions = Array.isArray(stats?.recentTransactions) ? stats.recentTransactions : [];
    const safeRecentRunLogs = Array.isArray(stats?.recentRunLogs) ? stats.recentRunLogs : [];
    const safeWorkers = Array.isArray(workers) ? workers : [];

    const generatorData = {
        labels: safeGenerators.map(g => g.name),
        datasets: [{
            label: 'Current Fuel Level (L)',
            data: safeGenerators.map(g => g.currentFuel),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        }]
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-600">Transfer Fuel to Generator</h2>
                                {safeGenerators.length > 0 && safeMainContainer.capacity !== undefined ? (
                                    <TransferFuel 
                                        generators={safeGenerators}
                                        mainContainer={safeMainContainer}
                                        onSuccess={handleSuccess}
                                    />
                                ) : <p className="text-sm text-gray-500 pt-2">Generator or Main Container data not fully available for fuel transfer operations.</p>}
                            </div>
                        </div>

                        {safeMainContainer.capacity !== undefined ? (
                            <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-600">Main Container Status</h2>
                                <div className="flex flex-col sm:flex-row items-center justify-around">
                                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                                        <p className="text-lg">Current Fuel: <span className="font-bold text-blue-600">{safeMainContainer.currentFuel?.toFixed(2) || '0.00'}L</span></p>
                                        <p className="text-lg">Capacity: <span className="font-bold">{safeMainContainer.capacity?.toFixed(2) || 'N/A'}L</span></p>
                                        {safeMainContainer.lastRefillDate && <p className="text-sm text-gray-500 mt-1">Last Refill: {new Date(safeMainContainer.lastRefillDate).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="w-36 h-36 relative">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e6e6" strokeWidth="3.5" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={safeMainContainer.currentFuel / safeMainContainer.capacity >= 0.2 ? "#4CAF50" : "#F44336"} strokeWidth="3.5" strokeDasharray={`${(safeMainContainer.currentFuel / safeMainContainer.capacity) * 100}, 100`} strokeLinecap="round" />
                                            <text x="18" y="20.5" textAnchor="middle" className="text-base font-bold fill-current text-gray-700">
                                                {safeMainContainer.capacity ? `${Math.round((safeMainContainer.currentFuel / safeMainContainer.capacity) * 100)}%` : 'N/A'}
                                            </text>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ) : <div className="mb-8 bg-white p-6 rounded-lg shadow-lg text-gray-500 text-center">Main Container data not available. Please set up the main container.</div>}

                        {safeGenerators.length > 0 ? (
                            <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-600">Generator Fuel Levels</h2>
                                <div className="h-80">
                                    <Line data={generatorData} options={{ maintainAspectRatio: false, responsive: true }} />
                                </div>
                            </div>
                        ) : <div className="mb-8 bg-white p-6 rounded-lg shadow-lg text-gray-500 text-center">No generator data to display. Please add generators.</div>}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-600">Recent Transactions</h2>
                                {safeRecentTransactions.length > 0 ? (
                                    <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                                        {safeRecentTransactions.map(transaction => (
                                            <div key={transaction._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                <p className="font-semibold text-indigo-700">
                                                  {transaction.type === 'main_entry' 
                                                    ? `Main Container Refill (Qty: ${transaction.quantity}L, Rate: ${transaction.rate}, Amt: ${transaction.amount})` 
                                                    : `Transfer to ${transaction.toGenerator?.name || 'Generator'}`}
                                                </p>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {transaction.type === 'main_entry' ? (
                                                        <>
                                                            Received By: <span className="font-bold">{transaction.receivedBy}</span> | 
                                                            From: <span className="font-bold">{transaction.supplyingUnitName} ({transaction.supplyingUnitLocation})</span> | 
                                                            To: <span className="font-bold">{transaction.receivingUnitName} ({transaction.receivingUnitLocation})</span>
                                                        </>
                                                    ) : (
                                                        `Amount: `
                                                    )}
                                                    <span className="font-bold">{transaction.amount}L</span>
                                                    {transaction.worker?.name && <> | Worker: <span className="font-bold">{transaction.worker.name}</span></>}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(transaction.createdAt).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-center py-4">No recent transactions.</p>}
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-600">Recent Run Logs</h2>
                                {safeRecentRunLogs.length > 0 ? (
                                    <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                                        {safeRecentRunLogs.map(log => (
                                            <div key={log._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                <p className="font-semibold text-green-700">{log.generator?.name || 'A Generator'}</p>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    Duration: <span className="font-bold">{log.duration} min</span> | 
                                                    Fuel Used: <span className="font-bold">{log.fuelConsumed?.toFixed(2) || '0.00'}L</span>
                                                    {log.worker?.name && <> | Worker: <span className="font-bold">{log.worker.name}</span></>}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 text-center py-4">No recent run logs.</p>}
                            </div>
                        </div>
                    </>
                );

            case 'container':
                return (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-600">Add Fuel to Main Container</h2>
                            <MainContainerEntry onSuccess={handleSuccess} />
                        </div>
                        <MainContainerManager 
                            onSuccess={handleSuccess}
                            existingContainer={safeMainContainer.capacity !== undefined ? safeMainContainer : null}
                        />
                    </div>
                );

            case 'generators':
                return (
                    <div className="space-y-8">
                        <GeneratorManager 
                            onSuccess={handleSuccess}
                            editingGenerator={editingGenerator}
                            onCancelEdit={handleCancelEdit}
                        />
                        <GeneratorsList 
                            generators={safeGenerators}
                            onEditGenerator={handleEditGenerator}
                        />
                    </div>
                );

            case 'workers':
                return (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-600">Manage Worker Accounts</h2>
                            <AddWorker onSuccess={handleSuccess} />
                        </div>
                        <WorkersList workers={safeWorkers} />
                    </div>
                );

            case 'reports':
                return (
                    <div className="space-y-8">
                        <GeneratorReports />
                    </div>
                );

            default:
                return null;
        }
    };

    if (!stats) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Diesel Management Dashboard</h1>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 mt-6 rounded-md shadow-md" role="alert">
                    <p className="font-bold text-lg">Dashboard Data Unavailable</p>
                    <p className="mt-2">Could not load dashboard statistics. This might be due to a network issue, a backend problem, or because essential data (like main container or generators) hasn't been set up yet. Please check the browser console for specific errors.</p>
                    <button 
                        onClick={fetchStats} 
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header with title and profile */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-700">Diesel Management Dashboard</h1>
                <ProfileButton />
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (tab.id !== 'generators') {
                                        setEditingGenerator(null);
                                    }
                                }}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
        </div>
    );
};

export default AdminDashboard;