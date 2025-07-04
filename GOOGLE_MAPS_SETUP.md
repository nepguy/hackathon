# Google Maps Integration Setup

## Overview
This document outlines the Google Maps integration for the Travel Alert Application.

## ⚠️ Security Warning
- Never commit API keys to version control
- Store real API keys only in `.env` file
- Keep `.env` in `.gitignore`

## API Key Configuration

The Google Maps API key should be configured securely:
- Use environment variables for the API key
- Set proper API key restrictions in Google Cloud Console
- Regularly rotate the key for security

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

### API Key Security
1. Set HTTP referrer restrictions in Google Cloud Console
2. Enable only necessary Google Maps services
3. Monitor API usage regularly
4. Set up billing alerts

## Features Implemented

### 1. Interactive Map Component
- **File**: `src/components/map/GoogleMap.tsx`
- **Features**:
  - Real-time map rendering
  - Custom styling for travel safety focus
  - Click event handling
  - Loading and error states

### 2. Safety Alert Markers
- **Red markers**: Danger zones/security incidents
- **Blue markers**: Weather warnings
- **Yellow markers**: Construction/warnings
- **Interactive info windows**: Detailed alert information

### 3. Layer Controls
- **File**: `src/components/map/MapControls.tsx`
- **Features**:
  - Safety alerts toggle
  - Weather layer toggle
  - Events layer toggle
  - Connectivity information
  - Temperature overlay

### 4. Map Page Integration
- **File**: `src/pages/MapPage.tsx`
- **Features**:
  - Full-screen map view
  - Integrated controls
  - Responsive design

## Technical Implementation

### Dependencies Added
```json
{
  "@googlemaps/react-wrapper": "^1.1.35",
  "@types/google.maps": "^3.55.0"
}
```

### TypeScript Configuration
Enhanced `src/vite-env.d.ts` with:
- Environment variable types
- Google Maps API types
- Window object extension

### Map Configuration
- **Default center**: New York City (40.7128, -74.0060)
- **Default zoom**: 12
- **Styling**: Custom styling with POI labels hidden
- **Controls**: Zoom, scale, fullscreen enabled

## Usage

### Basic Map Display
```tsx
import GoogleMapComponent from '../components/map/GoogleMap';

<GoogleMapComponent 
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={12}
  activeLayer="alerts"
  onMapClick={handleMapClick}
/>
```

### Layer Management
```tsx
const [activeLayer, setActiveLayer] = useState('alerts');

<MapControls 
  activeLayer={activeLayer}
  onLayerChange={setActiveLayer}
/>
```

## Future Enhancements

### Planned Features
1. **Real-time data integration** with travel alert APIs
2. **User location services** with geolocation
3. **Route planning** with directions API
4. **Offline map caching** for critical areas
5. **Multi-language support** for international users

### Performance Optimizations
1. **Marker clustering** for dense alert areas
2. **Lazy loading** for map tiles
3. **Caching strategies** for frequently accessed data

## Troubleshooting

### Common Issues
1. **Map not loading**: Check API key validity
2. **Markers not appearing**: Verify activeLayer state
3. **Click events not working**: Check onMapClick prop
4. **Styling issues**: Verify Tailwind CSS classes

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## Security Checklist
- [ ] API key stored in environment variables
- [ ] .env file added to .gitignore
- [ ] API restrictions configured in Google Cloud Console
- [ ] Domain restrictions enabled for production
- [ ] API usage monitoring enabled

## Support
For issues related to the Google Maps integration, refer to:
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps Wrapper](https://github.com/googlemaps/react-wrapper) 