import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getApiUrl } from '../../config/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const GeneratorReports = () => {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30))); // Last 30 days
    const [endDate, setEndDate] = useState(new Date());
    const [showColumnFilter, setShowColumnFilter] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        runtime: true,
        fuelConsumed: true,
        fuelReceived: true,
        cost: true,
        efficiency: true,
        costPerHour: true,
        runtimeThisMonth: false,
        runtimeThisYear: false,
        runtimeTotal: false,
        fuelConsumedThisMonth: false,
        fuelConsumedThisYear: false,
        fuelConsumedTotal: false,
        costThisMonth: false,
        costThisYear: false,
        costTotal: false
    });

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get(getApiUrl('/api/fuel/reports/generators'), {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            setReports(response.data);
        } catch (error) {
            toast.error('Failed to fetch generator reports');
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [startDate, endDate]);

    const toggleColumn = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatRuntime = (hours) => {
        const totalHours = Math.floor(hours);
        const minutes = Math.round((hours - totalHours) * 60);
        return `${totalHours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading generator reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Generator Details Table */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-600">Generator Performance Report</h2>
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnFilter(!showColumnFilter)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <span>Columns</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {showColumnFilter && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Default Columns</div>
                                    <div className="px-4 py-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="runtime"
                                                    checked={visibleColumns.runtime}
                                                    onChange={() => toggleColumn('runtime')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="runtime" className="ml-2 text-sm text-gray-700">Runtime (hrs)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="fuelConsumed"
                                                    checked={visibleColumns.fuelConsumed}
                                                    onChange={() => toggleColumn('fuelConsumed')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="fuelConsumed" className="ml-2 text-sm text-gray-700">Fuel Consumed (L)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="fuelReceived"
                                                    checked={visibleColumns.fuelReceived}
                                                    onChange={() => toggleColumn('fuelReceived')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="fuelReceived" className="ml-2 text-sm text-gray-700">Fuel Received (L)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="cost"
                                                    checked={visibleColumns.cost}
                                                    onChange={() => toggleColumn('cost')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="cost" className="ml-2 text-sm text-gray-700">Cost (₹)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="efficiency"
                                                    checked={visibleColumns.efficiency}
                                                    onChange={() => toggleColumn('efficiency')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="efficiency" className="ml-2 text-sm text-gray-700">Efficiency (L/hr)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="costPerHour"
                                                    checked={visibleColumns.costPerHour}
                                                    onChange={() => toggleColumn('costPerHour')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="costPerHour" className="ml-2 text-sm text-gray-700">Cost/Hour (₹)</label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-t">Additional Columns</div>
                                    <div className="px-4 py-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="runtimeThisMonth"
                                                    checked={visibleColumns.runtimeThisMonth}
                                                    onChange={() => toggleColumn('runtimeThisMonth')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="runtimeThisMonth" className="ml-2 text-sm text-gray-700">Runtime (This Month)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="runtimeThisYear"
                                                    checked={visibleColumns.runtimeThisYear}
                                                    onChange={() => toggleColumn('runtimeThisYear')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="runtimeThisYear" className="ml-2 text-sm text-gray-700">Runtime (This Year)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="runtimeTotal"
                                                    checked={visibleColumns.runtimeTotal}
                                                    onChange={() => toggleColumn('runtimeTotal')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="runtimeTotal" className="ml-2 text-sm text-gray-700">Runtime (Total)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="fuelConsumedThisMonth"
                                                    checked={visibleColumns.fuelConsumedThisMonth}
                                                    onChange={() => toggleColumn('fuelConsumedThisMonth')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="fuelConsumedThisMonth" className="ml-2 text-sm text-gray-700">Fuel (This Month)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="fuelConsumedThisYear"
                                                    checked={visibleColumns.fuelConsumedThisYear}
                                                    onChange={() => toggleColumn('fuelConsumedThisYear')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="fuelConsumedThisYear" className="ml-2 text-sm text-gray-700">Fuel (This Year)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="fuelConsumedTotal"
                                                    checked={visibleColumns.fuelConsumedTotal}
                                                    onChange={() => toggleColumn('fuelConsumedTotal')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="fuelConsumedTotal" className="ml-2 text-sm text-gray-700">Fuel (Total)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="costThisMonth"
                                                    checked={visibleColumns.costThisMonth}
                                                    onChange={() => toggleColumn('costThisMonth')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="costThisMonth" className="ml-2 text-sm text-gray-700">Cost (This Month)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="costThisYear"
                                                    checked={visibleColumns.costThisYear}
                                                    onChange={() => toggleColumn('costThisYear')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="costThisYear" className="ml-2 text-sm text-gray-700">Cost (This Year)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="costTotal"
                                                    checked={visibleColumns.costTotal}
                                                    onChange={() => toggleColumn('costTotal')}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="costTotal" className="ml-2 text-sm text-gray-700">Cost (Total)</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generator</th>
                                {visibleColumns.runtime && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime (hrs)</th>
                                )}
                                {visibleColumns.fuelConsumed && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Consumed (L)</th>
                                )}
                                {visibleColumns.fuelReceived && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Received (L)</th>
                                )}
                                {visibleColumns.cost && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (₹)</th>
                                )}
                                {visibleColumns.efficiency && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency (L/hr)</th>
                                )}
                                {visibleColumns.costPerHour && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Hour (₹)</th>
                                )}
                                {visibleColumns.runtimeThisMonth && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime (This Month)</th>
                                )}
                                {visibleColumns.runtimeThisYear && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime (This Year)</th>
                                )}
                                {visibleColumns.runtimeTotal && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime (Total)</th>
                                )}
                                {visibleColumns.fuelConsumedThisMonth && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel (This Month)</th>
                                )}
                                {visibleColumns.fuelConsumedThisYear && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel (This Year)</th>
                                )}
                                {visibleColumns.fuelConsumedTotal && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel (Total)</th>
                                )}
                                {visibleColumns.costThisMonth && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (This Month)</th>
                                )}
                                {visibleColumns.costThisYear && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (This Year)</th>
                                )}
                                {visibleColumns.costTotal && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (Total)</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports?.generators.map((gen, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gen.name}</td>
                                    {visibleColumns.runtime && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.totalRuntimeHours}</td>
                                    )}
                                    {visibleColumns.fuelConsumed && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.totalFuelConsumed}</td>
                                    )}
                                    {visibleColumns.fuelReceived && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.totalFuelReceived}</td>
                                    )}
                                    {visibleColumns.cost && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{gen.totalCost}</td>
                                    )}
                                    {visibleColumns.efficiency && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.averageEfficiency}</td>
                                    )}
                                    {visibleColumns.costPerHour && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{gen.costPerHour}</td>
                                    )}
                                    {visibleColumns.runtimeThisMonth && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.runtimeThisMonth}</td>
                                    )}
                                    {visibleColumns.runtimeThisYear && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.runtimeThisYear}</td>
                                    )}
                                    {visibleColumns.runtimeTotal && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.runtimeTotal}</td>
                                    )}
                                    {visibleColumns.fuelConsumedThisMonth && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.fuelConsumedThisMonth}</td>
                                    )}
                                    {visibleColumns.fuelConsumedThisYear && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.fuelConsumedThisYear}</td>
                                    )}
                                    {visibleColumns.fuelConsumedTotal && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.fuelConsumedTotal}</td>
                                    )}
                                    {visibleColumns.costThisMonth && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.costThisMonth}</td>
                                    )}
                                    {visibleColumns.costThisYear && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.costThisYear}</td>
                                    )}
                                    {visibleColumns.costTotal && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.costTotal}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GeneratorReports; 