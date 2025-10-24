/**
 * OpenAI Chat Integration
 * Handles communication with OpenAI API for financial chat
 */

import OpenAI from "openai";
import { CHAT_SYSTEM_PROMPT } from "./chat-prompt";
import { buildUserContext, formatContextForAI } from "./context-builder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatRequest {
  userId: string;
  query: string;
}

export interface ChatResponse {
  response: string;
  tokensUsed: number;
}

/**
 * Send a chat query to OpenAI and get a response
 * Uses GPT-4o-mini for cost efficiency
 */
export async function sendChatQuery(
  request: ChatRequest
): Promise<ChatResponse> {
  // Build user context (last 6 months of transactions)
  const context = await buildUserContext(request.userId);
  const contextString = formatContextForAI(context);

  // Prepare messages for OpenAI
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: CHAT_SYSTEM_PROMPT,
    },
    {
      role: "system",
      content: `User's Financial Data:\n${contextString}`,
    },
    {
      role: "user",
      content: request.query,
    },
  ];

  // Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 500,
    temperature: 0.3,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const response = completion.choices[0]?.message?.content || "";
  const tokensUsed = completion.usage?.total_tokens || 0;

  return {
    response,
    tokensUsed,
  };
}
