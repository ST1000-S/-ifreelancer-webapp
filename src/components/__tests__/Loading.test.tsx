import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Loading, LoadingPage, LoadingSpinner } from "../ui/loading";

describe("Loading Components", () => {
  describe("Loading", () => {
    it("renders with default size", () => {
      render(<Loading />);
      const loader = screen.getByRole("status");
      expect(loader).toHaveClass("h-6", "w-6");
    });

    it("renders with small size", () => {
      render(<Loading size="sm" />);
      const loader = screen.getByRole("status");
      expect(loader).toHaveClass("h-4", "w-4");
    });

    it("renders with large size", () => {
      render(<Loading size="lg" />);
      const loader = screen.getByRole("status");
      expect(loader).toHaveClass("h-8", "w-8");
    });

    it("displays loading text when provided", () => {
      const text = "Loading...";
      render(<Loading text={text} />);
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Loading className="test-class" />);
      const container = screen.getByRole("status").parentElement;
      expect(container).toHaveClass("test-class");
    });
  });

  describe("LoadingPage", () => {
    it("renders with default height", () => {
      render(<LoadingPage />);
      const container = screen.getByRole("region").closest("div");
      expect(container).toHaveClass("min-h-[400px]");
    });

    it("renders with full screen height", () => {
      render(<LoadingPage fullScreen />);
      const container = screen.getByRole("region").closest("div");
      expect(container).toHaveClass("min-h-screen");
    });

    it("uses large size for spinner", () => {
      render(<LoadingPage />);
      const loader = screen.getByRole("status");
      expect(loader).toHaveClass("h-8", "w-8");
    });
  });

  describe("LoadingSpinner", () => {
    it("renders with default classes", () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole("status");
      expect(spinner).toHaveClass("h-4", "w-4", "animate-spin");
    });

    it("applies custom className", () => {
      render(<LoadingSpinner className="test-class" />);
      const spinner = screen.getByRole("status");
      expect(spinner).toHaveClass("test-class");
    });
  });
});
