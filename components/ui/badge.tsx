"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "destructive" | "secondary" | "success";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-muted text-foreground",
        variant === "outline" && "border border-input text-foreground",
        variant === "destructive" && "bg-destructive/20 text-destructive",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "success" &&
          "bg-green-500/15 text-green-600 dark:text-green-400",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
