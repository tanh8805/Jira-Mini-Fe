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
        const logs = await getTaskAuditLogsApi(task.id);
        setAuditLogs(logs);
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
        className="modal-surface-enter w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl"
        style={{
          transformOrigin: modalOrigin
            ? `${modalOrigin.x}px ${modalOrigin.y}px`
            : "50% 50%",
        }}
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {isEditMode ? "Chi tiết công việc" : "Tạo công việc"}
        </h2>

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
                  Tiêu đề
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("title", {
                    required: "Tiêu đề là bắt buộc",
                    maxLength: {
                      value: 100,
                      message: "Tiêu đề không được vượt quá 100 ký tự",
                    },
                    validate: (value) =>
                      value.trim().length > 0 || "Tiêu đề không được để trống",
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
                  Mô tả
                </label>
                <textarea
                  id="taskDescription"
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("description", {
                    maxLength: {
                      value: 2000,
                      message: "Mô tả không được vượt quá 2000 ký tự",
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
                    Độ ưu tiên
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
                    Người phụ trách
                  </label>
                  <select
                    id="taskAssignee"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    {...register("assigneeId")}
                  >
                    <option value="">Chưa phân công</option>
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
                    Trạng thái
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
                      Xóa công việc
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Đang xử lý..."
                      : isEditMode
                        ? "Lưu thay đổi"
                        : "Tạo"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {isEditMode ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 lg:col-span-2 lg:max-h-[70vh] lg:overflow-y-auto">
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
              Xóa công việc
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void onDelete(task.id)}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TaskModal;
