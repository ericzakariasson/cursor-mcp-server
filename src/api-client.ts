import { z } from "zod";
import { ErrorResponseSchema } from "./schemas.js";

// Environment configuration
export const CURSOR_API_KEY = process.env.CURSOR_API_KEY;
export const CURSOR_API_URL = "https://api.cursor.com";

if (!CURSOR_API_KEY) {
  console.error("Error: CURSOR_API_KEY environment variable is required");
  process.exit(1);
}

// Helper function to make Cursor API requests with validation
export async function makeCursorApiRequest<T extends z.ZodType>({
  endpoint,
  responseSchema,
  method = "GET",
  body,
}: {
  endpoint: string;
  responseSchema: T;
  method?: string;
  body?: unknown;
}): Promise<z.infer<T>> {
  const url = `${CURSOR_API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${CURSOR_API_KEY}`,
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  let responseData: unknown;

  try {
    responseData = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response from API: ${responseText}`);
  }

  if (!response.ok) {
    const errorResult = ErrorResponseSchema.safeParse(responseData);
    if (errorResult.success) {
      throw new Error(
        `Cursor API error: ${response.status} - ${errorResult.data.error.message}`
      );
    }
    throw new Error(
      `Cursor API error: ${response.status} ${response.statusText} - ${responseText}`
    );
  }

  // Validate response against schema
  const validationResult = responseSchema.safeParse(responseData);
  if (!validationResult.success) {
    console.error("Response validation failed:", validationResult.error);
    throw new Error(
      `API response validation failed: ${validationResult.error.message}`
    );
  }

  return validationResult.data;
}
