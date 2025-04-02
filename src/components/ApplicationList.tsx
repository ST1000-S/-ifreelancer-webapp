"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define our own interfaces for serialized data
interface SerializedJob {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  type: string;
  status: string;
  category: string;
  experienceLevel: string;
  availability: string;
  location?: string;
  duration?: string;
  skills: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  creatorId: string;
}

interface SerializedApplication {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string | null;
  status: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  job: SerializedJob;
}

interface ApplicationListProps {
  applications: SerializedApplication[];
}

export function ApplicationList({
  applications: initialApplications,
}: ApplicationListProps) {
  const [applications, setApplications] =
    useState<SerializedApplication[]>(initialApplications);

  useEffect(() => {
    let eventSource: EventSource;

    const connectToSSE = () => {
      eventSource = new EventSource("/api/applications/status-updates");

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "status-update") {
          setApplications((prevApps) =>
            prevApps.map((app) => {
              if (app.id === data.applicationId) {
                toast.success(
                  `Application status for "${data.jobTitle}" updated to ${data.status}`
                );
                return {
                  ...app,
                  status: data.status,
                  updatedAt: data.updatedAt,
                };
              }
              return app;
            })
          );
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        // Attempt to reconnect after 5 seconds
        setTimeout(connectToSSE, 5000);
      };
    };

    connectToSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          You haven&apos;t applied to any jobs yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>{application.job.title}</TableCell>
              <TableCell>${application.job.budget}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(application.status)}>
                  {application.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(application.createdAt), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getStatusVariant(
  status: string
): "default" | "destructive" | "secondary" {
  switch (status) {
    case "ACCEPTED":
      return "secondary";
    case "REJECTED":
      return "destructive";
    default:
      return "default";
  }
}
