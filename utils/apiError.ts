type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord => {
  if (value && typeof value === 'object') {
    return value as UnknownRecord;
  }

  return {};
};

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  return null;
};

const extractCodeFromValue = (value: unknown): string | null => {
  const direct = toStringOrNull(value);
  if (direct) {
    return direct.trim().toUpperCase();
  }

  if (Array.isArray(value)) {
    const firstString = value.find((item) => typeof item === 'string');
    if (typeof firstString === 'string') {
      return firstString.trim().toUpperCase();
    }
  }

  return null;
};

export const extractApiErrorCode = (error: unknown): string | null => {
  const root = toRecord(error);
  const data = toRecord(root.data);
  const nestedData = toRecord(data.data);

  const codeCandidates = [root.error, data.error, nestedData.error];

  for (const candidate of codeCandidates) {
    const code = extractCodeFromValue(candidate);
    if (code) {
      return code;
    }
  }

  const messageCandidates = [root.message, data.message, nestedData.message];
  const hasAccountPrivateMessage = messageCandidates.some(
    (value) => typeof value === 'string' && value.toUpperCase().includes('ACCOUNT_PRIVATE'),
  );

  return hasAccountPrivateMessage ? 'ACCOUNT_PRIVATE' : null;
};

export const isAccountPrivateError = (error: unknown): boolean => extractApiErrorCode(error) === 'ACCOUNT_PRIVATE';

export const extractApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  const root = toRecord(error);
  const data = toRecord(root.data);
  const nestedData = toRecord(data.data);

  const candidates = [data.message, nestedData.message, root.message];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return fallbackMessage;
};
