import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the map component to avoid SSR issues
const MapLocationPicker = dynamic(
  () => import('./MapLocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

export default MapLocationPicker;