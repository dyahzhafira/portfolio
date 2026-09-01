const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type ApiTag = {
  ID: number;
  Name: string;
  IconSlug: string;
};

export type ApiExperience = {
  ID: number;
  Role: string;
  Org: string;
  PeriodStart: string;
  PeriodEnd: string | null;
  Description: string;
  SortOrder: number;
  Tags: ApiTag[];
};

export type ApiSkill = {
  ID: number;
  Name: string;
  Category: string;
  IconSlug: string;
  SortOrder: number;
};

export type ApiProject = {
  ID: number;
  Slug: string;
  Title: string;
  Description: string;
  Learnings: string;
  Status: string;
  DemoURL: string;
  RepoURL: string;
  Role: string;
  SortOrder: number;
  Tags: ApiTag[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

export function getExperience() {
  return fetchJson<ApiExperience[]>("/experience");
}

export function getSkills() {
  return fetchJson<ApiSkill[]>("/skills");
}

export function getProjects(tag?: string) {
  return fetchJson<ApiProject[]>(tag ? `/projects?tag=${encodeURIComponent(tag)}` : "/projects");
}

export function getProject(slug: string) {
  return fetchJson<ApiProject>(`/projects/${slug}`);
}

export function getTags() {
  return fetchJson<ApiTag[]>("/tags");
}

export type ApiFeedback = {
  ID: number;
  Message: string;
  CreatedAt: string;
};

export type ApiMedia = {
  ID: number;
  ProjectID: number | null;
  ExperienceID: number | null;
  URL: string;
  AltText: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error?.message ?? "Login failed", res.status);
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
  }
}

export async function adminPing(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/admin/ping`, {
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function adminMutate<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(errBody?.error?.message ?? `Request failed with status ${res.status}`, res.status);
  }

  const resBody = await res.json();
  return resBody.data as T;
}

export type CreateProjectPayload = {
  slug: string;
  title: string;
  description?: string;
  learnings?: string;
  status?: string;
  demo_url?: string;
  repo_url?: string;
  sort_order?: number;
};

export function createProject(payload: CreateProjectPayload) {
  return adminMutate<ApiProject>("/admin/projects", "POST", payload);
}

export function deleteProject(id: number) {
  return adminMutate<void>(`/admin/projects/${id}`, "DELETE");
}

export function updateProject({ id, payload }: { id: number; payload: Partial<CreateProjectPayload> }) {
  return adminMutate<ApiProject>(`/admin/projects/${id}`, "PATCH", payload);
}

export type CreateExperiencePayload = {
  role: string;
  org: string;
  period_start: string;
  period_end?: string;
  description?: string;
  sort_order?: number;
};

export function createExperience(payload: CreateExperiencePayload) {
  return adminMutate<ApiExperience>("/admin/experience", "POST", payload);
}

export function deleteExperience(id: number) {
  return adminMutate<void>(`/admin/experience/${id}`, "DELETE");
}

export function updateExperience({ id, payload }: { id: number; payload: Partial<CreateExperiencePayload> }) {
  return adminMutate<ApiExperience>(`/admin/experience/${id}`, "PATCH", payload);
}

export function attachTagToExperience({ experienceId, tagId }: { experienceId: number; tagId: number }) {
  return adminMutate<void>(`/admin/experience/${experienceId}/tags/${tagId}`, "POST");
}

export function detachTagFromExperience({ experienceId, tagId }: { experienceId: number; tagId: number }) {
  return adminMutate<void>(`/admin/experience/${experienceId}/tags/${tagId}`, "DELETE");
}

export type CreateSkillPayload = {
  name: string;
  category: string;
  icon_slug: string;
  sort_order?: number;
};

export function createSkill(payload: CreateSkillPayload) {
  return adminMutate<ApiSkill>("/admin/skills", "POST", payload);
}

export function deleteSkill(id: number) {
  return adminMutate<void>(`/admin/skills/${id}`, "DELETE");
}

export function updateSkill({ id, payload }: { id: number; payload: Partial<CreateSkillPayload> }) {
  return adminMutate<ApiSkill>(`/admin/skills/${id}`, "PATCH", payload);
}

export type CreateTagPayload = {
  name: string;
  icon_slug: string;
};

export function createTag(payload: CreateTagPayload) {
  return adminMutate<ApiTag>("/admin/tags", "POST", payload);
}

export function deleteTag(id: number) {
  return adminMutate<void>(`/admin/tags/${id}`, "DELETE");
}

export function updateTag({ id, payload }: { id: number; payload: Partial<CreateTagPayload> }) {
  return adminMutate<ApiTag>(`/admin/tags/${id}`, "PATCH", payload);
}

async function adminFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(errBody?.error?.message ?? `Request failed with status ${res.status}`, res.status);
  }
  const body = await res.json();
  return body.data as T;
}

export function getFeedback() {
  return adminFetch<ApiFeedback[]>("/admin/feedback");
}

export function deleteFeedback(id: number) {
  return adminMutate<void>(`/admin/feedback/${id}`, "DELETE");
}

export function getMedia(owner: { projectId?: number; experienceId?: number }) {
  const query = owner.projectId ? `project_id=${owner.projectId}` : `experience_id=${owner.experienceId}`;
  return fetchJson<ApiMedia[]>(`/media?${query}`);
}

export async function uploadMedia(
  owner: { projectId?: number; experienceId?: number },
  file: File,
  altText: string
): Promise<ApiMedia> {
  const formData = new FormData();
  if (owner.projectId) formData.append("project_id", String(owner.projectId));
  if (owner.experienceId) formData.append("experience_id", String(owner.experienceId));
  formData.append("alt_text", altText);
  formData.append("file", file);

  const res = await fetch(`${API_URL}/admin/media/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(errBody?.error?.message ?? "Upload failed", res.status);
  }

  const body = await res.json();
  return body.data as ApiMedia;
}

export function deleteMedia(id: number) {
  return adminMutate<void>(`/admin/media/${id}`, "DELETE");
}
