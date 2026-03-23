import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  { title: "TO DO", status: "TODO" },
  { title: "IN PROGRESS", status: "IN_PROGRESS" },
  { title: "DONE", status: "DONE" },
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
  const [springBackTaskId, setSpringBackTaskId] = useState<string | null>(null);
  const [hasDroppedInZone, setHasDroppedInZone] = useState<boolean>(false);
  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const tasksByStatus = useMemo(() => {
    return {
      TODO: tasks.filter((task) => task.status === "TODO"),
      IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS"),
      DONE: tasks.filter((task) => task.status === "DONE"),
    };
  }, [tasks]);

  const moveTaskToStatus = async (taskId: string, nextStatus: TaskStatus) => {
    const movingTask = tasks.find((task) => task.id === taskId);
    if (!movingTask || movingTask.status === nextStatus) {
      return;
    }

    const previousTasks = tasks;

    setDroppedTaskId(taskId);
    setTimeout(() => {
      setDroppedTaskId((current) => (current === taskId ? null : current));
    }, 260);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task,
      ),
    );

    try {
      const updatedTask = await updateTaskApi(projectId, taskId, {
        status: nextStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
        ),
      );
    } catch {
      setTasks(previousTasks);
      toast.error("Unable to update task status");
    }
  };

  const onDropToStatus = async (nextStatus: TaskStatus) => {
    if (!draggingTaskId) {
      return;
    }

    const currentDraggingTaskId = draggingTaskId;
    setHasDroppedInZone(true);
    setDraggingTaskId(null);
    setDragOverStatus(null);
    await moveTaskToStatus(currentDraggingTaskId, nextStatus);
  };

  return (
    <motion.div layout className="relative overflow-x-auto pb-2">
      <div className="flex min-w-max snap-x snap-mandatory gap-3 lg:grid lg:min-w-0 lg:grid-cols-3 lg:gap-4">
        {draggingTaskId ? (
          <>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/4 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/30 blur-3xl"
              animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.15, 0.9] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-2/3 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/20 blur-3xl"
              animate={{
                opacity: [0.15, 0.35, 0.15],
                scale: [0.85, 1.05, 0.85],
              }}
              transition={{
                duration: 1.35,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        ) : null}

        {statusColumns.map((column) => {
          const columnTasks = tasksByStatus[column.status];
          const isActiveDropZone = dragOverStatus === column.status;

          return (
            <motion.section
              layout
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
              className={`relative w-[86vw] min-w-[86vw] snap-start rounded-xl bg-gray-200/80 p-3 transition sm:w-[70vw] sm:min-w-[70vw] lg:w-auto lg:min-w-0 ${isActiveDropZone ? "ring-2 ring-blue-300" : ""}`}
            >
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-700">
                {column.title} (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${column.status}-${columnTasks.length}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {columnTasks.length}
                  </motion.span>
                </AnimatePresence>
                )
              </h2>

              <AnimatePresence>
                {isActiveDropZone ? (
                  <motion.div
                    key={`${column.status}-drop-zone`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-3 rounded-lg border border-dashed border-blue-300 bg-blue-100/55"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      animate={{ opacity: [0.25, 0.6, 0.25] }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        boxShadow: "0 0 0 1px rgba(147, 197, 253, 0.7) inset",
                      }}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>

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
                    Drag and drop tasks here or create a new one
                  </div>
                ) : null}

                {columnTasks.map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    draggable={!isTouchDevice}
                    onDragStart={() => {
                      setHasDroppedInZone(false);
                      setDraggingTaskId(task.id);
                    }}
                    onDragEnd={() => {
                      if (!hasDroppedInZone) {
                        setSpringBackTaskId(task.id);
                        setTimeout(() => {
                          setSpringBackTaskId((current) =>
                            current === task.id ? null : current,
                          );
                        }, 280);
                      }

                      setHasDroppedInZone(false);
                      setDraggingTaskId(null);
                      setDragOverStatus(null);
                    }}
                    className="transition-all duration-200"
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  >
                    <TaskCard
                      task={task}
                      onClick={onTaskClick}
                      isDragging={draggingTaskId === task.id}
                      isDropPopped={
                        droppedTaskId === task.id ||
                        springBackTaskId === task.id
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.div>
  );
}

export default KanbanBoard;
