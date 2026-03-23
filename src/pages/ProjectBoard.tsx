import axios from "axios";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getUserDisplayLabel } from "../features/auth/auth.api";
import { getProjectByIdApi } from "../features/projects/project.api";
import { findCurrentProjectMember } from "../features/projects/projectRole.util";
import {
  getProjectMembersApi,
  type ProjectMember,
  type ProjectRole,
} from "../features/projects/projectMembers.api";
import KanbanBoard from "../features/tasks/KanbanBoard";
import TaskModal from "../features/tasks/TaskModal";
import {
  createTaskApi,
  deleteTaskApi,
  getTasksApi,
  type Task,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
  updateTaskApi,
} from "../features/tasks/task.api";

type FilterStatus = "ALL" | TaskStatus;
type FilterPriority = "ALL" | TaskPriority;

const roleBadgeClassMap: Record<ProjectRole, string> = {
  OWNER: "bg-red-100 text-red-700",
  MANAGER: "bg-amber-100 text-amber-700",
  MEMBER: "bg-blue-100 text-blue-700",
};

function ProjectBoard() {
  const { projectId } = useParams<{ projectId: string }>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalError, setModalError] = useState<string>("");
  const [isModalSubmitting, setIsModalSubmitting] = useState<boolean>(false);
  const [taskModalOrigin, setTaskModalOrigin] = useState<{
    x: number;
    y: number;
  }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const effectiveProjectId = projectId ?? "";
  const currentUserLabel = useMemo(() => getUserDisplayLabel().trim(), []);

  const taskFilters = useMemo<TaskFilters>(() => {
    return {
      status: statusFilter === "ALL" ? undefined : statusFilter,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      assigneeId: assigneeFilter === "ALL" ? undefined : assigneeFilter,
    };
  }, [assigneeFilter, priorityFilter, statusFilter]);

  const currentMember = useMemo(() => {
    return findCurrentProjectMember(members, currentUserLabel);
  }, [currentUserLabel, members]);

  const currentUserRole: ProjectRole | null = currentMember?.role ?? null;

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
    if (!effectiveProjectId) {
      return;
    }

    const fetchMembers = async () => {
      try {
        const data = await getProjectMembersApi(effectiveProjectId);
        setMembers(data);
      } catch {
        toast.error("Unable to load members list");
      }
    };

    void fetchMembers();
  }, [effectiveProjectId]);

  useEffect(() => {
    if (!effectiveProjectId) {
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const data = await getTasksApi(effectiveProjectId, taskFilters);
        setTasks(data);
      } catch {
        toast.error("Unable to load task list");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTasks();
  }, [effectiveProjectId, taskFilters]);

  if (!effectiveProjectId) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          Valid project ID was not found.
        </p>
      </section>
    );
  }

  const openCreateTaskModal = (event?: MouseEvent<HTMLButtonElement>) => {
    if (event) {
      setTaskModalOrigin({ x: event.clientX, y: event.clientY });
    }

    setModalError("");
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setModalError("");
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    if (isModalSubmitting) {
      return;
    }

    setModalError("");
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleCreateTask = async (payload: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assigneeId?: string;
  }) => {
    setModalError("");
    setIsModalSubmitting(true);

    try {
      const createdTask = await createTaskApi(effectiveProjectId, payload);
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      toast.success("Task created successfully");
      closeTaskModal();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setModalError("Invalid data");
      } else {
        setModalError("Unable to create task. Please try again.");
      }
    } finally {
      setIsModalSubmitting(false);
    }
  };

  const handleUpdateTask = async (
    taskId: string,
    payload: {
      title: string;
      description?: string;
      priority: TaskPriority;
      assigneeId?: string;
      status?: TaskStatus;
    },
  ) => {
    setModalError("");
    setIsModalSubmitting(true);

    try {
      const updatedTask = await updateTaskApi(
        effectiveProjectId,
        taskId,
        payload,
      );
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
        ),
      );

      toast.success("Task changes saved");
      closeTaskModal();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setModalError("Invalid data");
      } else {
        setModalError("Unable to save changes. Please try again.");
      }
    } finally {
      setIsModalSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setModalError("");
    setIsModalSubmitting(true);

    try {
      await deleteTaskApi(effectiveProjectId, taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
      toast.success("Task deleted");
      closeTaskModal();
    } catch {
      setModalError("Unable to delete task. Please try again.");
    } finally {
      setIsModalSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {projectName || "Project"} {">"} Task Board
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Your role in this project:{" "}
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
            <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">
              Task Board
            </span>
            <Link
              to={`/projects/${effectiveProjectId}/members`}
              className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              Members
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => openCreateTaskModal(event)}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          + Create task
        </button>
      </header>

      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 ring-1 ring-gray-200 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="statusFilter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as FilterStatus)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priorityFilter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Priority
          </label>
          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as FilterPriority)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label
            htmlFor="assigneeFilter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Assignee
          </label>
          <select
            id="assigneeFilter"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((column) => (
            <div key={column} className="rounded-xl bg-gray-200/80 p-3">
              <div className="skeleton-shimmer mb-3 h-4 w-28 rounded" />
              <div className="space-y-3">
                {[1, 2].map((item) => (
                  <div
                    key={`${column}-${item}`}
                    className="rounded-lg bg-white p-3 ring-1 ring-gray-200"
                  >
                    <div className="skeleton-shimmer mb-2 h-3 w-14 rounded-full" />
                    <div className="skeleton-shimmer mb-2 h-4 w-full rounded" />
                    <div className="skeleton-shimmer mb-3 h-3 w-2/3 rounded" />
                    <div className="flex items-center justify-between">
                      <div className="skeleton-shimmer h-3 w-20 rounded" />
                      <div className="skeleton-shimmer h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          projectId={effectiveProjectId}
          tasks={tasks}
          setTasks={setTasks}
          onTaskClick={openEditTaskModal}
        />
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        task={selectedTask}
        modalOrigin={taskModalOrigin}
        members={members}
        isSubmitting={isModalSubmitting}
        errorMessage={modalError}
        onClose={closeTaskModal}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </section>
  );
}

export default ProjectBoard;
