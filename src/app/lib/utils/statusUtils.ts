// Utility functions for status conversion between frontend (string) and backend (number)

export const STATUS_MAP = {
  PENDING: 0,
  IN_PROGRESS: 1,
  UNDER_REVIEW: 2,
  COMPLETE: 3
} as const;

export const STATUS_LABELS = {
  0: 'Pending',
  1: 'In Progress', 
  2: 'Under Review',
  3: 'Complete'
} as const;

export const stringToStatusNumber = (status: string): number => {
  const statusMap: Record<string, number> = {
    'Pending': STATUS_MAP.PENDING,
    'In Progress': STATUS_MAP.IN_PROGRESS,
    'Under Review': STATUS_MAP.UNDER_REVIEW,
    'Complete': STATUS_MAP.COMPLETE
  };
  return statusMap[status] ?? STATUS_MAP.PENDING;
};

export const statusNumberToString = (status: number | string): string => {
  if (typeof status === 'string') return status;
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || 'Pending';
};

export const normalizeStatus = (status: string | number | undefined): string => {
  if (status === undefined || status === null) return 'Pending';
  if (typeof status === 'string') return status;
  return statusNumberToString(status);
};
