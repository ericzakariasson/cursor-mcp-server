import { z } from "zod";

// ============================================================================
// Zod Schemas - Request Types
// ============================================================================

export const ImageDimensionSchema = z.object({
  width: z.number().int().min(1),
  height: z.number().int().min(1),
});

export const ImageSchema = z.object({
  data: z.string().min(1).describe("Base64 encoded image data"),
  dimension: ImageDimensionSchema.optional(),
});

export const PromptSchema = z.object({
  text: z.string().min(1).describe("The instruction text"),
  images: z
    .array(ImageSchema)
    .max(5)
    .optional()
    .describe("Optional array of base64 encoded images (max 5)"),
});

export const SourceSchema = z.object({
  repository: z.string().min(1).describe("The GitHub repository URL"),
  ref: z
    .string()
    .optional()
    .describe("Git ref (branch/tag) to use as the base branch"),
});

export const TargetSchema = z.object({
  autoCreatePr: z
    .boolean()
    .optional()
    .describe(
      "Whether to automatically create a pull request when the agent completes"
    ),
  branchName: z
    .string()
    .optional()
    .describe("Custom branch name for the agent to create"),
});

export const WebhookSchema = z.object({
  url: z
    .string()
    .url()
    .max(2048)
    .describe("URL to receive webhook notifications"),
  secret: z
    .string()
    .min(32)
    .max(256)
    .describe("Secret key for webhook payload verification"),
});

export const LaunchAgentSchema = z.object({
  prompt: PromptSchema,
  model: z
    .string()
    .optional()
    .describe("The LLM to use (optional, auto if not provided)"),
  source: SourceSchema,
  target: TargetSchema.optional(),
  webhook: WebhookSchema.optional(),
});

export const AddFollowupSchema = z.object({
  agentId: z.string().describe("Unique identifier for the background agent"),
  prompt: PromptSchema,
});

export const DeleteAgentSchema = z.object({
  agentId: z.string().describe("Unique identifier for the background agent"),
});

export const ListAgentsSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of agents to return (default: 20)"),
  cursor: z
    .string()
    .optional()
    .describe("Pagination cursor from the previous response"),
});

export const GetAgentStatusSchema = z.object({
  agentId: z.string().describe("Unique identifier for the background agent"),
});

export const GetAgentConversationSchema = z.object({
  agentId: z.string().describe("Unique identifier for the background agent"),
});

// ============================================================================
// Zod Schemas - Response Types
// ============================================================================

export const AgentStatusEnum = z.enum([
  "CREATING",
  "RUNNING",
  "FINISHED",
  "ERROR",
  "EXPIRED",
]);

export const AgentSourceResponseSchema = z.object({
  repository: z.string(),
  ref: z.string().optional(),
});

export const AgentTargetResponseSchema = z.object({
  branchName: z.string().optional(),
  url: z.string(),
  prUrl: z.string().optional(),
  autoCreatePr: z.boolean().optional(),
});

export const AgentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: AgentStatusEnum,
  source: AgentSourceResponseSchema,
  target: AgentTargetResponseSchema,
  summary: z.string().optional(),
  createdAt: z.string(),
});

export const ListAgentsResponseSchema = z.object({
  agents: z.array(AgentResponseSchema),
  nextCursor: z.string().optional(),
});

export const DeleteAgentResponseSchema = z.object({
  id: z.string(),
});

export const AddFollowupResponseSchema = z.object({
  id: z.string(),
});

export const MessageTypeEnum = z.enum(["user_message", "assistant_message"]);

export const ConversationMessageSchema = z.object({
  id: z.string(),
  type: MessageTypeEnum,
  text: z.string(),
});

export const ConversationResponseSchema = z.object({
  id: z.string(),
  messages: z.array(ConversationMessageSchema),
});

export const ApiKeyInfoResponseSchema = z.object({
  apiKeyName: z.string(),
  createdAt: z.string(),
  userEmail: z.string().email().optional(),
});

export const ModelsResponseSchema = z.object({
  models: z.array(z.string()),
});

export const RepositorySchema = z.object({
  owner: z.string(),
  name: z.string(),
  repository: z.string().url(),
});

export const RepositoriesResponseSchema = z.object({
  repositories: z.array(RepositorySchema),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});
