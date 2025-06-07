import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const TransferFuel = ({ generators, mainContainer, onSuccess }) => {
  const [generatorId, setGeneratorId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(getApiUrl('/api/fuel/generator/transfer'), {
        generatorId,
        amount: Number(amount)
      });
      toast.success('Fuel transferred successfully');
      setAmount('');
      setGeneratorId('');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to transfer fuel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Generator
        </label>
        <select
          value={generatorId}
          onChange={(e) => setGeneratorId(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a generator</option>
          {generators.map(generator => (
            <option key={generator._id} value={generator._id}>
              {generator.name} - Current: {generator.currentFuel}L
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fuel Amount (L)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Transferring...' : 'Transfer Fuel'}
      </button>
    </form>
  );
};

export default TransferFuel; 