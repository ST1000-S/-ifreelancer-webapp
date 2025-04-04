import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { JobCard } from "../JobCard";
import { JobType, JobStatus, JobAvailability } from "@prisma/client";

describe("JobCard", () => {
  const mockJob = {
    id: "1",
    title: "React Developer",
    description: "Looking for an experienced React developer",
    budget: 5000,
    budgetType: "FIXED",
    type: JobType.REMOTE,
    status: JobStatus.OPEN,
    availability: JobAvailability.FULL_TIME,
    skills: ["React", "TypeScript", "Node.js"],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
    category: "Development",
    experienceLevel: "Intermediate",
    creatorId: "user1",
  };

  it("renders job details correctly", () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText(mockJob.title)).toBeInTheDocument();
    expect(screen.getByText(mockJob.description)).toBeInTheDocument();
    expect(screen.getByText(`Budget: $${mockJob.budget}`)).toBeInTheDocument();
    mockJob.skills.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<JobCard job={mockJob} onClick={handleClick} />);

    // Find and click the card
    const card = screen.getByTestId("job-card");
    fireEvent.click(card);

    // Check if onClick was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies hover styles", () => {
    render(<JobCard job={mockJob} />);

    const card = screen.getByTestId("job-card");
    expect(card).toHaveClass("hover:shadow-md");
  });

  it("truncates long descriptions", () => {
    const longDescription = "A".repeat(300);
    const jobWithLongDesc = { ...mockJob, description: longDescription };

    render(<JobCard job={jobWithLongDesc} />);

    const description = screen.getByText(/A+/);
    expect(description).toHaveClass("line-clamp-2");
  });
});
