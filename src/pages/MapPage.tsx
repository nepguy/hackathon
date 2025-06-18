import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import GoogleMapComponent from '../components/map/GoogleMap';
import MapControls from '../components/map/MapControls';

const MapPage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState('alerts');
  
  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  const handleMapClick = (location: google.maps.LatLngLiteral) => {
    console.log('Map clicked at:', location);
    // You can add additional functionality here, such as:
    // - Creating new alerts at the clicked location
    // - Showing location details
    // - Adding custom markers
  };

  return (
    <PageContainer title="Safety Map" padding={false}>
      <div className="px-4 mb-4">
        <p className="text-sm text-gray-600">
          View safety information, weather alerts, and points of interest on this interactive map.
        </p>
      </div>
      
      <div className="h-[calc(100vh-160px)] w-full">
        <GoogleMapComponent 
          center={{ lat: 40.7128, lng: -74.0060 }}
          zoom={12}
          activeLayer={activeLayer}
          onMapClick={handleMapClick}
        />
      </div>
      
      <MapControls 
        activeLayer={activeLayer}
        onLayerChange={handleLayerChange}
      />
    </PageContainer>
  );
};

export default MapPage;