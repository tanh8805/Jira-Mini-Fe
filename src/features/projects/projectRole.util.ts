import type { ProjectMember } from "./projectMembers.api";

export const findCurrentProjectMember = (
  members: ProjectMember[],
  userLabel: string,
): ProjectMember | null => {
  const normalizedLabel = userLabel.trim().toLowerCase();

  if (!normalizedLabel) {
    return null;
  }

  return (
    members.find((member) => {
      return (
        member.email.toLowerCase() === normalizedLabel ||
        member.fullName.toLowerCase() === normalizedLabel
      );
    }) ?? null
  );
};
