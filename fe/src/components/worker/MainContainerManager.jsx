import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const MainContainerManager = ({ onSuccess, existingContainer }) => {
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (existingContainer) {
      setCapacity(existingContainer.capacity?.toString() || '');
      setIsEdit(true);
    } else {
      setCapacity('');
      setIsEdit(false);
    }
  }, [existingContainer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await axios.patch('/api/fuel/main-container', { capacity: Number(capacity) });
        toast.success('Main container updated successfully');
      } else {
        await axios.post('/api/fuel/main-container', { capacity: Number(capacity) });
        toast.success('Main container created successfully');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} main container`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">
        {isEdit ? 'Edit Main Container' : 'Create Main Container'}
      </h2>
      
      {isEdit && existingContainer && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Current Fuel: <span className="font-bold">{existingContainer.currentFuel?.toFixed(2) || '0.00'}L</span>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Note: New capacity cannot be less than current fuel level
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Container Capacity (L) *
          </label>
          <input
            type="number"
            min={isEdit && existingContainer ? existingContainer.currentFuel : "1"}
            step="0.01"
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter container capacity"
          />
          <p className="text-xs text-gray-500 mt-1">
            Specify the maximum fuel capacity of the main container
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Container' : 'Create Container')}
        </button>
      </form>
    </div>
  );
};

export default MainContainerManager; 