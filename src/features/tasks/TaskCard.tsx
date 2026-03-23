import type { Task } from "./task.api";

type TaskCardProps = {
  task: Task;
  onClick: (task: Task) => void;
  isDragging?: boolean;
  isDropPopped?: boolean;
};

const taskTypeClassMap = {
  BUG: "bg-red-100 text-red-700",
  FEATURE: "bg-emerald-100 text-emerald-700",
  TASK: "bg-blue-100 text-blue-700",
} as const;

const priorityIconMap: Record<Task["priority"], string> = {
  LOW: "↓",
  MEDIUM: "→",
  HIGH: "↑",
};

const priorityClassMap: Record<Task["priority"], string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

const getTaskType = (title: string): keyof typeof taskTypeClassMap => {
  const normalized = title.toLowerCase();

  if (normalized.includes("bug")) {
    return "BUG";
  }

  if (normalized.includes("feature") || normalized.includes("feat")) {
    return "FEATURE";
  }

  return "TASK";
};

const getAssigneeInitials = (name?: string): string => {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

function TaskCard({
  task,
  onClick,
  isDragging = false,
  isDropPopped = false,
}: TaskCardProps) {
  const taskType = getTaskType(task.title);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = Boolean(
    dueDate &&
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.getTime() < Date.now(),
  );

  return (
    <article
      onClick={() => onClick(task)}
      className={`cursor-pointer rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:ring-blue-200 ${isDragging ? "task-dragging" : ""} ${isDropPopped ? "task-drop-pop" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${taskTypeClassMap[taskType]}`}
        >
          {taskType}
        </span>
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${priorityClassMap[task.priority]}`}
          title={task.priority}
        >
          {priorityIconMap[task.priority]}
        </span>
      </div>

      <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-gray-900">
        {task.title}
      </h3>

      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-gray-500"}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
          {dueDate && !Number.isNaN(dueDate.getTime())
            ? dueDate.toLocaleDateString("en-US")
            : "No due date"}
        </span>

        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white font-semibold text-gray-700 ring-1 ring-gray-200">
            {getAssigneeInitials(task.assigneeName)}
          </span>
          <span className="max-w-24.5 truncate">
            {task.assigneeName || "Unassigned"}
          </span>
        </span>
      </div>
    </article>
  );
}

export default TaskCard;
