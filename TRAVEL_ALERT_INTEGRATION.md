# Travel Alert System Integration Guide

## 🎯 Overview
This guide explains how to integrate the AI-powered Travel Alert System with your existing React + TypeScript + Supabase travel safety app.

## 🚀 What's Been Added

### 1. **API Client** (`src/lib/travelAlertApi.ts`)
- Complete TypeScript API client for the travel alert backend
- Supports all endpoints: scraping, Eventbrite events, GNews, automation
- Type-safe interfaces for all data structures

### 2. **New Components**
- **`AgentControl.tsx`**: Backend management interface
- **`AgentAlerts.tsx`**: Display AI-scraped alerts with filtering
- **Enhanced `AlertsPage.tsx`**: Three-tab interface

### 3. **Configuration** (`src/config/api.ts`)
- Centralized API configuration
- Environment-based URL configuration
- Timeout and retry settings

## 🔧 Setup Instructions

### Step 1: Environment Configuration
Create a `.env` file in the root directory:
```env
# Travel Alert Backend API Configuration
VITE_API_URL=http://localhost:5000
```

### Step 2: Start the Backend
In your backend directory (`D:\Hackathon\TravelAgentdata`):
```bash
# Start the Flask API server
python api_server.py
```

The backend will run on `http://localhost:5000`

### Step 3: Start the Frontend
In this directory (`D:\Hackathon\frontend-repo`):
```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📱 User Interface

### Tab 1: 📍 Local Alerts
- Your existing Supabase-based alerts
- Filtering and read/unread functionality
- No changes to existing functionality

### Tab 2: 🤖 AI Agent Data
- Real-time AI-scraped travel alerts
- Three sub-tabs:
  - **🏛️ Government**: Official travel advisories
  - **🎫 Events**: Eventbrite event-based alerts
  - **📰 Breaking News**: GNews real-time alerts
- Risk ratings, prevention tips, source links
- Location-based filtering

### Tab 3: ⚙️ Agent Control
- System status monitoring
- Quick location search
- Custom URL scraping
- Automation controls
- File management

## 🔌 API Integration

### Quick Location Search
```typescript
import TravelAlertAPI from '../lib/travelAlertApi';

// Get comprehensive alerts for a location
const alerts = await TravelAlertAPI.getQuickAlerts('Bangkok, Thailand');
const eventAlerts = await TravelAlertAPI.getEventAlerts('Bangkok, Thailand');
const newsAlerts = await TravelAlertAPI.getNewsAlerts('Bangkok, Thailand');
```

### Custom URL Scraping
```typescript
// Scrape custom travel safety websites
const result = await TravelAlertAPI.scrapeData([
  'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html',
  'https://www.gov.uk/foreign-travel-advice'
], 'travel_alerts', 'Thailand');
```

### Real-time Breaking News
```typescript
// Get breaking travel-related news
const breakingNews = await TravelAlertAPI.getBreakingNews(20);
```

## 🎨 UI Features

### Risk-Based Color Coding
- **🔴 High Risk (8-10)**: Red background, urgent attention
- **🟡 Medium Risk (5-7)**: Yellow background, caution advised
- **🟢 Low Risk (1-4)**: Green background, minimal concern

### Smart Filtering
- Filter by alert source (Government, Events, News)
- Location-based filtering
- Risk level filtering
- Date range filtering

### Prevention Tips
- AI-generated prevention advice
- Actionable safety recommendations
- Target demographic information

## 🔄 Data Flow

```
User Input (Location) 
    ↓
Frontend (React)
    ↓
API Client (travelAlertApi.ts)
    ↓
Backend (Flask API)
    ↓
AI Agents (OpenRouter + Agno)
    ↓
Data Sources (Gov Sites, Eventbrite, GNews)
    ↓
Processed Alerts (CSV + JSON)
    ↓
Frontend Display (Risk-coded alerts)
```

## 🛠️ Development

### Adding New Data Sources
1. Add URLs to `data_sources_config.py` in backend
2. Update API endpoints if needed
3. Frontend automatically displays new data

### Customizing Alert Display
Edit `AgentAlerts.tsx`:
- Modify `getRiskColor()` for different color schemes
- Update `getSeverityIcon()` for custom icons
- Customize alert card layout

### Adding New API Endpoints
1. Add endpoint to backend `api_server.py`
2. Add method to `travelAlertApi.ts`
3. Update TypeScript interfaces if needed

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy dist/ folder
# Update VITE_API_URL to production backend URL
```

### Backend (Render/Railway)
```bash
# Already configured in backend directory
# Deploy with environment variables:
# - OPENROUTER_API_KEY
# - EVENTBRITE_API_KEY  
# - GNEWS_API_KEY
```

### Environment Variables
```env
# Production .env
VITE_API_URL=https://your-backend-domain.com
```

## 📊 Data Sources

### Government Sources (50+ sites)
- US State Department
- UK Foreign Office
- Australian DFAT
- Canadian Global Affairs
- German Foreign Ministry
- And many more...

### Event Monitoring
- Eventbrite API integration
- Large gatherings, protests, festivals
- Risk assessment for events
- Crowd density warnings

### Breaking News
- GNews.io real-time monitoring
- Security incidents
- Natural disasters
- Political unrest
- Transportation disruptions

## 🔐 Security Features

### API Security
- CORS protection
- Request rate limiting
- Input validation
- Error handling

### Data Privacy
- No personal data stored
- Anonymous usage
- Secure API key management
- GDPR compliant

## 📈 Performance

### Caching
- API response caching
- File-based data storage
- Optimized re-renders

### Loading States
- Skeleton loading
- Progressive data loading
- Error boundaries

## 🐛 Troubleshooting

### Backend Not Connecting
1. Check if backend is running on port 5000
2. Verify CORS settings
3. Check API_URL in frontend config

### No Alerts Showing
1. Verify API keys in backend `.env`
2. Check network connectivity
3. Review browser console for errors

### TypeScript Errors
1. Run `npm install` to ensure dependencies
2. Check import paths
3. Verify interface definitions

## 🎯 Next Steps

### Immediate
1. Test the integration with sample locations
2. Verify all three alert sources work
3. Customize UI to match your brand

### Future Enhancements
1. Push notifications for high-risk alerts
2. Offline alert caching
3. User preference settings
4. Alert sharing functionality
5. Integration with mapping services

## 📞 Support

### Backend Issues
- Check `D:\Hackathon\TravelAgentdata\logs/` for error logs
- Verify API keys in backend `.env` file
- Test endpoints with Postman/curl

### Frontend Issues
- Check browser console for errors
- Verify component imports
- Test API connectivity

---

**🎉 Congratulations!** You now have a fully integrated AI-powered travel alert system that provides:
- Real-time government advisories
- Event-based risk assessment
- Breaking news monitoring
- Custom data source scraping
- Beautiful, responsive UI

Your users will have access to the most comprehensive travel safety information available, powered by AI and real-time data sources. 