# MCP (Model Context Protocol) Setup Guide for GuardNomad

## 🔧 **What is MCP?**

The Model Context Protocol (MCP) is a standardized way for AI assistants (like Cursor) to connect directly to external services like Supabase. This allows your AI assistant to:

- Query your database directly
- Manage tables and schemas
- Execute SQL operations
- Generate TypeScript types
- Create and deploy functions
- Access project configuration

## 🛡️ **Security Setup**

### Step 1: Add Token to Environment Variables

**⚠️ IMPORTANT**: Never commit your personal access token to version control!

Add this line to your `.env` file (manually):
```env
# Supabase Personal Access Token (for MCP and admin operations)
SUPABASE_ACCESS_TOKEN=sbp_c523fc72f0149d9ca9c7236b27890d54cedc85fe
```

### Step 2: Verify Project Reference

Your Supabase project reference: `rsbtzmqvgiuvmrocozpp`
- This can be found in your Supabase project settings under "Project ID"

## 🔧 **Cursor MCP Configuration**

### Option 1: Project-Level Setup (Recommended)

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=rsbtzmqvgiuvmrocozpp"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_c523fc72f0149d9ca9c7236b27890d54cedc85fe"
      }
    }
  }
}
```

### Option 2: Global Cursor Setup

1. Open Cursor
2. Go to **Settings** → **MCP**
3. Add the same configuration as above

## 🛠️ **Available MCP Tools**

Once connected, your AI assistant can use these tools:

### Database Tools
- `list_tables` - View all database tables
- `execute_sql` - Run SQL queries  
- `apply_migration` - Apply database migrations
- `list_extensions` - View installed extensions

### Development Tools
- `get_project_url` - Get API URL
- `get_anon_key` - Get anonymous key
- `generate_typescript_types` - Generate TypeScript types from schema

### Management Tools
- `get_logs` - View project logs
- `get_advisors` - Get security/performance advisors
- `create_branch` - Create development branches (paid plans)

### Function Tools
- `list_edge_functions` - List Edge Functions
- `deploy_edge_function` - Deploy new functions

## 🔒 **Security Features**

### Read-Only Mode (Enabled)
- Prevents accidental data modification
- AI can query but not modify data
- Recommended for development safety

### Project Scoping (Enabled)
- Restricts access to only your GuardNomad project
- No access to other Supabase projects in your account

## 🚀 **Usage Examples**

Once MCP is set up, you can ask your AI assistant:

```
"Show me all tables in the database"
"Generate TypeScript types for the user_profiles table"
"What's the current safety score average across all users?"
"Check if there are any performance advisors for this project"
"Create a migration to add a new column to travel_plans"
```

## 🧪 **Testing the Connection**

1. Restart Cursor after adding the MCP configuration
2. Check **Settings** → **MCP** for green status indicator
3. Try asking: "List all tables in my Supabase database"
4. You should see tables like: `user_statistics`, `travel_plans`, etc.

## 🛡️ **Security Best Practices**

✅ **DO:**
- Use `--read-only` flag for safety
- Use `--project-ref` to scope to specific project
- Keep personal access token in environment variables
- Never commit tokens to version control

❌ **DON'T:**
- Remove read-only mode without careful consideration
- Share your personal access token
- Commit MCP config with hardcoded tokens
- Grant full database access initially

## 🔧 **Troubleshooting**

### Common Issues:

1. **MCP not connecting**
   - Verify Node.js is installed: `node -v`
   - Check if npx is in PATH
   - Restart Cursor completely

2. **Permission errors**
   - Verify your personal access token is correct
   - Check project reference matches your Supabase project

3. **Windows-specific issues**
   - Ensure using `cmd /c` prefix in configuration
   - Verify Node.js is in system PATH

## 📚 **Next Steps**

With MCP configured, your AI assistant can now:
- Help with database design and migrations
- Generate accurate TypeScript types
- Assist with debugging using real database data
- Suggest optimizations based on actual schema
- Create Edge Functions directly from chat

This integration will significantly improve your development experience with the GuardNomad travel alert application! 