import React, { useEffect, useRef, useState } from 'react';
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

const StationStatus: React.FC<StationStatusProps> = ({ stationId, name, initialStatus = 'INACTIVE' }) => {
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100">
      <div className={ `w-4 h-4 rounded-full ${ status === 'ACTIVE' ? 'bg-[#4ADE80]' : 'bg-[#8E9196]' }` }/>
      <div className="flex-1">
        <span className="font-medium">Station {stationId}</span>
        <p className="text-sm text-gray-500">{name}</p>
      </div>
      <div
        className={ `px-3 py-1 rounded-full text-sm font-medium ${ status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700' }` }>{ status }</div>
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

  const wsRef = useRef<WebSocket | null>(null);

  const handleStatusUpdate = (data: any) => {
    console.log('received', data);

    let payload: StationData | undefined;
    try {

      if (typeof data === 'string') {
        console.log('Data is raw string, parsing...');
        data = JSON.parse(data);
      }

      if (data?.event) {
        console.log('Found event in data');
        payload = typeof data.event === 'string' ? JSON.parse(data.event) : data.event;
      } else if (data?.stationId) {
        console.log('Data is directly station info');
        payload = data;
      }

      if (payload?.stationId && payload?.status) {
        console.log('updating station status', payload.stationId, payload.status);
        setStationStatuses((prev) => ({
          ...prev,
          [payload.stationId]: payload.status,
        }));
      }
    } catch (error) {
      console.error('Error parsing station data:', error);
    }
  };

  const simulateStatusUpdate = (stationId: string, status: 'ACTIVE' | 'INACTIVE') => {
    const mockData = { stationId, status };
    handleStatusUpdate(mockData);
  };

  function getBase64UrlEncoded(input: object): string {
    const json = JSON.stringify(input);
    return btoa(json)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function getAuthProtocol(): string {
    const host = import.meta.env.VITE_API_HOST;
    const token = import.meta.env.VITE_AUTHORIZATION_TOKEN;

    if (!host || !token) {
      throw new Error('Missing VITE_API_HOST or VITE_AUTHORIZATION_TOKEN');
    }

    const payload = {
      host,
      Authorization: token,
    };

    const encoded = getBase64UrlEncoded(payload);
    return `header-${encoded}`;
  }

  useEffect(() => {
    const connectWebSocket = async () => {
      const ws = new WebSocket(
        import.meta.env.VITE_WEB_SOCKET_URL,
        [
          'aws-appsync-event-ws',
          getAuthProtocol(),
        ]
      );

      ws.onopen = () => {
        console.log('WebSocket connected. Subscribing...');
        const subscribeMessage = {
          id: '97f8c1b2-67d0-47a3-a507-c7ca40b4be17', // random UUID
          type: 'subscribe',
          channel: 'stations/status',
          authorization: {
            host: import.meta.env.VITE_API_HOST,
            Authorization: import.meta.env.VITE_AUTHORIZATION_TOKEN
          },
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        handleStatusUpdate(event.data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
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
          stationId={ station.id }
          name={ station.name }
          initialStatus={stationStatuses[station.id]}
        />
      ))}
      {simulateStatusUpdate && (
        <TestControls onSendStatus={simulateStatusUpdate} />
      )}
    </div>
  );
};

export default StationManager;