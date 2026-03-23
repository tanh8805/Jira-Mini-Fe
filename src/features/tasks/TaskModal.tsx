import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import AuditLogTimeline from "../audit/AuditLogTimeline";
import { getTaskAuditLogsApi, type AuditLog } from "../audit/audit.api";
import type { ProjectMember, Task, TaskPriority, TaskStatus } from "./task.api";

type TaskModalFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: string;
  status: TaskStatus;
};

type TaskModalSubmitPayload = {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  status?: TaskStatus;
};

type TaskModalProps = {
  isOpen: boolean;
  task?: Task | null;
  modalOrigin?: { x: number; y: number };
  members: ProjectMember[];
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onCreate: (payload: TaskModalSubmitPayload) => Promise<void>;
  onUpdate: (taskId: string, payload: TaskModalSubmitPayload) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
};

function TaskModal({
  isOpen,
  task,
  modalOrigin,
  members,
  isSubmitting,
  errorMessage,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: TaskModalProps) {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  const isEditMode = useMemo(() => Boolean(task), [task]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskModalFormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      assigneeId: "",
      status: "TODO",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setConfirmDelete(false);

    if (!task) {
      reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        assigneeId: "",
        status: "TODO",
      });
      return;
    }

    reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      assigneeId: task.assigneeId ?? "",
      status: task.status,
    });
  }, [isOpen, reset, task]);

  useEffect(() => {
    if (!isOpen || !task) {
      setAuditLogs([]);
      setIsAuditLoading(false);
      return;
    }

    const fetchAuditLogs = async () => {
      setIsAuditLoading(true);
      try {
        const logs = await getTaskAuditLogsApi(task.id, { page: 0, size: 8 });
        const latestLogs = [...logs]
          .sort(
            (first, second) =>
              new Date(second.createdAt).getTime() -
              new Date(first.createdAt).getTime(),
          )
          .slice(0, 8);
        setAuditLogs(latestLogs);
      } catch {
        setAuditLogs([]);
      } finally {
        setIsAuditLoading(false);
      }
    };

    void fetchAuditLogs();
  }, [isOpen, task]);

  if (!isOpen) {
    return null;
  }

  const onSubmit = async (values: TaskModalFormValues) => {
    const payload: TaskModalSubmitPayload = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      priority: values.priority,
      assigneeId: values.assigneeId || undefined,
      status: isEditMode ? values.status : undefined,
    };

    if (task) {
      await onUpdate(task.id, payload);
      return;
    }

    await onCreate(payload);
  };

  return (
    <div className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div
        className="modal-surface-enter max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        style={{
          transformOrigin: modalOrigin
            ? `${modalOrigin.x}px ${modalOrigin.y}px`
            : "50% 50%",
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Task details" : "Create task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-lg leading-none text-gray-600 transition hover:bg-gray-50"
          >
            ×
          </button>
        </div>

        <div
          className={isEditMode ? "grid grid-cols-1 gap-6 lg:grid-cols-5" : ""}
        >
          <div className={isEditMode ? "lg:col-span-3" : ""}>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="taskTitle"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("title", {
                    required: "Title is required",
                    maxLength: {
                      value: 100,
                      message: "Title must not exceed 100 characters",
                    },
                    validate: (value) =>
                      value.trim().length > 0 || "Title cannot be blank",
                  })}
                />
                {errors.title ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="taskDescription"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="taskDescription"
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("description", {
                    maxLength: {
                      value: 2000,
                      message: "Description must not exceed 2000 characters",
                    },
                  })}
                />
                {errors.description ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="taskPriority"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>
                  <select
                    id="taskPriority"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    {...register("priority")}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="taskAssignee"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Assignee
                  </label>
                  <select
                    id="taskAssignee"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    {...register("assigneeId")}
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.fullName} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditMode ? (
                <div>
                  <label
                    htmlFor="taskStatus"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="taskStatus"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    {...register("status")}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              ) : null}

              {errorMessage ? (
                <p className="text-sm font-medium text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete task
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : isEditMode
                        ? "Save changes"
                        : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {isEditMode ? (
            <div className="min-w-0 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-4 lg:col-span-2 lg:max-h-[70vh]">
              <AuditLogTimeline
                logs={auditLogs}
                members={members}
                isLoading={isAuditLoading}
                className="h-full"
              />
            </div>
          ) : null}
        </div>
      </div>

      {confirmDelete && task ? (
        <div className="modal-backdrop-enter fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="modal-surface-enter w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Delete task
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onDelete(task.id)}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TaskModal;
