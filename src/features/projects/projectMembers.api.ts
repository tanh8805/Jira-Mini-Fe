import axiosClient from "../../api/axiosClient";
import { extractArrayPayload, unwrapApiData } from "../../api/response";

export type ProjectRole = "OWNER" | "MANAGER" | "MEMBER";

export interface ProjectMember {
  id: string;
  fullName: string;
  email: string;
  role: ProjectRole;
}

export interface AddProjectMemberPayload {
  email: string;
  role: ProjectRole;
}

const isProjectRole = (value: unknown): value is ProjectRole => {
  return value === "OWNER" || value === "MANAGER" || value === "MEMBER";
};

const toProjectMember = (input: unknown): ProjectMember | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as {
    id?: unknown;
    userId?: unknown;
    role?: unknown;
    fullName?: unknown;
    email?: unknown;
    user?: {
      id?: unknown;
      fullName?: unknown;
      email?: unknown;
    };
  };

  const id =
    typeof raw.user?.id === "string"
      ? raw.user.id
      : typeof raw.userId === "string"
        ? raw.userId
        : raw.id;
  const fullName =
    typeof raw.user?.fullName === "string" ? raw.user.fullName : raw.fullName;
  const email = typeof raw.user?.email === "string" ? raw.user.email : raw.email;

  if (typeof id !== "string" || typeof fullName !== "string" || typeof email !== "string") {
    return null;
  }

  return {
    id,
    fullName,
    email,
    role: isProjectRole(raw.role) ? raw.role : "MEMBER",
  };
};

const toProjectMemberList = (payload: unknown): ProjectMember[] => {
  const items = extractArrayPayload(payload, ["members", "items", "data"]);

  return items
    .map((item) => toProjectMember(item))
    .filter((member): member is ProjectMember => Boolean(member));
};

export const getProjectMembersApi = async (
  projectId: string,
): Promise<ProjectMember[]> => {
  const response = await axiosClient.get<unknown>(`/api/projects/${projectId}/members`);
  return toProjectMemberList(response.data);
};

export const addProjectMemberApi = async (
  projectId: string,
  payload: AddProjectMemberPayload,
): Promise<ProjectMember | null> => {
  const response = await axiosClient.post<unknown>(
    `/api/projects/${projectId}/members`,
    payload,
  );

  return toProjectMember(unwrapApiData(response.data));
};

export const removeProjectMemberApi = async (
  projectId: string,
  userId: string,
): Promise<void> => {
  await axiosClient.delete(`/api/projects/${projectId}/members/${userId}`);
};
