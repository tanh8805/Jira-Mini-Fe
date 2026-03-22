import axiosClient from "../../api/axiosClient";
import { extractArrayPayload, unwrapApiData } from "../../api/response";

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}

const toProject = (input: unknown): Project | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    createdAt?: unknown;
  };

  if (typeof raw.id !== "string" || typeof raw.name !== "string") {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString(),
  };
};

const toProjectList = (payload: unknown): Project[] => {
  const candidate = extractArrayPayload(payload, ["items", "projects", "data"]);

  return candidate
    .map((project) => toProject(project))
    .filter((project): project is Project => Boolean(project));
};

export const getProjectsApi = async (): Promise<Project[]> => {
  const response = await axiosClient.get<unknown>("/api/projects");
  return toProjectList(response.data);
};

export const createProjectApi = async (
  payload: CreateProjectPayload,
): Promise<Project> => {
  const response = await axiosClient.post<unknown>("/api/projects", payload);
  const normalized = toProject(unwrapApiData(response.data));

  if (!normalized) {
    throw new Error("Invalid project response format");
  }

  return normalized;
};

export const getProjectByIdApi = async (
  projectId: string,
): Promise<Project | null> => {
  try {
    const response = await axiosClient.get<unknown>(`/api/projects/${projectId}`);
    const normalized = toProject(unwrapApiData(response.data));

    if (normalized) {
      return normalized;
    }
  } catch {
    const list = await getProjectsApi();
    return list.find((project) => project.id === projectId) ?? null;
  }

  const list = await getProjectsApi();
  return list.find((project) => project.id === projectId) ?? null;
};

export const deleteProjectApi = async (projectId: string): Promise<void> => {
  await axiosClient.delete(`/api/projects/${projectId}`);
};

export const updateProjectApi = async (
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> => {
  const response = await axiosClient.put<unknown>(
    `/api/projects/${projectId}`,
    payload,
  );
  const normalized = toProject(unwrapApiData(response.data));

  if (!normalized) {
    throw new Error("Invalid project response format");
  }

  return normalized;
};
