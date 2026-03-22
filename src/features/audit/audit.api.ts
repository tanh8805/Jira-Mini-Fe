import axiosClient from "../../api/axiosClient";
import { extractArrayPayload } from "../../api/response";

export type AuditAction = "CREATED" | "UPDATED" | "DELETED";

export interface AuditLog {
  id: string;
  action: AuditAction;
  actor: { id: string; fullName: string } | null;
  createdAt: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditLogFilters {
  page?: number;
  size?: number;
}

export const getTaskAuditLogsApi = async (
  taskId: string,
  filters?: AuditLogFilters,
): Promise<AuditLog[]> => {
  const params = new URLSearchParams({
    entityType: "TASK",
    entityId: taskId,
  });

  if (typeof filters?.page === "number") {
    params.set("page", String(filters.page));
  }

  if (typeof filters?.size === "number") {
    params.set("size", String(filters.size));
  }

  const response = await axiosClient.get<unknown>(`/api/audit-logs?${params.toString()}`);

  return extractArrayPayload(response.data, ["content", "items", "logs", "data"]) as AuditLog[];
};
