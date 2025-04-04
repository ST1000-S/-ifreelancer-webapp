import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Select,
  SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "../ui/select";

describe("Select Components", () => {
  describe("Native Select", () => {
    it("renders with default classes", () => {
      render(
        <Select aria-label="Options" title="Select an option">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass(
        "flex",
        "h-10",
        "w-full",
        "rounded-md",
        "border",
        "border-input",
        "bg-background"
      );
    });

    it("applies custom className", () => {
      render(
        <Select
          className="test-class"
          aria-label="Options"
          title="Select an option"
        >
          <option value="1">Option 1</option>
        </Select>
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("test-class");
    });

    it("handles value changes", () => {
      const handleChange = jest.fn();
      render(
        <Select
          onChange={handleChange}
          aria-label="Options"
          title="Select an option"
        >
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "2" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("can be disabled", () => {
      render(
        <Select disabled aria-label="Options" title="Select an option">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
      expect(select).toHaveClass(
        "disabled:cursor-not-allowed",
        "disabled:opacity-50"
      );
    });
  });

  describe("Radix Select", () => {
    it("renders trigger with default classes", () => {
      render(
        <SelectRoot>
          <SelectTrigger aria-label="Fruit selection">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectSeparator />
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass(
        "flex",
        "h-10",
        "w-full",
        "items-center",
        "justify-between",
        "rounded-md",
        "border"
      );
    });

    it("renders placeholder text", () => {
      render(
        <SelectRoot>
          <SelectTrigger aria-label="Fruit selection">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
      );

      const placeholder = screen.getByText("Select an option");
      expect(placeholder).toBeInTheDocument();
    });

    it("renders trigger icon", () => {
      render(
        <SelectRoot>
          <SelectTrigger aria-label="Fruit selection">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
      );

      const icon = document.querySelector("svg.lucide-chevron-down");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("h-4", "w-4", "opacity-50");
    });
  });
});
