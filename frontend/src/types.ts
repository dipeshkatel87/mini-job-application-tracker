export type JobType = "Internship" | "Full_time" | "Part_time";
export type ApplicationStatus = "Applied" | "Interviewing" | "Offer" | "Rejected";

export type JobApplication = {
  id: number;
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationFormData = {
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  notes: string;
};
