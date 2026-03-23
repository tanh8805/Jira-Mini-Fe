import { type ProjectMember } from "../tasks/task.api";
import { type AuditAction, type AuditLog } from "./audit.api";

type AuditLogTimelineProps = {
  logs: AuditLog[];
  members: ProjectMember[];
  isLoading: boolean;
  className?: string;
};

type JsonRecord = Record<string, unknown>;

const fieldLabelMap: Record<string, string> = {
  title: "Title",
  status: "Status",
  priority: "Priority",
  assigneeId: "Assignee",
};

const trackedFields = ["title", "status", "priority", "assigneeId"];

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const dateText = date.toLocaleDateString("en-US");
  const timeText = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${timeText} ${dateText}`;
};

const parseJsonRecord = (value: string | null): JsonRecord => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as JsonRecord) : {};
  } catch {
    return {};
  }
};

const formatFieldValue = (
  field: string,
  value: unknown,
  membersMap: Map<string, string>,
): string => {
  if (value === undefined || value === null || value === "") {
    return "(empty)";
  }

  if (field === "assigneeId") {
    const assigneeId = String(value);
    return membersMap.get(assigneeId) ?? assigneeId;
  }

  return String(value);
};

const buildActionText = (action: AuditAction, actorName: string): string => {
  if (action === "CREATED") {
    return `${actorName} created this task.`;
  }

  if (action === "DELETED") {
    return `${actorName} deleted this task.`;
  }

  return `${actorName} updated the task.`;
};

const buildDiffLines = (
  log: AuditLog,
  membersMap: Map<string, string>,
): string[] => {
  if (log.action !== "UPDATED") {
    return [];
  }

  const oldRecord = parseJsonRecord(log.oldValue);
  const newRecord = parseJsonRecord(log.newValue);

  return trackedFields
    .map((field) => {
      const oldValue = oldRecord[field];
      const newValue = newRecord[field];

      if (oldValue === newValue) {
        return null;
      }

      const label = fieldLabelMap[field] ?? field;
      const oldText = formatFieldValue(field, oldValue, membersMap);
      const newText = formatFieldValue(field, newValue, membersMap);

      return `${label}: ${oldText} ➔ ${newText}`;
    })
    .filter((line): line is string => Boolean(line));
};

function AuditLogTimeline({
  logs,
  members,
  isLoading,
  className,
}: AuditLogTimelineProps) {
  const membersMap = new Map<string, string>(
    members.map((member) => [member.id, member.fullName]),
  );

  return (
    <section
      className={`${className ?? "mt-5 border-t border-gray-200 pt-4"} min-w-0 overflow-hidden`}
    >
      <h3 className="mb-3 text-base font-semibold text-gray-900">
        Activity / Change history
      </h3>

      {isLoading ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
          Loading history...
        </p>
      ) : null}

      {!isLoading && logs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
          No change history yet
        </p>
      ) : null}

      {!isLoading && logs.length > 0 ? (
        <ol className="relative min-w-0 space-y-4 before:absolute before:bottom-0 before:left-[7px] before:top-1 before:w-px before:bg-gray-200">
          {logs.map((log) => {
            const actorName = log.actor?.fullName || "Unknown user";
            const diffLines = buildDiffLines(log, membersMap);

            return (
              <li key={log.id} className="relative min-w-0 pl-7">
                <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-white" />
                <p className="text-xs text-gray-400">
                  {formatDateTime(log.createdAt)}
                </p>
                <p className="mt-1 break-all text-sm font-medium text-gray-800 sm:break-words">
                  {buildActionText(log.action, actorName)}
                </p>

                {diffLines.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {diffLines.map((line) => (
                      <li
                        key={`${log.id}-${line}`}
                        className="break-all text-sm text-gray-600 sm:break-words"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}

export default AuditLogTimeline;
