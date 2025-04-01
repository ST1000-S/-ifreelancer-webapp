import type {
  JobType,
  JobStatus,
  ApplicationStatus,
  JobCategory,
} from "@prisma/client";

export interface User {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  type: JobType;
  status: JobStatus;
  category: JobCategory;
  experienceLevel: string;
  availability: string;
  location?: string;
  duration?: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type JobFormData = Omit<
  Job,
  "id" | "creatorId" | "createdAt" | "updatedAt" | "applications"
>;

export type JobApplicationFormData = Omit<
  JobApplication,
  "id" | "jobId" | "applicantId" | "createdAt" | "updatedAt" | "job"
>;

export interface JobWithCreator extends Job {
  creator: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  _count: {
    applications: number;
  };
}
