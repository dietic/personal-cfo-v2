"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCards } from "@/hooks/use-cards";
import { useTranslation } from "@/hooks/use-translation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, FileText, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StatementUploadDialog({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const { cards } = useCards();
  const [file, setFile] = useState<File | null>(null);
  const [cardId, setCardId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const qc = useQueryClient();

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // Check if it's a PDF
      if (file.type !== "application/pdf") {
        setError(t("statements.upload.errorInvalidType"));
        return false;
      }

      // Check file size (max 25MB as per env)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        setError(t("statements.upload.errorTooLarge"));
        return false;
      }

      return true;
    },
    [t]
  );

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (!validateFile(selectedFile)) return;
      setFile(selectedFile);
      setPassword("");
      setError(null);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  type SubmitResult = { ok: boolean; passwordError: boolean; error?: string };

  const handleSubmit = async (opts?: {
    fromPasswordAttempt?: boolean;
  }): Promise<SubmitResult> => {
    if (!file) {
      const msg = t("statements.upload.errorNoFile");
      setError(msg);
      return { ok: false, passwordError: false, error: msg };
    }
    if (!cardId) {
      const msg = t("statements.upload.errorNoCard");
      setError(msg);
      return { ok: false, passwordError: false, error: msg };
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("cardId", cardId);
      if (password) {
        formData.append("password", password);
      }

      // Upload statement
      const response = await fetch("/api/statements", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      let result: Partial<{ error: unknown; message: unknown }> = {};
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { error: text };
      }

      if (!response.ok) {
        const errMsg = String(
          (result.error as unknown as string | undefined) ??
            (result.message as unknown as string | undefined) ??
            ""
        );
        const isPasswordErr = /password|encrypted|incorrect_password/i.test(
          errMsg
        );

        // If this wasn't a password attempt, prompt for password when server indicates encryption
        if (isPasswordErr && !opts?.fromPasswordAttempt) {
          setShowPasswordPrompt(true);
        }

        return { ok: false, passwordError: isPasswordErr, error: errMsg };
      }

      // Success!
      toast.success(t("statements.upload.successTitle"), {
        description: t("statements.upload.successDescription"),
      });

      // Call success callback to refresh statements list
      onSuccess?.();

      // Proactively refresh statements data sources
      qc.invalidateQueries({ queryKey: ["statements"] });
      router.refresh?.();

      // Reset and close
      handleClose();
      return { ok: true, passwordError: false };
    } catch (err: unknown) {
      const message =
        (err as Error)?.message || t("statements.upload.errorUploadFailed");
      setError(message);
      const isPasswordErr = /password|encrypted|incorrect_password/i.test(
        message
      );
      if (isPasswordErr && !opts?.fromPasswordAttempt) {
        setShowPasswordPrompt(true);
      }
      return { ok: false, passwordError: isPasswordErr, error: message };
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError(t("statements.upload.errorNoPassword"));
      return;
    }
    if (!file) {
      setError(t("statements.upload.errorNoFile"));
      return;
    }

    // Defer validation to server; then alert based on result
    setShowPasswordPrompt(false);
    const res = await handleSubmit({ fromPasswordAttempt: true });
    if (res.ok) {
      alert("PDF unlocked");
    } else if (res.passwordError) {
      alert("Incorrect password");
      setShowPasswordPrompt(true);
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordPrompt(false);
    setPassword("");
    setError(null);
  };

  const handleClose = () => {
    setFile(null);
    setCardId("");
    setError(null);
    setPassword("");
    setIsDragging(false);
    setShowPasswordPrompt(false);
    setIsUploading(false);
    onClose();
  };

  // Render password prompt dialog only when needed
  if (showPasswordPrompt) {
    return (
      <Dialog open={true} onOpenChange={handleCancelPassword}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>
              {t("statements.upload.passwordPromptTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("statements.upload.passwordPromptDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-password">
                {t("statements.upload.passwordLabel")}
              </Label>
              <Input
                id="pdf-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("statements.upload.passwordPlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelPassword}>
              {t("statements.upload.passwordCancel")}
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={!password.trim()}>
              {t("statements.upload.passwordSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{t("statements.upload.title")}</DialogTitle>
          <DialogDescription>
            {t("statements.upload.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Card Selection */}
          <div className="space-y-2">
            <Label htmlFor="statement-card">
              {t("statements.upload.selectCard")}
            </Label>
            <Select value={cardId} onValueChange={setCardId}>
              <SelectTrigger id="statement-card">
                <SelectValue
                  placeholder={t("statements.upload.selectCardPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {cards.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    {t("statements.upload.noCards")}
                  </div>
                ) : (
                  cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <Label>{t("statements.upload.uploadFile")}</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("statements.upload.dropZoneTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("statements.upload.dropZoneSubtitle")}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Helpful Information */}
          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">
              {t("statements.upload.infoTitle")}
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>{t("statements.upload.infoPdfOnly")}</li>
              <li>{t("statements.upload.infoMaxSize")}</li>
              <li>{t("statements.upload.infoProcessing")}</li>
              <li>{t("statements.upload.infoSecurity")}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={!file || !cardId || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("statements.upload.uploading")}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {t("statements.upload.submitButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
