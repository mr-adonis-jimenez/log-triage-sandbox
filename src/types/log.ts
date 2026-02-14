// src/types/log.ts
export interface Log {
  timestamp: string;
  level: string;
  message: string;
  service?: string;
  traceId?: string;
}

export enum TriageStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  IGNORED = 'IGNORED',
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: string;
  source: string;
  message: string;
  triageStatus: TriageStatus;
  assignedTo?: string;
}

export interface TriageFilter {
  levels?: string[];
  status?: TriageStatus[];
  sources?: string[];
  dateRange?: { start: Date; end: Date };
  searchTerm?: string;
}

export interface TriageAction {
  logId: string;
  action: 'assign' | 'resolve' | 'ignore' | 'reopen';
  assignee?: string;
}
