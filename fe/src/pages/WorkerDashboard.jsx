import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import GeneratorList from '../components/worker/GeneratorList';
import AddRunLog from '../components/worker/AddRunLog';
import WorkerActivityHistory from '../components/worker/WorkerActivityHistory';
import ProfileButton from '../components/ProfileButton';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [generators, setGenerators] = useState([]);

  useEffect(() => {
    fetchGenerators();
  }, []);

  const fetchGenerators = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/generators'));
      setGenerators(response.data);
    } catch (error) {
      toast.error('Failed to fetch generators');
    }
  };

  const handleActivityUpdate = () => {
    fetchGenerators(); // Refresh generators when activities are updated
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with title and profile */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Worker Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>
        <ProfileButton />
      </div>
      
      {/* Top section with generators and add run log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Generators</h2>
          <GeneratorList generators={generators} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Run Log</h2>
          <AddRunLog generators={generators} onSuccess={handleActivityUpdate} />
        </div>
      </div>
      
      {/* Activity history section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Activity History</h2>
        <WorkerActivityHistory />
      </div>
    </div>
  );
};

export default WorkerDashboard; 