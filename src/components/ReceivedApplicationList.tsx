"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { JobApplication, Job, User, Profile } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExtendedJobApplication extends JobApplication {
  job: Job;
  applicant: User & {
    profile: Profile | null;
  };
}

interface ReceivedApplicationListProps {
  initialApplications: ExtendedJobApplication[];
}

export default function ReceivedApplicationList({
  initialApplications,
}: ReceivedApplicationListProps) {
  const { toast } = useToast();
  const [applications, setApplications] =
    useState<ExtendedJobApplication[]>(initialApplications);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch(
          `/api/applications?jobId=${initialApplications[0].job.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch applications",
          variant: "destructive",
        });
      }
    }
    fetchApplications();
  }, [initialApplications, toast]);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: JobApplication["status"]
  ) => {
    setUpdatingId(applicationId);

    // Optimistically update the UI
    setApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast({
        title: "Success",
        description: `Application status updated to ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      // Revert the optimistic update on error
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId ? { ...app, status: app.status } : app
        )
      );

      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No applications received yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{application.applicant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {application.applicant.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>${application.proposedRate}/hr</TableCell>
              <TableCell>
                {application.applicant.profile?.title || "Not specified"}
              </TableCell>
              <TableCell>{application.status}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(application.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <select
                  aria-label="Update application status"
                  value={application.status}
                  onChange={(e) =>
                    handleStatusChange(
                      application.id,
                      e.target.value as JobApplication["status"]
                    )
                  }
                  className="border rounded p-1"
                  disabled={updatingId === application.id}
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accept</option>
                  <option value="REJECTED">Reject</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
