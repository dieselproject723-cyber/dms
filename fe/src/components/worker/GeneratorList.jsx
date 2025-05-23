import React from 'react';

const GeneratorList = ({ generators }) => {
  if (!generators || generators.length === 0) {
    return <p className="text-gray-500">No generators assigned to you.</p>;
  }

  return (
    <div className="space-y-4">
      {generators.map(generator => (
        <div key={generator._id} className="border p-3 rounded-md bg-gray-50">
          <h3 className="font-medium">{generator.name}</h3>
          <div className="grid grid-cols-2 mt-2 text-sm">
            <div>
              <p>Location: {generator.location}</p>
              <p>Fuel: {generator.currentFuel}L / {generator.capacity}L</p>
            </div>
            <div>
              <p>Efficiency: {generator.fuelEfficiency}L/hour</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(generator.currentFuel / generator.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GeneratorList; 