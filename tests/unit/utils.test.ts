import { cn } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("should handle undefined and null", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("should merge Tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    // tailwind-merge should keep only px-4
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
    expect(result).toContain("py-1");
  });
});
