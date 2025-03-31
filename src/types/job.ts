import {
  JobType,
  JobStatus,
  ApplicationStatus,
  ExperienceLevel,
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
  type: JobType;
  budget: number;
  budgetType: "FIXED" | "HOURLY";
  skills: string[];
  status: JobStatus;
  category: JobCategory;
  experienceLevel: ExperienceLevel;
  duration:
    | "LESS_THAN_1_MONTH"
    | "ONE_TO_THREE_MONTHS"
    | "THREE_TO_SIX_MONTHS"
    | "MORE_THAN_6_MONTHS";
  availability: "FULL_TIME" | "PART_TIME" | "FLEXIBLE";
  location?: string;
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

export interface JobWithCreator extends Job {
  creator: Pick<User, "id" | "name" | "image">;
  _count: {
    applications: number;
  };
}
