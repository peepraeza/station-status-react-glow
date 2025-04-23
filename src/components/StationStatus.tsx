
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { events } from 'aws-amplify/data';
import TestControls from './TestControls';

interface StationData {
  stationId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface StationStatusProps {
  stationId: string;
  name: string;
  initialStatus?: 'ACTIVE' | 'INACTIVE';
}

// AWS Amplify configuration
Amplify.configure({
  "API": {
    "Events": {
      "endpoint": "https://gncntr4p5bg53gsk3yuihpxvum.appsync-api.ap-southeast-1.amazonaws.com/event",
      "region": "ap-southeast-1",
      "defaultAuthMode": "apiKey",
      "apiKey": "da2-jnfiv2bubzdflluspmixnck5ya"
    }
  }
});

const StationStatus: React.FC<StationStatusProps> = ({ stationId, name, initialStatus = 'INACTIVE' }) => {
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialStatus);

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100">
      <div 
        className={`w-4 h-4 rounded-full ${status === 'ACTIVE' ? 'bg-[#4ADE80]' : 'bg-[#8E9196]'}`}
      />
      <div className="flex-1">
        <span className="font-medium">Station {stationId}</span>
        <p className="text-sm text-gray-500">{name}</p>
      </div>
      <div 
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {status}
      </div>
    </div>
  );
};

export const StationManager: React.FC = () => {
  const [stationStatuses, setStationStatuses] = useState<Record<string, 'ACTIVE' | 'INACTIVE'>>({
    '1': 'INACTIVE',
    '2': 'INACTIVE',
    '3': 'INACTIVE',
    '4': 'INACTIVE',
    '5': 'INACTIVE',
  });

  // Function to handle status updates
  const handleStatusUpdate = (data: any) => {
    console.log('received', data);
    try {
      // Parse the data if it's a string
      const parsedData: StationData = typeof data === 'string' 
        ? JSON.parse(data) 
        : data;
      
      if (parsedData.stationId && parsedData.status) {
        setStationStatuses(prev => ({
          ...prev,
          [parsedData.stationId]: parsedData.status as 'ACTIVE' | 'INACTIVE'
        }));
      }
    } catch (error) {
      console.error('Error parsing station data:', error);
    }
  };

  // Function to manually update status (for testing)
  const simulateStatusUpdate = (stationId: string, status: 'ACTIVE' | 'INACTIVE') => {
    const mockData = { stationId, status };
    handleStatusUpdate(mockData);
  };

  useEffect(() => {
    const connectToChannel = async () => {
      try {
        console.log('Attempting to connect to AWS AppSync channel...');
        const channel = await events.connect('/stations/status');
        console.log('Connected to stations status channel');
        
        channel.subscribe({
          next: handleStatusUpdate,
          error: (err) => console.error('error', err),
        });
      } catch (error) {
        console.error('Failed to connect to channel:', error);
      }
    };

    connectToChannel();
  }, []);

  const stations = [
    { id: '1', name: 'Main Station' },
    { id: '2', name: 'Secondary Station' },
    { id: '3', name: 'Backup Station' },
    { id: '4', name: 'Remote Station' },
    { id: '5', name: 'Mobile Station' },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold mb-4">Station Status Monitor</h2>
      {stations.map((station) => (
        <StationStatus 
          key={station.id}
          stationId={station.id} 
          name={station.name} 
          initialStatus={stationStatuses[station.id]}
        />
      ))}
      
      {/* Export test function */}
      {simulateStatusUpdate && (
        <TestControls onSendStatus={simulateStatusUpdate} />
      )}
    </div>
  );
};

export default StationManager;
