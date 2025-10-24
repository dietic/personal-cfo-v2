// @ts-nocheck - Supabase type inference issues, will fix in type refinement pass

import { requireAuth } from "@/lib/auth";
import { getPlanEntitlements, getRemainingChatQueries } from "@/lib/plan";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET /api/chat/usage
 * Get chat usage stats for the current user
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();
    const supabaseAdmin = getSupabaseAdmin();

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

    // Get plan entitlements
    const entitlements = getPlanEntitlements(userPlan);
    const limit = entitlements.chatQueriesPerMonth;
    const remaining = getRemainingChatQueries(userPlan, currentMonthUsage);

    // Calculate reset date (end of current month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return NextResponse.json({
      success: true,
      data: {
        queriesThisMonth: currentMonthUsage,
        limit: limit === Infinity ? "unlimited" : limit,
        remaining: remaining === Infinity ? "unlimited" : remaining,
        resetDate: resetDate.toISOString(),
        plan: userPlan,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Chat usage API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
