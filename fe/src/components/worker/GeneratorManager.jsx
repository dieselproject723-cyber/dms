import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const GeneratorManager = ({ onSuccess, editingGenerator, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    fuelEfficiency: '',
    operatorId: ''
  });
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (editingGenerator) {
      setFormData({
        name: editingGenerator.name || '',
        capacity: editingGenerator.capacity?.toString() || '',
        location: editingGenerator.location || '',
        fuelEfficiency: editingGenerator.fuelEfficiency?.toString() || '',
        operatorId: editingGenerator.operator?._id || ''
      });
      setIsEdit(true);
    } else {
      setFormData({
        name: '',
        capacity: '',
        location: '',
        fuelEfficiency: '',
        operatorId: ''
      });
      setIsEdit(false);
    }
  }, [editingGenerator]);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/auth/workers');
      setWorkers(response.data);
    } catch (error) {
      toast.error('Failed to fetch workers');
      setWorkers([]);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        name: formData.name,
        capacity: Number(formData.capacity),
        location: formData.location,
        fuelEfficiency: Number(formData.fuelEfficiency),
        operatorId: formData.operatorId || null
      };

      if (isEdit) {
        await axios.patch(`/api/generators/${editingGenerator._id}`, {
          name: payload.name,
          location: payload.location,
          operator: payload.operatorId
        });
        toast.success('Generator updated successfully');
        onCancelEdit?.();
      } else {
        await axios.post('/api/generators', payload);
        toast.success('Generator created successfully');
        setFormData({
          name: '',
          capacity: '',
          location: '',
          fuelEfficiency: '',
          operatorId: ''
        });
      }
      
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} generator`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      capacity: '',
      location: '',
      fuelEfficiency: '',
      operatorId: ''
    });
    setIsEdit(false);
    onCancelEdit?.();
  };

  if (loadingWorkers) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">
        {isEdit ? 'Edit Generator' : 'Create New Generator'}
      </h2>
      
      {isEdit && editingGenerator && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Current Fuel: <span className="font-bold">{editingGenerator.currentFuel?.toFixed(2) || '0.00'}L</span>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Note: Capacity and fuel efficiency cannot be changed after creation
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generator Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter generator name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Capacity (L) *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            step="0.01"
            required
            disabled={isEdit}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter fuel capacity"
          />
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">
              Capacity cannot be changed after creation
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter generator location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Efficiency (L/hour) *
          </label>
          <input
            type="number"
            name="fuelEfficiency"
            value={formData.fuelEfficiency}
            onChange={handleChange}
            min="0.1"
            step="0.1"
            required
            disabled={isEdit}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter fuel consumption rate"
          />
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">
              Fuel efficiency cannot be changed after creation
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Operator
          </label>
          <select
            name="operatorId"
            value={formData.operatorId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select an operator (optional)</option>
            {workers.map(worker => (
              <option key={worker._id} value={worker._id}>
                {worker.name} ({worker.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            You can assign a worker to operate this generator
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Generator' : 'Create Generator')}
          </button>
          
          {isEdit && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GeneratorManager; 