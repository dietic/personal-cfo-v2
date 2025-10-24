"use client";

import { useState, useCallback } from "react";
import { useAuth } from "./use-auth";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatUsage {
  queriesThisMonth: number;
  limit: number | "unlimited";
  remaining: number | "unlimited";
  resetDate: string;
  plan: string;
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch usage stats
  const fetchUsage = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/chat/usage");
      if (!response.ok) {
        throw new Error("Failed to fetch usage");
      }
      const data = await response.json();
      setUsage(data.data);
    } catch (err) {
      console.error("Error fetching chat usage:", err);
    }
  }, [user]);

  // Send a chat message
  const sendMessage = useCallback(
    async (query: string) => {
      if (!user || !query.trim()) return;

      setError(null);
      setIsLoading(true);

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: query.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 429) {
            setError(data.error || "Too many requests. Please wait.");
          } else if (response.status === 402) {
            setError(data.error || "Monthly limit exceeded. Upgrade for more!");
          } else if (response.status === 400) {
            setError(data.error || "Invalid input. Please try again.");
          } else {
            setError(data.error || "Something went wrong. Please try again.");
          }
          return;
        }

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update usage stats
        if (data.data.remainingQueries !== undefined) {
          setUsage((prev) =>
            prev
              ? {
                  ...prev,
                  queriesThisMonth: prev.queriesThisMonth + 1,
                  remaining: data.data.remainingQueries,
                }
              : null
          );
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Clear chat history (session-only, no API call)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    usage,
    sendMessage,
    clearMessages,
    fetchUsage,
  };
}
