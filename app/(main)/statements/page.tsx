"use client";

import { StatementRealtimeListener } from "@/components/statements/statement-realtime-listener";
import { StatementUploadDialog } from "@/components/statements/statement-upload-dialog";
import { StatementsTable } from "@/components/statements/statements-table";
import {
  StatementsToolbar,
  type Filters,
} from "@/components/statements/statements-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";

export default function StatementsPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [openUpload, setOpenUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger refresh of statements table
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <StatementRealtimeListener />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("dashboard.navigation.statements")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {t("statements.subtitle")}
          </p>
        </div>
      </div>

      <StatementsToolbar
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onOpenUpload={() => setOpenUpload(true)}
      />
      <StatementUploadDialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onSuccess={handleUploadSuccess}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("statements.allStatements")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatementsTable
            key={refreshKey}
            filters={filters}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onChangePageSize={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
