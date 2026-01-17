/**
 * Log Parser Utility
 * Parses various log formats and extracts structured data
 */

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

export const LOG_PATTERNS = {
  // ISO 8601 timestamp pattern
  timestamp: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?/,
  // Log level pattern
  level: /\b(ERROR|WARN|WARNING|INFO|DEBUG|TRACE)\b/i,
  // IP address pattern
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  // Common log format
  commonLog: /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]+)" (\d{3}) (\d+|-)/
};

/**
 * Parse a single log line into structured data
 * @param {string} logLine - The log line to parse
 * @returns {Object} Parsed log entry
 */
export function parseLogLine(logLine) {
  if (!logLine || typeof logLine !== 'string') {
    return null;
  }

  const entry = {
    raw: logLine,
    timestamp: null,
    level: null,
    message: '',
    metadata: {}
  };

  // Extract timestamp
  const timestampMatch = logLine.match(LOG_PATTERNS.timestamp);
  if (timestampMatch) {
    entry.timestamp = new Date(timestampMatch[0]);
    entry.metadata.timestampString = timestampMatch[0];
  }

  // Extract log level
  const levelMatch = logLine.match(LOG_PATTERNS.level);
  if (levelMatch) {
    entry.level = levelMatch[1].toLowerCase();
  }

  // Extract IP addresses
  const ipMatches = logLine.match(new RegExp(LOG_PATTERNS.ipAddress, 'g'));
  if (ipMatches) {
    entry.metadata.ipAddresses = ipMatches;
  }

  // Try to parse as common log format
  const commonLogMatch = logLine.match(LOG_PATTERNS.commonLog);
  if (commonLogMatch) {
    entry.metadata.host = commonLogMatch[1];
    entry.metadata.user = commonLogMatch[3] !== '-' ? commonLogMatch[3] : null;
    entry.metadata.request = commonLogMatch[5];
    entry.metadata.statusCode = parseInt(commonLogMatch[6]);
    entry.metadata.size = commonLogMatch[7] !== '-' ? parseInt(commonLogMatch[7]) : 0;
  }

  // Extract the message (remaining text)
  entry.message = logLine.trim();

  return entry;
}

/**
 * Parse multiple log lines
 * @param {string} logText - Multi-line log text
 * @returns {Array} Array of parsed log entries
 */
export function parseLogText(logText) {
  if (!logText || typeof logText !== 'string') {
    return [];
  }

  const lines = logText.split('\n').filter(line => line.trim());
  return lines.map(parseLogLine).filter(entry => entry !== null);
}

/**
 * Filter logs by level
 * @param {Array} logs - Array of parsed log entries
 * @param {string} level - Log level to filter by
 * @returns {Array} Filtered logs
 */
export function filterByLevel(logs, level) {
  if (!Array.isArray(logs)) return [];
  return logs.filter(log => log.level === level.toLowerCase());
}

/**
 * Group logs by level
 * @param {Array} logs - Array of parsed log entries
 * @returns {Object} Logs grouped by level
 */
export function groupByLevel(logs) {
  if (!Array.isArray(logs)) return {};
  
  return logs.reduce((groups, log) => {
    const level = log.level || 'unknown';
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(log);
    return groups;
  }, {});
}

/**
 * Get log statistics
 * @param {Array} logs - Array of parsed log entries
 * @returns {Object} Statistics about the logs
 */
export function getLogStats(logs) {
  if (!Array.isArray(logs)) return null;

  const stats = {
    total: logs.length,
    byLevel: {},
    timeRange: {
      start: null,
      end: null
    }
  };

  // Count by level
  logs.forEach(log => {
    const level = log.level || 'unknown';
    stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;

    // Track time range
    if (log.timestamp) {
      if (!stats.timeRange.start || log.timestamp < stats.timeRange.start) {
        stats.timeRange.start = log.timestamp;
      }
      if (!stats.timeRange.end || log.timestamp > stats.timeRange.end) {
        stats.timeRange.end = log.timestamp;
      }
    }
  });

  return stats;
}

/**
 * Search logs for a specific term
 * @param {Array} logs - Array of parsed log entries
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Matching logs
 */
export function searchLogs(logs, searchTerm) {
  if (!Array.isArray(logs) || !searchTerm) return [];
  
  const term = searchTerm.toLowerCase();
  return logs.filter(log => 
    log.raw.toLowerCase().includes(term) ||
    log.message.toLowerCase().includes(term)
  );
}

export default {
  parseLogLine,
  parseLogText,
  filterByLevel,
  groupByLevel,
  getLogStats,
  searchLogs,
  LOG_LEVELS,
  LOG_PATTERNS
};
