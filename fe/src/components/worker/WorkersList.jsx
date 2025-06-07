import { useState } from 'react';

const WorkersList = ({ workers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkers = workers.filter(worker =>
    worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-600">Workers</h2>
        <span className="text-sm text-gray-500">
          {filteredWorkers.length} of {workers.length} workers
        </span>
      </div>

      {workers.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search workers by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}

      {workers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No worker accounts found</p>
          <p className="text-sm">Create your first worker account to get started</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No workers match your search</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredWorkers.map(worker => (
            <div
              key={worker._id}
              className="p-4 rounded-lg border-2 border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {worker.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="ml-1 font-medium">{worker.email}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="ml-1 font-medium">{worker.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Address:</span>
                      <span className="ml-1 font-medium">{worker.address || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Role:</span>
                      <span className="ml-1 font-medium">{worker.role}</span>
                    </div>
                  </div>
                </div>
                {/* <button
                  onClick={() => console.log('Edit worker', worker._id)}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Edit
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkersList; 