// src/services/logParser.service.ts
import { LogEntry, LogLevel, TriageStatus } from '../types/log.types';
import { v4 as uuidv4 } from 'uuid';

export class LogParserService {
  /**
   * Parse raw log string into structured LogEntry
   */
  parseLogEntry(rawLog: string): LogEntry | null {
    try {
      // Support multiple log formats
      const jsonMatch = this.tryParseJSON(rawLog);
      if (jsonMatch) return jsonMatch;

      const standardMatch = this.tryParseStandardFormat(rawLog);
      if (standardMatch) return standardMatch;

      return null;
    } catch (error) {
      console.error('Error parsing log entry:', error);
      return null;
    }
  }

  private tryParseJSON(rawLog: string): LogEntry | null {
    try {
      const parsed = JSON.parse(rawLog);
      return {
        id: uuidv4(),
        timestamp: new Date(parsed.timestamp || Date.now()),
        level: this.normalizeLogLevel(parsed.level),
        message: parsed.message || parsed.msg || '',
        source: parsed.source || parsed.service || 'unknown',
        stackTrace: parsed.stackTrace || parsed.stack,
        metadata: parsed.metadata || {},
        triageStatus: TriageStatus.NEW,
        tags: parsed.tags || []
      };
    } catch {
      return null;
    }
  }

  private tryParseStandardFormat(rawLog: string): LogEntry | null {
    // Pattern: [TIMESTAMP] [LEVEL] [SOURCE] MESSAGE
    const pattern = /\[([^\]]+)\]\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/;
    const match = rawLog.match(pattern);

    if (match) {
      return {
        id: uuidv4(),
        timestamp: new Date(match[1]),
        level: this.normalizeLogLevel(match[2]),
        message: match[4],
        source: match[3],
        triageStatus: TriageStatus.NEW,
        tags: []
      };
    }

    return null;
  }

  private normalizeLogLevel(level: string): LogLevel {
    const normalized = level.toUpperCase();
    return Object.values(LogLevel).includes(normalized as LogLevel)
      ? (normalized as LogLevel)
      : LogLevel.INFO;
  }

  /**
   * Parse multiple log entries from text
   */
  parseLogFile(content: string): LogEntry[] {
    const lines = content.split('\n').filter(line => line.trim());
    return lines
      .map(line => this.parseLogEntry(line))
      .filter((entry): entry is LogEntry => entry !== null);
  }
}