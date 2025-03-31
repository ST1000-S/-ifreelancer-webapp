export interface Profile {
  id: string;
  userId: string;
  bio?: string | null;
  skills: string[];
  hourlyRate?: number | null;
  location?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  title?: string | null;
  availability: boolean;
  languages: string[];
  phoneNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
  portfolio?: Portfolio[];
  experience?: WorkExperience[];
  education?: Education[];
  certifications?: Certification[];
}

export interface Portfolio {
  id: string;
  profileId: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  projectUrl?: string | null;
  skills: string[];
  startDate: Date;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkExperience {
  id: string;
  profileId: string;
  title: string;
  company: string;
  location?: string | null;
  type: string;
  description: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  profileId: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  grade?: string | null;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate?: Date | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileFormData = Omit<
  Profile,
  | "id"
  | "userId"
  | "createdAt"
  | "updatedAt"
  | "portfolio"
  | "experience"
  | "education"
  | "certifications"
>;

export type PortfolioFormData = Omit<
  Portfolio,
  "id" | "profileId" | "createdAt" | "updatedAt"
>;

export type WorkExperienceFormData = Omit<
  WorkExperience,
  "id" | "profileId" | "createdAt" | "updatedAt"
>;

export type EducationFormData = Omit<
  Education,
  "id" | "profileId" | "createdAt" | "updatedAt"
>;

export type CertificationFormData = Omit<
  Certification,
  "id" | "profileId" | "createdAt" | "updatedAt"
>;
