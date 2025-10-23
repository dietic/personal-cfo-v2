"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase-browser";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

type StatementRow = {
  id: string;
  user_id: string;
  status: "processing" | "completed" | "failed";
  failure_reason: string | null;
};

export function StatementRealtimeListener() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const prevStatusesRef = useRef<Map<string, StatementRow["status"]>>(
    new Map()
  );
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    const channel = supabase
      .channel("statements-status")
      .on<StatementRow>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "statements",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<StatementRow>) => {
          try {
            // Always invalidate cache so UI reflects changes
            qc.invalidateQueries({ queryKey: ["statements"] });

            // Notify when finishing processing
            if (payload.eventType === "UPDATE") {
              const oldStatus = payload.old?.status;
              const newStatus = payload.new?.status;
              const failureReason = payload.new?.failure_reason || undefined;

              if (oldStatus === "processing" && newStatus === "completed") {
                toast.success(t("statements.toastProcessingDoneTitle"), {
                  description: t("statements.toastProcessingDoneDesc"),
                });
              } else if (oldStatus === "processing" && newStatus === "failed") {
                toast.error(t("statements.toastProcessingFailedTitle"), {
                  description:
                    failureReason || t("statements.toastProcessingFailedDesc"),
                });
              }
            }
          } catch {
            // no-op
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [user?.id, qc, t]);

  // Fallback: poll cached query data to detect transitions when Realtime isn't available
  useEffect(() => {
    const timer = setInterval(() => {
      const queries = qc.getQueriesData<{
        success: true;
        data: StatementRow[];
        total: number;
      }>({ queryKey: ["statements"] });

      // Flatten all visible statements from cached queries
      const rows: StatementRow[] = [];
      for (const [, value] of queries) {
        if (value?.success && Array.isArray(value.data)) {
          rows.push(...value.data);
        }
      }

      if (!initializedRef.current) {
        // Seed map without firing toasts on first run
        for (const r of rows) prevStatusesRef.current.set(r.id, r.status);
        initializedRef.current = true;
        return;
      }

      // Detect transitions from processing -> completed/failed
      for (const r of rows) {
        const prev = prevStatusesRef.current.get(r.id);
        if (prev === "processing" && r.status === "completed") {
          toast.success(t("statements.toastProcessingDoneTitle"), {
            description: t("statements.toastProcessingDoneDesc"),
          });
        } else if (prev === "processing" && r.status === "failed") {
          toast.error(t("statements.toastProcessingFailedTitle"), {
            description:
              r.failure_reason || t("statements.toastProcessingFailedDesc"),
          });
        }
        prevStatusesRef.current.set(r.id, r.status);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [qc, t]);

  return null;
}
