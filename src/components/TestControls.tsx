
import React, { useState } from 'react';

interface TestControlsProps {
  onSendStatus: (stationId: string, status: 'ACTIVE' | 'INACTIVE') => void;
}

const TestControls: React.FC<TestControlsProps> = ({ onSendStatus }) => {
  const [stationId, setStationId] = useState('1');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendStatus(stationId, status);
  };

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium mb-3">Test Controls</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Station ID</label>
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="1">Station 1</option>
            <option value="2">Station 2</option>
            <option value="3">Station 3</option>
            <option value="4">Station 4</option>
            <option value="5">Station 5</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Simulate Status Update
        </button>
      </form>
    </div>
  );
};

export default TestControls;
