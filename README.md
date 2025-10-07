# Cursor Background Agents MCP Server

MCP server for Cursor's Background Agents API.

## Setup

1. Install dependencies:

```bash
bun install
```

2. Set API key:

```bash
export CURSOR_API_KEY="your-api-key-here"
```

3. Run server:

```bash
bun run index.ts
```

## Configure in Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "cursor-background-agents": {
      "command": "bun",
      "args": ["run", "/path/to/cursor-mcp-server/index.ts"],
      "env": {
        "CURSOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools

- `launch_agent` - Start a new agent
- `list_agents` - List all agents
- `get_agent_status` - Get agent status
- `add_followup` - Add instructions to agent
- `delete_agent` - Delete agent

## Resources

- `agents://list` - List all agents
- `agents://{id}` - Specific agent
- `models://list` - Available models
- `repositories://list` - GitHub repositories

## License

MIT
