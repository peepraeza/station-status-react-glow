
import React from 'react';
import { StationManager } from '@/components/StationStatus';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
        <StationManager />
      </div>
    </div>
  );
};

export default Index;
