/**
 * Simple API Configuration Test for GuardNomad
 * Verifies environment variables are properly configured
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config();

console.log('🚀 GuardNomad API Configuration Test\n');

// Read .env file directly to verify content
let envContent = '';
try {
  envContent = readFileSync('.env', 'utf8');
  console.log('✅ .env file found and readable');
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
}

// Test environment variables
const requiredVars = {
  'VITE_LINGO_API_KEY': 'Lingo Translation API',
  'VITE_SUPABASE_URL': 'Supabase Database URL',
  'VITE_SUPABASE_ANON_KEY': 'Supabase Anonymous Key',
  'VITE_WEATHER_API_KEY': 'Weather API Key',
  'VITE_GNEWS_API_KEY': 'News API Key',
  'VITE_GOOGLE_MAPS_API_KEY': 'Google Maps API Key',
  'VITE_EVENTBRITE_PRIVATE_TOKEN': 'Eventbrite API Token'
};

console.log('\n🔑 Environment Variables Check:');
console.log('=' .repeat(50));

let configuredCount = 0;
const results = {};

for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  const isConfigured = value && 
                      value !== 'your_api_key_here' && 
                      value !== 'your_supabase_url_here' &&
                      value !== 'your_supabase_anon_key_here' &&
                      value.length > 10;
  
  results[varName] = isConfigured;
  
  if (isConfigured) {
    configuredCount++;
    console.log(`✅ ${description}: Configured (${value.substring(0, 20)}...)`);
  } else {
    console.log(`❌ ${description}: Missing or invalid`);
  }
}

// Test specific API configurations
console.log('\n🧪 API Specific Tests:');
console.log('=' .repeat(50));

// Test Supabase URL format
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
  console.log('✅ Supabase URL format: Valid');
} else {
  console.log('❌ Supabase URL format: Invalid or missing');
}

// Test Lingo API key format
const lingoKey = process.env.VITE_LINGO_API_KEY;
if (lingoKey && lingoKey.startsWith('api_')) {
  console.log('✅ Lingo API key format: Valid');
} else {
  console.log('❌ Lingo API key format: Invalid or missing');
}

// Summary
console.log('\n📊 Configuration Summary:');
console.log('=' .repeat(50));
console.log(`Configured APIs: ${configuredCount}/${Object.keys(requiredVars).length}`);

if (configuredCount >= 6) {
  console.log('🎉 Excellent! All major APIs are configured.');
  console.log('✅ GuardNomad is ready for full functionality!');
} else if (configuredCount >= 4) {
  console.log('✅ Good! Most APIs are configured.');
  console.log('⚠️ Some features may use fallback data.');
} else {
  console.log('⚠️ Limited configuration detected.');
  console.log('🔧 App will work but with reduced functionality.');
}

// Test a simple fetch to verify internet connectivity
console.log('\n🌐 Testing Internet Connectivity:');
try {
  const testUrl = 'https://httpbin.org/get';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  fetch(testUrl, { signal: controller.signal })
    .then(response => {
      clearTimeout(timeoutId);
      if (response.ok) {
        console.log('✅ Internet connectivity: Working');
      } else {
        console.log('⚠️ Internet connectivity: Limited');
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log('⚠️ Internet connectivity: Timeout');
      } else {
        console.log('❌ Internet connectivity: Failed');
      }
    });
} catch (error) {
  console.log('❌ Internet connectivity test failed:', error.message);
}

console.log('\n🎯 Next Steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:5173 in your browser');
console.log('3. Test the app functionality with real data');
console.log('4. Check browser console for API responses');

export { results, configuredCount }; 