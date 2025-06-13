import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const WorkerActivityHistory = ({ refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]); // To store both main entries and generator transfers
  const [runLogs, setRunLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerHistory();
  }, [refreshTrigger]);

  const fetchWorkerHistory = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/fuel/worker/history'));
      setTransactions(response.data.transactions || []);
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
    // Sum fuel from run logs and amount from generator transfers (main entries are not fuel *used* by worker)
    const totalRunLogFuel = runLogs.reduce((total, log) => total + (log.fuelConsumed || 0), 0);
    const totalTransferFuel = transactions.reduce((total, trans) => total + (trans.type === 'to_generator' ? (trans.amount || 0) : 0), 0);
    return totalRunLogFuel + totalTransferFuel;
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
      <h2 className="text-xl font-semibold mb-4">My Operations History</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">{runLogs.length + transactions.length}</p>
          <p className="text-sm text-green-700">Total Operations</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">{formatDuration(calculateTotalDuration())}</p>
          <p className="text-sm text-blue-700">Total Runtime</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">{calculateTotalFuelUsed().toFixed(1)}L</p>
          <p className="text-sm text-purple-700">Fuel Transferred/Consumed</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-600">
            {transactions.length > 0 ? (calculateTotalFuelUsed() / (runLogs.length + transactions.length)).toFixed(1) : 0}L/Op
          </p>
          <p className="text-sm text-orange-700">Avg Fuel/Op</p>
        </div>
      </div>

      {/* Combined History List */}
      {transactions.length === 0 && runLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg mb-2">No activity history yet</p>
          <p className="text-sm">
            Start by adding generator run logs or viewing fuel transfers
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {[...transactions, ...runLogs]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(item => {
              // Check if it's a run log (has 'duration' property)
              if (item.duration !== undefined) {
                return (
                  <div key={item._id} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-green-700 flex items-center">
                          <span className="mr-2">⚙️</span>
                          Generator Run Log: {item.generator?.name || 'Unknown Generator'}
                        </p>
                        <div className="text-sm text-green-600 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">⏱️</span>
                            <span>Duration: <span className="font-bold">{formatDuration(item.duration)}</span></span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">⛽</span>
                            <span>Fuel Used: <span className="font-bold">{item.fuelConsumed?.toFixed(2) || '0.00'}L</span></span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">📈</span>
                            <span>Efficiency: <span className="font-bold">{((item.fuelConsumed / (item.duration / 60)) || 0).toFixed(1)}L/h</span></span>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-3">
                          <span className="mr-1">📅</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-green-500 text-2xl ml-4">
                        ✅
                      </div>
                    </div>
                  </div>
                );
              } else { // It's a fuel transaction (MainFuelEntry or GeneratorFuelTransfer)
                return (
                  <div key={item._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-blue-700 flex items-center">
                          {item.quantity ? 'Main Container Fuel Entry' : `Fuel Transfer to ${item.toGenerator?.name || 'Generator'}`}
                        </p>
                        <div className="text-sm text-blue-600 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.quantity && (
                            <>
                              <div>
                                <span className="text-gray-500 mr-1">📦</span>
                                <span>Quantity: <span className="font-bold">{item.quantity?.toFixed(2) || '0.00'}L</span></span>
                              </div>
                              <div>
                                <span className="text-gray-500 mr-1">💲</span>
                                <span>Rate: <span className="font-bold">{item.rate?.toFixed(2) || '0.00'}</span></span>
                              </div>
                              <div>
                                <span className="text-gray-500 mr-1">💰</span>
                                <span>Amount: <span className="font-bold">{item.amount?.toFixed(2) || '0.00'}</span></span>
                              </div>
                            </>
                          )}
                          {!item.quantity && (
                            <div>
                              <span className="text-gray-500 mr-1">⛽</span>
                              <span>Transfer Amount: <span className="font-bold">{item.amount?.toFixed(2) || '0.00'}L</span></span>
                            </div>
                          )}
                        </div>
                        {item.receivedBy && (
                            <div className="text-sm text-blue-600 mt-2">
                                Received By: <span className="font-bold">{item.receivedBy}</span>
                            </div>
                        )}
                        {item.supplyingUnitName && (
                            <div className="text-sm text-blue-600">
                                From: <span className="font-bold">{item.supplyingUnitName} ({item.supplyingUnitLocation})</span>
                            </div>
                        )}
                        {item.receivingUnitName && (
                            <div className="text-sm text-blue-600">
                                To: <span className="font-bold">{item.receivingUnitName} ({item.receivingUnitLocation})</span>
                            </div>
                        )}

                        <div className="flex items-center text-xs text-gray-500 mt-3">
                          <span className="mr-1">📅</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-blue-500 text-2xl ml-4">
                        ➡️
                      </div>
                    </div>
                  </div>
                );
              }
            })
          }
        </div>
      )}
    </div>
  );
};

export default WorkerActivityHistory; 