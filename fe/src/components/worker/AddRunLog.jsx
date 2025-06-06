import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const AddRunLog = ({ generators, onSuccess }) => {
  const [generatorId, setGeneratorId] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(getApiUrl('/api/fuel/generator/run-log'), {
        generatorId,
        startTime,
        endTime
      });
      toast.success('Run log added successfully');
      setGeneratorId('');
      setStartTime(new Date());
      setEndTime(new Date());
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add run log');
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
        <Select
          value={generators.find(g => g._id === generatorId) ? { value: generatorId, label: generators.find(g => g._id === generatorId)?.name } : null}
          onChange={option => setGeneratorId(option?.value || '')}
          options={generators.map(g => ({ value: g._id, label: g.name }))}
          placeholder="Select a generator"
          isClearable
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Time
        </label>
        <DatePicker
          selected={startTime}
          onChange={setStartTime}
          showTimeSelect
          showTimeSelectMinutes
          timeIntervals={1}
          dateFormat="Pp"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          End Time
        </label>
        <DatePicker
          selected={endTime}
          onChange={setEndTime}
          showTimeSelect
          showTimeSelectMinutes
          timeIntervals={1}
          dateFormat="Pp"
          minDate={startTime}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Adding...' : 'Add Run Log'}
      </button>
    </form>
  );
};

export default AddRunLog; 