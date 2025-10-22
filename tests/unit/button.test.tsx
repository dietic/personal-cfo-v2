import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("should apply variant styles", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button", { name: /delete/i })
    expect(button).toHaveClass("bg-destructive")
  })

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button", { name: /disabled/i })
    expect(button).toBeDisabled()
  })

  it("should apply size variant", () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByRole("button", { name: /small button/i })
    expect(button).toHaveClass("h-9")
  })
})
