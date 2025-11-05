export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface LogEntry {
  ts: string;
  level: Level;
  service?: string;
  message: string;
  meta?: Record<string, unknown>;
  raw: string;
}
export interface RuleWhere {
  service?: string | string[];
  level?: Level | Level[];
  contains?: string | string[];
  regex?: string;
}
export interface RuleAction {
  bucket?: string;
  addTag?: string | string[];
  elevate?: Level;
  drop?: boolean;
}
export interface TriageRule {
  id: string;
  where: RuleWhere;
  action: RuleAction;
}
export interface Bucket {
  name: string;
  count: number;
  levels: Record<Level, number>;
  tags: Record<string, number>;
  samples: LogEntry[];
}
export interface TriageResult {
  total: number;
  buckets: Record<string, Bucket>;
  unmatched: Bucket;
  tags: Record<string, number>;
  generatedAt: string;
  rulesApplied: string[];
}
