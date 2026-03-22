type GenericObject = Record<string, unknown>;

const isRecord = (input: unknown): input is GenericObject => {
  return Boolean(input) && typeof input === "object" && !Array.isArray(input);
};

export const unwrapApiData = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return payload;
  }

  if ("data" in payload) {
    return (payload as { data?: unknown }).data;
  }

  return payload;
};

export const extractArrayPayload = (
  payload: unknown,
  keys: string[] = ["items", "content", "data", "members", "tasks"],
): unknown[] => {
  const normalized = unwrapApiData(payload);

  if (Array.isArray(normalized)) {
    return normalized;
  }

  if (!isRecord(normalized)) {
    return [];
  }

  for (const key of keys) {
    const value = normalized[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};