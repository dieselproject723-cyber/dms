import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const WorkerActivityHistory = () => {
  const [runLogs, setRunLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerHistory();
  }, []);

  const fetchWorkerHistory = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/fuel/worker/history'));
      setRunLogs(response.data.runLogs || []);
    } catch (error) {
      toast.error('Failed to fetch activity history');
      console.error('Error fetching worker history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateTotalFuelUsed = () => {
    return runLogs.reduce((total, log) => total + (log.fuelConsumed || 0), 0);
  };

  const calculateTotalDuration = () => {
    return runLogs.reduce((total, log) => total + (log.duration || 0), 0);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading your activity history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">My Generator Operations</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">{runLogs.length}</p>
          <p className="text-sm text-green-700">Total Runs</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">{formatDuration(calculateTotalDuration())}</p>
          <p className="text-sm text-blue-700">Total Runtime</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">{calculateTotalFuelUsed().toFixed(1)}L</p>
          <p className="text-sm text-purple-700">Fuel Consumed</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-600">
            {runLogs.length > 0 ? (calculateTotalDuration() / runLogs.length).toFixed(0) : 0}m
          </p>
          <p className="text-sm text-orange-700">Avg Duration</p>
        </div>
      </div>

      {/* Run Logs List */}
      {runLogs.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {runLogs.map(log => (
            <div key={log._id} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-green-700 flex items-center">
                    <span className="mr-2">⚙️</span>
                    {log.generator?.name || 'Unknown Generator'}
                  </p>
                  <div className="text-sm text-green-600 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">⏱️</span>
                      <span>Duration: <span className="font-bold">{formatDuration(log.duration)}</span></span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">⛽</span>
                      <span>Fuel Used: <span className="font-bold">{log.fuelConsumed?.toFixed(2) || '0.00'}L</span></span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">📈</span>
                      <span>Efficiency: <span className="font-bold">{((log.fuelConsumed / (log.duration / 60)) || 0).toFixed(1)}L/h</span></span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-3">
                    <span className="mr-1">📅</span>
                    <span>{formatDate(log.createdAt)}</span>
                  </div>
                </div>
                <div className="text-green-500 text-2xl ml-4">
                  ✅
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-lg mb-2">No generator operations yet</p>
          <p className="text-sm">
            Start by adding your first generator run log above
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkerActivityHistory; 