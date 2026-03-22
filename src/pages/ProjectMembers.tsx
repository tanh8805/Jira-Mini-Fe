import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getUserDisplayLabel } from "../features/auth/auth.api";
import {
  deleteProjectApi,
  getProjectByIdApi,
} from "../features/projects/project.api";
import { findCurrentProjectMember } from "../features/projects/projectRole.util";
import {
  addProjectMemberApi,
  getProjectMembersApi,
  removeProjectMemberApi,
  type ProjectMember,
  type ProjectRole,
} from "../features/projects/projectMembers.api";

type AddMemberFormValues = {
  email: string;
  role: ProjectRole;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleBadgeClassMap: Record<ProjectRole, string> = {
  OWNER: "bg-red-100 text-red-700",
  MANAGER: "bg-amber-100 text-amber-700",
  MEMBER: "bg-blue-100 text-blue-700",
};

const memberRoleBadgeClassMap: Record<ProjectRole, string> = {
  OWNER: "border border-amber-300 bg-amber-50 text-amber-700",
  MANAGER: "border border-orange-300 bg-orange-50 text-orange-700",
  MEMBER: "border border-blue-300 bg-blue-50 text-blue-700",
};

const getInitials = (fullName: string): string => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

function ProjectMembers() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const effectiveProjectId = projectId ?? "";

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");
  const [deletingMemberId, setDeletingMemberId] = useState<string>("");
  const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberFormValues>({
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const fetchMembers = async () => {
    if (!effectiveProjectId) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await getProjectMembersApi(effectiveProjectId);
      setMembers(data);
    } catch {
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!effectiveProjectId) {
      return;
    }

    const fetchProject = async () => {
      try {
        const project = await getProjectByIdApi(effectiveProjectId);
        setProjectName(project?.name ?? effectiveProjectId);
      } catch {
        setProjectName(effectiveProjectId);
      }
    };

    void fetchProject();
  }, [effectiveProjectId]);

  useEffect(() => {
    void fetchMembers();
  }, [effectiveProjectId]);

  const onOpenAdd = (event?: MouseEvent<HTMLButtonElement>) => {
    if (event) {
      setModalOrigin({ x: event.clientX, y: event.clientY });
    }

    setServerError("");
    reset({ email: "", role: "MEMBER" });
    setIsAddOpen(true);
  };

  const onCloseAdd = () => {
    setServerError("");
    setIsAddOpen(false);
  };

  const onSubmitAdd = async (values: AddMemberFormValues) => {
    setServerError("");

    try {
      await addProjectMemberApi(effectiveProjectId, {
        email: values.email.trim(),
        role: values.role,
      });

      onCloseAdd();
      await fetchMembers();
      toast.success("Đã thêm thành viên vào project");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setError("email", {
            type: "server",
            message: "Người dùng đã có trong project",
          });
          return;
        }

        if (error.response?.status === 403) {
          setServerError("Bạn không có quyền thực hiện hành động này");
          return;
        }
      }

      setServerError("Không thể thêm thành viên. Vui lòng thử lại.");
    }
  };

  const hasMembers = useMemo(() => members.length > 0, [members]);
  const currentUserLabel = useMemo(() => getUserDisplayLabel().trim(), []);

  const currentMember = useMemo(() => {
    return findCurrentProjectMember(members, currentUserLabel);
  }, [currentUserLabel, members]);

  const currentUserRole: ProjectRole | null = currentMember?.role ?? null;

  const canAddMember =
    currentUserRole === "OWNER" || currentUserRole === "MANAGER";
  const canDeleteProject = currentUserRole === "OWNER";

  const canRemoveMember = (targetMember: ProjectMember): boolean => {
    if (!currentMember || !currentUserRole) {
      return false;
    }

    const isSelf = targetMember.id === currentMember.id;

    if (currentUserRole === "OWNER") {
      return targetMember.role !== "OWNER" && !isSelf;
    }

    if (currentUserRole === "MANAGER") {
      return targetMember.role === "MEMBER" && !isSelf;
    }

    return currentUserRole === "MEMBER" && isSelf;
  };

  const onRemoveMember = async (targetMember: ProjectMember) => {
    const actionLabel =
      currentMember && targetMember.id === currentMember.id
        ? "rời project"
        : "xóa thành viên";

    const confirmed = window.confirm(
      `Bạn có chắc muốn ${actionLabel} này không?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingMemberId(targetMember.id);

    try {
      await removeProjectMemberApi(effectiveProjectId, targetMember.id);
      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== targetMember.id),
      );
      toast.success(
        actionLabel === "rời project"
          ? "Bạn đã rời project"
          : "Đã xóa thành viên khỏi project",
      );

      if (currentMember && targetMember.id === currentMember.id) {
        navigate("/projects", { replace: true });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          toast.error(
            "OWNER không thể tự rời project. Hãy transfer ownership trước.",
          );
          return;
        }

        if (error.response?.status === 403) {
          toast.error("Bạn không có quyền thực hiện hành động này");
          return;
        }

        if (error.response?.status === 404) {
          toast.error("Không tìm thấy thành viên trong project");
          return;
        }
      }

      toast.error("Không thể xóa thành viên. Vui lòng thử lại.");
    } finally {
      setDeletingMemberId("");
    }
  };

  const onDeleteProject = async () => {
    const confirmed = window.confirm(
      "Xóa project sẽ xóa toàn bộ tasks và members. Bạn có chắc chắn?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingProject(true);

    try {
      await deleteProjectApi(effectiveProjectId);
      toast.success("Đã xóa project thành công");
      navigate("/projects", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          toast.error("Chỉ OWNER mới có quyền xóa project");
          return;
        }

        if (error.response?.status === 404) {
          toast.error("Không tìm thấy project");
          return;
        }
      }

      toast.error("Không thể xóa project. Vui lòng thử lại.");
    } finally {
      setIsDeletingProject(false);
    }
  };

  if (!effectiveProjectId) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          Không tìm thấy projectId hợp lệ.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {projectName || "Project"} {">"} Thành viên
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quyền của bạn trong project:{" "}
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                currentUserRole
                  ? roleBadgeClassMap[currentUserRole]
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {currentUserRole ?? "N/A"}
            </span>
          </p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <Link
              to={`/projects/${effectiveProjectId}/tasks`}
              className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              Bảng công việc
            </Link>
            <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">
              Thành viên
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canDeleteProject ? (
            <button
              type="button"
              onClick={() => void onDeleteProject()}
              disabled={isDeletingProject}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeletingProject ? "Đang xóa..." : "Xóa project"}
            </button>
          ) : null}

          {canAddMember ? (
            <button
              type="button"
              onClick={(event) => onOpenAdd(event)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Thêm thành viên
            </button>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-225 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                STT
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tên thành viên
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Vai trò
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {!isLoading && !hasMembers ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  Chưa có thành viên nào
                </td>
              </tr>
            ) : null}

            {isLoading
              ? [1, 2, 3].map((item) => (
                  <tr key={item}>
                    <td className="px-4 py-3">
                      <div className="skeleton-shimmer h-3 w-5 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="skeleton-shimmer h-8 w-8 rounded-full" />
                        <div className="skeleton-shimmer h-3 w-28 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="skeleton-shimmer h-3 w-40 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="skeleton-shimmer h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto mr-0 h-7 w-14 rounded-md" />
                    </td>
                  </tr>
                ))
              : null}

            <AnimatePresence initial={false}>
              {!isLoading
                ? members.map((member, index) => (
                    <motion.tr
                      layout
                      key={member.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{
                        layout: { type: "spring", stiffness: 320, damping: 30 },
                        opacity: { duration: 0.2, ease: "easeOut" },
                        y: { duration: 0.2, ease: "easeOut" },
                      }}
                      className="group transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                            {getInitials(member.fullName) || "?"}
                          </span>
                          <span>{member.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${memberRoleBadgeClassMap[member.role]}`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {canRemoveMember(member) ? (
                          <motion.button
                            type="button"
                            onClick={() => void onRemoveMember(member)}
                            disabled={deletingMemberId === member.id}
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 opacity-0 transition duration-200 group-hover:opacity-100 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingMemberId === member.id
                              ? "Đang xử lý..."
                              : currentMember && currentMember.id === member.id
                                ? "Rời project"
                                : "Xóa"}
                          </motion.button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                : null}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {isAddOpen ? (
        <div className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div
            className="modal-surface-enter w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            style={{
              transformOrigin: `${modalOrigin.x}px ${modalOrigin.y}px`,
            }}
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Thêm thành viên
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmitAdd)}>
              <div>
                <label
                  htmlFor="memberEmail"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="memberEmail"
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    maxLength: {
                      value: 100,
                      message: "Email không được vượt quá 100 ký tự",
                    },
                    pattern: {
                      value: emailPattern,
                      message: "Email không đúng định dạng",
                    },
                  })}
                />
                {errors.email ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="memberRole"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Vai trò
                </label>
                <select
                  id="memberRole"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("role")}
                >
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="MEMBER">MEMBER</option>
                </select>
              </div>

              {serverError ? (
                <p className="text-sm font-medium text-red-600">
                  {serverError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseAdd}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProjectMembers;
