import axiosClient from "../../api/axiosClient";
import { extractArrayPayload, unwrapApiData } from "../../api/response";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt?: string;
  dueDate?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
}

export interface ProjectMember {
  id: string;
  fullName: string;
  email: string;
}

const isTaskStatus = (value: unknown): value is TaskStatus => {
  return value === "TODO" || value === "IN_PROGRESS" || value === "DONE";
};

const isTaskPriority = (value: unknown): value is TaskPriority => {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
};

const toTask = (input: unknown): Task | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as {
    id?: unknown;
    title?: unknown;
    description?: unknown;
    status?: unknown;
    priority?: unknown;
    projectId?: unknown;
    assigneeId?: unknown;
    assigneeName?: unknown;
    createdAt?: unknown;
    dueDate?: unknown;
    assignee?: { id?: unknown; fullName?: unknown; email?: unknown };
  };

  if (
    typeof raw.id !== "string" ||
    typeof raw.title !== "string" ||
    typeof raw.projectId !== "string"
  ) {
    return null;
  }

  return {
    id: raw.id,
    title: raw.title,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    status: isTaskStatus(raw.status) ? raw.status : "TODO",
    priority: isTaskPriority(raw.priority) ? raw.priority : "MEDIUM",
    projectId: raw.projectId,
    assigneeId:
      typeof raw.assigneeId === "string"
        ? raw.assigneeId
        : typeof raw.assignee?.id === "string"
          ? raw.assignee.id
          : undefined,
    assigneeName:
      typeof raw.assigneeName === "string"
        ? raw.assigneeName
        : typeof raw.assignee?.fullName === "string"
          ? raw.assignee.fullName
          : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    dueDate: typeof raw.dueDate === "string" ? raw.dueDate : undefined,
  };
};

const toTaskList = (payload: unknown): Task[] => {
  const items = extractArrayPayload(payload, ["content", "items", "tasks", "data"]);

  return items
    .map((task) => toTask(task))
    .filter((task): task is Task => Boolean(task));
};

export const getTasksApi = async (
  projectId: string,
  filters?: TaskFilters,
): Promise<Task[]> => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.priority) {
    params.set("priority", filters.priority);
  }

  if (filters?.assigneeId) {
    params.set("assigneeId", filters.assigneeId);
  }

  if (typeof filters?.page === "number") {
    params.set("page", String(filters.page));
  }

  if (typeof filters?.size === "number") {
    params.set("size", String(filters.size));
  }

  if (filters?.sort) {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  const path = query
    ? `/api/projects/${projectId}/tasks?${query}`
    : `/api/projects/${projectId}/tasks`;

  const response = await axiosClient.get<unknown>(path);
  return toTaskList(response.data);
};

export const createTaskApi = async (
  projectId: string,
  payload: CreateTaskPayload,
): Promise<Task> => {
  const response = await axiosClient.post<unknown>(
    `/api/projects/${projectId}/tasks`,
    payload,
  );

  const normalizedTask = toTask(unwrapApiData(response.data));
  if (!normalizedTask) {
    throw new Error("Invalid task response format");
  }

  return normalizedTask;
};

export const updateTaskApi = async (
  projectId: string,
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<Task> => {
  const response = await axiosClient.put<unknown>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    payload,
  );

  const normalizedTask = toTask(unwrapApiData(response.data));
  if (!normalizedTask) {
    throw new Error("Invalid task response format");
  }

  return normalizedTask;
};

export const deleteTaskApi = async (
  projectId: string,
  taskId: string,
): Promise<void> => {
  await axiosClient.delete(`/api/projects/${projectId}/tasks/${taskId}`);
};

export const getProjectMembersApi = async (
  projectId: string,
): Promise<ProjectMember[]> => {
  const response = await axiosClient.get<unknown>(
    `/api/projects/${projectId}/members`,
  );

  const items = extractArrayPayload(response.data, ["members", "items", "data"]);

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const member = item as {
        id?: string;
        fullName?: string;
        email?: string;
        user?: { id?: string; fullName?: string; email?: string };
      };

      const id = member.user?.id ?? member.id;
      const fullName = member.user?.fullName ?? member.fullName;
      const email = member.user?.email ?? member.email;

      if (!id || !fullName || !email) {
        return null;
      }

      return {
        id,
        fullName,
        email,
      };
    })
    .filter((member): member is ProjectMember => Boolean(member));
};
