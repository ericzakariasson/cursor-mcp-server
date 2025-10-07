import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeCursorApiRequest } from "./api-client.js";
import {
  LaunchAgentSchema,
  AddFollowupSchema,
  DeleteAgentSchema,
  ListAgentsSchema,
  GetAgentStatusSchema,
  GetAgentConversationSchema,
  AgentResponseSchema,
  AddFollowupResponseSchema,
  DeleteAgentResponseSchema,
  ListAgentsResponseSchema,
  ConversationResponseSchema,
  ApiKeyInfoResponseSchema,
  ModelsResponseSchema,
  RepositoriesResponseSchema,
} from "./schemas.js";

export function createMCPServer() {
  const server = new McpServer({
    name: "cursor-background-agents-mcp-server",
    version: "1.0.0",
  });

  // Register tools
  server.registerTool(
    "launch_agent",
    {
      title: "Launch Agent",
      description:
        "Start a new background agent to work on a GitHub repository",
      inputSchema: LaunchAgentSchema.shape,
    },
    async (args) => {
      const validated = LaunchAgentSchema.parse(args);
      const result = await makeCursorApiRequest({
        endpoint: "/v0/agents",
        responseSchema: AgentResponseSchema,
        method: "POST",
        body: validated,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "add_followup",
    {
      title: "Add Followup",
      description:
        "Add a follow-up instruction to an existing background agent",
      inputSchema: AddFollowupSchema.shape,
    },
    async (args) => {
      const { agentId, prompt } = AddFollowupSchema.parse(args);
      const result = await makeCursorApiRequest({
        endpoint: `/v0/agents/${agentId}/followup`,
        responseSchema: AddFollowupResponseSchema,
        method: "POST",
        body: { prompt },
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "delete_agent",
    {
      title: "Delete Agent",
      description:
        "Delete a background agent. This action is permanent and cannot be undone.",
      inputSchema: DeleteAgentSchema.shape,
    },
    async (args) => {
      const { agentId } = DeleteAgentSchema.parse(args);
      const result = await makeCursorApiRequest({
        endpoint: `/v0/agents/${agentId}`,
        responseSchema: DeleteAgentResponseSchema,
        method: "DELETE",
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "list_agents",
    {
      title: "List Agents",
      description: "List all background agents for the authenticated user",
      inputSchema: ListAgentsSchema.shape,
    },
    async (args) => {
      const { limit, cursor } = ListAgentsSchema.parse(args || {});
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (cursor) params.append("cursor", cursor);

      const queryString = params.toString();
      const result = await makeCursorApiRequest({
        endpoint: `/v0/agents${queryString ? `?${queryString}` : ""}`,
        responseSchema: ListAgentsResponseSchema,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "get_agent_status",
    {
      title: "Get Agent Status",
      description:
        "Retrieve the current status and results of a background agent",
      inputSchema: GetAgentStatusSchema.shape,
    },
    async (args) => {
      const { agentId } = GetAgentStatusSchema.parse(args);
      const result = await makeCursorApiRequest({
        endpoint: `/v0/agents/${agentId}`,
        responseSchema: AgentResponseSchema,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "get_agent_conversation",
    {
      title: "Get Agent Conversation",
      description: "Retrieve the conversation history of a background agent",
      inputSchema: GetAgentConversationSchema.shape,
    },
    async (args) => {
      const { agentId } = GetAgentConversationSchema.parse(args);
      const result = await makeCursorApiRequest({
        endpoint: `/v0/agents/${agentId}/conversation`,
        responseSchema: ConversationResponseSchema,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "get_me",
    {
      title: "Get API Key Info",
      description:
        "Get information about the API key being used for authentication",
      inputSchema: {},
    },
    async () => {
      const result = await makeCursorApiRequest({
        endpoint: "/v0/me",
        responseSchema: ApiKeyInfoResponseSchema,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "list_models",
    {
      title: "List Models",
      description:
        "List available models for background agents. Includes 'Auto' option for automatic model selection.",
      inputSchema: {},
    },
    async () => {
      const result = await makeCursorApiRequest({
        endpoint: "/v0/models",
        responseSchema: ModelsResponseSchema,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "list_repositories",
    {
      title: "List Repositories",
      description:
        "List accessible GitHub repositories. WARNING: Strict rate limits (1/user/minute, 30/user/hour)",
      inputSchema: {},
    },
    async () => {
      const result = await makeCursorApiRequest({
        endpoint: "/v0/repositories",
        responseSchema: RepositoriesResponseSchema,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  // Register resources
  server.registerResource(
    "agents-list",
    new ResourceTemplate("agents://list", { list: undefined }),
    {
      title: "All Agents",
      description: "List of all background agents for the authenticated user",
    },
    async (uri) => {
      const agents = await makeCursorApiRequest({
        endpoint: "/v0/agents",
        responseSchema: ListAgentsResponseSchema,
      });
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(agents, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "models-list",
    new ResourceTemplate("models://list", { list: undefined }),
    {
      title: "Available Models",
      description: "List of available models for background agents",
    },
    async (uri) => {
      const models = await makeCursorApiRequest({
        endpoint: "/v0/models",
        responseSchema: ModelsResponseSchema,
      });
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(models, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "repositories-list",
    new ResourceTemplate("repositories://list", { list: undefined }),
    {
      title: "GitHub Repositories",
      description:
        "List of accessible GitHub repositories (strict rate limits apply)",
    },
    async (uri) => {
      const repos = await makeCursorApiRequest({
        endpoint: "/v0/repositories",
        responseSchema: RepositoriesResponseSchema,
      });
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(repos, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "agent-details",
    new ResourceTemplate("agents://{agentId}", { list: undefined }),
    {
      title: "Agent Details",
      description: "Details of a specific background agent",
    },
    async (uri, { agentId }) => {
      const agent = await makeCursorApiRequest({
        endpoint: `/v0/agents/${agentId}`,
        responseSchema: AgentResponseSchema,
      });
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(agent, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "agent-conversation",
    new ResourceTemplate("agents://{agentId}/conversation", {
      list: undefined,
    }),
    {
      title: "Agent Conversation",
      description: "Conversation history of a specific background agent",
    },
    async (uri, { agentId }) => {
      const conversation = await makeCursorApiRequest({
        endpoint: `/v0/agents/${agentId}/conversation`,
        responseSchema: ConversationResponseSchema,
      });
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(conversation, null, 2),
          },
        ],
      };
    }
  );

  return server;
}
