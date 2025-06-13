import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import Select from 'react-select';

const AddRunLog = ({ generators, onSuccess, editingRunLog }) => {
  const [generatorId, setGeneratorId] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // New states for separate date/time components
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1); // Month is 0-indexed
  const [startDay, setStartDay] = useState(new Date().getDate());
  const [startHour, setStartHour] = useState(new Date().getHours());
  const [startMinute, setStartMinute] = useState(new Date().getMinutes());

  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endDay, setEndDay] = useState(new Date().getDate());
  const [endHour, setEndHour] = useState(new Date().getHours());
  const [endMinute, setEndMinute] = useState(new Date().getMinutes());

  // Initialize form with editingRunLog data if provided
  useEffect(() => {
    if (editingRunLog) {
      setGeneratorId(editingRunLog.generator?._id || '');
      
      const startDate = new Date(editingRunLog.startTime);
      setStartYear(startDate.getFullYear());
      setStartMonth(startDate.getMonth() + 1);
      setStartDay(startDate.getDate());
      setStartHour(startDate.getHours());
      setStartMinute(startDate.getMinutes());

      const endDate = new Date(editingRunLog.endTime);
      setEndYear(endDate.getFullYear());
      setEndMonth(endDate.getMonth() + 1);
      setEndDay(endDate.getDate());
      setEndHour(endDate.getHours());
      setEndMinute(endDate.getMinutes());
    }
  }, [editingRunLog]);

  // Functions to generate options
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) { // +/- 5 years
      years.push(i);
    }
    return years;
  };

  const getMonths = () => {
    return [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' }
    ];
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate(); // month is 1-indexed for this
  };

  const getDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getHours = () => {
    return Array.from({ length: 24 }, (_, i) => i); // 0-23
  };

  const getMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i); // 0-59
  };

  // Effect to update startTime and endTime based on individual selectors
  useEffect(() => {
    setStartTime(new Date(startYear, startMonth - 1, startDay, startHour, startMinute));
  }, [startYear, startMonth, startDay, startHour, startMinute]);

  useEffect(() => {
    setEndTime(new Date(endYear, endMonth - 1, endDay, endHour, endMinute));
  }, [endYear, endMonth, endDay, endHour, endMinute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const constructedStartTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
    const constructedEndTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

    if (constructedEndTime < constructedStartTime) {
      toast.error('End time cannot be before start time');
      setLoading(false);
      return;
    }

    try {
      if (editingRunLog) {
        await axios.patch(getApiUrl(`/api/fuel/generator/run-log/${editingRunLog._id}`), {
          generatorId,
          startTime: constructedStartTime,
          endTime: constructedEndTime
        });
        toast.success('Run log updated successfully');
      } else {
        await axios.post(getApiUrl('/api/fuel/generator/run-log'), {
          generatorId,
          startTime: constructedStartTime,
          endTime: constructedEndTime
        });
        toast.success('Run log added successfully');
      }

      if (!editingRunLog) {
        setGeneratorId('');
        const now = new Date();
        setStartYear(now.getFullYear());
        setStartMonth(now.getMonth() + 1);
        setStartDay(now.getDate());
        setStartHour(now.getHours());
        setStartMinute(now.getMinutes());

        setEndYear(now.getFullYear());
        setEndMonth(now.getMonth() + 1);
        setEndDay(now.getDate());
        setEndHour(now.getHours());
        setEndMinute(now.getMinutes());
      }
      
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editingRunLog ? 'update' : 'add'} run log`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Generator
        </label>
        <Select
          value={generators.find(g => g._id === generatorId) ? { value: generatorId, label: generators.find(g => g._id === generatorId)?.name } : null}
          onChange={option => setGeneratorId(option?.value || '')}
          options={generators.map(g => ({ value: g._id, label: g.name }))}
          placeholder="Select a generator"
          isClearable
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Time
        </label>
        <div className="flex space-x-2 mb-2"> {/* Date Selectors */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Day</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={startDay}
              onChange={(e) => setStartDay(Number(e.target.value))}
            >
              {getDays(startYear, startMonth).map(day => <option key={day} value={day}>{String(day).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
            >
              {getMonths().map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Year</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
            >
              {getYears().map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
        <div className="flex space-x-2"> {/* Time Selectors */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Hour</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
            >
              {getHours().map(hour => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Minute</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={startMinute}
              onChange={(e) => setStartMinute(Number(e.target.value))}
            >
              {getMinutes().map(minute => <option key={minute} value={minute}>{String(minute).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          End Time
        </label>
        <div className="flex space-x-2 mb-2"> {/* Date Selectors */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Day</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={endDay}
              onChange={(e) => setEndDay(Number(e.target.value))}
            >
              {getDays(endYear, endMonth).map(day => <option key={day} value={day}>{String(day).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
            >
              {getMonths().map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Year</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
            >
              {getYears().map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
        <div className="flex space-x-2"> {/* Time Selectors */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Hour</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
            >
              {getHours().map(hour => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Minute</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={endMinute}
              onChange={(e) => setEndMinute(Number(e.target.value))}
            >
              {getMinutes().map(minute => <option key={minute} value={minute}>{String(minute).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? (editingRunLog ? 'Updating...' : 'Adding...') : (editingRunLog ? 'Update Run Log' : 'Add Run Log')}
      </button>
    </form>
  );
};

export default AddRunLog;