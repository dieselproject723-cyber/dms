import { useState } from 'react';

const GeneratorsList = ({ generators, onEditGenerator }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGenerators = generators.filter(generator =>
    generator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generator.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generator.operator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFuelLevelColor = (currentFuel, capacity) => {
    const percentage = (currentFuel / capacity) * 100;
    if (percentage >= 50) return 'text-green-600';
    if (percentage >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFuelLevelBg = (currentFuel, capacity) => {
    const percentage = (currentFuel / capacity) * 100;
    if (percentage >= 50) return 'bg-green-100';
    if (percentage >= 20) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-600">Generators</h2>
        <span className="text-sm text-gray-500">
          {filteredGenerators.length} of {generators.length} generators
        </span>
      </div>

      {generators.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search generators by name, location, or operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}

      {generators.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No generators found</p>
          <p className="text-sm">Create your first generator to get started</p>
        </div>
      ) : filteredGenerators.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No generators match your search</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGenerators.map(generator => (
            <div
              key={generator._id}
              className={`p-4 rounded-lg border-2 hover:shadow-md transition-shadow ${getFuelLevelBg(generator.currentFuel, generator.capacity)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {generator.name}
                    </h3>
                    <button
                      onClick={() => onEditGenerator(generator)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="ml-1 font-medium">{generator.location}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Efficiency:</span>
                      <span className="ml-1 font-medium">{generator.fuelEfficiency} L/hr</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="ml-1 font-medium">{generator.capacity} L</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Operator:</span>
                      <span className="ml-1 font-medium">
                        {generator.operator?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Current Fuel:</span>
                      <span className={`ml-1 font-bold ${getFuelLevelColor(generator.currentFuel, generator.capacity)}`}>
                        {generator.currentFuel?.toFixed(2) || '0.00'} L
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({Math.round((generator.currentFuel / generator.capacity) * 100)}%)
                      </span>
                    </div>
                    
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          (generator.currentFuel / generator.capacity) * 100 >= 50
                            ? 'bg-green-500'
                            : (generator.currentFuel / generator.capacity) * 100 >= 20
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (generator.currentFuel / generator.capacity) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneratorsList; 