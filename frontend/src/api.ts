import type { ApplicationFormData, ApplicationStatus, JobApplication } from "./types";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getApplications(filters: { status?: ApplicationStatus | "All"; search?: string }) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "All") params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString();
  return request<JobApplication[]>(`/applications${query ? `?${query}` : ""}`);
}

export function createApplication(data: ApplicationFormData) {
  return request<JobApplication>("/applications", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateApplication(id: number, data: ApplicationFormData) {
  return request<JobApplication>(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export function deleteApplication(id: number) {
  return request<void>(`/applications/${id}`, { method: "DELETE" });
}
