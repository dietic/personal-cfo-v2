import { cn } from "@/lib/utils";
import * as React from "react";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

// Simple shadcn-style Skeleton using theme tokens
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
