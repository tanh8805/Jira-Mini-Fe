import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import TaskCard from "./TaskCard";
import { type Task, type TaskStatus, updateTaskApi } from "./task.api";

type KanbanBoardProps = {
  projectId: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick: (task: Task) => void;
};

const statusColumns: Array<{
  title: string;
  status: TaskStatus;
}> = [
  { title: "CẦN LÀM", status: "TODO" },
  { title: "ĐANG THỰC HIỆN", status: "IN_PROGRESS" },
  { title: "HOÀN THÀNH", status: "DONE" },
];

function KanbanBoard({
  projectId,
  tasks,
  setTasks,
  onTaskClick,
}: KanbanBoardProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [droppedTaskId, setDroppedTaskId] = useState<string | null>(null);

  const tasksByStatus = useMemo(() => {
    return {
      TODO: tasks.filter((task) => task.status === "TODO"),
      IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS"),
      DONE: tasks.filter((task) => task.status === "DONE"),
    };
  }, [tasks]);

  const onDropToStatus = async (nextStatus: TaskStatus) => {
    if (!draggingTaskId) {
      return;
    }

    const movingTask = tasks.find((task) => task.id === draggingTaskId);

    const currentDraggingTaskId = draggingTaskId;
    setDraggingTaskId(null);
    setDragOverStatus(null);

    if (!movingTask || movingTask.status === nextStatus) {
      return;
    }

    const previousTasks = tasks;

    setDroppedTaskId(currentDraggingTaskId);
    setTimeout(() => {
      setDroppedTaskId((current) =>
        current === currentDraggingTaskId ? null : current,
      );
    }, 260);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === draggingTaskId ? { ...task, status: nextStatus } : task,
      ),
    );

    try {
      const updatedTask = await updateTaskApi(projectId, draggingTaskId, {
        status: nextStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
        ),
      );
    } catch {
      setTasks(previousTasks);
      toast.error("Không thể cập nhật trạng thái công việc");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {statusColumns.map((column) => {
        const columnTasks = tasksByStatus[column.status];
        const isActiveDropZone = dragOverStatus === column.status;

        return (
          <section
            key={column.status}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverStatus(column.status);
            }}
            onDrop={(event) => {
              event.preventDefault();
              void onDropToStatus(column.status);
            }}
            onDragLeave={() =>
              setDragOverStatus((current) =>
                current === column.status ? null : current,
              )
            }
            className={`rounded-xl bg-gray-200/80 p-3 transition ${isActiveDropZone ? "ring-2 ring-blue-300" : ""}`}
          >
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-700">
              {column.title} ({columnTasks.length})
            </h2>

            <div className="space-y-3">
              {columnTasks.length === 0 ? (
                <div className="rounded-lg bg-white px-3 py-6 text-center text-sm text-gray-400 ring-1 ring-gray-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="mx-auto mb-2 h-8 w-8 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18v3H3z" />
                    <path d="M5 9h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9z" />
                    <path d="M9 13h6" />
                  </svg>
                  Kéo thả task vào đây hoặc tạo mới
                </div>
              ) : null}

              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggingTaskId(task.id)}
                  onDragEnd={() => {
                    setDraggingTaskId(null);
                    setDragOverStatus(null);
                  }}
                  className="transition-all duration-200"
                >
                  <TaskCard
                    task={task}
                    onClick={onTaskClick}
                    isDragging={draggingTaskId === task.id}
                    isDropPopped={droppedTaskId === task.id}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
