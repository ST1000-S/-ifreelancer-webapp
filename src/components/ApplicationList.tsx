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

export function ApplicationList({ applications }: ApplicationListProps) {
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
