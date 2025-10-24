/**
 * Inngest API Route
 *
 * Webhook endpoint for Inngest to communicate with our background functions.
 * This route handles function execution, retries, and event processing.
 */

import { inngest } from "@/lib/inngest";
import { categorizeByKeyword } from "@/lib/inngest/functions/categorize-by-keyword";
import { processStatement } from "@/lib/inngest/functions/process-statement";
import { reassignKeyword } from "@/lib/inngest/functions/reassign-keyword";
import { serve } from "inngest/next";

// Register all Inngest functions here
const functions = [processStatement, categorizeByKeyword, reassignKeyword];

// Create and export the handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
