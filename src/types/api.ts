import {
  Profile,
  Portfolio,
  WorkExperience,
  Education,
  Certification,
} from "./profile";
import { Job, JobApplication } from "./jobs";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ProfileResponse extends ApiResponse<Profile> {}
export interface PortfolioResponse extends ApiResponse<Portfolio> {}
export interface WorkExperienceResponse extends ApiResponse<WorkExperience> {}
export interface EducationResponse extends ApiResponse<Education> {}
export interface CertificationResponse extends ApiResponse<Certification> {}

export interface JobResponse extends ApiResponse<Job> {}
export interface JobApplicationResponse extends ApiResponse<JobApplication> {}

export interface ProfilesResponse
  extends ApiResponse<PaginatedResponse<Profile>> {}
export interface PortfoliosResponse
  extends ApiResponse<PaginatedResponse<Portfolio>> {}
export interface WorkExperiencesResponse
  extends ApiResponse<PaginatedResponse<WorkExperience>> {}
export interface EducationsResponse
  extends ApiResponse<PaginatedResponse<Education>> {}
export interface CertificationsResponse
  extends ApiResponse<PaginatedResponse<Certification>> {}

export interface JobsResponse extends ApiResponse<PaginatedResponse<Job>> {}
export interface JobApplicationsResponse
  extends ApiResponse<PaginatedResponse<JobApplication>> {}
