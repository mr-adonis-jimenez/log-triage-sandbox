// src/services/logTriage.service.ts
import { LogEntry, TriageFilter, TriageAction, TriageStatus } from '../types/log.types';

export class LogTriageService {
  private logs: Map<string, LogEntry> = new Map();

  /**
   * Add log entries to the triage system
   */
  addLogs(logs: LogEntry[]): void {
    logs.forEach(log => this.logs.set(log.id, log));
  }

  /**
   * Get all logs with optional filtering
   */
  getLogs(filter?: TriageFilter): LogEntry[] {
    let logs = Array.from(this.logs.values());

    if (!filter) return logs;

    if (filter.levels?.length) {
      logs = logs.filter(log => filter.levels!.includes(log.level));
    }

    if (filter.status?.length) {
      logs = logs.filter(log => filter.status!.includes(log.triageStatus));
    }

    if (filter.sources?.length) {
      logs = logs.filter(log => filter.sources!.includes(log.source));
    }

    if (filter.dateRange) {
      logs = logs.filter(log => 
        log.timestamp >= filter.dateRange!.start &&
        log.timestamp <= filter.dateRange!.end
      );
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      logs = logs.filter(log =>
        log.message.toLowerCase().includes(term) ||
        log.source.toLowerCase().includes(term)
      );
    }

    return logs;
  }

  /**
   * Perform triage action on a log entry
   */
  performTriageAction(action: TriageAction): boolean {
    const log = this.logs.get(action.logId);
    if (!log) return false;

    switch (action.action) {
      case 'assign':
        log.assignedTo = action.assignee;
        log.triageStatus = TriageStatus.IN_PROGRESS;
        break;
      case 'resolve':
        log.triageStatus = TriageStatus.RESOLVED;
        break;
      case 'ignore':
        log.triageStatus = TriageStatus.IGNORED;
        break;
      case 'reopen':
        log.triageStatus = TriageStatus.NEW;
        log.assignedTo = undefined;
        break;
    }

    return true;
  }

  /**
   * Get statistics about logs
   */
  getStatistics() {
    const logs = Array.from(this.logs.values());
    return {
      total: logs.length,
      byLevel: this.groupByLevel(logs),
      byStatus: this.groupByStatus(logs),
      bySource: this.groupBySource(logs)
    };
  }

  private groupByLevel(logs: LogEntry[]) {
    return logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByStatus(logs: LogEntry[]) {
    return logs.reduce((acc, log) => {
      acc[log.triageStatus] = (acc[log.triageStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupBySource(logs: LogEntry[]) {
    return logs.reduce((acc, log) => {
      acc[log.source] = (acc[log.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}