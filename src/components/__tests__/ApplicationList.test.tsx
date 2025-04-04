import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ApplicationList } from "../ApplicationList";
import { format } from "date-fns";

// Mock EventSource
const mockEventSource = {
  onmessage: null,
  onerror: null,
  close: jest.fn(),
};

// Mock date for consistent testing
const mockDate = new Date("2024-01-01");

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock EventSource constructor
(global as any).EventSource = jest.fn(() => mockEventSource);

describe("ApplicationList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no applications exist", () => {
    render(<ApplicationList applications={[]} />);
    expect(
      screen.getByText("You haven't applied to any jobs yet.")
    ).toBeInTheDocument();
  });

  it("renders a list of applications", () => {
    const mockApplications = [
      {
        id: "1",
        jobId: "job1",
        applicantId: "user1",
        coverLetter: null,
        status: "PENDING",
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
        job: {
          id: "job1",
          title: "Test Job",
          description: "Test Description",
          budget: 1000,
          budgetType: "Fixed",
          type: "Full-time",
          status: "OPEN",
          category: "Development",
          experienceLevel: "Intermediate",
          availability: "Immediate",
          skills: ["React", "TypeScript"],
          createdAt: mockDate.toISOString(),
          updatedAt: mockDate.toISOString(),
          creatorId: "creator1",
        },
      },
    ];

    render(<ApplicationList applications={mockApplications} />);

    // Check if table headers are rendered
    expect(screen.getByText("Job Title")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Applied On")).toBeInTheDocument();

    // Check if application data is rendered
    expect(screen.getByText("Test Job")).toBeInTheDocument();
    expect(screen.getByText("$1000")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(
      screen.getByText(format(mockDate, "MMM d, yyyy"))
    ).toBeInTheDocument();
  });

  it("applies correct badge variant based on status", () => {
    const mockApplications = [
      {
        id: "1",
        jobId: "job1",
        applicantId: "user1",
        coverLetter: null,
        status: "ACCEPTED",
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
        job: {
          id: "job1",
          title: "Test Job 1",
          description: "Test Description",
          budget: 1000,
          budgetType: "Fixed",
          type: "Full-time",
          status: "OPEN",
          category: "Development",
          experienceLevel: "Intermediate",
          availability: "Immediate",
          skills: ["React", "TypeScript"],
          createdAt: mockDate.toISOString(),
          updatedAt: mockDate.toISOString(),
          creatorId: "creator1",
        },
      },
      {
        id: "2",
        jobId: "job2",
        applicantId: "user1",
        coverLetter: null,
        status: "REJECTED",
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
        job: {
          id: "job2",
          title: "Test Job 2",
          description: "Test Description",
          budget: 2000,
          budgetType: "Fixed",
          type: "Full-time",
          status: "OPEN",
          category: "Development",
          experienceLevel: "Intermediate",
          availability: "Immediate",
          skills: ["React", "TypeScript"],
          createdAt: mockDate.toISOString(),
          updatedAt: mockDate.toISOString(),
          creatorId: "creator1",
        },
      },
    ];

    render(<ApplicationList applications={mockApplications} />);

    const acceptedBadge = screen.getByText("ACCEPTED").closest("div");
    const rejectedBadge = screen.getByText("REJECTED").closest("div");

    expect(acceptedBadge).toHaveClass("bg-secondary");
    expect(rejectedBadge).toHaveClass("bg-destructive");
  });

  it("handles SSE status updates", async () => {
    const mockApplications = [
      {
        id: "1",
        jobId: "job1",
        applicantId: "user1",
        coverLetter: null,
        status: "PENDING",
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
        job: {
          id: "job1",
          title: "Test Job",
          description: "Test Description",
          budget: 1000,
          budgetType: "Fixed",
          type: "Full-time",
          status: "OPEN",
          category: "Development",
          experienceLevel: "Intermediate",
          availability: "Immediate",
          skills: ["React", "TypeScript"],
          createdAt: mockDate.toISOString(),
          updatedAt: mockDate.toISOString(),
          creatorId: "creator1",
        },
      },
    ];

    render(<ApplicationList applications={mockApplications} />);

    // Verify EventSource was initialized
    expect(EventSource).toHaveBeenCalledWith(
      "/api/applications/status-updates"
    );

    // Get the EventSource instance
    const eventSourceInstance = (EventSource as jest.Mock).mock.results[0]
      .value;

    // Simulate receiving an SSE message
    eventSourceInstance.onmessage({
      data: JSON.stringify({
        type: "status-update",
        applicationId: "1",
        jobTitle: "Test Job",
        status: "ACCEPTED",
        updatedAt: mockDate.toISOString(),
      }),
    });

    // Wait for the status to be updated in the DOM
    await waitFor(() => {
      expect(screen.getByText("ACCEPTED")).toBeInTheDocument();
    });

    // Verify the badge has the correct variant
    const acceptedBadge = screen.getByText("ACCEPTED").closest("div");
    expect(acceptedBadge).toHaveClass("bg-secondary");
  });
});
