import { z } from "zod";

export const jobTypes = ["Internship", "Full_time", "Part_time"] as const;
export const statuses = ["Applied", "Interviewing", "Offer", "Rejected"] as const;

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Applied date must be a valid date"
});

export const applicationCreateSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  jobType: z.enum(jobTypes),
  status: z.enum(statuses),
  appliedDate: dateString,
  notes: z.string().trim().optional().nullable()
});

export const applicationUpdateSchema = applicationCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required"
);

export const querySchema = z.object({
  status: z.enum(statuses).optional(),
  search: z.string().trim().optional()
});
