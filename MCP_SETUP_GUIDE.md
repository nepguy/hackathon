# 🔧 MCP (Model Context Protocol) Setup Guide

## 🌟 Overview

Model Context Protocol (MCP) enhances your development experience by connecting AI assistants directly to real-time data sources. This setup integrates **Exa.ai** with your GuardNomad travel alert application for enhanced intelligence.

## 🎯 Benefits of MCP + Exa.ai

- ✅ **Real-time location-based intelligence** during development
- ✅ **Enhanced German/European content** for proper localization testing
- ✅ **Live scam alerts and safety warnings** for accurate data validation  
- ✅ **Current local events and news** for content verification
- ✅ **AI-powered development assistance** with real-time travel data
- ✅ **Better debugging** of location-specific features

## 🚀 Quick Setup

### **1. Run the Setup Script**
```bash
node setup-mcp.mjs
```

This script will:
- ✅ Find your Exa API key from `.env` file
- ✅ Generate `mcp-config.json` with proper configuration
- ✅ Create `.cursorrules-mcp` for Cursor integration
- ✅ Provide platform-specific installation instructions

### **2. Configure Cursor**

#### **Option A: Through Cursor Settings UI**
1. Open **Cursor** → **File** → **Preferences** → **Settings**
2. Search for **"MCP"** or **"Model Context Protocol"**
3. Add the server configuration from `mcp-config.json`
4. **Restart Cursor** to activate

#### **Option B: Manual settings.json**
Add this to your Cursor `settings.json`:
```json
{
  "mcp": {
    "mcpServers": {
      "exa": {
        "command": "npx",
        "args": [
          "-y", 
          "mcp-remote",
          "https://mcp.exa.ai/mcp?exaApiKey=YOUR_ACTUAL_KEY"
        ],
        "description": "Exa.ai MCP server for GuardNomad travel intelligence"
      }
    }
  }
}
```

### **3. Verify Setup**
After restarting Cursor, you should see:
- 🔗 MCP connection indicator in Cursor
- 🌍 Enhanced AI responses with real-time data
- 📍 Location-aware development assistance

## 🛡️ Security Notes

- 🔒 **API keys are automatically protected** - `mcp-config.json` is in `.gitignore`
- 🚫 **Never commit** MCP config files with real API keys
- ✅ **Safe to share** the setup script (`setup-mcp.mjs`)
- 🔄 **Regenerate configs** if you update your Exa API key

## 🌍 Location-Specific Intelligence

With MCP enabled, the AI assistant can provide:

### **For Magdeburg, Germany:**
- 🇩🇪 **German news sources**: Spiegel, Zeit, Tagesschau, MDR
- 🛡️ **German security alerts**: BKA, BSI, Verbraucherzentrale  
- 🎪 **Local events**: Magdeburg city events, Sachsen-Anhalt activities
- 🌦️ **Regional weather**: German weather services

### **Development Benefits:**
- **Better testing** of location-based features
- **Accurate content validation** for European users
- **Real-time debugging** of news/alerts APIs
- **Enhanced AI code assistance** with travel domain knowledge

## 🔧 Troubleshooting

### **"No MCP servers found"**
- Ensure you've restarted Cursor after adding configuration
- Check that `mcp-config.json` has your actual Exa API key
- Verify the MCP server URL is correct

### **"Exa API key invalid"**
- Check your `.env` file has `VITE_EXA_API_KEY=your_actual_key`
- Re-run `node setup-mcp.mjs` to regenerate config
- Ensure API key is active at [exa.ai](https://exa.ai/)

### **"Location data not working"**
- MCP may take a few minutes to fully initialize
- Try asking location-specific questions to test
- Check Cursor's output panel for MCP connection status

## 📋 Files Created

| File | Purpose | Committed? |
|------|---------|------------|
| `setup-mcp.mjs` | Setup script | ✅ Yes |
| `mcp-settings.json` | Template config | ✅ Yes |  
| `mcp-config.json` | Generated config with API key | ❌ No (.gitignore) |
| `.cursorrules-mcp` | Cursor-specific rules | ❌ No (.gitignore) |

## 🎯 Usage Examples

Once MCP is active, you can ask the AI assistant:

```
"What are the latest travel alerts for Germany?"
"Find current events happening in Magdeburg this week"
"Check for any scam alerts affecting German travelers"
"What's the security situation in Magdeburg today?"
```

The AI will use **real-time Exa.ai data** instead of static knowledge!

## 🌟 Next Steps

1. ✅ **Test the integration** by asking location-specific questions
2. 🔄 **Update API key** if you rotate your Exa credentials  
3. 🚀 **Enhance your app** with insights from real-time development data
4. 📊 **Monitor performance** of location-based features with live data

---

**🎉 Ready to develop with enhanced intelligence!** Your GuardNomad app now has access to real-time travel data during development. 