import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

describe("Dialog Components", () => {
  describe("Dialog composition", () => {
    it("renders a complete dialog with all subcomponents", async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Example Dialog</DialogTitle>
              <DialogDescription>
                This is a dialog description
              </DialogDescription>
            </DialogHeader>
            <div>This is the main content of the dialog.</div>
            <DialogFooter>
              <Button data-testid="close-button">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const openButton = screen.getByRole("button", { name: "Open Dialog" });
      expect(openButton).toBeInTheDocument();
      await user.click(openButton);

      expect(screen.getByText("Example Dialog")).toBeInTheDocument();
      expect(
        screen.getByText("This is a dialog description")
      ).toBeInTheDocument();
      expect(
        screen.getByText("This is the main content of the dialog.")
      ).toBeInTheDocument();
      expect(screen.getByTestId("close-button")).toBeInTheDocument();
    });
  });

  describe("DialogHeader", () => {
    it("renders with default classes", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>Header Content</DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const header = screen.getByText("Header Content").closest("div");
      expect(header).toHaveClass(
        "flex",
        "flex-col",
        "space-y-1.5",
        "text-center",
        "sm:text-left"
      );
    });

    it("applies custom className", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader className="test-class">Header Content</DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const header = screen.getByText("Header Content").closest("div");
      expect(header).toHaveClass("test-class");
    });
  });

  describe("DialogFooter", () => {
    it("renders with default classes", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter>Footer Content</DialogFooter>
          </DialogContent>
        </Dialog>
      );
      const footer = screen.getByText("Footer Content").closest("div");
      expect(footer).toHaveClass(
        "flex",
        "flex-col-reverse",
        "sm:flex-row",
        "sm:justify-end",
        "sm:space-x-2"
      );
    });

    it("applies custom className", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter className="test-class">Footer Content</DialogFooter>
          </DialogContent>
        </Dialog>
      );
      const footer = screen.getByText("Footer Content").closest("div");
      expect(footer).toHaveClass("test-class");
    });
  });

  describe("DialogTitle", () => {
    it("renders with default classes", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      const title = screen.getByText("Dialog Title");
      expect(title).toHaveClass(
        "text-lg",
        "font-semibold",
        "leading-none",
        "tracking-tight"
      );
    });

    it("applies custom className", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle className="test-class">Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      const title = screen.getByText("Dialog Title");
      expect(title).toHaveClass("test-class");
    });
  });

  describe("DialogDescription", () => {
    it("renders with default classes", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      const description = screen.getByText("Dialog Description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("applies custom className", () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription className="test-class">
              Dialog Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
      const description = screen.getByText("Dialog Description");
      expect(description).toHaveClass("test-class");
    });
  });
});
