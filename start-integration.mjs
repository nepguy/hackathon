#!/usr/bin/env node

// Quick start script for Travel Alert Integration
// Run with: node start-integration.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Travel Alert System - Quick Start Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Travel Alert Backend API Configuration
VITE_API_URL=http://localhost:5000

# Optional: For production deployment
# VITE_API_URL=https://your-backend-domain.com
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check backend directory
const backendPath = path.join(__dirname, '..', 'TravelAgentdata');
if (fs.existsSync(backendPath)) {
  console.log('✅ Backend directory found at:', backendPath);
} else {
  console.log('⚠️  Backend directory not found. Expected at:', backendPath);
  console.log('   Make sure you have the TravelAgentdata directory in the parent folder\n');
}

console.log('📋 Setup Instructions:');
console.log('');
console.log('1️⃣ Start the Backend:');
console.log('   cd ../TravelAgentdata');
console.log('   python api_server.py');
console.log('');
console.log('2️⃣ Start the Frontend (in a new terminal):');
console.log('   cd frontend-repo');
console.log('   npm run dev');
console.log('');
console.log('3️⃣ Test the Integration:');
console.log('   node test-integration.js');
console.log('');
console.log('4️⃣ Access the App:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend API: http://localhost:5000');
console.log('');
console.log('🎯 Features to Test:');
console.log('   • Navigate to Alerts page');
console.log('   • Click "Agent Control" tab');
console.log('   • Search for a location (e.g., "Bangkok, Thailand")');
console.log('   • View AI-scraped alerts in "AI Agent Data" tab');
console.log('');
console.log('📚 Documentation:');
console.log('   • Read TRAVEL_ALERT_INTEGRATION.md for detailed guide');
console.log('   • Check backend INTEGRATION_GUIDE.md for API details');
console.log('');
console.log('🎉 Happy coding! Your AI-powered travel alert system is ready!'); 