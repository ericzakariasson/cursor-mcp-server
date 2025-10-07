#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { createMCPServer } from "./server.js";

async function main() {
  const server = createMCPServer();

  const runHttpServer =
    process.env.MCP_SERVER_MODE === "http" || process.argv.includes("--http");

  if (runHttpServer) {
    const app = express();
    app.use(express.json());

    app.post("/mcp", async (req, res) => {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on("close", () => {
        transport.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    });

    const port = parseInt(process.env.PORT || "3000");
    app
      .listen(port, () => {
        console.log(
          `Cursor Background Agents MCP Server running on http://localhost:${port}/mcp`
        );
      })
      .on("error", (error) => {
        console.error("Server error:", error);
        process.exit(1);
      });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Cursor Background Agents MCP Server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
