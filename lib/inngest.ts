/**
 * Inngest Client
 *
 * Background job queue for async processing (PDF extraction, re-categorization, etc.)
 * Replaces Celery/Redis setup with a serverless-friendly solution.
 */

import { Inngest } from "inngest";

// Create Inngest client
export const inngest = new Inngest({
  id: "personal-cfo",
  name: "Personal CFO",
  eventKey: process.env.INNGEST_EVENT_KEY || "",
});

/**
 * Event types for type-safe job triggering
 */
export type InngestEvents = {
  "statement/process": {
    data: {
      statementId: string;
      userId: string;
      cardId: string;
      fileName: string;
      extractedText: string; // Pre-extracted PDF text (PDF already processed and discarded)
    };
  };
  "transactions/recategorize": {
    data: {
      userId: string;
      transactionIds: string[];
    };
  };
};
