#!/usr/bin/env node

/**
 * MCP Setup Script for GuardNomad Travel Alert App
 * Configures Model Context Protocol with Exa.ai integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up MCP (Model Context Protocol) for Exa.ai...\n');

// Read environment variables
const envFile = path.join(__dirname, '.env');
let exaApiKey = 'your-exa-api-key';

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const exaKeyMatch = envContent.match(/VITE_EXA_API_KEY=(.+)/);
  if (exaKeyMatch && exaKeyMatch[1] && exaKeyMatch[1] !== 'your_exa_api_key') {
    exaApiKey = exaKeyMatch[1].trim();
    console.log('✅ Found Exa API key in .env file');
  } else {
    console.log('⚠️  No valid Exa API key found in .env file');
    console.log('   Please add VITE_EXA_API_KEY=your_actual_key to .env\n');
  }
} else {
  console.log('⚠️  .env file not found');
  console.log('   Please create .env file with VITE_EXA_API_KEY=your_actual_key\n');
}

// Create MCP configuration with actual API key
const mcpConfig = {
  mcpServers: {
    exa: {
      command: "npx",
      args: [
        "-y",
        "mcp-remote",
        `https://mcp.exa.ai/mcp?exaApiKey=${exaApiKey}`
      ],
      description: "Exa.ai MCP server for GuardNomad travel intelligence",
      capabilities: [
        "real_time_search",
        "location_aware_content",
        "travel_safety_data",
        "local_news_events",
        "scam_alerts"
      ],
      tags: ["search", "travel", "safety", "real-time"]
    }
  },
  projectName: "GuardNomad",
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development"
};

// Write MCP configuration file
const mcpConfigPath = path.join(__dirname, 'mcp-config.json');
fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
console.log(`✅ MCP configuration written to: ${mcpConfigPath}`);

// Create Cursor-specific configuration
const cursorConfig = {
  "mcp": mcpConfig,
  "rules": [
    "Use Exa.ai MCP for real-time location-based travel intelligence",
    "Prioritize local German/European sources for German locations",  
    "Focus on travel safety, scam alerts, and local events",
    "Maintain user privacy and data security",
    "Provide accurate, up-to-date location-specific information"
  ]
};

const cursorConfigPath = path.join(__dirname, '.cursorrules-mcp');
fs.writeFileSync(cursorConfigPath, JSON.stringify(cursorConfig, null, 2));
console.log(`✅ Cursor MCP rules written to: ${cursorConfigPath}`);

console.log('\n🚀 MCP Setup Complete!');
console.log('\n📋 Next Steps for Cursor Integration:');
console.log('   1. Open Cursor → File → Preferences → Settings');
console.log('   2. Search for "MCP" or "Model Context Protocol"'); 
console.log('   3. Add the configuration from mcp-config.json');
console.log('   4. Restart Cursor to activate MCP integration');

console.log('\n🔧 Alternative: Manual Cursor Settings');
console.log('   Add this to Cursor settings.json:');
console.log('   ```json');
console.log('   "mcp": ' + JSON.stringify(mcpConfig, null, 4));
console.log('   ```');

console.log('\n🎯 MCP Benefits for GuardNomad:');
console.log('   ✅ Real-time location-based travel intelligence');
console.log('   ✅ Enhanced German/European content for Magdeburg users');
console.log('   ✅ Live scam alerts and safety warnings');
console.log('   ✅ Current local events and news');
console.log('   ✅ AI-powered travel recommendations');
console.log('   ✅ Improved development assistance with real-time data');

if (exaApiKey === 'your-exa-api-key') {
  console.log('\n⚠️  IMPORTANT: Replace "your-exa-api-key" with your actual Exa API key!');
  console.log('   1. Get your key from https://exa.ai/');
  console.log('   2. Add VITE_EXA_API_KEY=your_actual_key to .env file');
  console.log('   3. Re-run this script: node setup-mcp.mjs');
}

console.log('\n🌍 Ready to enhance your development workflow with MCP + Exa.ai!'); 