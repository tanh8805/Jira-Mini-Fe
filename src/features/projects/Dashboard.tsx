import axios from "axios";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createProjectApi,
  deleteProjectApi,
  getProjectsApi,
  updateProjectApi,
  type Project,
} from "./project.api";
import { getProjectMembersApi } from "./projectMembers.api";
import { getTasksApi } from "../tasks/task.api";

type CreateProjectFormValues = {
  name: string;
  description: string;
};

type ProjectMeta = {
  totalTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  doneThisWeek: number;
  memberInitials: string[];
};

const getInitials = (fullName: string): string => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const isWithinLastWeek = (dateValue?: string): boolean => {
  if (!dateValue) {
    return false;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const now = Date.now();
  return now - parsed.getTime() <= 7 * 24 * 60 * 60 * 1000;
};

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMeta, setProjectMeta] = useState<Record<string, ProjectMeta>>(
    {},
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMetaLoading, setIsMetaLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(
    null,
  );
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const hydrateProjectMeta = async (projectList: Project[]) => {
    setIsMetaLoading(true);

    try {
      const collected = await Promise.all(
        projectList.map(async (project) => {
          try {
            const [tasks, members] = await Promise.all([
              getTasksApi(project.id, { size: 200 }),
              getProjectMembersApi(project.id),
            ]);

            const totalTasks = tasks.length;
            const doneTasks = tasks.filter(
              (task) => task.status === "DONE",
            ).length;
            const inProgressTasks = tasks.filter(
              (task) => task.status === "IN_PROGRESS",
            ).length;
            const doneThisWeek = tasks.filter(
              (task) =>
                task.status === "DONE" && isWithinLastWeek(task.createdAt),
            ).length;

            return [
              project.id,
              {
                totalTasks,
                doneTasks,
                inProgressTasks,
                doneThisWeek,
                memberInitials: members
                  .slice(0, 4)
                  .map((member) => getInitials(member.fullName)),
              },
            ] as const;
          } catch {
            return [
              project.id,
              {
                totalTasks: 0,
                doneTasks: 0,
                inProgressTasks: 0,
                doneThisWeek: 0,
                memberInitials: [],
              },
            ] as const;
          }
        }),
      );

      setProjectMeta(Object.fromEntries(collected));
    } finally {
      setIsMetaLoading(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsApi();
      setProjects(data);
      await hydrateProjectMeta(data);
    } catch {
      toast.error("Unable to load project list", {
        id: "projects-load-error",
      });
      setProjectMeta({});
      setIsMetaLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  const onOpenCreate = (event?: MouseEvent<HTMLButtonElement>) => {
    if (event) {
      const { clientX, clientY } = event;
      setModalOrigin({ x: clientX, y: clientY });
    }

    setCreateError("");
    setEditingProject(null);
    reset({ name: "", description: "" });
    setIsCreateOpen(true);
  };

  const onOpenEdit = (project: Project) => {
    setModalOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setCreateError("");
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description ?? "",
    });
    setIsCreateOpen(true);
    setOpenMenuProjectId(null);
  };

  const onCloseCreate = () => {
    setCreateError("");
    setEditingProject(null);
    setIsCreateOpen(false);
  };

  const onDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProjectApi(projectId);
      toast.success("Project deleted");
      await fetchProjects();
    } catch {
      toast.error("Unable to delete project");
    } finally {
      setOpenMenuProjectId(null);
    }
  };

  const onSubmitCreate = async (values: CreateProjectFormValues) => {
    setCreateError("");

    try {
      if (editingProject) {
        await updateProjectApi(editingProject.id, {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
        });
      } else {
        await createProjectApi({
          name: values.name.trim(),
          description: values.description.trim() || undefined,
        });
      }

      onCloseCreate();
      await fetchProjects();
      toast.success(
        editingProject
          ? "Project updated successfully"
          : "Project created successfully",
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setCreateError("Invalid data");
        return;
      }

      setCreateError("Unable to save project. Please try again.");
    }
  };

  const hasProjects = useMemo(() => projects.length > 0, [projects]);
  const summary = useMemo(() => {
    return {
      totalProjects: projects.length,
      inProgressTasks: Object.values(projectMeta).reduce(
        (total, meta) => total + meta.inProgressTasks,
        0,
      ),
      doneThisWeek: Object.values(projectMeta).reduce(
        (total, meta) => total + meta.doneThisWeek,
        0,
      ),
    };
  }, [projectMeta, projects.length]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">My projects</h1>
        <button
          type="button"
          onClick={(event) => onOpenCreate(event)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Create new project
        </button>
      </header>

      {isLoading || isMetaLoading ? (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-white p-4 ring-1 ring-gray-200"
            >
              <div className="skeleton-shimmer mb-3 h-3 w-24 rounded" />
              <div className="skeleton-shimmer h-7 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total projects
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summary.totalProjects}
            </p>
          </article>
          <article className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tasks in progress
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {summary.inProgressTasks}
            </p>
          </article>
          <article className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tasks completed this week
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {summary.doneThisWeek}
            </p>
          </article>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-white p-4 ring-1 ring-gray-200"
            >
              <div className="skeleton-shimmer mb-3 h-5 w-2/3 rounded" />
              <div className="skeleton-shimmer mb-2 h-3 w-full rounded" />
              <div className="skeleton-shimmer mb-4 h-3 w-5/6 rounded" />
              <div className="skeleton-shimmer mb-4 h-2 w-full rounded-full" />
              <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-3 w-24 rounded" />
                <div className="flex gap-1">
                  <div className="skeleton-shimmer h-6 w-6 rounded-full" />
                  <div className="skeleton-shimmer h-6 w-6 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !hasProjects ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">
            You have not joined any projects yet
          </p>
        </div>
      ) : null}

      {!isLoading && hasProjects ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group relative rounded-xl bg-white p-4 text-left ring-1 ring-gray-200 transition-all duration-200 ease-in-out hover:-translate-y-0.75 hover:shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                  className="line-clamp-1 text-left text-lg font-semibold text-gray-900 transition group-hover:text-blue-700"
                >
                  {project.name}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuProjectId((current) =>
                        current === project.id ? null : project.id,
                      )
                    }
                    className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100"
                    aria-label="Open project options"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle cx="5" cy="12" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="19" cy="12" r="1.8" />
                    </svg>
                  </button>

                  {openMenuProjectId === project.id ? (
                    <div className="absolute right-0 top-9 z-10 w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => onOpenEdit(project)}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteProject(project.id)}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/projects/${project.id}/tasks`)}
                className="w-full text-left"
              >
                <p className="mb-4 line-clamp-3 min-h-18 text-sm text-gray-500">
                  {(typeof project.description === "string"
                    ? project.description.trim()
                    : "") || "No description"}
                </p>

                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>
                      {projectMeta[project.id]?.totalTasks
                        ? Math.round(
                            ((projectMeta[project.id]?.doneTasks ?? 0) /
                              (projectMeta[project.id]?.totalTasks ?? 1)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${
                          projectMeta[project.id]?.totalTasks
                            ? Math.round(
                                ((projectMeta[project.id]?.doneTasks ?? 0) /
                                  (projectMeta[project.id]?.totalTasks ?? 1)) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    Created on:{" "}
                    {new Date(project.createdAt).toLocaleDateString("en-US")}
                  </p>

                  <div className="flex -space-x-2">
                    {(projectMeta[project.id]?.memberInitials ?? []).map(
                      (initial, index) => (
                        <span
                          key={`${project.id}-${initial}-${index}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-semibold text-blue-700"
                        >
                          {initial || "?"}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {isCreateOpen ? (
        <div className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div
            className="modal-surface-enter w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            style={{
              transformOrigin: `${modalOrigin.x}px ${modalOrigin.y}px`,
            }}
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {editingProject ? "Edit project" : "Create new project"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmitCreate)}>
              <div>
                <label
                  htmlFor="projectName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Project name
                </label>
                <input
                  id="projectName"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...register("name", {
                    required: "Project name is required",
                    maxLength: {
                      value: 100,
                      message: "Project name must not exceed 100 characters",
                    },
                    validate: (value) =>
                      value.trim().length > 0 || "Project name cannot be blank",
                  })}
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="projectDescription"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="projectDescription"
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

              {createError ? (
                <p className="text-sm font-medium text-red-600">
                  {createError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseCreate}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingProject
                      ? "Save changes"
                      : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Dashboard;
