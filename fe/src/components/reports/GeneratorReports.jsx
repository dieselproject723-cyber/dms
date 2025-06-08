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
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Generator Reports</h2>
                
                {/* Date Range Selector */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            className="border rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            className="border rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                {/* Overall Statistics */}
                {reports?.overall && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-700">Total Runtime</h3>
                            <p className="text-2xl font-bold">{reports.overall.totalRuntime} hours</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-700">Total Fuel Consumed</h3>
                            <p className="text-2xl font-bold">{reports.overall.totalFuelConsumed}L</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-700">Total Cost</h3>
                            <p className="text-2xl font-bold">₹{reports.overall.totalCost}</p>
                        </div>
                    </div>
                )}

                {/* Generator Details Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generator</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime (hrs)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Consumed (L)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Received (L)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency (L/hr)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Hour (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports?.generators.map((gen, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gen.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.totalRuntimeHours}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.totalFuelConsumed}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.totalFuelReceived}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{gen.totalCost}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gen.averageEfficiency}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{gen.costPerHour}</td>
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