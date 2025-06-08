import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const MainContainerEntry = ({ onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [receivedBy, setReceivedBy] = useState('');
  const [receivingUnitName, setReceivingUnitName] = useState('');
  const [receivingUnitLocation, setReceivingUnitLocation] = useState('');
  const [supplyingUnitName, setSupplyingUnitName] = useState('');
  const [supplyingUnitLocation, setSupplyingUnitLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qty = parseFloat(quantity);
    const rt = parseFloat(rate);
    if (!isNaN(qty) && !isNaN(rt)) {
      setCalculatedAmount(qty * rt);
    } else {
      setCalculatedAmount(0);
    }
  }, [quantity, rate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(getApiUrl('/api/fuel/main-container/add'), {
        quantity: Number(quantity),
        rate: Number(rate),
        amount: calculatedAmount,
        receivedBy,
        receivingUnitName,
        receivingUnitLocation,
        supplyingUnitName,
        supplyingUnitLocation,
      });
      toast.success('Fuel added successfully');
      setQuantity('');
      setRate('');
      setReceivedBy('');
      setReceivingUnitName('');
      setReceivingUnitLocation('');
      setSupplyingUnitName('');
      setSupplyingUnitLocation('');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add fuel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fuel Quantity (L) *
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter fuel quantity"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate (per L) *
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter rate per liter"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Amount
        </label>
        <input
          type="text"
          value={calculatedAmount.toFixed(2)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Received By (Person Name) *
        </label>
        <input
          type="text"
          required
          value={receivedBy}
          onChange={(e) => setReceivedBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter name of receiver"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receiving Unit Name *
        </label>
        <input
          type="text"
          required
          value={receivingUnitName}
          onChange={(e) => setReceivingUnitName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter receiving unit name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receiving Unit Location *
        </label>
        <input
          type="text"
          required
          value={receivingUnitLocation}
          onChange={(e) => setReceivingUnitLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter receiving unit location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplying Unit Name *
        </label>
        <input
          type="text"
          required
          value={supplyingUnitName}
          onChange={(e) => setSupplyingUnitName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter supplying unit name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplying Unit Location *
        </label>
        <input
          type="text"
          required
          value={supplyingUnitLocation}
          onChange={(e) => setSupplyingUnitLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter supplying unit location"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Fuel'}
      </button>
    </form>
  );
};

export default MainContainerEntry; 