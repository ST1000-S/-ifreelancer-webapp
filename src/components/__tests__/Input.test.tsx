import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../ui/input";

describe("Input Component", () => {
  it("renders with default classes", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toHaveClass(
      "flex",
      "h-9",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-transparent",
      "px-3",
      "py-1",
      "text-sm",
      "shadow-sm"
    );
  });

  it("applies custom className", () => {
    render(<Input className="test-class" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toHaveClass("test-class");
  });

  it("handles text input correctly", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Hello, World!" } });
    expect(input.value).toBe("Hello, World!");
  });

  it("handles different input types", () => {
    render(<Input type="number" placeholder="Enter number" />);
    const input = screen.getByPlaceholderText("Enter number");
    expect(input).toHaveAttribute("type", "number");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Enter text" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("handles disabled state", () => {
    render(<Input disabled placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      "disabled:cursor-not-allowed",
      "disabled:opacity-50"
    );
  });

  it("handles focus state", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    input.focus();
    expect(input).toHaveFocus();
    expect(input).toHaveClass(
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-ring"
    );
  });

  it("handles file input type", () => {
    render(<Input type="file" placeholder="Choose file" />);
    const input = screen.getByPlaceholderText("Choose file");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveClass(
      "file:border-0",
      "file:bg-transparent",
      "file:text-sm",
      "file:font-medium"
    );
  });
});
