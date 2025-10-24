"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { ChatWidget } from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatBubble } from "@/components/chat/chat-bubble";

export function ChatProvider() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Don't render anything if no profile
  if (!profile) return null;

  // Free plan users see upgrade modal
  if (profile.plan === "free") {
    return (
      <>
        <ChatBubble onClick={() => setShowUpgradeModal(true)} />
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("chat.upgrade.title")}</DialogTitle>
              <DialogDescription>
                {t("chat.upgrade.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </Button>
              <Link href="/settings?tab=billing">
                <Button>{t("chat.upgrade.cta")}</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Plus, Pro, and Admin users get full chat access
  return <ChatWidget />;
}
