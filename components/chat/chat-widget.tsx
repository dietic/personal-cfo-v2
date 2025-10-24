"use client";

import { useState } from "react";
import { ChatBubble } from "./chat-bubble";
import { ChatDrawer } from "./chat-drawer";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatBubble onClick={() => setIsOpen(true)} />
      <ChatDrawer open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
