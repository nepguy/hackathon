import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import MapPlaceholder from '../components/map/MapPlaceholder';
import MapControls from '../components/map/MapControls';

const MapPage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState('alerts');
  
  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  return (
    <PageContainer title="Safety Map" padding={false}>
      <div className="px-4 mb-4">
        <p className="text-sm text-gray-600">
          View safety information, weather alerts, and points of interest on this interactive map.
        </p>
      </div>
      
      <MapPlaceholder />
      
      <MapControls 
        activeLayer={activeLayer}
        onLayerChange={handleLayerChange}
      />
    </PageContainer>
  );
};

export default MapPage;