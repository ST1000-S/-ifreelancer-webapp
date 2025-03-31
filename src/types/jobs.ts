export type JobType = "REMOTE" | "ONSITE" | "HYBRID";

export type JobStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Job {
  id: string;
  title: string;
  description: string;
  type: JobType;
  budget: number;
  skills: string[];
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  applications?: JobApplication[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  proposedRate: number;
  availability: string;
  startDate: Date;
  status: ApplicationStatus;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  job?: Job;
}

export type JobFormData = Omit<
  Job,
  "id" | "creatorId" | "createdAt" | "updatedAt" | "applications"
>;

export type JobApplicationFormData = Omit<
  JobApplication,
  "id" | "jobId" | "applicantId" | "createdAt" | "updatedAt" | "job"
>;
