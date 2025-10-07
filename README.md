# Cursor Background Agents MCP Server

MCP server for Cursor's Background Agents API.

## Setup

1. Install dependencies:

```bash
bun install
```

2. Create a `.env` file and set your API key:

```bash
echo "CURSOR_API_KEY=your-api-key-here" > .env
```

## Configure in Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "cursor": {
      "command": "node",
      "args": ["run", "/path/to/cursor-mcp-server/index.js"],
      "envFile": ".env"
    }
  }
}
```

## License

MIT
