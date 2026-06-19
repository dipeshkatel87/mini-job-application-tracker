import { describe, expect, it } from "vitest";
import { applicationCreateSchema } from "../src/validation.js";

describe("application validation", () => {
  it("accepts a valid application payload", () => {
    const result = applicationCreateSchema.safeParse({
      companyName: "InternSathi",
      jobTitle: "Full Stack Intern",
      jobType: "Internship",
      status: "Applied",
      appliedDate: "2026-06-19",
      notes: "Submitted assignment"
    });

    expect(result.success).toBe(true);
  });

  it("rejects short company names", () => {
    const result = applicationCreateSchema.safeParse({
      companyName: "A",
      jobTitle: "Full Stack Intern",
      jobType: "Internship",
      status: "Applied",
      appliedDate: "2026-06-19"
    });

    expect(result.success).toBe(false);
  });
});
