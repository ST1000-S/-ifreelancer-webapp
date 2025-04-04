import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDisabled();
  });

  it("has correct styles", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toHaveClass("bg-blue-500", "text-white", "rounded");
  });
});
