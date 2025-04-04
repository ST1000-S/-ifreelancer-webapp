import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

describe("Card Components", () => {
  describe("Card", () => {
    it("renders with default classes", () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText("Card content");
      expect(card).toHaveClass(
        "rounded-lg",
        "border",
        "bg-card",
        "text-card-foreground",
        "shadow-sm"
      );
    });

    it("applies custom className", () => {
      render(<Card className="test-class">Card content</Card>);
      const card = screen.getByText("Card content");
      expect(card).toHaveClass("test-class");
    });
  });

  describe("CardHeader", () => {
    it("renders with default classes", () => {
      render(<CardHeader>Header content</CardHeader>);
      const header = screen.getByText("Header content");
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6");
    });

    it("applies custom className", () => {
      render(<CardHeader className="test-class">Header content</CardHeader>);
      const header = screen.getByText("Header content");
      expect(header).toHaveClass("test-class");
    });
  });

  describe("CardTitle", () => {
    it("renders with default classes", () => {
      render(<CardTitle>Card title</CardTitle>);
      const title = screen.getByText("Card title");
      expect(title).toHaveClass(
        "text-2xl",
        "font-semibold",
        "leading-none",
        "tracking-tight"
      );
      expect(title.tagName.toLowerCase()).toBe("h3");
    });

    it("applies custom className", () => {
      render(<CardTitle className="test-class">Card title</CardTitle>);
      const title = screen.getByText("Card title");
      expect(title).toHaveClass("test-class");
    });
  });

  describe("CardDescription", () => {
    it("renders with default classes", () => {
      render(<CardDescription>Card description</CardDescription>);
      const description = screen.getByText("Card description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
      expect(description.tagName.toLowerCase()).toBe("p");
    });

    it("applies custom className", () => {
      render(
        <CardDescription className="test-class">
          Card description
        </CardDescription>
      );
      const description = screen.getByText("Card description");
      expect(description).toHaveClass("test-class");
    });
  });

  describe("CardContent", () => {
    it("renders with default classes", () => {
      render(<CardContent>Content</CardContent>);
      const content = screen.getByText("Content");
      expect(content).toHaveClass("p-6", "pt-0");
    });

    it("applies custom className", () => {
      render(<CardContent className="test-class">Content</CardContent>);
      const content = screen.getByText("Content");
      expect(content).toHaveClass("test-class");
    });
  });

  describe("CardFooter", () => {
    it("renders with default classes", () => {
      render(<CardFooter>Footer content</CardFooter>);
      const footer = screen.getByText("Footer content");
      expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
    });

    it("applies custom className", () => {
      render(<CardFooter className="test-class">Footer content</CardFooter>);
      const footer = screen.getByText("Footer content");
      expect(footer).toHaveClass("test-class");
    });
  });

  describe("Card composition", () => {
    it("renders a complete card with all subcomponents", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Example Card</CardTitle>
            <CardDescription>This is a card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText("Example Card")).toBeInTheDocument();
      expect(
        screen.getByText("This is a card description")
      ).toBeInTheDocument();
      expect(
        screen.getByText("This is the main content of the card.")
      ).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });
  });
});
