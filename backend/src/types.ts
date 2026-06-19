export type ApplicationFormData = {
  companyName: string;
  jobTitle: string;
  jobType: "Internship" | "Full_time" | "Part_time";
  status: "Applied" | "Interviewing" | "Offer" | "Rejected";
  appliedDate: string;
  notes?: string | null;
};
