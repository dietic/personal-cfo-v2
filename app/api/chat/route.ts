// @ts-nocheck - Supabase type inference issues, will fix in type refinement pass
/* eslint-disable @typescript-eslint/no-explicit-any */

import { sendChatQuery } from "@/lib/ai/chat";
import { sanitizeAIResponse, sanitizeUserInput } from "@/lib/ai/chat-prompt";
import { requireAuth } from "@/lib/auth";
import { canSendChatQuery, getRemainingChatQueries } from "@/lib/plan";
import { getSupabaseAdmin } from "@/lib/supabase";
import { chatQuerySchema } from "@/lib/validators/chat";
import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiter (10 queries per hour per user)
// In production, use Redis or a proper rate limiting solution
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkHourlyRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const limit = 10;

  const record = rateLimitMap.get(userId);

  if (!record || now > record.resetAt) {
    // New window
    const resetAt = now + hourInMs;
    rateLimitMap.set(userId, { count: 0, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  return {
    allowed: true,
    remaining: limit - record.count - 1,
    resetAt: record.resetAt,
  };
}

function incrementHourlyRateLimit(userId: string): void {
  const record = rateLimitMap.get(userId);
  if (record) {
    record.count += 1;
  }
}

/**
 * POST /api/chat
 * Send a chat query to the AI financial assistant
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();
    const supabaseAdmin = getSupabaseAdmin();

    // Parse and validate request body
    const body = await request.json();
    const validation = chatQuerySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { query } = validation.data;

    // Sanitize input (check for SQL injection, XSS, etc.)
    let sanitizedQuery: string;
    try {
      sanitizedQuery = sanitizeUserInput(query);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid input detected" },
        { status: 400 }
      );
    }

    // Check hourly rate limit (10 queries/hour)
    const hourlyLimit = checkHourlyRateLimit(user.id);
    if (!hourlyLimit.allowed) {
      const retryAfter = Math.ceil(
        (hourlyLimit.resetAt - Date.now()) / 1000 / 60
      ); // minutes
      return NextResponse.json(
        {
          error: "Hourly rate limit exceeded",
          retryAfter: `${retryAfter} minutes`,
        },
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
      );
    }

    // Get user's profile (for plan)
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const userPlan = profile.plan as "free" | "plus" | "pro" | "admin";

    // Get monthly usage count
    const { data: usageCount } = await supabaseAdmin.rpc(
      "get_monthly_chat_usage",
      {
        p_user_id: user.id,
      }
    );

    const currentMonthUsage = usageCount || 0;

    // Check plan limits
    if (!canSendChatQuery(userPlan, currentMonthUsage)) {
      const remaining = getRemainingChatQueries(userPlan, currentMonthUsage);
      return NextResponse.json(
        {
          error: "Monthly plan limit exceeded",
          plan: userPlan,
          limit: currentMonthUsage,
          remaining,
        },
        { status: 402 }
      );
    }

    // Send query to OpenAI
    let aiResponse: { response: string; tokensUsed: number };
    try {
      aiResponse = await sendChatQuery({
        userId: user.id,
        query: sanitizedQuery,
      });
    } catch (error) {
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        {
          error:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    // Sanitize AI response
    const sanitizedResponse = sanitizeAIResponse(aiResponse.response);

    // Log usage to database
    const { error: insertError } = await supabaseAdmin
      .from("chat_usage")
      .insert({
        user_id: user.id,
        query: sanitizedQuery,
        response: sanitizedResponse,
        tokens_used: aiResponse.tokensUsed,
      });

    if (insertError) {
      console.error("Failed to log chat usage:", insertError);
      // Don't fail the request, but log the error
    }

    // Increment hourly rate limit counter
    incrementHourlyRateLimit(user.id);

    // Calculate remaining queries
    const remainingQueries = getRemainingChatQueries(
      userPlan,
      currentMonthUsage + 1
    );

    return NextResponse.json({
      success: true,
      data: {
        response: sanitizedResponse,
        tokensUsed: aiResponse.tokensUsed,
        remainingQueries,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
