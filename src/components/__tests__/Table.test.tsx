import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "../ui/table";

describe("Table Components", () => {
  describe("Table", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Test Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole("table");
      expect(table).toHaveClass("w-full", "caption-bottom", "text-sm");
    });

    it("applies custom className", () => {
      render(
        <Table className="test-class">
          <TableBody>
            <TableRow>
              <TableCell>Test Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole("table");
      expect(table).toHaveClass("test-class");
    });
  });

  describe("TableHeader", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const header = screen.getByRole("rowgroup");
      expect(header).toHaveClass("[&_tr]:border-b");
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableHeader className="test-class">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const header = screen.getByRole("rowgroup");
      expect(header).toHaveClass("test-class");
    });
  });

  describe("TableBody", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const body = screen.getByRole("rowgroup");
      expect(body).toHaveClass("[&_tr:last-child]:border-0");
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableBody className="test-class">
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const body = screen.getByRole("rowgroup");
      expect(body).toHaveClass("test-class");
    });
  });

  describe("TableFooter", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const footer = screen.getByRole("rowgroup");
      expect(footer).toHaveClass(
        "bg-primary",
        "font-medium",
        "text-primary-foreground"
      );
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableFooter className="test-class">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const footer = screen.getByRole("rowgroup");
      expect(footer).toHaveClass("test-class");
    });
  });

  describe("TableRow", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByRole("row");
      expect(row).toHaveClass(
        "border-b",
        "transition-colors",
        "hover:bg-muted/50",
        "data-[state=selected]:bg-muted"
      );
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableBody>
            <TableRow className="test-class">
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByRole("row");
      expect(row).toHaveClass("test-class");
    });
  });

  describe("TableHead", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const head = screen.getByRole("columnheader");
      expect(head).toHaveClass(
        "h-12",
        "px-4",
        "text-left",
        "align-middle",
        "font-medium",
        "text-muted-foreground",
        "[&:has([role=checkbox])]:pr-0"
      );
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="test-class">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const head = screen.getByRole("columnheader");
      expect(head).toHaveClass("test-class");
    });
  });

  describe("TableCell", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByRole("cell");
      expect(cell).toHaveClass(
        "p-4",
        "align-middle",
        "[&:has([role=checkbox])]:pr-0"
      );
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="test-class">Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByRole("cell");
      expect(cell).toHaveClass("test-class");
    });
  });

  describe("TableCaption", () => {
    it("renders with default classes", () => {
      render(
        <Table>
          <TableCaption>Table Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = screen.getByText("Table Caption");
      expect(caption).toHaveClass("mt-4", "text-sm", "text-muted-foreground");
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableCaption className="test-class">Table Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = screen.getByText("Table Caption");
      expect(caption).toHaveClass("test-class");
    });
  });
});
